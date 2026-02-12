package api

import (
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/octomus/cloud/internal/mcp"
	"github.com/octomus/cloud/internal/store"
)

// MCP Management Handlers

func (s *Server) handleListInstalledMCPs(c echo.Context) error {
	orgIDStr := c.Param("id") // orgID
	orgID, err := uuid.Parse(orgIDStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid org id"})
	}

	mcps, err := s.store.ListInstalledMCPs(c.Request().Context(), orgID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to list mcps"})
	}

	return c.JSON(http.StatusOK, mcps)
}

func (s *Server) handleListManagedMCPs(c echo.Context) error {
	return c.JSON(http.StatusOK, mcp.Catalog)
}

func (s *Server) handleInstallMCP(c echo.Context) error {
	orgIDStr := c.Param("id")
	orgID, err := uuid.Parse(orgIDStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid org id"})
	}

	var req struct {
		MCPName string         `json:"mcp_name"`
		Config  map[string]any `json:"config"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}

	// Check if this is a Managed MCP Activation
	managed := mcp.GetManagedMCP(req.MCPName)
	if managed != nil {
		// Managed flow: we might pre-validate config or just proceed
		fmt.Printf("Activating managed MCP: %s\n", managed.Name)
	}

	install := &store.MCPInstallation{
		ID:             uuid.New(),
		OrganizationID: orgID,
		MCPName:        req.MCPName,
		Config:         req.Config,
		InstalledAt:    time.Now(),
	}

	if err := s.store.InstallMCP(c.Request().Context(), install); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to install mcp"})
	}

	// Create Audit Log
	// Validating userID from context would be ideal here
	dummyUserID := uuid.Nil 
	
	s.store.CreateAuditLog(c.Request().Context(), &store.AuditLog{
		ID:             uuid.New(),
		OrganizationID: orgID,
		UserID:         dummyUserID,
		Action:         "mcp.install",
		Resource:       req.MCPName,
		Details:        req.Config,
		Timestamp:      time.Now(),
	})

	return c.JSON(http.StatusCreated, install)
}

func (s *Server) handleUninstallMCP(c echo.Context) error {
	orgIDStr := c.Param("id")
	mcpName := c.Param("name")
	orgID, err := uuid.Parse(orgIDStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid org id"})
	}

	if err := s.store.UninstallMCP(c.Request().Context(), orgID, mcpName); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": fmt.Sprintf("failed to uninstall mcp: %v", err)})
	}

	return c.NoContent(http.StatusOK)
}

func (s *Server) handleListAuditLogs(c echo.Context) error {
	// Since audit logs are filtered by Org in the plan, strict separation
	// But duplicate 'handleListOrgs' style, we might need a general endpoint or nested one
	
	// Assuming query param ?org_id=... or getting from user context
	orgIDStr := c.QueryParam("org_id")
	if orgIDStr == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "org_id required"})
	}
	
	orgID, err := uuid.Parse(orgIDStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid org_id"})
	}
	
	logs, err := s.store.ListAuditLogs(c.Request().Context(), orgID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to list audit logs"})
	}
	
	return c.JSON(http.StatusOK, logs)
}


