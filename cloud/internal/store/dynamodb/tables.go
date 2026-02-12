package dynamodb

import (
	"time"


)

// Table Names (can be overridden via config)
const (
	TableUsers   = "Octomus_Users"
	TableMCPs    = "Octomus_MCPs"
	TableHistory = "Octomus_History"
	TableAccess  = "Octomus_Access"
	TableOrgs    = "Octomus_Organizations" // Need this for Org metadata
)

// Item Structs

type OrgItem struct {
	ID        string    `dynamodbav:"id"`   // PK
	Name      string    `dynamodbav:"name"`
	OwnerID   string    `dynamodbav:"owner_id"`
	CreatedAt time.Time `dynamodbav:"created_at"`
}

type UserItem struct {
	Email          string    `dynamodbav:"email"` // PK
	ID             string    `dynamodbav:"id"`
	PasswordHash   string    `dynamodbav:"password_hash"` // Encrypted?
	OrganizationID string    `dynamodbav:"organization_id"` // Main Org
	Role           string    `dynamodbav:"role"`            // "admin" or sub-account role
	CreatedAt      time.Time `dynamodbav:"created_at"`
	Preferences    string    `dynamodbav:"preferences"`     // Encrypted JSON
}

type MCPItem struct {
	ID             string    `dynamodbav:"id"`              // PK
	OrganizationID string    `dynamodbav:"organization_id"` // GSI PK
	Name           string    `dynamodbav:"name"`
	Config         []byte    `dynamodbav:"config"`          // Encrypted blob
	InstalledAt    time.Time `dynamodbav:"created_at"`
}

type HistoryItem struct {
	OrganizationID string    `dynamodbav:"organization_id"` // PK
	SortKey        string    `dynamodbav:"sk"`              // Timestamp#ID
	UserID         string    `dynamodbav:"user_id"`
	Action         string    `dynamodbav:"action"`
	Resource       string    `dynamodbav:"resource"`
	Details        []byte    `dynamodbav:"details"`         // Encrypted blob
	Timestamp      time.Time `dynamodbav:"timestamp"`
}

type AccessItem struct {
	UserID   string   `dynamodbav:"user_id"` // PK
	MCPID    string   `dynamodbav:"mcp_id"`  // SK
	Actions  []string `dynamodbav:"actions"` // Allowed actions
}
