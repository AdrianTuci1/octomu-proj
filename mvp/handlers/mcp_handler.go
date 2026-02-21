package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"octomus/mvp/models"
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
				"name":        "search",
				"description": "Perform a powerful search across the web using Exa's neural search engine.",
				"parameters": gin.H{
					"query": "string",
					"num_results": "number",
				},
			},
			{
				"name":        "get_contents",
				"description": "Retrieve the cleaned, high-quality content of specific URLs.",
				"parameters": gin.H{
					"urls": "array",
				},
			},
		}
	case "memory":
		tools = []gin.H{
			{
				"name":        "store_knowledge",
				"description": "Save a new piece of information into the persistent knowledge graph.",
				"parameters": gin.H{
					"fact": "string",
					"entities": "array",
				},
			},
			{
				"name":        "query_knowledge",
				"description": "Retrieve stored facts based on relevance or entity matching.",
				"parameters": gin.H{
					"query": "string",
				},
			},
		}
	case "everything":
		tools = []gin.H{
			{
				"name": "echo",
				"description": "Simply returns the input provided. Used for testing.",
				"parameters": gin.H{"message": "string"},
			},
		}
	case "sequential_thinking":
		tools = []gin.H{
			{
				"name": "think",
				"description": "Break down a complex problem into sequential, logical steps.",
				"parameters": gin.H{"problem": "string", "steps": "number"},
			},
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"mcp_id": mcpID,
		"tools":  tools,
	})
}
