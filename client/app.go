package main

import (
	"context"
	_ "embed"
	"fmt"

	"client/backend"

	"github.com/pkg/browser"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx           context.Context
	windowVisible bool
	panelMode     bool // true when settings/onboarding are open (larger window)
	mcpManager    *backend.MCPManager
	systemService *backend.SystemService
	panelManager  *backend.PanelWindowManager
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		windowVisible: true,
		panelManager:  backend.NewPanelWindowManager(),
	}
}

//go:embed appicon.png
var trayIcon []byte

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.mcpManager = backend.NewMCPManager(ctx)
	a.systemService = backend.NewSystemService()
	a.panelManager.SetContext(ctx)
	// Global shortcut (Option + Space) is now handled natively in tray_darwin.m

	// Hide window on blur (only in compact/launcher mode)
	runtime.EventsOn(ctx, "wails:window-blur", func(data ...interface{}) {
		if a.panelMode {
			return // Don't hide when settings/onboarding are open
		}
		runtime.WindowHide(a.ctx)
		a.windowVisible = false
	})

	// Listen for window mode changes from frontend
	runtime.EventsOn(ctx, "octomus:window-mode", func(data ...interface{}) {
		if len(data) > 0 {
			if mode, ok := data[0].(string); ok {
				a.panelMode = (mode == "panel")
				fmt.Printf("[App] Window mode switched to: %s (panelMode=%v)\n", mode, a.panelMode)
			}
		}
	})

	// Listen for open settings event from frontend
	runtime.EventsOn(ctx, "octomus:open-settings", func(data ...interface{}) {
		a.OpenSettings()
	})

	// Listen for open onboarding event from frontend
	runtime.EventsOn(ctx, "octomus:open-onboarding", func(data ...interface{}) {
		a.OpenOnboarding()
	})

	// Listen for close panel event from frontend
	runtime.EventsOn(ctx, "octomus:close-panel", func(data ...interface{}) {
		a.ClosePanel()
	})
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
	return a.mcpManager.DownloadBinary(mcpId, url)
}

// ExecuteBinary runs a local binary, performs MCP handshake, and calls the tool
func (a *App) ExecuteBinary(mcpId string, toolName string, args map[string]interface{}, apiKey string, envVarName string) (string, error) {
	return a.mcpManager.ExecuteBinary(mcpId, toolName, args, apiKey, envVarName)
}

// ListTools queries an MCP binary for exactly what tools and schemas it supports dynamically.
func (a *App) ListTools(mcpId string, apiKey string, envVarName string) (string, error) {
	return a.mcpManager.ListTools(mcpId, apiKey, envVarName)
}

// CheckBinary checks if a binary exists for a given MCP
func (a *App) CheckBinary(mcpId string) bool {
	return a.mcpManager.CheckBinary(mcpId)
}

// StopBinary kills a running MCP binary process
func (a *App) StopBinary(mcpId string) error {
	return a.mcpManager.StopBinary(mcpId)
}

// ─── Remote HTTP MCP ─────────────────────────────────────────────────────────

// ListToolsRemote fetches the tool schema from a remote HTTP MCP server.
func (a *App) ListToolsRemote(mcpId, endpoint, token string) (string, error) {
	return a.mcpManager.ListToolsRemote(mcpId, endpoint, token)
}

// ExecuteRemoteTool calls a specific tool on a remote HTTP MCP server.
func (a *App) ExecuteRemoteTool(mcpId, endpoint, token, toolName string, args map[string]interface{}) (string, error) {
	return a.mcpManager.ExecuteRemoteTool(mcpId, endpoint, token, toolName, args)
}

// ExchangeToken performs a client_credentials exchange locally in the Wails backend.
func (a *App) ExchangeToken(mcpId, tokenUrl, clientId, clientSecret string, scopes []string) (string, error) {
	return a.mcpManager.ExchangeToken(mcpId, tokenUrl, clientId, clientSecret, scopes)
}

// ─── Keychain Bindings (exposed to TypeScript via Wails) ──────────────────────

// SaveCredential saves a credential (token, API key, etc.) in the macOS Keychain.
// key is typically "{mcpId}_token" or "{mcpId}_refresh_token".
func (a *App) SaveCredential(key, value string) error {
	return backend.SaveCredential(key, value)
}

// GetCredential retrieves a credential from the macOS Keychain.
// Returns empty string if not found (no error).
func (a *App) GetCredential(key string) (string, error) {
	return backend.GetCredential(key)
}

// HasCredential returns true if a credential exists for the given key.
func (a *App) HasCredential(key string) bool {
	return backend.HasCredential(key)
}

// DeleteCredential removes a credential from the macOS Keychain.
func (a *App) DeleteCredential(key string) error {
	return backend.DeleteCredential(key)
}

// ─── OAuth Flow ───────────────────────────────────────────────────────────────

// OpenOAuthBrowser opens the system browser to the given URL.
// Used to initiate the OAuth2 flow: the user logs in, the cloud server
// exchanges the code for tokens, then redirects to octomus://oauth/callback?token=...
// which is intercepted by the registered URL scheme handler.
func (a *App) OpenOAuthBrowser(url string) error {
	fmt.Printf("[Wails] Opening OAuth browser: %s\n", url)
	return browser.OpenURL(url)
}

// ExecuteSystemCommand executes a macOS system command
func (a *App) ExecuteSystemCommand(cmd string) (string, error) {
	fmt.Printf("[Wails] Executing system command: %s\n", cmd)
	return a.systemService.ExecuteCommand(cmd)
}

// GetInstalledApps returns a list of installed macOS applications
func (a *App) GetInstalledApps() (string, error) {
	return a.systemService.ExecuteCommand("list_apps")
}

// ─── Panel Window Management ─────────────────────────────────────────────────

// OpenSettings opens the Settings panel
func (a *App) OpenSettings() error {
	return a.panelManager.OpenPanel(backend.PanelSettings)
}

// OpenOnboarding opens the Onboarding panel
func (a *App) OpenOnboarding() error {
	return a.panelManager.OpenPanel(backend.PanelOnboarding)
}

// ClosePanel closes the current panel and returns to compact mode
func (a *App) ClosePanel() error {
	err := a.panelManager.ClosePanel()
	if err != nil {
		return err
	}

	// Reset window to compact launcher size
	runtime.WindowSetSize(a.ctx, 750, 450)
	runtime.WindowSetAlwaysOnTop(a.ctx, true)
	runtime.WindowCenter(a.ctx)
	a.panelMode = false
	a.windowVisible = true

	return nil
}
