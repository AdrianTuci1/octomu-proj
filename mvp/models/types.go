package models

// MCPRegistryItem represents an MCP in the Octomus ecosystem
type MCPRegistryItem struct {
	ID          string `json:"id"`
	Label       string `json:"label"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
	Type        string `json:"type"` // "cloud", "local_binary", "npm_package"
	ImageURL    string `json:"image_url,omitempty"`
	Status      string `json:"status"` // "connected", "disconnected", "installing"
	AuthType    string `json:"auth_type,omitempty"`
	AuthConfig  struct {
		Placeholder string `json:"placeholder,omitempty"`
		HelpText    string `json:"help_text,omitempty"`
		EnvVarName  string `json:"env_var_name,omitempty"`
	} `json:"auth_config,omitempty"`
	// If Type is "cloud", this is the public URL the Wails client should talk to
	PublicURL   string `json:"public_url,omitempty"`
	
	// If Type is local, these fields tell the Wails client how to install it
	InstallCmd  string `json:"install_cmd,omitempty"`
	BinaryPath  string `json:"binary_path,omitempty"`
	DownloadURL string `json:"download_url,omitempty"`
}

// ProxiedChatRequest represents a chat request sent from the Wails client to the Cloud
type ProxiedChatRequest struct {
	Messages []map[string]interface{} `json:"messages" binding:"required"`
	Tools    []map[string]interface{} `json:"tools,omitempty"` // The client passes the schemas it knows about
}

// ProxiedChatResponse represents the response back to the client
type ProxiedChatResponse struct {
	Role    string      `json:"role"`
	Content string      `json:"content,omitempty"`
	ToolCall interface{} `json:"tool_call,omitempty"` // Structure telling client to execute a specific tool
}

// MessageResponse represents standard API responses
type MessageResponse struct {
	Message string      `json:"message"`
	Status  string      `json:"status,omitempty"`
	Details interface{} `json:"details,omitempty"`
}
