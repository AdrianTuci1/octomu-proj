package main

import (
	"context"
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
)

//go:embed all:frontend/dist
var assets embed.FS

var globalApp *App

func main() {
	// Create an instance of the app structure
	globalApp = NewApp()

	// Create application with options
	err := wails.Run(&options.App{
		Title:             "Octomus client",
		Width:             750,
		Height:            450,
		DisableResize:      true,
		Fullscreen:         false,
		Frameless:          true,
		AlwaysOnTop:        true,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 0, G: 0, B: 0, A: 0},
		StartHidden:      true,
		OnStartup: func(ctx context.Context) {
			globalApp.startup(ctx)
			setupTray()
		},
		Bind: []interface{}{
			globalApp,
		},
		Mac: &mac.Options{
			TitleBar: &mac.TitleBar{
				TitlebarAppearsTransparent: true,
				HideTitle:                  true,
				HideTitleBar:               true,
				FullSizeContent:            true,
				UseToolbar:                 false,
				HideToolbarSeparator:       true,
			},
			Appearance:           mac.NSAppearanceNameDarkAqua,
			WebviewIsTransparent: true,
			WindowIsTranslucent:  true,
			About: &mac.AboutInfo{
				Title:   "Octomus client",
				Message: "Octomus Desktop client",
			},
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
