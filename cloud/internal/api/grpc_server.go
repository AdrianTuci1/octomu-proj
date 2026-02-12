package api

import (

	"fmt"
	"sync"

	"github.com/octomus/cloud/internal/store"
	// "github.com/google/uuid"
	// pb "github.com/octomus/cloud/internal/proto/controlplane"
	// "google.golang.org/grpc/codes"
	// "google.golang.org/grpc/status"
)

// GRPCServer implements the Control Plane NodeService (gRPC)
// Stubbed for now due to missing proto generation
type GRPCServer struct {
	// pb.UnimplementedNodeServiceServer
	store store.Store

	// Active streams to Push events to Nodes
	streamsMu sync.RWMutex
	// streams   map[string]pb.NodeService_StreamEventsServer
}

func NewNodeServer(s store.Store) *GRPCServer {
	return &GRPCServer{
		store:   s,
		// streams: make(map[string]pb.NodeService_StreamEventsServer),
	}
}

// DispatchSession sends a "AssignSession" event to a specific Node
// Stubbed to accept any and return error
func (s *GRPCServer) DispatchSession(nodeID string, task any) error {
	return fmt.Errorf("gRPC dispatch is disabled (proto files missing)")
}
