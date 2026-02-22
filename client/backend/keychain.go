package backend

import (
	"fmt"
	"os/exec"
	"strings"
)

// keychain wraps macOS `security` CLI for credential storage.
// This avoids adding an external Go dependency (go-keyring) to the Wails client.
//
// On macOS, the `security` command ships with Xcode Command Line Tools and is always available.
// Credentials are stored in the user's login Keychain and are encrypted at rest by the OS.

const keychainService = "octomus"

// SaveCredential saves a value securely in macOS Keychain.
// key is typically: "{mcpId}_token", "{mcpId}_refresh_token", etc.
func SaveCredential(key, value string) error {
	// First, delete any existing entry to avoid "already exists" errors
	_ = DeleteCredential(key)

	cmd := exec.Command(
		"security", "add-generic-password",
		"-s", keychainService,
		"-a", key,
		"-w", value,
		"-U", // Update if exists
	)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("keychain save failed for '%s': %s", key, strings.TrimSpace(string(out)))
	}
	fmt.Printf("[Keychain] Saved credential: %s\n", key)
	return nil
}

// GetCredential retrieves a previously saved credential from macOS Keychain.
// Returns an empty string and no error if the key doesn't exist.
func GetCredential(key string) (string, error) {
	cmd := exec.Command(
		"security", "find-generic-password",
		"-s", keychainService,
		"-a", key,
		"-w", // Print password only
	)
	out, err := cmd.Output()
	if err != nil {
		// Not found is not a fatal error — caller decides what to do
		return "", nil
	}
	return strings.TrimSpace(string(out)), nil
}

// DeleteCredential removes a credential from macOS Keychain.
func DeleteCredential(key string) error {
	cmd := exec.Command(
		"security", "delete-generic-password",
		"-s", keychainService,
		"-a", key,
	)
	// Ignore errors here — the entry might not exist
	_ = cmd.Run()
	return nil
}

// HasCredential returns true if a credential exists for the given key.
func HasCredential(key string) bool {
	val, _ := GetCredential(key)
	return val != ""
}
