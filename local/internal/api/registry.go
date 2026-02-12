package api

import (
	"fmt"
	"io"
	"net/http"
)

// RegistryHandler proxies requests to the official MCP registry
func RegistryHandler(w http.ResponseWriter, r *http.Request) {
	// Add search query parameter handling if needed
	query := r.URL.Query().Encode()
	url := "https://registry.modelcontextprotocol.io/v0.1/servers"
	if query != "" {
		url += "?" + query
	}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to create request: %v", err), http.StatusInternalServerError)
		return
	}

	// Forward necessary headers if any, or set user agent
	req.Header.Set("User-Agent", "Octomus-Local/0.1.0")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to fetch registry: %v", err), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		// Try to read error body
		body, _ := io.ReadAll(resp.Body)
		http.Error(w, fmt.Sprintf("Registry returned status: %d, body: %s", resp.StatusCode, string(body)), http.StatusBadGateway)
		return
	}

	// Copy headers
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=300") // 5 min cache

	// Stream the response body directly to the client
	_, err = io.Copy(w, resp.Body)
	if err != nil {
		// Can't effectively report error here as headers might be sent
		fmt.Printf("Error streaming registry response: %v\n", err)
	}
}
