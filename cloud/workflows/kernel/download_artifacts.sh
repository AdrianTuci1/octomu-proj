#!/bin/bash
set -e

# Directory for artifacts
BUILD_DIR="./build/artifacts"
mkdir -p "$BUILD_DIR"

echo "Downloading Firecracker Kernel..."
# Use a pre-built hello-world kernel for testing, or build one
# Here we download a standard Firecracker CI kernel
curl -L -o "$BUILD_DIR/vmlinux" "https://s3.amazonaws.com/spec.ccfc.min/img/quickstart_guide/x86_64/kernels/vmlinux-5.10.186"

echo "Downloading RootFS..."
# Download a minimal Alpine rootfs prepared for Firecracker
curl -L -o "$BUILD_DIR/rootfs.ext4" "https://s3.amazonaws.com/spec.ccfc.min/img/quickstart_guide/x86_64/rootfs/bionic.rootfs.ext4"

echo "Artifacts ready in $BUILD_DIR"
echo "Kernel: $BUILD_DIR/vmlinux"
echo "RootFS: $BUILD_DIR/rootfs.ext4"
