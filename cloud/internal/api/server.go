package api

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"github.com/octomus/cloud/internal/mcp"
	"github.com/octomus/cloud/internal/store"
	"github.com/octomus/cloud/internal/store/dynamodb"
)


type Server struct {
	store      store.Store
	nodeServer *GRPCServer
	mcpStorage *mcp.ManagedStorage
}

func NewServer() *Server {
	// Initialize Store
	// store := store.NewInMemoryStore()

	// Real DynamoDB Store
	tableName := os.Getenv("DYNAMODB_TABLE")
	if tableName == "" {
		tableName = "octomus-cloud"
	}

	// Assuming appropriate AWS Env Vars are set (AWS_ACCESS_KEY_ID, etc.)
	// or ~/.aws/credentials exists.
	// For production, we should handle error here, but for NewServer signature we might panic or change sig.
	// Let's use a background context or a timeout context.
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	store, err := dynamodb.NewDynamoDBStore(ctx, tableName)
	if err != nil {
		// Fallback to memory for development if DynamoDB fails?
		// Or panic? Let's panic to be explicit about failure in "Propd-ish" mode
		// panic(fmt.Sprintf("failed to connect to dynamodb: %v", err))

		// Actually, for this hybrid dev mode, let's log and fallback if env var not set,
		// but since we want to enforce it:
		fmt.Printf("Failing to connect to DynamoDB: %v\n", err)
		panic(fmt.Sprintf("failed to connect to dynamodb: %v", err)) // Added panic as per thought process
	}

	s := &Server{
		store:      store,
		nodeServer: NewNodeServer(store),
		mcpStorage: mcp.NewManagedStorage(""), // Default cache dir
	}
	return s
}

func (s *Server) RegisterRoutes(e *echo.Echo) {
	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	
	// CORS
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"}, // For dev, allow all. In prod, restrict to frontend URL
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
		AllowMethods: []string{http.MethodGet, http.MethodHead, http.MethodPut, http.MethodPatch, http.MethodPost, http.MethodDelete},
	}))

	v1 := e.Group("/api/v1")

	// Auth
	v1.GET("/auth/:provider/url", s.handleGetOAuthURL)
	v1.POST("/auth/callback", s.handleOAuthExchange)

	// IAM (Orgs & Users)
	v1.GET("/orgs", s.handleListOrgs)
	v1.POST("/orgs", s.handleCreateOrg)
	v1.GET("/orgs/:id", s.handleGetOrgDetails)
	v1.POST("/orgs/:id/members", s.handleAddMember)
	v1.GET("/users", s.handleListUsers) // Admin
	
	// MCP Management
	v1.GET("/orgs/:id/mcps", s.handleListInstalledMCPs)
	v1.POST("/orgs/:id/mcps", s.handleInstallMCP)
	v1.DELETE("/orgs/:id/mcps/:name", s.handleUninstallMCP)
	v1.GET("/managed", s.handleListManagedMCPs)
	
	// Audit
	// v1.GET("/audit", s.handleListAuditLogs) // Context-based or query param

	// Protected Routes (Session Management)
	// Requires "mcp.execute" or "session.create" permission
	v1.POST("/sessions", s.handleCreateSession, s.PermissionMiddleware("mcp.execute"))
	// Agentic API for LLMs
	v1.GET("/sync", s.handleSync, s.PermissionMiddleware("mcp.read"))
	v1.POST("/execute", s.handleExecute, s.PermissionMiddleware("mcp.execute"))

	// Node Management (different permission needed, maybe "node.view")
	v1.GET("/nodes/health", s.handleNodeHealth)
	
	// Registry is public (or authenticated)
	v1.GET("/registry", s.HandleRegistry)
}

type CreateSessionRequest struct {
	MCPConfig map[string]any `json:"mcp_config"`
}

func (s *Server) handleCreateSession(c echo.Context) error {
	var req CreateSessionRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}

	// TODO: Get user from context (Auth middleware)
	userID := uuid.New() // Placeholder
	// TODO: Get OrganizationID from context or request
	orgID := uuid.New() // Placeholder

	session := &store.VMSession{
		ID:             uuid.New(),
		UserID:         userID,
		OrganizationID: orgID,
		Status:         "provisioning",
		MCPConfig:      req.MCPConfig,
		CreatedAt:      time.Now(),
		ExpiresAt:      time.Now().Add(1 * time.Hour),
	}

	// TODO: Call Scheduler to assign node
	// For now, just save pending session
	
	if err := s.store.CreateSession(c.Request().Context(), session); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to create session"})
	}

	return c.JSON(http.StatusCreated, session)
}

func (s *Server) handleNodeHealth(c echo.Context) error {
	// Worker nodes ping this
	// We might want to accept POST with stats
	return c.NoContent(http.StatusOK)
}
