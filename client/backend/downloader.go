package backend

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	rungo "runtime"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// ProgressWriter tracks the progress of a download and emits events to Wails
type ProgressWriter struct {
	Total      int64
	Downloaded int64
	OnProgress func(percentage int)
}

func (pw *ProgressWriter) Write(p []byte) (int, error) {
	n := len(p)
	pw.Downloaded += int64(n)
	if pw.Total > 0 {
		percentage := int(float64(pw.Downloaded) / float64(pw.Total) * 100)
		pw.OnProgress(percentage)
	}
	return n, nil
}

// Downloader handles binary file downloads with progress reporting
type Downloader struct {
	ctx context.Context
}

func NewDownloader(ctx context.Context) *Downloader {
	return &Downloader{ctx: ctx}
}

// Download saves a file from URL to destPath and reports progress
func (d *Downloader) Download(mcpId string, url string, destPath string) error {
	fmt.Printf("[Downloader] Starting download for %s from %s\n", mcpId, url)

	// Ensure parent directory exists
	dir := filepath.Dir(destPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create directory %s: %v", dir, err)
	}

	resp, err := http.Get(url)
	if err != nil {
		return fmt.Errorf("http get failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("server returned status %d", resp.StatusCode)
	}

	out, err := os.Create(destPath)
	if err != nil {
		return fmt.Errorf("failed to create file %s: %v", destPath, err)
	}
	defer out.Close()

	pw := &ProgressWriter{
		Total: resp.ContentLength,
		OnProgress: func(percentage int) {
			runtime.EventsEmit(d.ctx, "download-progress", map[string]interface{}{
				"mcpId":      mcpId,
				"percentage": percentage,
			})
		},
	}

	// Double copy to both file and progress writer
	if _, err := io.Copy(out, io.TeeReader(resp.Body, pw)); err != nil {
		return fmt.Errorf("download copy failed: %v", err)
	}

	// Make executable
	if err := os.Chmod(destPath, 0755); err != nil {
		return fmt.Errorf("failed to set executable permission: %v", err)
	}

	// Sign binary on macOS Apple Silicon, else it will be killed (SIGKILL)
	if rungo.GOOS == "darwin" {
		fmt.Printf("[Downloader] Ad-hoc signing binary for macOS: %s\n", destPath)
		signCmd := exec.Command("codesign", "--force", "--sign", "-", destPath)
		if err := signCmd.Run(); err != nil {
			fmt.Printf("[Downloader] Warning: failed to sign binary: %v\n", err)
		}
	}

	fmt.Printf("[Downloader] Successfully saved binary to %s\n", destPath)
	return nil
}
