package main

import (
	"log"
	"os"
	"time"
)

func main() {
	log.Println("Node Agent Stub started.")
	log.Println("gRPC and Proto functionality disabled due to missing generated files.")
	
	// Just hang to keep container alive if needed, or exit if that's preferred.
	// For dev mode, keeping it alive is better so logs can be seen.
	for {
		time.Sleep(1 * time.Hour)
	}
}

// Stubbed dependencies to remove from go.mod
// pb "github.com/octomus/cloud/internal/proto/controlplane"
// "github.com/octomus/cloud/internal/firecracker"

