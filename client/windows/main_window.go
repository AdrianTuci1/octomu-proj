package windows

import (
	"github.com/wailsapp/wails/v3/pkg/application"
)

func CreateMainWindow(app *application.App) *application.WebviewWindow {
	return app.Window.NewWithOptions(application.WebviewWindowOptions{
		Name:             "main",
		Title:            "Octomus Launcher",
		Width:            750,
		Height:           450,
		AlwaysOnTop:      true,
		Frameless:        true,
		DisableResize:    true,
		Hidden:           true,
		BackgroundColour: application.NewRGBA(0, 0, 0, 0),
		Mac: application.MacWindow{
			Backdrop:                application.MacBackdropTranslucent,
			TitleBar:                application.MacTitleBarHidden,
			InvisibleTitleBarHeight: 0,
		},
		URL: "/",
	})
}
