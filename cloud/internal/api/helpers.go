package api

import (
	"log"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// CheckResourcePermission verifies if the authenticated user has access to a specific resource
func (s *Server) CheckResourcePermission(c echo.Context, action, resource string) bool {
	// 1. Get User/Org (Mocked same as middleware for now)
	userIDStr := c.Request().Header.Get("X-User-ID")
	orgIDStr := c.Request().Header.Get("X-Org-ID")

	if userIDStr == "" || orgIDStr == "" {
		return false
	}

	userID, _ := uuid.Parse(userIDStr)
	orgID, _ := uuid.Parse(orgIDStr)

	// 2. Get Role
	role, err := s.store.GetMemberRole(c.Request().Context(), orgID, userID)
	if err != nil {
		log.Printf("Failed to get role: %v", err)
		return false
	}

	// 3. Check Policies
	for _, policy := range role.Policies {
		actionMatch := (policy.Action == "*" || policy.Action == action)
		resourceMatch := (policy.Resource == "*" || policy.Resource == resource)

		if actionMatch && resourceMatch {
			return true
		}
	}

	return false
}
