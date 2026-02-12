package core

// MCPServerConfig represents the configuration for a Model Context Protocol server
type MCPServerConfig struct {
	Name        string            `json:"name"`
	Command     string            `json:"command"`
	Args        []string          `json:"args"`
	Env         map[string]string `json:"env"`
	Description string            `json:"description,omitempty"`
}

// ToolDefinition represents a tool available to the LLM
type ToolDefinition struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Schema      any    `json:"schema"` // JSON Schema for arguments
}

// SyncResponse is the payload for GET /sync
type SyncResponse struct {
	Tools []ToolDefinition `json:"tools"`
}

// ExecutionRequest is the payload for POST /execute
type ExecutionRequest struct {
	ToolName  string                 `json:"tool_name"`
	Method    string                 `json:"method"` // e.g., "call", "list_resources" - usually implies 'call' if missing or specific execution type
	Arguments map[string]interface{} `json:"arguments"`
}

// ExecutionResult is the response from POST /execute
type ExecutionResult struct {
	Status string `json:"status"` // "success", "error"
	Result any    `json:"result,omitempty"`
	Error  string `json:"error,omitempty"`
}

// ExecutionRecord represents a single execution event in history
type ExecutionRecord struct {
	ID         string                 `json:"id"`
	Timestamp  string                 `json:"timestamp"` // ISO8601
	ToolName   string                 `json:"tool_name"`
	Method     string                 `json:"method"`
	Arguments  map[string]interface{} `json:"arguments"`
	Status     string                 `json:"status"` // success, error
	DurationMs int64                  `json:"duration_ms"`
	Result     any                    `json:"result,omitempty"`
	Error      string                 `json:"error,omitempty"`
}
