package store

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/google/uuid"
)

type InMemoryStore struct {
	users         map[uuid.UUID]*User
	organizations map[uuid.UUID]*Organization
	members       map[string]*Member // Key: "orgID:userID"
	roles         map[uuid.UUID]*Role
	installations map[uuid.UUID]*MCPInstallation
	auditLogs     []*AuditLog
	
	nodes         map[uuid.UUID]*WorkerNode
	sessions      map[uuid.UUID]*VMSession
	mu            sync.RWMutex
}

func NewInMemoryStore() *InMemoryStore {
	return &InMemoryStore{
		users:         make(map[uuid.UUID]*User),
		organizations: make(map[uuid.UUID]*Organization),
		members:       make(map[string]*Member),
		roles:         make(map[uuid.UUID]*Role),
		installations: make(map[uuid.UUID]*MCPInstallation),
		auditLogs:     make([]*AuditLog, 0),
		nodes:         make(map[uuid.UUID]*WorkerNode),
		sessions:      make(map[uuid.UUID]*VMSession),
	}
}

func (s *InMemoryStore) CreateUser(ctx context.Context, user *User) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.users[user.ID] = user
	return nil
}

func (s *InMemoryStore) GetUserByEmail(ctx context.Context, email string) (*User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, u := range s.users {
		if u.Email == email {
			return u, nil
		}
	}
	return nil, errors.New("user not found")
}

func (s *InMemoryStore) ListUsers(ctx context.Context) ([]*User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	
	users := make([]*User, 0, len(s.users))
	for _, u := range s.users {
		users = append(users, u)
	}
	return users, nil
}

func (s *InMemoryStore) CreateOrganization(ctx context.Context, org *Organization) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.organizations[org.ID] = org
	s.organizations[org.ID] = org
	return nil
}

func (s *InMemoryStore) ListOrganizations(ctx context.Context) ([]*Organization, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	
	orgs := make([]*Organization, 0, len(s.organizations))
	for _, o := range s.organizations {
		orgs = append(orgs, o)
	}
	return orgs, nil
}

func (s *InMemoryStore) GetOrganization(ctx context.Context, id uuid.UUID) (*Organization, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	
	org, ok := s.organizations[id]
	if !ok {
		return nil, errors.New("organization not found")
	}
	return org, nil
}

func (s *InMemoryStore) CreateRole(ctx context.Context, role *Role) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.roles[role.ID] = role
	return nil
}

func (s *InMemoryStore) AddMember(ctx context.Context, member *Member) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	key := fmt.Sprintf("%s:%s", member.OrganizationID, member.UserID)
	s.members[key] = member
	return nil
}

func (s *InMemoryStore) GetMemberRole(ctx context.Context, orgID, userID uuid.UUID) (*Role, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	
	key := fmt.Sprintf("%s:%s", orgID, userID)
	member, ok := s.members[key]
	if !ok {
		return nil, errors.New("member not found")
	}
	
	role, ok := s.roles[member.RoleID]
	if !ok {
		return nil, errors.New("role not found")
	}
	
	return role, nil
}

func (s *InMemoryStore) GetMembers(ctx context.Context, orgID uuid.UUID) ([]*Member, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	
	var members []*Member
	for _, m := range s.members {
		if m.OrganizationID == orgID {
			members = append(members, m)
		}
	}
	return members, nil
}

// MCP Management
func (s *InMemoryStore) InstallMCP(ctx context.Context, install *MCPInstallation) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.installations[install.ID] = install
	return nil
}

func (s *InMemoryStore) ListInstalledMCPs(ctx context.Context, orgID uuid.UUID) ([]*MCPInstallation, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	
	var installed []*MCPInstallation
	for _, i := range s.installations {
		if i.OrganizationID == orgID {
			installed = append(installed, i)
		}
	}
	return installed, nil
}

// Audit
func (s *InMemoryStore) CreateAuditLog(ctx context.Context, log *AuditLog) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.auditLogs = append(s.auditLogs, log)
	return nil
}

func (s *InMemoryStore) ListAuditLogs(ctx context.Context, orgID uuid.UUID) ([]*AuditLog, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	
	var logs []*AuditLog
	for _, l := range s.auditLogs {
		if l.OrganizationID == orgID {
			logs = append(logs, l)
		}
	}
	return logs, nil
}

func (s *InMemoryStore) RegisterNode(ctx context.Context, node *WorkerNode) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	
	node.LastHeartbeatAt = time.Now()
	s.nodes[node.ID] = node
	return nil
}

func (s *InMemoryStore) UpdateNodeHeartbeat(ctx context.Context, nodeID uuid.UUID) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	
	node, ok := s.nodes[nodeID]
	if !ok {
		return errors.New("node not found")
	}
	node.LastHeartbeatAt = time.Now()
	return nil
}

func (s *InMemoryStore) ListActiveNodes(ctx context.Context) ([]*WorkerNode, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	
	var active []*WorkerNode
	for _, n := range s.nodes {
		if n.Status == "active" {
			active = append(active, n)
		}
	}
	return active, nil
}

func (s *InMemoryStore) CreateSession(ctx context.Context, session *VMSession) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.sessions[session.ID] = session
	return nil
}

func (s *InMemoryStore) GetSession(ctx context.Context, id uuid.UUID) (*VMSession, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	session, ok := s.sessions[id]
	if !ok {
		return nil, errors.New("session not found")
	}
	return session, nil
}

func (s *InMemoryStore) UpdateSessionStatus(ctx context.Context, id uuid.UUID, status string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	
	session, ok := s.sessions[id]
	if !ok {
		return errors.New("session not found")
	}
	session.Status = status
	return nil
}
