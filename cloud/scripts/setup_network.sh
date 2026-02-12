#!/bin/bash
# Usage: ./setup_network.sh <vm_id_suffix>
# Creates a tap device tap-<suffix> and sets up NAT

ID=$1
TAP_DEV="tap-${ID}"
TAP_IP="172.16.${ID}.1"
VM_IP="172.16.${ID}.2"

if [ -z "$ID" ]; then
  echo "Usage: $0 <id_suffix>"
  exit 1
fi

# Create TAP device
sudo ip tuntap add dev $TAP_DEV mode tap
sudo ip addr add $TAP_IP/30 dev $TAP_DEV
sudo ip link set dev $TAP_DEV up

# Enable forwarding
sudo sysctl -w net.ipv4.ip_forward=1

# Setup NAT (simplistic)
INTERFACE=$(ip route get 8.8.8.8 | awk -- '{printf $5}')
sudo iptables -t nat -A POSTROUTING -o $INTERFACE -j MASQUERADE
sudo iptables -A FORWARD -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
sudo iptables -A FORWARD -i $TAP_DEV -o $INTERFACE -j ACCEPT

echo "Created $TAP_DEV with IP $TAP_IP. VM should use $VM_IP"
