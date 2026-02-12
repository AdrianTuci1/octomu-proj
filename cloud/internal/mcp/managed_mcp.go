package mcp

import "time"

type ManagedMCP struct {
	Name           string    `json:"name"`
	Description    string    `json:"description"`
	Vendor         string    `json:"vendor"`
	Category       string    `json:"category"`
	Icon           string    `json:"icon"`
	InstallCommand string    `json:"install_command"`
	AssetKey       string    `json:"asset_key"` // S3 or Storage Key
	Version        string    `json:"version"`
	UpdatedAt      time.Time `json:"updated_at"`
}

var Catalog = []ManagedMCP{
	{
		Name:           "GitHub",
		Description:    "Access live GitHub context, including issues, pull requests, and code files.",
		Vendor:         "github",
		Category:       "popular",
		Icon:           "🐙",
		InstallCommand: "npx -y @modelcontextprotocol/server-github",
		AssetKey:       "managed/github-mcp-v1",
		Version:        "1.0.0",
		UpdatedAt:      time.Now(),
	},
	{
		Name:           "Notion",
		Description:    "Enhance your AI assistant with information from your Notion workspace.",
		Vendor:         "notion",
		Category:       "popular",
		Icon:           "📝",
		InstallCommand: "npx -y @modelcontextprotocol/server-notion",
		AssetKey:       "managed/notion-mcp-v1",
		Version:        "1.0.0",
		UpdatedAt:      time.Now(),
	},
	{
		Name:           "Trello",
		Description:    "Manage boards, cards, and lists directly.",
		Vendor:         "atlassian",
		Category:       "popular",
		Icon:           "📋",
		InstallCommand: "npx -y @modelcontextprotocol/server-trello",
		AssetKey:       "managed/trello-mcp-v1",
		Version:        "1.0.0",
		UpdatedAt:      time.Now(),
	},
	{
		Name:           "ClickUp",
		Description:    "Task management and productivity integration.",
		Vendor:         "clickup",
		Category:       "productivity-mgmt",
		Icon:           "📈",
		InstallCommand: "npx -y @modelcontextprotocol/server-clickup",
		AssetKey:       "managed/clickup-mcp-v1",
		Version:        "1.0.0",
		UpdatedAt:      time.Now(),
	},
}

func GetManagedMCP(name string) *ManagedMCP {
	for _, mcp := range Catalog {
		if mcp.Name == name {
			return &mcp
		}
	}
	return nil
}
