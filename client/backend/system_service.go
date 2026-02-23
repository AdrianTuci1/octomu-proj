package backend

import (
	"fmt"
	"os/exec"
	"strings"
)

// CommandHandler is a function that executes a single macOS system command.
type CommandHandler func() (string, error)

// ── Helper constructors ────────────────────────────────────────────────────────

// appleScript wraps an inline AppleScript string into a CommandHandler.
func appleScript(script string) CommandHandler {
	return func() (string, error) {
		return ExecuteAppleScript(script)
	}
}

// shellScript wraps a shell command string into a CommandHandler.
func shellScript(cmd string) CommandHandler {
	return func() (string, error) {
		out, err := exec.Command("sh", "-c", cmd).CombinedOutput()
		return strings.TrimSpace(string(out)), err
	}
}

// static returns a CommandHandler that always succeeds with a fixed string.
// Used for UI-only commands that are handled by the frontend.
func static(result string) CommandHandler {
	return func() (string, error) { return result, nil }
}

// ── Core ───────────────────────────────────────────────────────────────────────

// ExecuteAppleScript runs an AppleScript string and returns trimmed output.
func ExecuteAppleScript(script string) (string, error) {
	cmd := exec.Command("osascript", "-e", script)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return string(out), fmt.Errorf("applescript error: %v", err)
	}
	return strings.TrimSpace(string(out)), nil
}

// SystemService dispatches macOS system commands to the appropriate handler.
type SystemService struct {
	handlers map[string]CommandHandler
}

func NewSystemService() *SystemService {
	s := &SystemService{}
	s.handlers = s.buildHandlers()
	return s
}

// buildHandlers merges all category handler maps into one dispatch table.
// To add a new category: create commands_<category>.go and add its function here.
func (s *SystemService) buildHandlers() map[string]CommandHandler {
	categories := []map[string]CommandHandler{
		windowCommandHandlers(),
		systemCommandHandlers(),
		utilitiesCommandHandlers(),
		finderCommandHandlers(),
	}

	merged := make(map[string]CommandHandler)
	for _, category := range categories {
		for k, v := range category {
			merged[k] = v
		}
	}
	return merged
}

// ExecuteCommand looks up and runs the handler for cmdName.
func (s *SystemService) ExecuteCommand(cmdName string) (string, error) {
	handler, ok := s.handlers[cmdName]
	if !ok {
		return "", fmt.Errorf("unknown system command: %s", cmdName)
	}
	return handler()
}
