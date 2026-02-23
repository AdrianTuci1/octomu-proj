package backend

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"sync"
)

// MCPManager centralizes the lifecycle and execution of both local and remote MCPs.
type MCPManager struct {
	ctx              context.Context
	activeMCPs       map[string]*MCPClient
	activeRemoteMCPs map[string]*RemoteMCPClient
	mcpMutex         sync.Mutex
}

// NewMCPManager creates a new MCPManager instance.
func NewMCPManager(ctx context.Context) *MCPManager {
	return &MCPManager{
		ctx:              ctx,
		activeMCPs:       make(map[string]*MCPClient),
		activeRemoteMCPs: make(map[string]*RemoteMCPClient),
	}
}

// CheckBinary checks if a binary exists for a given MCP
func (m *MCPManager) CheckBinary(mcpId string) bool {
	binPath := filepath.Join("bin", mcpId)
	_, err := os.Stat(binPath)
	return err == nil && !os.IsNotExist(err)
}

// DownloadBinary downloads a binary from a URL and saves it locally
func (m *MCPManager) DownloadBinary(mcpId string, url string) (string, error) {
	destPath := filepath.Join("bin", mcpId)

	downloader := NewDownloader(m.ctx)
	if err := downloader.Download(mcpId, url, destPath); err != nil {
		return "", err
	}

	return destPath, nil
}

// ensureMCPClient returns a running MCP client for the given ID, starting it if necessary
func (m *MCPManager) ensureMCPClient(mcpId string, apiKey string, envVarName string) (*MCPClient, error) {
	m.mcpMutex.Lock()
	defer m.mcpMutex.Unlock()

	client, exists := m.activeMCPs[mcpId]
	if exists {
		return client, nil
	}

	binPath := filepath.Join("bin", mcpId)
	if _, err := os.Stat(binPath); os.IsNotExist(err) {
		absPath, _ := filepath.Abs(binPath)
		return nil, fmt.Errorf("binary not found at %s", absPath)
	}

	// Prepare Environment
	env := os.Environ()
	if apiKey != "" {
		if envVarName != "" {
			env = append(env, fmt.Sprintf("%s=%s", envVarName, apiKey))
		}
		env = append(env, fmt.Sprintf("API_KEY=%s", apiKey))
		autoEnv := fmt.Sprintf("%s_API_KEY", strings.ToUpper(strings.ReplaceAll(mcpId, "-", "_")))
		env = append(env, fmt.Sprintf("%s=%s", autoEnv, apiKey))
	}

	// 1. Start Subprocess via MCP Client
	newClient, err := NewMCPClient(binPath, []string{}, env)
	if err != nil {
		return nil, fmt.Errorf("failed to start mcp client: %v", err)
	}

	// 2. Initialize Handshake
	initParams := map[string]any{
		"protocolVersion": "2024-11-05",
		"capabilities":    map[string]any{},
		"clientInfo": map[string]string{
			"name":    "octomus-client",
			"version": "1.0.0",
		},
	}

	fmt.Printf("[MCP Manager] Sending initialize to %s...\n", mcpId)
	initResp, err := newClient.SendRequest("initialize", initParams)
	if err != nil {
		newClient.Close()
		return nil, fmt.Errorf("mcp initialize failed: %v", err)
	}
	if initResp.Error != nil {
		newClient.Close()
		return nil, fmt.Errorf("mcp initialize error: %s", initResp.Error.Message)
	}

	// 3. Send Initialized Notification
	if err := newClient.SendNotification("notifications/initialized", map[string]any{}); err != nil {
		newClient.Close()
		return nil, fmt.Errorf("failed to send initialized notification: %v", err)
	}

	m.activeMCPs[mcpId] = newClient
	return newClient, nil
}

// ExecuteBinary runs a local binary, performs MCP handshake, and calls the tool
func (m *MCPManager) ExecuteBinary(mcpId string, toolName string, args map[string]interface{}, apiKey string, envVarName string) (string, error) {
	client, err := m.ensureMCPClient(mcpId, apiKey, envVarName)
	if err != nil {
		return "", err
	}

	callParams := map[string]any{
		"name":      toolName,
		"arguments": args,
	}

	callResp, err := client.SendRequest("tools/call", callParams)
	if err != nil {
		return "", fmt.Errorf("tool call request failed: %v", err)
	}
	if callResp.Error != nil {
		return "", fmt.Errorf("tool execution logic error: %s", callResp.Error.Message)
	}

	var toolResult struct {
		Content []struct {
			Type string `json:"type"`
			Text string `json:"text"`
		} `json:"content"`
	}

	if err := json.Unmarshal(callResp.Result, &toolResult); err != nil {
		return string(callResp.Result), nil
	}

	var out strings.Builder
	for i, block := range toolResult.Content {
		if block.Type == "text" {
			if i > 0 {
				out.WriteString("\n---\n")
			}
			out.WriteString(block.Text)
		}
	}

	if out.Len() == 0 {
		return string(callResp.Result), nil
	}

	return out.String(), nil
}

// ListTools queries an MCP binary for tool schemas.
func (m *MCPManager) ListTools(mcpId string, apiKey string, envVarName string) (string, error) {
	client, err := m.ensureMCPClient(mcpId, apiKey, envVarName)
	if err != nil {
		return "", err
	}

	callResp, err := client.SendRequest("tools/list", map[string]any{})
	if err != nil {
		return "", fmt.Errorf("tools/list request failed: %v", err)
	}
	if callResp.Error != nil {
		return "", fmt.Errorf("tool listing logic error: %s", callResp.Error.Message)
	}

	return string(callResp.Result), nil
}

// ensureRemoteMCPClient returns (or creates) a RemoteMCPClient for the given MCP.
func (m *MCPManager) ensureRemoteMCPClient(mcpId, endpoint, token string) (*RemoteMCPClient, error) {
	m.mcpMutex.Lock()
	defer m.mcpMutex.Unlock()

	if existing, ok := m.activeRemoteMCPs[mcpId]; ok {
		if existing.Token == token {
			return existing, nil
		}
		fmt.Printf("[MCP Manager] Remote %s: Token changed. Re-initializing...\n", mcpId)
		delete(m.activeRemoteMCPs, mcpId)
	}

	c := NewRemoteMCPClient(endpoint, token)

	initParams := map[string]any{
		"protocolVersion": "2024-11-05",
		"capabilities":    map[string]any{},
		"clientInfo": map[string]any{
			"name":    "octomus-wails-client",
			"version": "1.0.0",
		},
	}

	initResp, err := c.SendRequest("initialize", initParams)
	if err != nil {
		return nil, fmt.Errorf("remote handshake failed: %v", err)
	}
	if initResp.Error != nil {
		return nil, fmt.Errorf("remote initialize error: %s", initResp.Error.Message)
	}

	if err := c.SendNotification("notifications/initialized", map[string]any{}); err != nil {
		return nil, fmt.Errorf("failed to send remote initialized notification: %v", err)
	}

	m.activeRemoteMCPs[mcpId] = c
	return c, nil
}

// ListToolsRemote fetches the tool schema from a remote HTTP MCP server.
func (m *MCPManager) ListToolsRemote(mcpId, endpoint, token string) (string, error) {
	if token == "" {
		saved, _ := GetCredential(mcpId + "_token")
		token = saved
	}

	client, err := m.ensureRemoteMCPClient(mcpId, endpoint, token)
	if err != nil {
		return "", err
	}

	resp, err := client.ListTools()
	if err != nil {
		m.mcpMutex.Lock()
		delete(m.activeRemoteMCPs, mcpId)
		m.mcpMutex.Unlock()
		return "", err
	}
	if resp.Error != nil {
		return "", fmt.Errorf("remote tools/list error: %s", resp.Error.Message)
	}

	fmt.Printf("[MCP Manager] ListToolsRemote: result snippet: %.100s...\n", string(resp.Result))
	return string(resp.Result), nil
}

// ExecuteRemoteTool calls a specific tool on a remote HTTP MCP server.
func (m *MCPManager) ExecuteRemoteTool(mcpId, endpoint, token, toolName string, args map[string]interface{}) (string, error) {
	if token == "" {
		saved, _ := GetCredential(mcpId + "_token")
		token = saved
	}

	client, err := m.ensureRemoteMCPClient(mcpId, endpoint, token)
	if err != nil {
		return "", err
	}

	resp, err := client.CallTool(toolName, args)
	if err != nil {
		m.mcpMutex.Lock()
		delete(m.activeRemoteMCPs, mcpId)
		m.mcpMutex.Unlock()
		return "", err
	}
	if resp.Error != nil {
		return "", fmt.Errorf("remote tool error: %s", resp.Error.Message)
	}

	var toolResult struct {
		Content []struct {
			Type string `json:"type"`
			Text string `json:"text"`
		} `json:"content"`
	}
	if err := json.Unmarshal(resp.Result, &toolResult); err != nil {
		return string(resp.Result), nil
	}

	var out strings.Builder
	for i, block := range toolResult.Content {
		if block.Type == "text" {
			if i > 0 {
				out.WriteString("\n---\n")
			}
			out.WriteString(block.Text)
		}
	}
	if out.Len() == 0 {
		return string(resp.Result), nil
	}
	return out.String(), nil
}

// StopBinary kills a running MCP binary process and removes it from the active map.
func (m *MCPManager) StopBinary(mcpId string) error {
	m.mcpMutex.Lock()
	defer m.mcpMutex.Unlock()

	client, exists := m.activeMCPs[mcpId]
	if !exists {
		return nil // Already stopped or not running
	}

	fmt.Printf("[MCP Manager] Stopping binary for %s...\n", mcpId)
	err := client.Close()
	delete(m.activeMCPs, mcpId)
	return err
}

func (m *MCPManager) ExchangeToken(mcpId, tokenURL, clientId, clientSecret string, scopes []string) (string, error) {
	fmt.Printf("[MCP Manager] Exchanging tokens for %s via %s...\n", mcpId, tokenURL)

	data := url.Values{}
	data.Set("grant_type", "client_credentials")
	data.Set("client_id", clientId)
	data.Set("client_secret", clientSecret)
	if len(scopes) > 0 {
		data.Set("scope", strings.Join(scopes, " "))
	}

	resp, err := http.PostForm(tokenURL, data)
	if err != nil {
		return "", fmt.Errorf("token exchange request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("token exchange failed (%d): %s", resp.StatusCode, string(body))
	}

	var result struct {
		AccessToken string `json:"access_token"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("failed to decode token response: %v", err)
	}

	if result.AccessToken == "" {
		return "", fmt.Errorf("received empty access token")
	}

	// Save to keychain automatically
	err = SaveCredential(mcpId+"_token", result.AccessToken)
	if err != nil {
		fmt.Printf("[MCP Manager] WARNING: Failed to save token to keychain: %v\n", err)
	}

	return result.AccessToken, nil
}
