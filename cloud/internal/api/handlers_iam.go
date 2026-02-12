package api

import (

	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/octomus/cloud/internal/store"
)

// Organization Handlers

func (s *Server) handleListOrgs(c echo.Context) error {
	// TODO: Get userID from auth context
	// userID := c.Get("user_id").(uuid.UUID)

	// For now, list all (Admin view) or we need a Store method to list by User
	orgs, err := s.store.ListOrganizations(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to list organizations"})
	}

	return c.JSON(http.StatusOK, orgs)
}

func (s *Server) handleCreateOrg(c echo.Context) error {
	var req struct {
		Name string `json:"name"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}

	// TODO: Get userID from auth context
	ownerID := uuid.New() // Placeholder if not authed, but we should be authed.

	org := &store.Organization{
		ID:    uuid.New(),
		Name:  req.Name,
		OwnerID: ownerID,
	}

	if err := s.store.CreateOrganization(c.Request().Context(), org); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to create organization"})
	}

	// Create Admin Role for this Org
	roleID := uuid.New()
	adminRole := &store.Role{
		ID:       roleID,
		Name:     "admin",
		Policies: []store.MCPPolicy{{Action: "*", Resource: "*"}},
		CreatedAt: time.Now(),
	}
	s.store.CreateRole(c.Request().Context(), adminRole)

	// Add owner as member (owner role)
	member := &store.Member{
		OrganizationID: org.ID,
		UserID:         ownerID,
		RoleID:         roleID,
		JoinedAt:       time.Now(),
	}
	s.store.AddMember(c.Request().Context(), member)

	return c.JSON(http.StatusCreated, org)
}

func (s *Server) handleGetOrgDetails(c echo.Context) error {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid org id"})
	}

	org, err := s.store.GetOrganization(c.Request().Context(), id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "organization not found"})
	}

	members, err := s.store.GetMembers(c.Request().Context(), id)
	if err != nil {
		// Log error but maybe return empty list?
		members = []*store.Member{}
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"organization": org,
		"members":      members,
	})
}

// User Handlers (IAM)

func (s *Server) handleListUsers(c echo.Context) error {
	// Admin only
	users, err := s.store.ListUsers(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to list users"})
	}
	return c.JSON(http.StatusOK, users)
}

func (s *Server) handleCreateUser(c echo.Context) error {
	// Admin creating another user directly? Or invite flow?
	// This mirrors Register but maybe for admin usage
	var req RegisterRequest // Reuse or new struct
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}

	// ... Implementation similar to Register but without auto-creating Org ...
	return c.JSON(http.StatusNotImplemented, map[string]string{"error": "not implemented"})
}

func (s *Server) handleAddMember(c echo.Context) error {
	orgIDStr := c.Param("id")
	orgID, err := uuid.Parse(orgIDStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid org id"})
	}

	var req struct {
		Email  string `json:"email"`
		RoleID string `json:"role_id"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}

	// 1. Find User by Email
	user, err := s.store.GetUserByEmail(c.Request().Context(), req.Email)
	if err != nil {
		// Mock creating user if not exists? Or return error.
		// For prototype, we fail.
		return c.JSON(http.StatusNotFound, map[string]string{"error": "user not found"})
	}

	// 2. Validate Role
	roleID, err := uuid.Parse(req.RoleID)
	if err != nil {
		// Default to viewer or something if we had logic, here fail
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid role id"})
	}

	// 3. Add Member
	member := &store.Member{
		OrganizationID: orgID,
		UserID:         user.ID,
		RoleID:         roleID,
		JoinedAt:       time.Now(),
	}

	if err := s.store.AddMember(c.Request().Context(), member); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to add member"})
	}

	// 4. Audit
	s.store.CreateAuditLog(c.Request().Context(), &store.AuditLog{
		ID:             uuid.New(),
		OrganizationID: orgID,
		UserID:         user.ID, // Target user or actor? Actor should be from context.
		Action:         "org.add_member",
		Details:        map[string]any{"target_user": user.Email, "role_id": roleID},
		Timestamp:      time.Now(),
	})

	return c.JSON(http.StatusCreated, member)
}
