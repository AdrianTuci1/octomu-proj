package main

import (
	"context"
	_ "embed"
	"fmt"

	"client/backend"

	"github.com/pkg/browser"
	"github.com/wailsapp/wails/v3/pkg/application"
)

// App struct
type App struct {
	app           *application.App
	ctx           context.Context
	windowVisible bool
	panelMode     bool // true when settings/onboarding are open (larger window)
	mcpManager    *backend.MCPManager
	systemService *backend.SystemService
	panelManager  *backend.PanelWindowManager
}

// NewApp creates a new App application struct
func NewApp(app *application.App) *App {
	return &App{
		app:           app,
		windowVisible: true,
		panelManager:  backend.NewPanelWindowManager(),
	}
}

//go:embed appicon.png
var trayIcon []byte

// ServiceStartup is called when the app starts.
func (a *App) ServiceStartup(ctx context.Context, options application.ServiceOptions) error {
	a.ctx = ctx
	a.mcpManager = backend.NewMCPManager(ctx)
	a.systemService = backend.NewSystemService()
	a.panelManager.SetContext(ctx)

	// Listen for window mode changes from frontend
	a.app.Event.On("octomus:window-mode", func(event *application.CustomEvent) {
		if mode, ok := event.Data.(string); ok {
			a.panelMode = (mode == "panel")
			fmt.Printf("[App] Window mode switched to: %s (panelMode=%v)\n", mode, a.panelMode)
		}
	})

	// Listen for open settings event from frontend
	a.app.Event.On("octomus:open-settings", func(event *application.CustomEvent) {
		a.OpenSettings()
	})

	// Listen for open onboarding event from frontend
	a.app.Event.On("octomus:open-onboarding", func(event *application.CustomEvent) {
		a.OpenOnboarding()
	})

	// Listen for close panel event from frontend
	a.app.Event.On("octomus:close-panel", func(event *application.CustomEvent) {
		a.ClosePanel()
	})

	return nil
}

// ToggleWindow hides or shows the main window
func (a *App) ToggleWindow() {
	win, exists := a.app.Window.GetByName("main")
	if !exists {
		return
	}

	if win.IsVisible() {
		win.Hide()
		a.windowVisible = false
	} else {
		win.Show()
		win.Focus()
		win.SetAlwaysOnTop(true)
		win.Center()
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
	if win, exists := a.app.Window.GetByName("main"); exists {
		win.Hide()
	}
	win, exists := a.app.Window.GetByName("settings")
	if exists {
		win.Show()
		win.Focus()
	}
	return nil
}

// OpenOnboarding opens the Onboarding panel
func (a *App) OpenOnboarding() error {
	if win, exists := a.app.Window.GetByName("main"); exists {
		win.Hide()
	}
	win, exists := a.app.Window.GetByName("onboarding")
	if exists {
		win.Show()
		win.Focus()
	}
	return nil
}

// ClosePanel closes the current panel (this might be called from a panel window)
func (a *App) ClosePanel() error {
	// In v3 with multiple windows, "ClosePanel" likely means close the active panel window
	// If called from frontend, we need to know WHICH window called it or just close both possible panels
	if win, exists := a.app.Window.GetByName("settings"); exists {
		win.Hide()
	}
	if win, exists := a.app.Window.GetByName("onboarding"); exists {
		win.Hide()
	}

	// Ensure main window is still healthy/visible if needed
	if win, exists := a.app.Window.GetByName("main"); exists {
		win.Show()
		win.Focus()
	}

	return nil
}
