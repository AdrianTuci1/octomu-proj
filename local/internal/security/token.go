package security

import (
	"crypto/rand"
	"encoding/hex"
	"sync"
)

// TokenManager handles generation and validation of access tokens
type TokenManager struct {
	currentToken string
	mu           sync.RWMutex
}

// NewTokenManager creates a new token manager
func NewTokenManager() *TokenManager {
	return &TokenManager{}
}

// GenerateToken creates a new random secure token and stores it
func (tm *TokenManager) GenerateToken() (string, error) {
	tm.mu.Lock()
	defer tm.mu.Unlock()

	bytes := make([]byte, 32) // 256-bit token
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}

	tm.currentToken = hex.EncodeToString(bytes)
	return tm.currentToken, nil
}

// SetToken sets a specific token (e.g. from env var or persistence)
func (tm *TokenManager) SetToken(token string) {
	tm.mu.Lock()
	defer tm.mu.Unlock()
	tm.currentToken = token
}

// ValidateToken checks if the provided token matches the current active token
func (tm *TokenManager) ValidateToken(token string) bool {
	tm.mu.RLock()
	defer tm.mu.RUnlock()
	
	if tm.currentToken == "" {
		return false
	}
	return tm.currentToken == token
}

// GetToken returns the current token
func (tm *TokenManager) GetToken() string {
	tm.mu.RLock()
	defer tm.mu.RUnlock()
	return tm.currentToken
}
