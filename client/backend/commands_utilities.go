package backend

// utilitiesCommandHandlers returns handlers for utility-type system tools.
func utilitiesCommandHandlers() map[string]CommandHandler {
	return map[string]CommandHandler{

		"color_picker": appleScript(
			`tell application "Digital Color Meter" to activate`,
		),

		"speedtest": shellScript(`open 'https://fast.com'`),

		"ip_geo": shellScript(`open 'https://ipinfo.io'`),

		// confetti is a UI-only effect handled entirely in the frontend.
		"confetti": static("success"),
	}
}
