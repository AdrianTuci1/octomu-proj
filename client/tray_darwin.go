//go:build darwin

package main

/*
#cgo CFLAGS: -x objective-c
#cgo LDFLAGS: -framework Cocoa
void SetupNativeTray();
*/
import "C"

import (
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

//export toggleWindowFromC
func toggleWindowFromC() {
	if globalApp != nil {
		globalApp.ToggleWindow()
	}
}

//export quitAppFromC
func quitAppFromC() {
	if globalApp != nil && globalApp.ctx != nil {
		runtime.Quit(globalApp.ctx)
	}
}

func setupTray() {
	C.SetupNativeTray()
}
