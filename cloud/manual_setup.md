# Manual Setup & Verification Guide

This guide describes how to manually build, configure, and verify the Firecracker microVM integration locally.

## 1. Prerequisites
- **Linux Machine** (or bare metal). Firecracker requires KVM.
  - *If on macOS*: You cannot run Firecracker directly. You must run this inside a Linux VM (e.g., via VMWare Fusion, Parallels, or Lima).
- **Go 1.23+**
- **Docker** (optional, useful for building rootfs)
- **Firecracker Binary** (`firecracker`) in your PATH.

## 2. Artifact Preparation

### A. Build the Guest Agent
This is the binary that runs *inside* the VM.
```bash
cd cloud/cmd/guest-agent
GOOS=linux GOARCH=amd64 go build -o guest-init main.go
```

### B. Prepare the Root Filesystem (RootFS)
You need a text-based Linux image (Ext4).
1.  **Download a base image** (e.g., getting-started `hello-rootfs.ext4` from Firecracker repo is too simple, use Ubuntu/Alpine).
2.  **Mount the image**:
    ```bash
    mkdir -p /tmp/my-rootfs
    sudo mount -o loop path/to/bionic.rootfs.ext4 /tmp/my-rootfs
    ```
3.  **Install the Guest Agent**:
    ```bash
    # Copy the binary we just built
    sudo cp cloud/cmd/guest-agent/guest-init /tmp/my-rootfs/sbin/guest-init
    
    # Make it the init process (simplest way), OR add an RC script
    # For testing, we can symlink /sbin/init to our agent
    sudo ln -sf /sbin/guest-init /tmp/my-rootfs/sbin/init
    ```
4.  **Unmount**:
    ```bash
    sudo umount /tmp/my-rootfs
    ```
5.  **Place Files**:
    - Move your modified rootfs to `/opt/rootfs/bionic.rootfs.ext4`
    - Place your vmlinux kernel at `/opt/kernels/vmlinux`

## 3. Run the System

### A. Start the Control Plane
```bash
cd cloud
go run cmd/controlplane/main.go
# Server listens on :8080 (HTTP) and :50051 (gRPC)
```

### B. Start the Worker Agent
The agent must run as **root** to create TAP devices.
```bash
cd cloud
sudo go run cmd/node-agent/main.go
```
*The agent will immediately try to "pre-warm" VMs. Watch the logs for "Started VM..."*

## 4. Trigger Execution
Use `curl` to simulate a User Request.

```bash
curl -X POST http://localhost:8080/api/v1/execute \
  -H "Content-Type: application/json" \
  -d '{
    "mcp_name": "basic-tool",
    "arguments": {
        "download_url": "http://example.com/my-mcp.zip"
    }
  }'
```

## 5. Troubleshooting
- **Permission Denied**: Check `/dev/kvm` permissions (`sudo setfacl -m u:$USER:rw /dev/kvm`).
- **Network Failures**: Check if `tap-xxx` devices exist (`ip link`).
- **VM Crash**: Check `/tmp/firecracker-xxx.log` (if configured).
