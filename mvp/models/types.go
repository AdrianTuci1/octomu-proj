package models

// MCPRegistryItem represents an MCP in the Octomus ecosystem.
// type can be: "local_binary", "remote_http", "npm_package"
// auth_type can be: "none", "api_key", "oauth2"
type MCPRegistryItem struct {
	ID          string     `json:"id"`
	Label       string     `json:"label"`
	Description string     `json:"description"`
	Icon        string     `json:"icon"`
	ImageURL    string     `json:"image_url,omitempty"`
	Status      string     `json:"status"` // "connected", "disconnected", "installing"
	AuthType    string     `json:"auth_type,omitempty"`
	AuthConfig  AuthConfig `json:"auth_config,omitempty"`

	// Type is "local_binary" or "remote_http"
	Type string `json:"type"`

	// remote_http only: the MCP JSON-RPC endpoint
	Endpoint string `json:"endpoint,omitempty"`

	// local_binary only: how to download/run the binary
	InstallCmd  string `json:"install_cmd,omitempty"`
	BinaryPath  string `json:"binary_path,omitempty"`
	DownloadURL string `json:"download_url,omitempty"`
}

// AuthConfig holds authentication configuration for an MCP.
// Fields are shared across auth types — only the relevant ones will be populated.
type AuthConfig struct {
	// Common
	Placeholder string `json:"placeholder,omitempty"`
	HelpText    string `json:"help_text,omitempty"`

	// API Key: env var name for local binaries
	EnvVarName string `json:"env_var_name,omitempty"`

	// API Key: HTTP header configuration for remote MCPs
	HeaderName   string `json:"header_name,omitempty"`   // e.g. "Authorization"
	HeaderPrefix string `json:"header_prefix,omitempty"` // e.g. "Bearer"

	// OAuth2: all calls go through Octomus Cloud (which holds Client IDs/Secrets)
	AuthorizationURL string   `json:"authorization_url,omitempty"` // our cloud's /auth/start/{provider}
	TokenURL         string   `json:"token_url,omitempty"`         // our cloud's /oauth/exchange/{provider}
	Scopes           []string `json:"scopes,omitempty"`
	RedirectURI      string   `json:"redirect_uri,omitempty"` // "octomus://oauth/callback"

	// OAuth2 Client Credentials grant (client_id + client_secret, no user login):
	// Used by machine-to-machine APIs like Contabo.
	// The user provides client_id and client_secret directly; the cloud exchanges
	// them for an access token on the client's behalf.
	GrantType string `json:"grant_type,omitempty"` // "authorization_code" | "client_credentials"
}

// ProxiedChatRequest represents a chat request sent from the Wails client to the Cloud
type ProxiedChatRequest struct {
	Messages []map[string]interface{} `json:"messages" binding:"required"`
	Tools    []map[string]interface{} `json:"tools,omitempty"` // The client passes the schemas it knows about
}

// ProxiedChatResponse represents the response back to the client
type ProxiedChatResponse struct {
	Role     string      `json:"role"`
	Content  string      `json:"content,omitempty"`
	ToolCall interface{} `json:"tool_call,omitempty"` // Structure telling client to execute a specific tool
}

// MessageResponse represents standard API responses
type MessageResponse struct {
	Message string      `json:"message"`
	Status  string      `json:"status,omitempty"`
	Details interface{} `json:"details,omitempty"`
}
