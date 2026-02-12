package pool

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/octomus/cloud/internal/firecracker"
)

// Pool maintains a set of pre-warmed VMs
type Pool struct {
	manager    *firecracker.Manager
	readyVMs   chan *firecracker.RunningVM
	targetSize int
	mu         sync.Mutex
}

func NewPool(manager *firecracker.Manager, size int) *Pool {
	return &Pool{
		manager:    manager,
		readyVMs:   make(chan *firecracker.RunningVM, size),
		targetSize: size,
	}
}

// StartMaintainer ensures the pool stays populated
func (p *Pool) StartMaintainer(ctx context.Context) {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			p.refill(ctx)
		}
	}
}

func (p *Pool) refill(ctx context.Context) {
	currentSize := len(p.readyVMs)
	if currentSize >= p.targetSize {
		return
	}

	needed := p.targetSize - currentSize
	log.Printf("Pool needs %d VMs (current: %d, target: %d)", needed, currentSize, p.targetSize)

	for i := 0; i < needed; i++ {
		go func() {
			// Configuration for a basic "warm" VM
			// In reality, this would use a base snapshot or fresh boot
			cfg := firecracker.VMConfig{
				ID:              fmt.Sprintf("warm-%d", time.Now().UnixNano()),
				KernelImagePath: "/var/lib/octomus/kernels/vmlinux",
				RootFSPath:      "/var/lib/octomus/rootfs/alpine.ext4",
				SocketPath:      fmt.Sprintf("/tmp/firecracker-%d.socket", time.Now().UnixNano()),
				CPUCount:        1,
				MemSizeMib:      128,
			}

			if err := p.manager.StartVM(ctx, cfg); err != nil {
				log.Printf("Failed to pre-warm VM: %v", err)
				return
			}

			// We need to retrieve the VM object we just created
			// In a real implementation, StartVM might return the VM or we lookup
			// For now, let's assume we can construct a wrapper
			warmVM := &firecracker.RunningVM{
				Config: cfg,
			}

			p.readyVMs <- warmVM
			log.Printf("Pre-warmed VM %s added to pool", cfg.ID)
		}()
	}
}

// GetVM claims a VM from the pool. If none are ready, it blocks or errors.
func (p *Pool) GetVM(ctx context.Context) (*firecracker.RunningVM, error) {
	select {
	case vm := <-p.readyVMs:
		return vm, nil
	case <-time.After(5 * time.Second):
		// Fallback: Create one on demand if pool is empty/slow
		// Or return error "Capacity Exceeded"
		return nil, fmt.Errorf("timeout waiting for VM from pool")
	}
}
