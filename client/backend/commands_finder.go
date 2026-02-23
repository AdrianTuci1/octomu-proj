package backend

import (
	"encoding/json"
	"fmt"
	"os/exec"
	"path/filepath"
	"strings"
)

// AppInfo represents a macOS application bundle
type AppInfo struct {
	ID         string `json:"id"`
	Label      string `json:"label"`
	Path       string `json:"path"`
	Category   string `json:"category"`
	Type       string `json:"type"`
	Icon       string `json:"icon"`
	IconBase64 string `json:"iconBase64,omitempty"`
	Accessory  string `json:"accessory"`
}

// finderCommandHandlers returns handlers for Finder/App related actions.
func finderCommandHandlers() map[string]CommandHandler {
	return map[string]CommandHandler{
		"list_apps": func() (string, error) {
			apps, err := GetInstalledApps()
			if err != nil {
				return "", err
			}
			data, _ := json.Marshal(apps)
			return string(data), nil
		},
	}
}

// GetInstalledApps uses mdfind to find all .app bundles on the system.
func GetInstalledApps() ([]AppInfo, error) {
	cmd := exec.Command("mdfind", "kMDItemKind == 'Application'")
	out, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("failed to list apps: %v", err)
	}

	lines := strings.Split(string(out), "\n")
	var apps []AppInfo

	for _, path := range lines {
		path = strings.TrimSpace(path)
		if path == "" || !strings.HasSuffix(path, ".app") {
			continue
		}

		if strings.Contains(path, "/Contents/") || strings.Contains(path, "/Versions/") {
			continue
		}

		name := filepath.Base(path)
		name = strings.TrimSuffix(name, ".app")

		app := AppInfo{
			ID:        "app-" + strings.ToLower(strings.ReplaceAll(name, " ", "-")),
			Label:     name,
			Path:      path,
			Category:  "Apps",
			Type:      "application",
			Icon:      "Globe",
			Accessory: "Application",
		}

		// Try to extract icon for the first 30 apps (performance)
		if len(apps) < 30 {
			iconBase64, _ := GetAppIcon(path)
			app.IconBase64 = iconBase64
		}

		apps = append(apps, app)

		if len(apps) > 80 { // Safety limit
			break
		}
	}

	return apps, nil
}

// GetAppIcon extracts the application icon as a base64 string.
func GetAppIcon(appPath string) (string, error) {
	// 1. Find the icon file from Info.plist
	plistPath := filepath.Join(appPath, "Contents", "Info.plist")
	cmd := exec.Command("defaults", "read", plistPath, "CFBundleIconFile")
	iconFileBytes, err := cmd.Output()
	if err != nil {
		return "", err
	}
	iconFileName := strings.TrimSpace(string(iconFileBytes))
	if !strings.HasSuffix(iconFileName, ".icns") {
		iconFileName += ".icns"
	}

	iconPath := filepath.Join(appPath, "Contents", "Resources", iconFileName)

	// 2. Convert .icns to PNG using sips
	// We'll use a temporary file for the conversion
	tmpFile := filepath.Join("/tmp", fmt.Sprintf("octomus_icon_%x.png", strings.ToLower(iconFileName)))

	// Create a small PNG (32x32 is enough for our list)
	convertCmd := exec.Command("sips", "-z", "32", "32", "-s", "format", "png", iconPath, "--out", tmpFile)
	if err := convertCmd.Run(); err != nil {
		return "", err
	}

	// 3. Read PNG and encode to base64
	pngData, err := exec.Command("base64", "-i", tmpFile).Output()
	if err != nil {
		return "", err
	}

	return string(pngData), nil
}
