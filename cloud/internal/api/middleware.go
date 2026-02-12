package api

import (
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// PermissionMiddleware checks if the user has the required permission
func (s *Server) PermissionMiddleware(requiredAction string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// 1. Get User and Org from Context (set by Auth middleware)
			// For now, we mock these or extract from header for dev
			userIDStr := c.Request().Header.Get("X-User-ID")
			orgIDStr := c.Request().Header.Get("X-Org-ID")

			if userIDStr == "" || orgIDStr == "" {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "missing identity headers"})
			}

			userID, err := uuid.Parse(userIDStr)
			if err != nil {
				return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid user id"})
			}
			orgID, err := uuid.Parse(orgIDStr)
			if err != nil {
				return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid org id"})
			}

			// 2. Get Member Role
			role, err := s.store.GetMemberRole(c.Request().Context(), orgID, userID)
			if err != nil {
				return c.JSON(http.StatusForbidden, map[string]string{"error": "access denied to organization"})
			}

			// 3. Check Permissions/Policies
			hasPermission := false
			for _, policy := range role.Policies {
				// Simple check logic:
				// Action: "mcp.execute" matches "mcp.execute" or "*"
				// Resource: "*" matches everything.
				// In a real implementation, we would check the request body to see WHICH MCP is being requested.
				
				actionMatch := (policy.Action == "*" || policy.Action == requiredAction)
				resourceMatch := (policy.Resource == "*") 
				
				// TODO: Extract requested resource from body/param to check specific resource policy
				
				if actionMatch && resourceMatch {
					hasPermission = true
					break
				}
			}

			if !hasPermission {
				return c.JSON(http.StatusForbidden, map[string]string{
					"error": fmt.Sprintf("missing permission: %s", requiredAction),
				})
			}

			return next(c)
		}
	}
}
