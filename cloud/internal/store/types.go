package store

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID `json:"id"`
	Email     string    `json:"email"`
	GoogleID  string    `json:"google_id,omitempty"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}

type Organization struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	OwnerID   uuid.UUID `json:"owner_id"`
	CreatedAt time.Time `json:"created_at"`
}

type Role struct {
	ID        uuid.UUID   `json:"id"`
	Name      string      `json:"name"`     // e.g. "admin", "viewer"
	Policies  []MCPPolicy `json:"policies"` // Defines access
	CreatedAt time.Time   `json:"created_at"`
}

type MCPPolicy struct {
	Action   string `json:"action"`   // "mcp.execute", "mcp.install", "*"
	Resource string `json:"resource"` // "github-mcp", "*", "google-drive"
}

type Member struct {
	OrganizationID uuid.UUID `json:"organization_id"`
	UserID         uuid.UUID `json:"user_id"`
	RoleID         uuid.UUID `json:"role_id"`
	JoinedAt       time.Time `json:"joined_at"`
}

type MCPInstallation struct {
	ID             uuid.UUID      `json:"id"`
	OrganizationID uuid.UUID      `json:"organization_id"`
	MCPName        string         `json:"mcp_name"` // e.g., "google-drive-mcp"
	Config         map[string]any `json:"config"`   // Env vars, etc.
	InstalledAt    time.Time      `json:"installed_at"`
}

type AuditLog struct {
	ID             uuid.UUID      `json:"id"`
	OrganizationID uuid.UUID      `json:"organization_id"`
	UserID         uuid.UUID      `json:"user_id"`
	Action         string         `json:"action"`          // "mcp.install", "user.create", "mcp.execute"
	Resource       string         `json:"resource"`        // Target resource ID/Name
	Details        map[string]any `json:"details"`         // Metadata
	Timestamp      time.Time      `json:"timestamp"`
	IPAddress      string         `json:"ip_address"`
}

type WorkerNode struct {
	ID              uuid.UUID `json:"id"`
	Hostname        string    `json:"hostname"`
	IPAddress       string    `json:"ip_address"`
	CapacityCPU     int       `json:"capacity_cpu"`       // Number of vCPUs
	CapacityMemory  int       `json:"capacity_memory_mb"` // MB
	Status          string    `json:"status"`             // "active", "draining", "offline"
	LastHeartbeatAt time.Time `json:"last_heartbeat_at"`
}

type VMSession struct {
	ID             uuid.UUID      `json:"id"`
	OrganizationID uuid.UUID      `json:"organization_id"`
	UserID         uuid.UUID      `json:"user_id"`
	WorkerNodeID   uuid.UUID      `json:"worker_node_id,omitempty"`
	Status         string         `json:"status"` // "provisioning", "running", "stopped"
	MCPConfig      map[string]any `json:"mcp_config"`
	Connection     ConnectionInfo `json:"connection_info,omitempty"`
	CreatedAt      time.Time      `json:"created_at"`
	ExpiresAt      time.Time      `json:"expires_at"`
}

type ConnectionInfo struct {
	Host  string `json:"host"`
	Port  int    `json:"port"`
	Token string `json:"token"`
}

type Store interface {
	// IAM & Auth
	CreateUser(ctx context.Context, user *User) error
	GetUserByEmail(ctx context.Context, email string) (*User, error)
	ListUsers(ctx context.Context) ([]*User, error) // Admin only
	
	CreateOrganization(ctx context.Context, org *Organization) error
	ListOrganizations(ctx context.Context) ([]*Organization, error)
	GetOrganization(ctx context.Context, id uuid.UUID) (*Organization, error)
	
	CreateRole(ctx context.Context, role *Role) error
	AddMember(ctx context.Context, member *Member) error
	GetMemberRole(ctx context.Context, orgID, userID uuid.UUID) (*Role, error)
	GetMembers(ctx context.Context, orgID uuid.UUID) ([]*Member, error)
	
	// MCP Management
	InstallMCP(ctx context.Context, install *MCPInstallation) error
	UninstallMCP(ctx context.Context, orgID uuid.UUID, mcpName string) error
	ListInstalledMCPs(ctx context.Context, orgID uuid.UUID) ([]*MCPInstallation, error)
	
	// Audit
	CreateAuditLog(ctx context.Context, log *AuditLog) error
	ListAuditLogs(ctx context.Context, orgID uuid.UUID) ([]*AuditLog, error)

	// Infrastructure
	RegisterNode(ctx context.Context, node *WorkerNode) error
	UpdateNodeHeartbeat(ctx context.Context, nodeID uuid.UUID) error
	ListActiveNodes(ctx context.Context) ([]*WorkerNode, error)

	CreateSession(ctx context.Context, session *VMSession) error
	GetSession(ctx context.Context, id uuid.UUID) (*VMSession, error)
	UpdateSessionStatus(ctx context.Context, id uuid.UUID, status string) error
}
