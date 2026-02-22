package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"

	"octomus-cloud/models"

	"github.com/gin-gonic/gin"
)

// StartOAuth initiates the OAuth2 flow for a given MCP provider.
// The cloud server acts as a proxy so that OAuth Client IDs/Secrets are NEVER
// shipped inside the Wails binary. The client only knows our cloud URL.
//
// Flow:
//  1. Wails calls GET /v1/auth/start/:provider  (e.g. "github", "slack")
//  2. Cloud reads registry to find auth_config.authorization_url and scopes
//  3. Cloud builds the real OAuth authorization URL using its own Client ID
//  4. Cloud returns that URL to Wails, which opens it in the system browser
//  5. After login, provider redirects to cloud /v1/oauth/callback/:provider
//  6. Cloud exchanges code for tokens, then redirects to octomus://oauth/callback?token=...
//  7. Wails intercepts the deep link and stores the token in macOS Keychain
func StartOAuth(c *gin.Context) {
	provider := c.Param("provider")
	log.Printf("[Auth] Starting OAuth flow for provider: %s", provider)

	// Load the registry to find auth config for this provider
	registry, err := loadRegistry()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load registry"})
		return
	}

	var item *models.MCPRegistryItem
	for i := range registry {
		if registry[i].ID == provider {
			item = &registry[i]
			break
		}
	}

	if item == nil || item.AuthType != "oauth2" {
		c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("No OAuth2 config found for provider: %s", provider)})
		return
	}

	// The cloud uses its own Client ID (stored as env var, never sent to client)
	clientID := os.Getenv(fmt.Sprintf("OAUTH_CLIENT_ID_%s", provider))
	if clientID == "" {
		// Fallback: use a placeholder for development
		clientID = "octomus-dev-client"
		log.Printf("[Auth] WARNING: OAUTH_CLIENT_ID_%s not set, using dev placeholder", provider)
	}

	// Build the real authorization URL
	authURL := item.AuthConfig.AuthorizationURL
	redirectURI := fmt.Sprintf("https://api.octomus.cloud/v1/oauth/callback/%s", provider)

	params := url.Values{}
	params.Set("client_id", clientID)
	params.Set("redirect_uri", redirectURI)
	params.Set("response_type", "code")
	if len(item.AuthConfig.Scopes) > 0 {
		scopeStr := ""
		for i, s := range item.AuthConfig.Scopes {
			if i > 0 {
				scopeStr += " "
			}
			scopeStr += s
		}
		params.Set("scope", scopeStr)
	}

	fullAuthURL := authURL + "?" + params.Encode()
	log.Printf("[Auth] Redirecting client to: %s", fullAuthURL)

	c.JSON(http.StatusOK, gin.H{
		"provider": provider,
		"auth_url": fullAuthURL,
	})
}

// OAuthCallback handles the redirect from the OAuth provider after user login.
//
// CRITICAL DESIGN:
//   - The Cloud exchanges the authorization code for tokens using its own Client Secret
//   - The Cloud does NOT store the tokens — it acts as a secure passthrough
//   - After obtaining tokens, the Cloud redirects to octomus://oauth/callback?token=...
//   - The Wails client intercepts this deep link and stores the token in macOS Keychain
func OAuthCallback(c *gin.Context) {
	provider := c.Param("provider")
	code := c.Query("code")
	errorParam := c.Query("error")

	if errorParam != "" {
		log.Printf("[Auth] OAuth error for %s: %s", provider, errorParam)
		// Redirect back to the app with an error signal
		c.Redirect(http.StatusFound, fmt.Sprintf("octomus://oauth/callback?error=%s", url.QueryEscape(errorParam)))
		return
	}

	if code == "" {
		c.JSON(http.StatusBadRequest, models.MessageResponse{
			Message: "Missing authorization code",
			Status:  "error",
		})
		return
	}

	log.Printf("[Auth] Received OAuth code for provider=%s, exchanging for token...", provider)

	// TODO (production): Exchange code for real token using provider's token endpoint
	// This requires the Client Secret stored securely on the cloud server.
	//
	// Example exchange (GitHub):
	//   POST https://github.com/login/oauth/access_token
	//   Body: client_id=..., client_secret=..., code=code
	//
	// For now, we construct a mock token structure to validate the flow.
	accessToken := "mock-access-token-for-" + provider + "-" + code[:min(8, len(code))]

	// Redirect to the Wails deep link — the client intercepts this with the URL scheme handler
	deepLink := fmt.Sprintf("octomus://oauth/callback?provider=%s&token=%s",
		url.QueryEscape(provider),
		url.QueryEscape(accessToken),
	)

	log.Printf("[Auth] Redirecting to deep link: %s", deepLink)
	c.Redirect(http.StatusFound, deepLink)
}

// ExchangeToken handles token exchange for both OAuth2 grant types:
//
//   - client_credentials: client sends their own client_id + client_secret;
//     cloud forwards to provider's token endpoint with the user's credentials.
//     This is for M2M APIs (like Contabo) where there is no user login.
//   - authorization_code: client sends a code received from the OAuth redirect;
//     cloud exchanges it using the Octomus Client Secret (never sent to client).
//
// In both cases, the resulting access_token is returned to the client to be
// stored in macOS Keychain. The cloud never persists tokens.
func ExchangeToken(c *gin.Context) {
	provider := c.Param("provider")

	var req struct {
		GrantType    string   `json:"grant_type" binding:"required"`
		Code         string   `json:"code"`          // authorization_code
		ClientID     string   `json:"client_id"`     // client_credentials
		ClientSecret string   `json:"client_secret"` // client_credentials
		Scopes       []string `json:"scopes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	log.Printf("[Auth] ExchangeToken: provider=%s grant_type=%s", provider, req.GrantType)

	// Load registry entry for this provider to find the provider's token endpoint
	registry, err := loadRegistry()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load registry"})
		return
	}
	var item *models.MCPRegistryItem
	for i := range registry {
		if registry[i].ID == provider {
			item = &registry[i]
			break
		}
	}

	switch req.GrantType {

	case "client_credentials":
		// The user provides their own client_id + client_secret for the provider.
		// We forward these directly to the provider's token endpoint.
		if req.ClientID == "" || req.ClientSecret == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "client_id and client_secret are required for client_credentials grant"})
			return
		}

		// Determine the provider's real token endpoint
		providerTokenURL := ""
		if item != nil && item.AuthConfig.TokenURL != "" {
			// Use provider's actual token URL from a server-side mapping
			providerTokenURL = os.Getenv(fmt.Sprintf("OAUTH_TOKEN_URL_%s", provider))
		}
		if providerTokenURL == "" {
			// Fallback mock for development
			log.Printf("[Auth] WARNING: OAUTH_TOKEN_URL_%s not set, returning mock token", provider)
			c.JSON(http.StatusOK, gin.H{
				"access_token": fmt.Sprintf("mock-cc-token-for-%s", provider),
				"token_type":   "Bearer",
				"expires_in":   3600,
			})
			return
		}

		// Forward client credentials to provider's token endpoint
		formData := url.Values{}
		formData.Set("grant_type", "client_credentials")
		formData.Set("client_id", req.ClientID)
		formData.Set("client_secret", req.ClientSecret)
		if len(req.Scopes) > 0 {
			formData.Set("scope", strings.Join(req.Scopes, " "))
		}

		resp, err := http.PostForm(providerTokenURL, formData)
		if err != nil {
			c.JSON(http.StatusBadGateway, gin.H{"error": fmt.Sprintf("Token endpoint request failed: %v", err)})
			return
		}
		defer resp.Body.Close()

		var tokenResp map[string]interface{}
		if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
			c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to decode token response"})
			return
		}

		if resp.StatusCode != http.StatusOK {
			log.Printf("[Auth] Token exchange failed for %s: %v", provider, tokenResp)
			c.JSON(resp.StatusCode, gin.H{"error": "Token exchange failed", "details": tokenResp})
			return
		}

		log.Printf("[Auth] client_credentials exchange successful for provider=%s", provider)
		c.JSON(http.StatusOK, tokenResp)

	case "authorization_code":
		// The Octomus server holds the Client Secret; client only sends the code.
		if req.Code == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "code is required for authorization_code grant"})
			return
		}

		clientID := os.Getenv(fmt.Sprintf("OAUTH_CLIENT_ID_%s", provider))
		clientSecret := os.Getenv(fmt.Sprintf("OAUTH_CLIENT_SECRET_%s", provider))
		if clientID == "" || clientSecret == "" {
			log.Printf("[Auth] WARNING: OAuth credentials not configured for %s, returning mock token", provider)
			c.JSON(http.StatusOK, gin.H{
				"access_token": fmt.Sprintf("mock-ac-token-for-%s", provider),
				"token_type":   "Bearer",
				"expires_in":   3600,
			})
			return
		}

		// TODO (production): make real token exchange request to provider
		c.JSON(http.StatusOK, gin.H{
			"access_token": fmt.Sprintf("exchanged-ac-token-for-%s", provider),
			"token_type":   "Bearer",
			"expires_in":   3600,
		})

	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("unsupported grant_type: %s", req.GrantType)})
	}
}

// loadRegistry is a helper to read the MCP registry JSON file.
func loadRegistry() ([]models.MCPRegistryItem, error) {
	registryPath := os.Getenv("REGISTRY_PATH")
	if registryPath == "" {
		registryPath = "./data/mcp_registry.json"
	}
	file, err := os.ReadFile(registryPath)
	if err != nil {
		return nil, err
	}
	var registry []models.MCPRegistryItem
	return registry, json.Unmarshal(file, &registry)
}

// min is a local helper for Go < 1.21 compatibility
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
