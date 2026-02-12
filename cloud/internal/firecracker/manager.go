package firecracker

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sync"
	"time"

	"github.com/google/uuid"
	models "github.com/firecracker-microvm/firecracker-go-sdk/client/models"
	"github.com/firecracker-microvm/firecracker-go-sdk"
	// "github.com/go-openapi/strfmt" // If needed for models
)

// VMConfig holds configuration for a microVM
type VMConfig struct {
	ID             string
	KernelImagePath string
	RootFSPath     string
	SocketPath     string
	CPUCount       int64
	MemSizeMib     int64
	Credentials    map[string]string // ID -> Secret
}

// Manager handles the lifecycle of Firecracker VMs
type Manager struct {
	vms         map[string]*RunningVM
	pool        chan *RunningVM // Pre-warmed VMs
	mu          sync.Mutex
	kernelPath  string
	rootfsPath  string
}

type RunningVM struct {
	Config    VMConfig
	IPAddress string
	InUse     bool
	Machine   *firecracker.Machine
}

func NewManager(kernelPath, rootfsPath string, poolSize int) *Manager {
	return &Manager{
		vms:        make(map[string]*RunningVM),
		pool:       make(chan *RunningVM, poolSize),
		kernelPath: kernelPath,
		rootfsPath: rootfsPath,
	}
}

// StartPrewarming fills the pool with VMs
func (m *Manager) StartPrewarming(ctx context.Context) {
	go func() {
		for {
			// If pool has space, create a VM
			if len(m.pool) < cap(m.pool) {
				vm, err := m.createVM(context.Background())
				if err != nil {
					fmt.Printf("Failed to prewarm VM: %v\n", err)
					time.Sleep(5 * time.Second)
					continue
				}
				m.pool <- vm
				fmt.Printf("Pre-warmed VM %s added to pool\n", vm.Config.ID)
			}
			time.Sleep(2 * time.Second)
		}
	}()
}

// StartVM configures and starts a Firecracker VM
func (m *Manager) StartVM(ctx context.Context, cfg VMConfig) error {
	// 1. Create Machine Config
	fcCfg := models.MachineConfiguration{
		VcpuCount:  firecracker.Int64(cfg.CPUCount),
		MemSizeMib: firecracker.Int64(cfg.MemSizeMib),
		// Smt:        firecracker.Bool(true), // Simultanous Multi-Threading
	}

	// 2. Drives (RootFS)
	drives := []models.Drive{
		{
			DriveID:      firecracker.String("1"),
			PathOnHost:   firecracker.String(cfg.RootFSPath),
			IsRootDevice: firecracker.Bool(true),
			IsReadOnly:   firecracker.Bool(false),
		},
	}

	// 3. Network Interfaces (TAP)
	// Create TAP device dynamically
	// We use the first 3 chars of ID as simple suffix for prototype (ensure collision avoidance in real app)
	suffix := cfg.ID[:3]
	tapDevice := fmt.Sprintf("tap-%s", suffix)
	
	// Execute setup script (Requires sudo/root)
	// In production, CNI plugins or a separate privileged network daemon should handle this.
	setupCmd := exec.Command("/bin/bash", "../../scripts/setup_network.sh", suffix)
	if out, err := setupCmd.CombinedOutput(); err != nil {
		return fmt.Errorf("failed to setup network: %v, output: %s", err, out)
	}

	ifaces := []models.NetworkInterface{
		{
			IfaceID:     firecracker.String("eth0"),
			HostDevName: firecracker.String(tapDevice),
		},
	}

	// 4. Boot Source (Kernel)
	boot := models.BootSource{
		KernelImagePath: firecracker.String(cfg.KernelImagePath),
		BootArgs:        firecracker.String("console=ttyS0 reboot=k panic=1 pci=off"),
	}

	// 5. Machine Builder
	cmd := firecracker.VMCommandBuilder{}.
		WithSocketPath(cfg.SocketPath).
		Build(ctx)

	machineOpts := []firecracker.Opt{
		firecracker.WithMachineConfiguration(fcCfg),
		firecracker.WithDrives(drives),
		firecracker.WithNetworkInterfaces(ifaces),
		firecracker.WithBootSource(boot),
		// firecracker.WithProcessRunner(cmd), // SDK handles this?
	}

	// Delete socket if exists
	os.Remove(cfg.SocketPath)

	vmm, err := firecracker.NewMachine(ctx, firecracker.Config{ // Changed api.Config to firecracker.Config
		SocketPath:      cfg.SocketPath,
		KernelImagePath: cfg.KernelImagePath,
		MachineCfg:      fcCfg,
		Drives:          drives,
		NetworkInterfaces: ifaces,
		LogLevel: "Debug",
	}, machineOpts...)
	
	if err != nil {
		return fmt.Errorf("failed to create machine: %w", err)
	}
	
	// 6. Start Instance
	if err := vmm.Start(ctx); err != nil {
		return fmt.Errorf("failed to start machine: %w", err)
	}

	m.mu.Lock()
	m.vms[cfg.ID] = &RunningVM{
		Config: cfg,
		Machine: vmm, // Save reference to control it
	}
	m.mu.Unlock()
	
	log.Printf("Started VM %s", cfg.ID)
	return nil
}

// ClaimVM retrieves a VM from the pool and injects credentials
func (m *Manager) ClaimVM(ctx context.Context, sessionID string, mcpConfig []byte, credentials map[string]string) (*RunningVM, error) {
	var vm *RunningVM
	
	// Try to get from pool
	select {
	case vm = <-m.pool:
		fmt.Printf("Claimed pre-warmed VM %s for session %s\n", vm.Config.ID, sessionID)
	default:
		// Pool empty, create new
		var err error
		vm, err = m.createVM(ctx)
		if err != nil {
			return nil, err
		}
		fmt.Printf("Created new VM %s for session %s (pool empty)\n", vm.Config.ID, sessionID)
	}

	m.mu.Lock()
	vm.InUse = true
	m.vms[vm.Config.ID] = vm
	m.mu.Unlock()

	// Inject Credentials & Config to MMDS
	metadata := map[string]interface{}{
		"session_id": sessionID,
		"mcp_config": string(mcpConfig), // JSON payload
		"credentials": credentials,
	}
	
	if err := vm.Machine.SetMetadata(ctx, metadata); err != nil {
		log.Printf("Failed to set MMDS: %v", err)
		// Proceed? Or Fail? For now log error.
	}
	
	return vm, nil
}

func (m *Manager) createVM(ctx context.Context) (*RunningVM, error) {
	id := uuid.New().String()
	socketPath := m.GenerateSocketPath(id)
	
	cfg := VMConfig{
		ID:              id,
		KernelImagePath: m.kernelPath,
		RootFSPath:      m.rootfsPath,
		SocketPath:      socketPath,
		CPUCount:        2,
		MemSizeMib:      1024,
	}
	
	// Start VM Logic (Stubbed)
	err := m.StartVM(ctx, cfg) // Now calls the real StartVM
	if err != nil {
		return nil, fmt.Errorf("failed to start VM %s: %w", id, err)
	}
	
	// Retrieve the RunningVM instance that StartVM created and stored
	m.mu.Lock()
	runningVM, ok := m.vms[cfg.ID]
	m.mu.Unlock()

	if !ok {
		return nil, fmt.Errorf("VM %s not found after starting", cfg.ID)
	}

	runningVM.IPAddress = "192.168.1.10" // Mock IP for now
	
	return runningVM, nil
}

// ReleaseVM destroys a VM (or recycles it if we implement cleaning)
func (m *Manager) ReleaseVM(vmID string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	if vm, ok := m.vms[vmID]; ok {
		// StopVM(vmID) // This was a comment, now we can call the real StopVM
		if vm.Machine != nil {
			log.Printf("Stopping VM %s", vmID)
			if err := vm.Machine.StopVMM(); err != nil { // Use StopVMM to stop the Firecracker process
				log.Printf("Error stopping VM %s: %v", vmID, err)
			}
		}
		delete(m.vms, vmID)
	}
}

// StopVM stops a Firecracker VM
func (m *Manager) StopVM(ctx context.Context, vmID string) error {
    m.ReleaseVM(vmID) // ReleaseVM now handles stopping the machine
	return nil
}

// Helper to generate socket path
func (m *Manager) GenerateSocketPath(vmID string) string {
	return filepath.Join("/tmp", fmt.Sprintf("firecracker-%s.socket", vmID))
}
