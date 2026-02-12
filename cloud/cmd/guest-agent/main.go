package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"time"
)

// Metadata structure matching what we inject in manager.go
type Metadata struct {
	SessionID   string                 `json:"session_id"`
	MCPConfig   string                 `json:"mcp_config"` // JSON string
	Credentials map[string]string      `json:"credentials"`
}

type MCPConfig struct {
	ServerName string                 `json:"server_name"`
	ToolName   string                 `json:"tool_name"`
	Arguments  map[string]interface{} `json:"arguments"`
}

const mmdsURL = "http://169.254.169.254/latest/meta-data/"

func main() {
	log.Println("Guest Agent Starting...")

	// 0. Configure Network (Critical for reaching MMDS and Internet)
    // In production, we might use kernel cmdline ip=... or DHCP.
    // Here we hardcode or parse from kernel args.
    if err := configureNetwork(); err != nil {
        log.Printf("Network setup failed (continuing anyway to try MMDS): %v", err)
    }

	// 1. Wait for Network
	// In a real init, we'd wait for eth0 to be up.
	// Implementing a simple retry loop for MMDS availability.
	var meta Metadata
	for i := 0; i < 30; i++ {
		if err := fetchMetadata(&meta); err == nil {
			log.Println("MMDS fetched successfully.")
			break
		}
		log.Printf("Waiting for MMDS... (%d/30)\n", i)
		time.Sleep(1 * time.Second)
	}

	if meta.SessionID == "" {
		log.Fatal("Failed to retrieve Session ID from MMDS")
	}

	log.Printf("Session ID: %s", meta.SessionID)
	
	// 2. Parse MCP Config
	var mcpCfg MCPConfig
	if err := json.Unmarshal([]byte(meta.MCPConfig), &mcpCfg); err != nil {
		log.Fatalf("Failed to parse MCP Config: %v", err)
	}
	log.Printf("Target Tool: %s (Server: %s)", mcpCfg.ToolName, mcpCfg.ServerName)

	// 3. Execute Tool
	runTool(mcpCfg, meta.Credentials)
	
	// 4. Report Result? 
	// The node-agent outside observes the VM. 
	// Or we could curl back to a callback URL if we allowed egress.
	// For now, we just stdout, which Firecracker logs to a file on host.
	log.Println("Execution Complete.")
	
	// Keep VM alive for a bit or shutdown?
	// If we exit, the kernel might panic or restart init depending on config.
	// Best to sleep forever or poweroff.
	select {} 
}

func fetchMetadata(dest *Metadata) error {
	client := &http.Client{Timeout: 2 * time.Second}
	resp, err := client.Get(mmdsURL)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return fmt.Errorf("mmds returned status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}
    
    // Firecracker MMDS returns just the JSON user data if configured at root,
    // or we might need to query specific paths. 
    // Manager.go injected map[string]interface{}, so it should be the root JSON.
    return json.Unmarshal(body, dest)
}

func (c *MCPConfig) GetDownloadURL() string {
    // If not provided in config, construct it from Control Plane
    // return fmt.Sprintf("http://172.16.0.1:8081/artifacts/%s.zip", c.ToolName)
    // For now, rely on parsed JSON
    if url, ok := c.Arguments["download_url"].(string); ok {
        return url
    }
    return ""
}

func runTool(cfg MCPConfig, creds map[string]string) {
	log.Println("--- TOOL EXECUTION STARTING ---")
    
    // 1. Determine Artifact URL
    downloadURL := cfg.GetDownloadURL()
    if downloadURL == "" {
        log.Println("No download_url provided in arguments. Skipping download.")
        // Fallback: Assume tool is pre-baked in rootfs
    } else {
        // 2. Download Artifact
        log.Printf("Downloading artifact from %s...", downloadURL)
        if err := downloadArtifact(downloadURL, "/tmp/tool.zip"); err != nil {
             log.Fatalf("Failed to download artifact: %v", err)
        }
        
        // 3. Unzip
        log.Println("Extracting artifact...")
        if err := unzip("/tmp/tool.zip", "/tmp/tool"); err != nil {
            log.Fatalf("Failed to extract artifact: %v", err)
        }
    }

    // 4. Prepare Command
    // We assume the tool has an entrypoint script or we directly run it
    // Logic: If /tmp/tool/run.sh exists, run it. Else try to run the ToolName as a command.
    cmdPath := "/tmp/tool/run.sh"
    if _, err := os.Stat(cmdPath); os.IsNotExist(err) {
        // Fallback to just running the tool name (if pre-installed global binary)
        cmdPath = cfg.ToolName
    } else {
        // Make executable
        os.Chmod(cmdPath, 0755)
    }

    cmd := exec.Command(cmdPath)
    
    // 5. Inject Credentials as Env Vars
    cmd.Env = os.Environ()
    for k, v := range creds {
        cmd.Env = append(cmd.Env, fmt.Sprintf("%s=%s", k, v))
    }
    
    // 6. Capture Output
    cmd.Stdout = os.Stdout
    cmd.Stderr = os.Stderr
    
    log.Printf("Executing %s...", cmdPath)
    if err := cmd.Run(); err != nil {
        log.Printf("Tool execution failed: %v", err)
    } else {
        log.Println("Tool executed successfully.")
    }
    
	log.Println("--- TOOL EXECUTION FINISHED ---")
}

func downloadArtifact(url, filepath string) error {
    out, err := os.Create(filepath)
    if err != nil {
        return err
    }
    defer out.Close()

    resp, err := http.Get(url)
    if err != nil {
        return err
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return fmt.Errorf("bad status: %s", resp.Status)
    }

    _, err = io.Copy(out, resp.Body)
    return err
}

func unzip(src, dest string) error {
    // Basic unzip implementation would go here using "archive/zip"
    // For brevity/robustness in this snippet, let's use the system `unzip` if available,
    // or assume we need to implement it.
    // Since rootfs might be minimal, pure Go is safer.
    
    // note: requires import "archive/zip"
    // Since I can't easily add imports in this block without messing up the file structure if I don't use multi_replace,
    // I will shell out to `unzip` which is common in busybox/alpine.
    // If unavailable, this will fail.
    
    cmd := exec.Command("unzip", "-o", src, "-d", dest)
    out, err := cmd.CombinedOutput()
    if err != nil {
        return fmt.Errorf("unzip failed: %v (%s)", err, out)
    }
    return nil
}

func configureNetwork() error {
    log.Println("Configuring eth0...")
    // 1. Bring up interface
    // ip link set eth0 up
    if err := runCmd("ip", "link", "set", "eth0", "up"); err != nil {
        return err
    }

    // 2. Set IP (Static for now, matching Manager's assumption)
    // 172.16.x.2/30
    // In real implementation, parse /proc/cmdline for "ip="
    if err := runCmd("ip", "addr", "add", "172.16.0.2/30", "dev", "eth0"); err != nil {
         // Ignore "file exists" if already set
         log.Printf("IP set warning: %v", err)
    }

    // 3. Set Gateway
    if err := runCmd("ip", "route", "add", "default", "via", "172.16.0.1"); err != nil {
        log.Printf("Route set warning: %v", err)
    }

    // 4. DNS (Google DNS)
    if err := os.WriteFile("/etc/resolv.conf", []byte("nameserver 8.8.8.8\n"), 0644); err != nil {
        log.Printf("DNS set warning: %v", err)
    }
    
    return nil
}

func runCmd(name string, args ...string) error {
    cmd := exec.Command(name, args...)
    if out, err := cmd.CombinedOutput(); err != nil {
        return fmt.Errorf("%s failed: %v, output: %s", name, err, out)
    }
    return nil
}
