package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/octomus/local/internal/api"
	"github.com/octomus/local/internal/core"
	"github.com/octomus/local/internal/security"
	"github.com/octomus/local/internal/storage"
	"github.com/octomus/local/internal/tunnel"
)

func main() {
	// Load .env file if it exists
	_ = godotenv.Load()

	// Initialize Dependencies
	store, err := storage.NewSQLiteStore("data") // In Docker this maps to /app/data
	if err != nil {
		log.Fatalf("Failed to initialize storage: %v", err)
	}

	vault := security.NewVault()
	tokenManager := security.NewTokenManager()

	// Check if Auth is required
	authRequired := os.Getenv("OCTOMUS_AUTH") == "true"
	var token string

	if authRequired {
		// Generate or load token
		existingToken := os.Getenv("OCTOMUS_TOKEN")
		if existingToken != "" {
			tokenManager.SetToken(existingToken)
			token = existingToken
		} else {
			var err error
			token, err = tokenManager.GenerateToken()
			if err != nil {
				log.Fatalf("Failed to generate secure token: %v", err)
			}
		}
	}

	// Initialize Core Orchestrator
	orchestrator := core.NewOrchestrator(store, vault)
	if err := orchestrator.Start(); err != nil {
		log.Fatalf("Failed to start orchestrator: %v", err)
	}
	defer orchestrator.Stop()

	// Initialize Routes
	handler := api.NewHandler(orchestrator, tokenManager, authRequired)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      handler,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	log.Printf("Starting Octomus Local on port %s", port)
	
	// Print Access Instructions
	if authRequired {
		log.Println("----------------------------------------------------------------")
		log.Printf("Security Enabled. Access Dashboard at:")
		log.Printf("http://localhost:%s/?token=%s", port, token)
		log.Println("----------------------------------------------------------------")
	} else {
		log.Println("----------------------------------------------------------------")
		log.Printf("Running in Local Mode (No Auth). Dashboard at:")
		log.Printf("http://localhost:%s", port)
		log.Println("----------------------------------------------------------------")
	}

	// Start Cloud Tunnel if configured
	// Start Cloud Tunnel (Always on by default in local mode to support LLM connectivity)
	cloudURL := os.Getenv("OCTOMUS_CLOUD_URL")
	if cloudURL == "" {
		cloudURL = "wss://octomus.dev/tunnel/connect"
	}
	
	// We pass an empty token - the cloud will assign a session/URL
	// Or we could persist a local ID if we wanted stable URLs, but for now ephemeral is fine
	// or the cloud handles "anonymous" connections.
	tunnelClient := tunnel.NewTunnelClient(cloudURL, "", handler) // Token removed

	go func() {
		// Basic reconnect loop
		for {
			if err := tunnelClient.Start(context.Background()); err != nil {
				log.Printf("Tunnel disconnected: %v. Reconnecting in 5s...", err)
				time.Sleep(5 * time.Second)
			}
		}
	}()

	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
