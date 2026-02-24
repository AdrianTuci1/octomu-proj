package backend

import (
	"context"
	"fmt"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// PanelType defines the type of panel window
type PanelType string

const (
	PanelSettings   PanelType = "settings"
	PanelOnboarding PanelType = "onboarding"
)

// PanelWindowManager manages secondary windows (Settings, Onboarding)
// Note: Wails v2 single-window app uses window resizing for panel mode
type PanelWindowManager struct {
	ctx          context.Context
	isPanelOpen  bool
	currentPanel PanelType
}

// NewPanelWindowManager creates a new panel window manager
func NewPanelWindowManager() *PanelWindowManager {
	return &PanelWindowManager{}
}

// SetContext sets the application context
func (p *PanelWindowManager) SetContext(ctx context.Context) {
	p.ctx = ctx
}

// OpenPanel opens a panel window (settings or onboarding)
func (p *PanelWindowManager) OpenPanel(panelType PanelType) error {
	if p.ctx == nil {
		return fmt.Errorf("context not set")
	}

	// If panel is already open, just focus it
	if p.isPanelOpen {
		runtime.WindowShow(p.ctx)
		runtime.WindowSetAlwaysOnTop(p.ctx, false)
		runtime.WindowCenter(p.ctx)
		return nil
	}

	// Resize main window to panel mode
	p.isPanelOpen = true
	p.currentPanel = panelType

	// Set panel window size (larger than compact launcher)
	runtime.WindowSetSize(p.ctx, 1000, 700)
	runtime.WindowSetAlwaysOnTop(p.ctx, false)
	runtime.WindowCenter(p.ctx)
	runtime.WindowShow(p.ctx)

	// Emit event to frontend to switch to panel content
	runtime.EventsEmit(p.ctx, "octomus:open-panel", string(panelType))

	return nil
}

// ClosePanel closes the panel window
func (p *PanelWindowManager) ClosePanel() error {
	if p.ctx == nil {
		return fmt.Errorf("context not set")
	}

	p.isPanelOpen = false
	p.currentPanel = ""

	// Emit event to frontend to close panel mode
	runtime.EventsEmit(p.ctx, "octomus:close-panel")

	return nil
}

// IsPanelOpen returns whether a panel is currently open
func (p *PanelWindowManager) IsPanelOpen() bool {
	return p.isPanelOpen
}

// GetCurrentPanel returns the current panel type
func (p *PanelWindowManager) GetCurrentPanel() PanelType {
	return p.currentPanel
}
