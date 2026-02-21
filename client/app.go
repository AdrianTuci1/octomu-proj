package main

import (
	"context"
	_ "embed"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"client/backend"

	hook "github.com/robotn/gohook"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx           context.Context
	windowVisible bool
	activeMCPs    map[string]*backend.MCPClient
	mcpMutex      sync.Mutex
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		windowVisible: true,
		activeMCPs:    make(map[string]*backend.MCPClient),
	}
}

//go:embed appicon.png
var trayIcon []byte

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.setupGlobalShortcut()

	// Hide window on blur
	runtime.EventsOn(ctx, "wails:window-blur", func(data ...interface{}) {
		runtime.WindowHide(a.ctx)
		a.windowVisible = false
	})
}

func (a *App) setupGlobalShortcut() {
	go func() {
		// Option (Alt) + Space
		hook.Register(hook.KeyDown, []string{"alt", "space"}, func(e hook.Event) {
			a.ToggleWindow()
		})
		fmt.Println("Shortcut înregistrat cu succes: Option + Space")
		<-hook.Process(hook.Start())
	}()
}

// ToggleWindow hides or shows the main window
func (a *App) ToggleWindow() {
	if a.ctx == nil {
		return
	}

	if a.windowVisible {
		runtime.WindowHide(a.ctx)
		a.windowVisible = false
	} else {
		runtime.WindowShow(a.ctx)
		runtime.WindowSetAlwaysOnTop(a.ctx, true)
		runtime.WindowCenter(a.ctx)
		a.windowVisible = true
	}
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// DownloadBinary downloads a binary from a URL and saves it locally
func (a *App) DownloadBinary(mcpId string, url string) (string, error) {
	destPath := filepath.Join("bin", mcpId)

	downloader := backend.NewDownloader(a.ctx)
	if err := downloader.Download(mcpId, url, destPath); err != nil {
		return "", err
	}

	return destPath, nil
}

// ensureMCPClient returns a running MCP client for the given ID, starting it if necessary
func (a *App) ensureMCPClient(mcpId string, apiKey string, envVarName string) (*backend.MCPClient, error) {
	a.mcpMutex.Lock()
	defer a.mcpMutex.Unlock()

	client, exists := a.activeMCPs[mcpId]
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
	newClient, err := backend.NewMCPClient(binPath, []string{}, env)
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

	fmt.Printf("[Wails] MCP: Sending initialize...\n")
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
	fmt.Printf("[Wails] MCP: Sending initialized notification...\n")
	if err := newClient.SendNotification("notifications/initialized", map[string]any{}); err != nil {
		newClient.Close()
		return nil, fmt.Errorf("failed to send initialized notification: %v", err)
	}

	a.activeMCPs[mcpId] = newClient
	return newClient, nil
}

// ExecuteBinary runs a local binary, performs MCP handshake, and calls the tool
func (a *App) ExecuteBinary(mcpId string, toolName string, args map[string]interface{}, apiKey string, envVarName string) (string, error) {
	fmt.Printf("[Wails] DEBUG: Executing Tool: %s on MCP: %s\n", toolName, mcpId)

	client, err := a.ensureMCPClient(mcpId, apiKey, envVarName)
	if err != nil {
		return "", err
	}

	// 4. Call Tool
	fmt.Printf("[Wails] MCP: Calling tool %s with args %+v\n", toolName, args)
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

	// 5. Parse Result
	var toolResult struct {
		Content []struct {
			Type string `json:"type"`
			Text string `json:"text"`
		} `json:"content"`
		IsError bool `json:"isError"`
	}

	if err := json.Unmarshal(callResp.Result, &toolResult); err != nil {
		fmt.Printf("[Wails] MCP: Non-standard result format, using raw JSON\n")
		return string(callResp.Result), nil
	}

	// Extract text from content blocks
	finalOutput := ""
	for _, block := range toolResult.Content {
		if block.Type == "text" {
			if finalOutput != "" {
				finalOutput += "\n---\n"
			}
			finalOutput += block.Text
		}
	}

	if finalOutput == "" {
		fmt.Printf("[Wails] MCP: No text content in result, using raw JSON\n")
		return string(callResp.Result), nil
	}

	fmt.Printf("[Wails] SUCCESS: Got %d chars output from %s\n", len(finalOutput), toolName)
	return finalOutput, nil
}

// ListTools queries an MCP binary for exactly what tools and schemas it supports dynamically.
func (a *App) ListTools(mcpId string, apiKey string, envVarName string) (string, error) {
	fmt.Printf("[Wails] DEBUG: Listing Tools from MCP: %s\n", mcpId)

	client, err := a.ensureMCPClient(mcpId, apiKey, envVarName)
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

// CheckBinary checks if a binary exists for a given MCP
func (a *App) CheckBinary(mcpId string) bool {
	binPath := filepath.Join("bin", mcpId)
	_, err := os.Stat(binPath)
	return err == nil && !os.IsNotExist(err)
}
