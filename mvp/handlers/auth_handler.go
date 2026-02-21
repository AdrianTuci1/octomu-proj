package handlers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"octomus-cloud/models"
)

// StartOAuth initializes the OAuth flow
// It acts as a wrapper to protect the Developer Console Client IDs/Secrets from shipping in the Wails binary.
func StartOAuth(c *gin.Context) {
	provider := c.Param("provider")
	log.Printf("Initiating OAuth Wrapper flow for: %s", provider)

	// Cloud constructs the real URL using its hidden server-side Client ID
	authURL := "https://api.octomus.cloud/mock-login/" + provider
	
	c.JSON(http.StatusOK, gin.H{
		"provider": provider,
		"auth_url": authURL,
	})
}

// OAuthCallback handles the redirect after a user authenticates with the external SaaS.
// CRITICAL: The Cloud Server exchanges the code for tokens, but DOES NOT store them.
// It acts purely as a passthrough, returning the raw tokens securely to the Wails client 
// so the client can store them in its local encrypted vault.
func OAuthCallback(c *gin.Context) {
	provider := c.Param("provider")
	code := c.Query("code")

	if code == "" {
		c.JSON(http.StatusBadRequest, models.MessageResponse{
			Message: "Missing authorization code",
			Status:  "error",
		})
		return
	}

	log.Printf("OAuth Callback received for %s with code: %s", provider, code)

	// Mocking the exchange of `code` for an Access Token
	// In production, this securely calls Slack/Google with the Cloud's Client Secret.
	mockAccessToken := "raw-access-token-for-" + provider + "-59x8a"
	mockRefreshToken := "raw-refresh-token-for-" + provider + "-11b2z"

	// Handoff: The Cloud sends the tokens back to the Client (e.g. via deep-link redirect or secure WebSocket).
	// For this MVP HTTP request, we return them in the JSON payload.
	c.JSON(http.StatusOK, gin.H{
		"message": "Authentication successful. Secure handoff initiated.",
		"status":  "success",
		"provider": provider,
		"handoff_payload": gin.H{
			"access_token": mockAccessToken,
			"refresh_token": mockRefreshToken,
			"expires_in": 3600,
		},
	})
}
