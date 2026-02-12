package auth

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

// TokenStorage defines interface for saving tokens
type TokenStorage interface {
	SaveToken(provider string, token *oauth2.Token) error
	GetToken(provider string) (*oauth2.Token, error)
}

type AuthService struct {
	storage         TokenStorage
	configs         map[string]*oauth2.Config
	cloudURL        string
	isCloudEnabled  bool
}

func NewAuthService(storage TokenStorage) *AuthService {
	// Initialize with dummy creds or from env
	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	clientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")
	redirectURL := "http://localhost:8080/auth/callback?provider=google"

	cloudURL := os.Getenv("OCTOMUS_CLOUD_URL")
	if cloudURL == "" {
		cloudURL = "https://octomus.dev" // Default
	}
	
	// Check if we should use cloud auth (if no local keys provided, or explicitly requested)
	useCloud := os.Getenv("OCTOMUS_USE_CLOUD_AUTH") == "true" || (clientID == "" && clientSecret == "")

	return &AuthService{
		storage:        storage,
		cloudURL:       cloudURL,
		isCloudEnabled: useCloud,
		configs: map[string]*oauth2.Config{
			"google": {
				ClientID:     clientID,
				ClientSecret: clientSecret,
				RedirectURL:  redirectURL,
				Scopes: []string{
					"https://www.googleapis.com/auth/userinfo.email",
					"https://www.googleapis.com/auth/drive.readonly", // Example scope
				},
				Endpoint: google.Endpoint,
			},
		},
	}
}

func (s *AuthService) LoginHandler(w http.ResponseWriter, r *http.Request) {
	provider := r.URL.Query().Get("provider")
	
	if s.isCloudEnabled {
		// Redirect to Octomus Cloud Auth
		// We send the provider we want (e.g. google) and our local callback
		// The cloud will handle the OAuth flow with the provider
		callbackURL := fmt.Sprintf("http://localhost:8080/auth/callback?provider=%s", provider)
		
		// Generate random state
		b := make([]byte, 16)
		rand.Read(b)
		state := base64.URLEncoding.EncodeToString(b)
		
		authURL := fmt.Sprintf("%s/auth/connect/%s?redirect_uri=%s&state=%s", 
			s.cloudURL, 
			provider, 
			url.QueryEscape(callbackURL),
			state,
		)
		
		http.Redirect(w, r, authURL, http.StatusTemporaryRedirect)
		return
	}

	config, ok := s.configs[provider]
	if !ok {
		http.Error(w, "Provider not supported", http.StatusBadRequest)
		return
	}

	// Generate random state
	b := make([]byte, 16)
	rand.Read(b)
	state := base64.URLEncoding.EncodeToString(b)
	// TODO: Store state in cookie to verify callback

	url := config.AuthCodeURL(state, oauth2.AccessTypeOffline)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func (s *AuthService) CallbackHandler(w http.ResponseWriter, r *http.Request) {
	provider := r.URL.Query().Get("provider")
	
	code := r.URL.Query().Get("code")
	if code == "" {
		http.Error(w, "Code not found", http.StatusBadRequest)
		return
	}

	var token *oauth2.Token
	var err error

	if s.isCloudEnabled {
		// Exchange code with Octomus Cloud for the actual provider token
		token, err = s.exchangeCloudCode(code, provider)
	} else {
		config, ok := s.configs[provider]
		if !ok {
			http.Error(w, "Provider not supported", http.StatusBadRequest)
			return
		}
		token, err = config.Exchange(context.Background(), code)
	}

	if err != nil {
		log.Printf("Failed to exchange token: %v", err)
		http.Error(w, "Failed to exchange token: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if err := s.storage.SaveToken(provider, token); err != nil {
		log.Printf("Failed to save token: %v", err)
		http.Error(w, "Failed to save token", http.StatusInternalServerError)
		return
	}

	// Redirect back to frontend settings
	http.Redirect(w, r, "/settings?status=success", http.StatusTemporaryRedirect)
}

func (s *AuthService) exchangeCloudCode(code, provider string) (*oauth2.Token, error) {
	// Call Octomus Cloud API to exchange the temporary code for the provider's token
	reqBody, _ := json.Marshal(map[string]string{
		"code":     code,
		"provider": provider,
	})

	resp, err := http.Post(
		fmt.Sprintf("%s/api/auth/exchange", s.cloudURL),
		"application/json",
		bytes.NewBuffer(reqBody),
	)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("cloud exchange failed with status: %d", resp.StatusCode)
	}

	var token oauth2.Token
	if err := json.NewDecoder(resp.Body).Decode(&token); err != nil {
		return nil, err
	}
	
	return &token, nil
}
