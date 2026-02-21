package main

import (
	"context"
	_ "embed"
	"fmt"

	hook "github.com/robotn/gohook"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx          context.Context
	windowVisible bool
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		windowVisible: true,
	}
}

//go:embed appicon.png
var trayIcon []byte

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.setupGlobalShortcut()

	// Ascundem fereastra când pierde focusul (blur)
	runtime.EventsOn(ctx, "wails:window-blur", func(data ...interface{}) {
		runtime.WindowHide(a.ctx)
		a.windowVisible = false
	})
}

func (a *App) setupGlobalShortcut() {
	// Rulăm listener-ul într-un goroutine pentru a nu bloca startup-ul
	go func() {
		// Option (Alt) + Space
		// Pe Mac, Option este adesea mapat la Alt în gohook
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
