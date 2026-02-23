package backend

// windowCommandHandlers returns all window management AppleScript handlers.
func windowCommandHandlers() map[string]CommandHandler {
	return map[string]CommandHandler{

		"maximize": appleScript(
			`tell application "System Events" to set value of attribute "AXFullScreen" of window 1 of (first process whose frontmost is true) to true`,
		),

		"almost_maximize": appleScript(`
			tell application "Finder"
				set screenBounds to bounds of window of desktop
				set sw to (item 3 of screenBounds) - (item 1 of screenBounds)
				set sh to (item 4 of screenBounds) - (item 2 of screenBounds)
				set margin to 40
			end tell
			tell application "System Events"
				set frontProcess to first process whose frontmost is true
				set frontWindow to window 1 of frontProcess
				set value of attribute "AXPosition" of frontWindow to {margin, margin}
				set value of attribute "AXSize" of frontWindow to {sw - (margin * 2), sh - (margin * 2)}
			end tell
		`),

		"left_half": appleScript(`
			tell application "Finder"
				set screenBounds to bounds of window of desktop
				set sw to (item 3 of screenBounds) - (item 1 of screenBounds)
				set sh to (item 4 of screenBounds) - (item 2 of screenBounds)
			end tell
			tell application "System Events"
				set frontProcess to first process whose frontmost is true
				set frontWindow to window 1 of frontProcess
				set value of attribute "AXPosition" of frontWindow to {0, 0}
				set value of attribute "AXSize" of frontWindow to {sw / 2, sh}
			end tell
		`),

		"right_half": appleScript(`
			tell application "Finder"
				set screenBounds to bounds of window of desktop
				set sw to (item 3 of screenBounds) - (item 1 of screenBounds)
				set sh to (item 4 of screenBounds) - (item 2 of screenBounds)
			end tell
			tell application "System Events"
				set frontProcess to first process whose frontmost is true
				set frontWindow to window 1 of frontProcess
				set value of attribute "AXPosition" of frontWindow to {sw / 2, 0}
				set value of attribute "AXSize" of frontWindow to {sw / 2, sh}
			end tell
		`),

		"reasonable_size": appleScript(`
			tell application "Finder"
				set screenBounds to bounds of window of desktop
				set sw to (item 3 of screenBounds) - (item 1 of screenBounds)
				set sh to (item 4 of screenBounds) - (item 2 of screenBounds)
				set tw to 900
				set th to 600
				set tx to (sw - tw) / 2
				set ty to (sh - th) / 2
			end tell
			tell application "System Events"
				set frontProcess to first process whose frontmost is true
				set frontWindow to window 1 of frontProcess
				set value of attribute "AXPosition" of frontWindow to {tx, ty}
				set value of attribute "AXSize" of frontWindow to {tw, th}
			end tell
		`),
	}
}
