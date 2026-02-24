package main

import (
	"embed"
	_ "embed"
	"log"

	"client/backend"
	"client/windows"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
	"golang.design/x/hotkey"
)

//go:embed all:frontend/dist
var assets embed.FS

var (
	mainWindow       *application.WebviewWindow
	settingsWindow   *application.WebviewWindow
	onboardingWindow *application.WebviewWindow
	globalApp        *App
)

func main() {
	app := application.New(application.Options{
		Name:        "Octomus",
		Description: "Octomus Desktop client",
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Mac: application.MacOptions{
			ActivationPolicy: application.ActivationPolicyAccessory,
		},
	})

	// Create Windows
	mainWindow = windows.CreateMainWindow(app)
	settingsWindow = windows.CreateSettingsWindow(app)
	onboardingWindow = windows.CreateOnboardingWindow(app)

	// Create and Bind App
	globalApp = NewApp(app)
	app.RegisterService(application.NewService(globalApp))

	app.Event.OnApplicationEvent(events.Mac.ApplicationDidFinishLaunching, func(event *application.ApplicationEvent) {
		// Register global shortcut
		go func() {
			hk := hotkey.New([]hotkey.Modifier{hotkey.ModOption}, hotkey.KeySpace)
			err := hk.Register()
			if err != nil {
				log.Printf("Failed to register global hotkey: %v", err)
				return
			}
			for {
				<-hk.Keydown()
				application.InvokeSync(func() {
					globalApp.ToggleWindow()
				})
			}
		}()
	})

	mainWindow.OnWindowEvent(events.Mac.WindowDidResignKey, func(event *application.WindowEvent) {
		mainWindow.Hide()
	})

	// Show Onboarding first if not completed
	onboardingDone, _ := backend.GetCredential("onboarding_completed")
	if onboardingDone != "true" {
		onboardingWindow.Show()
	} else {
		mainWindow.Show()
	}

	err := app.Run()
	if err != nil {
		log.Fatal(err)
	}
}
