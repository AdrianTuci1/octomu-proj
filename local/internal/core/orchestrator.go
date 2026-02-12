package core

import (
	"fmt"
	"log"
	"time"

	"github.com/octomus/local/internal/security"
	"golang.org/x/oauth2"
)

// ServerStorage interface for persistence derived from storage implementation
type ServerStorage interface {
	SaveServer(server MCPServerConfig) error
	ListServers() ([]MCPServerConfig, error)
	GetServer(name string) (*MCPServerConfig, error)
	AppendHistory(record ExecutionRecord) error
	GetHistory(limit int) ([]ExecutionRecord, error)
	SaveToken(provider string, token *oauth2.Token) error
	GetToken(provider string) (*oauth2.Token, error)
}

// Orchestrator manages the lifecycle of MCP servers
type Orchestrator struct {
	storage ServerStorage
	vault   *security.Vault
}

func NewOrchestrator(storage ServerStorage, vault *security.Vault) *Orchestrator {
	return &Orchestrator{
		storage: storage,
		vault:   vault,
	}
}

func (o *Orchestrator) Start() error {
	log.Println("Core Engine: Orchestrator started")
	return nil
}

func (o *Orchestrator) Stop() {
	log.Println("Core Engine: Orchestrator stopped")
}

func (o *Orchestrator) GetStorage() ServerStorage {
    return o.storage
}

// RegisterServer encrypts sensitive env vars and saves the configuration
func (o *Orchestrator) RegisterServer(config MCPServerConfig) error {
	if config.Name == "" || config.Command == "" {
		return fmt.Errorf("name and command are required")
	}

	// Encrypt Environment Variables
	if config.Env != nil {
		encryptedEnv := make(map[string]string)
		for k, v := range config.Env {
			encryptedVal, err := o.vault.Encrypt(v)
			if err != nil {
				return fmt.Errorf("failed to encrypt env var %s: %w", k, err)
			}
			encryptedEnv[k] = encryptedVal
		}
		config.Env = encryptedEnv
	}

	return o.storage.SaveServer(config)
}

// ListServers returns all registered servers (with encrypted env vars)
// In a real usage, we might want to keep them encrypted until execution time.
func (o *Orchestrator) ListServers() ([]MCPServerConfig, error) {
	return o.storage.ListServers()
}

// GetToolSyncInfo returns the list of available tools for the LLM
func (o *Orchestrator) GetToolSyncInfo() (SyncResponse, error) {
	// TODO: In a real implementation, we would query the running MCP servers for their capabilities/lists.
	// For now, we return a mock list to demonstrate the "Sync" concept.
	servers, err := o.storage.ListServers()
	if err != nil {
		return SyncResponse{}, err
	}

	tools := []ToolDefinition{}
	for _, srv := range servers {
		// Mock tool based on server name
		tools = append(tools, ToolDefinition{
			Name:        srv.Name,
			Description: fmt.Sprintf("Toolset provided by %s", srv.Name),
			Schema:      map[string]any{"type": "object"}, // Dummy schema
		})
	}

	return SyncResponse{Tools: tools}, nil
}

// ExecuteTool handles the universal execution request
func (o *Orchestrator) ExecuteTool(req ExecutionRequest) (ExecutionResult, error) {
	start := time.Now()
	log.Printf("Execute Request: Tool=%s Method=%s", req.ToolName, req.Method)

	// 1. PermissionGuard
	if !o.checkPermission(req) {
		return ExecutionResult{Status: "error", Error: "Permission denied"}, nil
	}

	// 2. Runtime Execution
	serverConfig, err := o.storage.GetServer(req.ToolName) // Assuming ToolName maps to ServerName for now, or we need a lookup
    // note: simplistic mapping: in reaity we need to know WHICH server provides the tool. 
    // For this MVP, we will assume the User passed "ServerName" as "ToolName" or we look it up.
    // Let's assume the UI sends "server_name:tool_name" or we just try to find a server with that name.
    
    // Correction: req.ToolName usually is "weather" but we need to know it comes from "weather-server".
    // For now, let's assume the UI passes the ServerName in a separate field or we try to load it.
    // Looking at types.go, ExecutionRequest has `ToolName` and `ServerName`? No, let's check types.
    // We will update this to find the server. For now, let's try to load server by name if possible.
    
	if err != nil {
        // Fallback: maybe tool name IS server name for simple execute?
		return ExecutionResult{Status: "error", Error: fmt.Sprintf("Server not found: %s", req.ToolName)}, nil
	}

    // Prepare command
    cmdName := serverConfig.Command
    cmdArgs := serverConfig.Args
    
    // Decrypt Env
    env := make([]string, 0)
    for k, v := range serverConfig.Env {
        decrypted, err := o.vault.Decrypt(v)
        if err != nil {
             return ExecutionResult{Status: "error", Error: fmt.Sprintf("Failed to decrypt env %s: %v", k, err)}, nil
        }
        env = append(env, fmt.Sprintf("%s=%s", k, decrypted))
    }

    // Inject OAuth Tokens (e.g. Google)
    // For MVP: Check if we have a google token and inject it as GOOGLE_ACCESS_TOKEN
    if token, err := o.storage.GetToken("google"); err == nil && token.Valid() {
        env = append(env, fmt.Sprintf("GOOGLE_ACCESS_TOKEN=%s", token.AccessToken))
    }

    // Execute ephemeral MCP session
    result, err := o.runEphemeralMCPSession(cmdName, cmdArgs, env, req)
    
    status := "success"
    errMsg := ""
    if err != nil {
        status = "error"
        errMsg = err.Error()
        return ExecutionResult{Status: "error", Error: errMsg}, nil
    }

    execResult = ExecutionResult{
        Status: status,
        Result: result,
    }
    
	// 3. Audit Logging
	duration := time.Since(start).Milliseconds()
	record := ExecutionRecord{
		ID:         fmt.Sprintf("%d", start.UnixNano()),
		Timestamp:  start.Format(time.RFC3339),
		ToolName:   req.ToolName,
		Method:     req.Method,
		Arguments:  req.Arguments,
		Status:     execResult.Status,
		DurationMs: duration,
		Result:     execResult.Result,
		Error:      execResult.Error,
	}

	if err := o.storage.AppendHistory(record); err != nil {
		log.Printf("Failed to append history: %v", err)
	}

	return execResult, nil
}

// runEphemeralMCPSession spins up the server, handshakes, calls tool, and tears down
func (o *Orchestrator) runEphemeralMCPSession(cmdName string, args []string, env []string, req ExecutionRequest) (map[string]any, error) {
    client, err := NewMCPClient(cmdName, args, env)
    if err != nil {
        return nil, fmt.Errorf("failed to start subprocess: %w", err)
    }
    defer client.Close()

    // 1. Initialize
    initParams := map[string]any{
        "protocolVersion": "2024-11-05",
        "capabilities": map[string]any{
            "roots": map[string]any{
                "listChanged": true,
            },
        },
        "clientInfo": map[string]string{
            "name":    "octomus-local",
            "version": "0.1.0",
        },
    }
    
    initResp, err := client.SendRequest("initialize", initParams)
    if err != nil {
        return nil, fmt.Errorf("initialize failed: %w", err)
    }
    if initResp.Error != nil {
        return nil, fmt.Errorf("initialize error: %s", initResp.Error.Message)
    }

    // 2. Initialized Notification
    if err := client.SendNotification("notifications/initialized", map[string]any{}); err != nil {
        return nil, fmt.Errorf("failed to send initialized: %w", err)
    }

    // 3. Call Tool
    toolParams := map[string]any{
        "name": req.ToolName, // NOTE: MCP CallTool expects "name" and "arguments"
        "arguments": req.Arguments,
    }
    
    // In standard MCP, the method is tools/call
    callResp, err := client.SendRequest("tools/call", toolParams)
    if err != nil {
        return nil, fmt.Errorf("tools/call failed: %w", err)
    }
    if callResp.Error != nil {
        return nil, fmt.Errorf("tool execution error: %s", callResp.Error.Message)
    }

    // Parse result
    var result map[string]any
    if err := json.Unmarshal(callResp.Result, &result); err != nil {
        return nil, fmt.Errorf("failed to parse tool result: %w", err)
    }
    
    return result, nil
}

func (o *Orchestrator) GetHistory() ([]ExecutionRecord, error) {
	return o.storage.GetHistory(0) // 0 = no limit
}

func (o *Orchestrator) checkPermission(req ExecutionRequest) bool {
	// STUB: Implement real policy check
	return true
}

func (o *Orchestrator) auditLog(req ExecutionRequest) {
	// Deprecated in favor of inline history logging
}

