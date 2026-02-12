package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/octomus/cloud/internal/mcp"
	"github.com/octomus/cloud/internal/store"
)

// handleSync returns the list of available tools for the current user context
func (s *Server) handleSync(c echo.Context) error {
	// Mock Tools with their associated MCP Server Name
	allTools := []struct {
		ServerName string                 `json:"server_name"`
		Tool       map[string]interface{} `json:"tool"`
	}{
		{
			ServerName: "calculator-mcp",
			Tool: map[string]interface{}{
				"name":        "calculator",
				"description": "Performs basic arithmetic",
				"inputSchema": map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"a": map[string]string{"type": "number"},
						"b": map[string]string{"type": "number"},
					},
				},
			},
		},
		{
			ServerName: "google-drive-mcp",
			Tool: map[string]interface{}{
				"name":        "google_drive_search",
				"description": "Searches Google Drive files",
				"inputSchema": map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"query": map[string]string{"type": "string"},
					},
				},
			},
		},
	}

	var allowedTools []map[string]interface{}

	// Filter based on permissions
	for _, item := range allTools {
		// Check if user can "read" this MCP
		if s.CheckResourcePermission(c, "mcp.read", item.ServerName) {
			allowedTools = append(allowedTools, item.Tool)
		}
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"tools": allowedTools,
	})
}

// ExecuteRequest is the payload for running a tool
type ExecuteRequest struct {
	ServerName  string            `json:"server_name"` // "google-drive-mcp"
	ToolName    string            `json:"tool_name"`
	Arguments   map[string]interface{} `json:"arguments"`
	Credentials map[string]string `json:"credentials,omitempty"` // Runtime credentials
}

// handleExecute runs a tool on a Worker Node
func (s *Server) handleExecute(c echo.Context) error {
	var req ExecuteRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}

	// 1. Gateway Authorization Check
	// Verify user has access to THIS specific MCP server
	if !s.CheckResourcePermission(c, "mcp.execute", req.ServerName) {
		return c.JSON(http.StatusForbidden, map[string]string{
			"error": fmt.Sprintf("access denied to mcp server: %s", req.ServerName),
		})
	}

	// 2. Identify User/Org
	// In real impl, these come from middleware context
	userID := uuid.New() // Placeholder
	orgID := uuid.New()  // Placeholder

	// 3. Select a Worker Node
	// Simple scheduler: pick first active node
	nodes, err := s.store.ListActiveNodes(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to list nodes"})
	}
	if len(nodes) == 0 {
		return c.JSON(http.StatusServiceUnavailable, map[string]string{"error": "no active worker nodes"})
	}
	node := nodes[0] // Round-robin ideal, but first is fine for MVP

	// 4. Create Session
	sessionID := uuid.New()
	
	// Check if this is a Managed MCP
	mcpMeta := mcp.GetManagedMCP(req.ServerName)
	var assetURL string
	if mcpMeta != nil {
		assetURL, _ = s.mcpStorage.GetAssetURL(c.Request().Context(), mcpMeta.AssetKey)
	}

	mcpConfig := map[string]any{
		"server_name": req.ServerName,
		"tool_name":   req.ToolName,
		"arguments":   req.Arguments,
	}
	if mcpMeta != nil {
		mcpConfig["managed"] = true
		mcpConfig["asset_url"] = assetURL
		mcpConfig["asset_key"] = mcpMeta.AssetKey
	}

	session := &store.VMSession{
		ID:             sessionID,
		OrganizationID: orgID,
		UserID:         userID,
		WorkerNodeID:   node.ID,
		Status:         "provisioning",
		MCPConfig:      mcpConfig,
		CreatedAt:      time.Now(),
		ExpiresAt:      time.Now().Add(1 * time.Hour),
	}

	if err := s.store.CreateSession(c.Request().Context(), session); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to create session"})
	}

	// 5. Dispatch to Node
	// Construct Proto message
	// We need to marshal the config to JSON bytes for the proto
	configBytes, _ := json.Marshal(session.MCPConfig)

	// assignReq := &pb.AssignSession{
	// 	SessionId:     sessionID.String(),
	// 	UserId:        userID.String(),
	// 	McpConfigJson: configBytes,
	// 	Credentials:   req.Credentials,
	// }

	// Passing a map instead of proto struct since DispatchSession now accepts 'any'
	assignReqStub := map[string]interface{}{
		"SessionId":     sessionID.String(),
		"UserId":        userID.String(),
		"McpConfigJson": configBytes,
		"Credentials":   req.Credentials,
	}

	if err := s.nodeServer.DispatchSession(node.ID.String(), assignReqStub); err != nil {
		// Rollback or mark failed
		s.store.UpdateSessionStatus(c.Request().Context(), sessionID, "failed")
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to dispatch session"})
	}

	// 6. Audit Log
	s.store.CreateAuditLog(c.Request().Context(), &store.AuditLog{
		ID:             uuid.New(),
		OrganizationID: orgID,
		UserID:         userID,
		Action:         "mcp.execute",
		Resource:       req.ServerName,
		Details:        map[string]any{"tool": req.ToolName, "session_id": sessionID},
		Timestamp:      time.Now(),
	})

	return c.JSON(http.StatusAccepted, map[string]interface{}{
		"status":     "provisioning",
		"session_id": sessionID.String(),
		"message":    "Execution started on worker node",
	})
}
