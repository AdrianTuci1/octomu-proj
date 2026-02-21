package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"octomus-cloud/routes"
)

func main() {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("[INFO] No .env file found, using system environment variables")
	}

	log.Println("Starting Modular Octomus Cloud MVP Server...")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	r := routes.SetupRouter()

	log.Printf("Server listening on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
