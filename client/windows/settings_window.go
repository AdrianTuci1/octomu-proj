package windows

import (
	"github.com/wailsapp/wails/v3/pkg/application"
)

func CreateSettingsWindow(app *application.App) *application.WebviewWindow {
	return app.Window.NewWithOptions(application.WebviewWindowOptions{
		Name:             "settings",
		Title:            "Octomus Settings",
		Width:            1000,
		Height:           800,
		Hidden:           true,
		BackgroundColour: application.NewRGBA(0, 0, 0, 0),
		Mac: application.MacWindow{
			Backdrop: application.MacBackdropTranslucent,
			TitleBar: application.MacTitleBarDefault,
		},
		URL: "/?panel=settings",
	})
}
