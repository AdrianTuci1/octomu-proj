package handlers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"octomus-cloud/models"
)

// ProxyLLMChat acts as a secure proxy between the Wails client and the Gemini API.
// 1. Client sends conversational history + available Tool schemas.
// 2. Cloud Server injects its secure Gemini API Key.
// 3. Cloud Server calls Gemini.
// 4. Cloud Server returns the raw textual answer OR the Tool Call request back to the client.
func ProxyLLMChat(c *gin.Context) {
	var req models.ProxiedChatRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.MessageResponse{
			Message: "Invalid chat payload format",
			Status:  "error",
			Details: err.Error(),
		})
		return
	}

	log.Printf("[LLM PROXY] Received request with %d messages and %d tool schemas.", len(req.Messages), len(req.Tools))

	// In production, we would initialize the Google Generative AI SDK here using os.Getenv("GEMINI_API_KEY").
	// For the MVP, we mock the Gemini decision logic.

	// Mock Logic: If tools are provided, simulate a tool call. Otherwise, return text.
	if len(req.Tools) > 0 {
		log.Println("[LLM PROXY] Tools detected. Simulating a Tool Call decision from Gemini.")
		
		// Let's pretend the first tool passed in was "slack_search"
		// The client will receive this, see the tool call, and execute its local MCP connection.
		c.JSON(http.StatusOK, models.ProxiedChatResponse{
			Role: "assistant",
			ToolCall: gin.H{
				"name": "slack_search",
				"arguments": gin.H{
					"query": "project updates",
				},
			},
		})
		return
	}

	// Mock Logic: Standard text response
	log.Println("[LLM PROXY] Standard chat mode. Simulating text response.")
	c.JSON(http.StatusOK, models.ProxiedChatResponse{
		Role:    "assistant",
		Content: "I am Octomus Cloud AI (Gemini MVP). I noticed you didn't provide any tools, so I am answering directly.",
	})
}
