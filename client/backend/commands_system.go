package backend

// systemCommandHandlers returns all macOS system/process action handlers.
func systemCommandHandlers() map[string]CommandHandler {
	return map[string]CommandHandler{

		"empty_trash": appleScript(
			`tell application "Finder" to empty trash`,
		),

		"toggle_appearance": appleScript(`
			tell application "System Events"
				tell appearance preferences
					set dark mode to not dark mode
				end tell
			end tell
		`),

		"sleep": appleScript(
			`tell application "System Events" to sleep`,
		),

		"restart": appleScript(
			`tell application "System Events" to restart`,
		),

		"eject_all": appleScript(
			`tell application "Finder" to eject (every disk whose ejectable is true)`,
		),

		"force_quit": appleScript(`
			tell application "System Events"
				set frontProcess to first process whose frontmost is true
				set frontProcessName to name of frontProcess
			end tell
			do shell script "killall " & quoted form of frontProcessName
		`),

		"kill_process": appleScript(`
			tell application "System Events"
				set frontProcess to first process whose frontmost is true
				set the_pid to unix id of frontProcess
			end tell
			do shell script "kill -9 " & the_pid
		`),

		"ask_kill_process": appleScript(`
			tell application "System Events"
				set processList to (name of every process whose background only is false)
			end tell
			set chosen to choose from list processList with prompt "Select a process to kill:" default items {} with title "Kill Process"
			if chosen is not false then
				set chosenName to item 1 of chosen
				do shell script "killall " & quoted form of chosenName
			end if
		`),

		"replace_spotlight": appleScript(`
			display dialog "To replace Spotlight with Octomus: go to System Settings → Keyboard → Keyboard Shortcuts → Spotlight, and disable the ⌘Space shortcut. Then assign ⌘Space to Octomus in its settings." buttons {"OK"} default button "OK" with title "Replace Spotlight"
		`),

		"emoji_picker": appleScript(`
			tell application "System Events"
				key code 49 using {control down, command down}
			end tell
		`),

		"open_calendar": appleScript(
			`tell application "Calendar" to activate`,
		),

		"recent_files": appleScript(`
			tell application "System Events"
				tell menu bar item "Apple" of menu bar 1 of process "Finder"
					click
					tell menu "Apple" to click menu item "Recent Items"
				end tell
			end tell
		`),

		"open_downloads": appleScript(`
			tell application "Finder"
				activate
				open (path to downloads folder)
			end tell
		`),

		"search_menu": appleScript(`
			tell application "System Events"
				set frontProcess to first process whose frontmost is true
				tell menu bar 1 of frontProcess
					click menu bar item "Help"
				end tell
			end tell
		`),

		"focus_session": shellScript(
			`shortcuts run 'Focus' 2>/dev/null || open 'x-apple.systempreferences:com.apple.Focus-Settings.extension'`,
		),
	}
}
