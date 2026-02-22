package backend

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"sync/atomic"
	"time"
)

// RemoteMCPClient manages JSON-RPC communication with a remote HTTP MCP server.
// Unlike MCPClient (stdio), this client sends each request as a stateless HTTP POST
// with a Bearer token in the Authorization header.
type RemoteMCPClient struct {
	Endpoint   string
	Token      string
	httpClient *http.Client
	seq        int64
	mu         sync.Mutex
}

// NewRemoteMCPClient creates a new RemoteMCPClient for the given endpoint and bearer token.
func NewRemoteMCPClient(endpoint, token string) *RemoteMCPClient {
	return &RemoteMCPClient{
		Endpoint: endpoint,
		Token:    token,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// SendRequest sends a JSON-RPC 2.0 request to the remote HTTP endpoint and returns the response.
// Unlike the stdio MCPClient, no persistent state or handshake is needed — each call is independent.
func (r *RemoteMCPClient) SendRequest(method string, params any) (*JSONRPCResponse, error) {
	id := atomic.AddInt64(&r.seq, 1)
	reqBody := JSONRPCRequest{
		JSONRPC: "2.0",
		Method:  method,
		Params:  params,
		ID:      id,
	}

	bodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("remote mcp: marshal request: %w", err)
	}

	fmt.Printf("[RemoteMCP] → [%d] %s  method: %s\n", id, r.Endpoint, method)

	req, err := http.NewRequest(http.MethodPost, r.Endpoint, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("remote mcp: create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	if r.Token != "" {
		req.Header.Set("Authorization", "Bearer "+r.Token)
	}

	resp, err := r.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("remote mcp: http call failed: %w", err)
	}
	defer resp.Body.Close()

	fmt.Printf("[RemoteMCP] ← [%d] Status: %d\n", id, resp.StatusCode)

	if resp.StatusCode == http.StatusUnauthorized {
		return nil, fmt.Errorf("remote mcp: unauthorized (401) — check your token")
	}
	if resp.StatusCode >= 400 {
		bodySnippet, _ := io.ReadAll(io.LimitReader(resp.Body, 1024))
		fmt.Printf("[RemoteMCP] ERROR BODY [%d]: %s\n", id, string(bodySnippet))
		return nil, fmt.Errorf("remote mcp: server error %d: %s", resp.StatusCode, string(bodySnippet))
	}

	var respBytes []byte
	respBytes, err = io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("remote mcp: read response body: %w", err)
	}

	fmt.Printf("[RemoteMCP] RAW RECV from %s [%d]: %s\n", r.Endpoint, id, string(respBytes))

	var rpcResp JSONRPCResponse
	if err := json.Unmarshal(respBytes, &rpcResp); err != nil {
		return nil, fmt.Errorf("remote mcp: decode response: %w", err)
	}

	return &rpcResp, nil
}

// SendNotification sends a JSON-RPC 2.0 notification (no ID, no response) to the remote server.
func (r *RemoteMCPClient) SendNotification(method string, params any) error {
	reqBody := JSONRPCRequest{
		JSONRPC: "2.0",
		Method:  method,
		Params:  params,
	}

	bodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("remote mcp: marshal notification: %w", err)
	}

	fmt.Printf("[RemoteMCP] (NOTIF) → %s  method: %s\n", r.Endpoint, method)

	req, err := http.NewRequest(http.MethodPost, r.Endpoint, bytes.NewReader(bodyBytes))
	if err != nil {
		return fmt.Errorf("remote mcp: create notification: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	if r.Token != "" {
		req.Header.Set("Authorization", "Bearer "+r.Token)
	}

	resp, err := r.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("remote mcp: http notification failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("remote mcp: server rejected notification with %d", resp.StatusCode)
	}

	return nil
}

// ListTools fetches the tool spec from the remote server using the tools/list method.
func (r *RemoteMCPClient) ListTools() (*JSONRPCResponse, error) {
	return r.SendRequest("tools/list", map[string]any{})
}

// CallTool invokes a specific tool on the remote server.
func (r *RemoteMCPClient) CallTool(toolName string, args map[string]any) (*JSONRPCResponse, error) {
	return r.SendRequest("tools/call", map[string]any{
		"name":      toolName,
		"arguments": args,
	})
}
