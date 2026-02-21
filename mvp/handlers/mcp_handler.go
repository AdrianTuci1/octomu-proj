package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"octomus-cloud/models"

	"github.com/gin-gonic/gin"
)

// GetMCPDirectory returns the registry of available MCPs loaded from a JSON file.
func GetMCPDirectory(c *gin.Context) {
	registryPath := os.Getenv("REGISTRY_PATH")
	if registryPath == "" {
		registryPath = "./data/mcp_registry.json"
	}

	file, err := os.ReadFile(registryPath)
	if err != nil {
		log.Printf("[ERR] Failed to read registry file: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load MCP directory"})
		return
	}

	var registry []models.MCPRegistryItem
	if err := json.Unmarshal(file, &registry); err != nil {
		log.Printf("[ERR] Failed to parse registry JSON: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse MCP directory"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"registry": registry})
}

// GetMCPTools returns the list of tools offered by a specific MCP.
// This simulates the "list_tools" call that Wails would perform on a local binary or cloud app.
func GetMCPTools(c *gin.Context) {
	mcpID := c.Param("id")

	// In a real scenario, we would run the binary with a specific flag or hit the Cloud MCP URL.
	// For the MVP, we mock the results based on the ID.
	tools := []gin.H{}

	switch mcpID {
	case "exa_search":
		tools = []gin.H{
			{
				"name":        "web_search_exa",
				"description": "Search the web for any topic and get clean, ready-to-use content. Best for finding current information, news, facts.",
				"inputSchema": gin.H{
					"type": "object",
					"properties": gin.H{
						"query":      gin.H{"type": "string", "description": "Web search query"},
						"numResults": gin.H{"type": "integer", "description": "Number of results (default: 5)"},
					},
					"required": []string{"query"},
				},
			},
			{
				"name":        "crawling_exa",
				"description": "Retrieve the cleaned high-quality content of specific URLs.",
				"inputSchema": gin.H{
					"type": "object",
					"properties": gin.H{
						"urls": gin.H{"type": "array", "description": "List of URLs to crawl"},
					},
					"required": []string{"urls"},
				},
			},
		}
	case "memory":
		tools = []gin.H{
			{
				"name":        "store_knowledge",
				"description": "Save a new piece of information into the persistent knowledge graph.",
				"inputSchema": gin.H{
					"type": "object",
					"properties": gin.H{
						"fact":     gin.H{"type": "string", "description": "The fact to store"},
						"entities": gin.H{"type": "array", "description": "Related entities"},
					},
					"required": []string{"fact"},
				},
			},
			{
				"name":        "query_knowledge",
				"description": "Retrieve stored facts based on relevance or entity matching.",
				"inputSchema": gin.H{
					"type": "object",
					"properties": gin.H{
						"query": gin.H{"type": "string", "description": "Search query"},
					},
					"required": []string{"query"},
				},
			},
		}
	case "everything":
		tools = []gin.H{
			{
				"name":        "echo",
				"description": "Simply returns the input provided. Used for testing.",
				"inputSchema": gin.H{
					"type":       "object",
					"properties": gin.H{"message": gin.H{"type": "string"}},
					"required":   []string{"message"},
				},
			},
		}
	case "sequential_thinking":
		tools = []gin.H{
			{
				"name":        "think",
				"description": "Break down a complex problem into sequential, logical steps.",
				"inputSchema": gin.H{
					"type": "object",
					"properties": gin.H{
						"problem": gin.H{"type": "string", "description": "The problem to think through"},
					},
					"required": []string{"problem"},
				},
			},
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"mcp_id": mcpID,
		"tools":  tools,
	})
}

// InstallMCP simulates downloading and installing an MCP binary.
func InstallMCP(c *gin.Context) {
	mcpID := c.Param("id")
	log.Printf("[MCP] Installing/Downloading binary for: %s", mcpID)

	// In a real scenario, this would:
	// 1. Fetch the binary URL from the registry
	// 2. Download it to a local folder (e.g., ~/.octomus/bin)
	// 3. Mark the MCP as "ready" in the local state

	// Simulation:
	log.Printf("[MCP] Successfully installed binary for %s", mcpID)

	c.JSON(http.StatusOK, gin.H{
		"message": "Binary installed successfully",
		"mcp_id":  mcpID,
		"status":  "installed",
	})
}
