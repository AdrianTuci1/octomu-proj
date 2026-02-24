package windows

import (
	"github.com/wailsapp/wails/v3/pkg/application"
)

func CreateOnboardingWindow(app *application.App) *application.WebviewWindow {
	return app.Window.NewWithOptions(application.WebviewWindowOptions{
		Name:             "onboarding",
		Title:            "Octomus Onboarding",
		Width:            1000,
		Height:           800,
		Hidden:           false,
		BackgroundColour: application.NewRGBA(0, 0, 0, 0),
		Mac: application.MacWindow{
			Backdrop: application.MacBackdropTranslucent,
			TitleBar: application.MacTitleBarDefault,
		},
		URL: "/?panel=onboarding",
	})
}
