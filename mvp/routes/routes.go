package routes

import (
	"octomus-cloud/handlers"

	"github.com/gin-gonic/gin"
)

// SetupRouter initializes the Gin engine and configures all API routes
func SetupRouter() *gin.Engine {
	r := gin.Default()

	// Configure CORS for local development
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Serve static files (images, binaries, etc.) from the public directory
	r.Static("/images", "./public/images")
	r.Static("/binaries", "./binaries")

	v1 := r.Group("/v1")
	{
		// 1. OAuth Wrapper (Passthrough)
		auth := v1.Group("/auth")
		{
			auth.GET("/start/:provider", handlers.StartOAuth)
			auth.GET("/callback/:provider", handlers.OAuthCallback)
		}

		// 2. OAuth Token Exchange (cloud holds Client Secret; returns token to client for Keychain storage)
		oauth := v1.Group("/oauth")
		{
			oauth.POST("/exchange/:provider", handlers.ExchangeToken)
		}

		// MCP Discovery & Inspection
		v1.GET("/mcp/directory", handlers.GetMCPDirectory)
		v1.GET("/mcp/inspect/:id", handlers.GetMCPTools)
		v1.POST("/mcp/install/:id", handlers.InstallMCP)

		// LLM Proxy

		// 3. LLM Secure Proxy
		// Client sends prompts and schemas here. Cloud uses its own LLM API key.
		chat := v1.Group("/chat")
		{
			chat.POST("/", handlers.ProxyLLMChat)
		}
	}

	return r
}
