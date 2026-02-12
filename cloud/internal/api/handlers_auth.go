package api

import (
	"fmt"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/octomus/cloud/internal/store"
)

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	OrgName  string `json:"org_name"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string      `json:"token"`
	User  *store.User `json:"user"`
}

// Google/GitHub OAuth definitions would go here or in a separate auth package

// 1. GET /auth/:provider/url
func (s *Server) handleGetOAuthURL(c echo.Context) error {
	provider := c.Param("provider")
	if provider != "google" && provider != "github" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "unsupported provider"})
	}

	// Mocking the Provider Authorization URL.
	// In a real app, this would be "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=http://localhost:5173/login/callback"
	
	// Since we are mocking: We return a URL that behaves like the Provider redirecting back to the Frontend.
	// For this prototype, we'll just redirect the browser immediately to the frontend callback with a mock code.
	
	// Frontend URL (Simulating Provider -> Redirect -> Frontend)
	// We point to the *Frontend* callback route.
	frontendCallback := "http://localhost:5173/login/callback"
	
	// The "Provider" tells the browser to go here with a code
	mockProviderURL := fmt.Sprintf("%s?code=mock_code_for_%s&provider=%s", 
		frontendCallback, provider, provider)
	
	return c.JSON(http.StatusOK, map[string]string{
		"url": mockProviderURL, 
	})
}

// 2. POST /auth/callback
func (s *Server) handleOAuthExchange(c echo.Context) error {
	var req struct {
		Provider string `json:"provider"`
		Code     string `json:"code"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}

	if req.Code == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "missing code"})
	}

	// 1. Exchange Code for Token (Mock)
	// realToken, err := provider.Exchange(req.Code)
	
	// Mock User Info based on code or provider
	email := fmt.Sprintf("user_%s@example.com", req.Provider) 
	if req.Provider == "github" {
		email = "github_user@example.com"
	} else if req.Provider == "google" {
		email = "google_user@example.com"
	}
	
	// 2. Find or Create User
	ctx := c.Request().Context()
	user, err := s.store.GetUserByEmail(ctx, email)
	if err != nil {
		// Create User
		userID := uuid.New()
		user = &store.User{
			ID:           userID,
			Email:        email,
			CreatedAt:    time.Now(),
		}
		s.store.CreateUser(ctx, user)
		
		// Auto-provision Default Org
		orgID := uuid.New()
		org := &store.Organization{
			ID:        orgID,
			Name:      fmt.Sprintf("%s's Org", "User"),
			OwnerID:   userID,
			CreatedAt: time.Now(),
		}
		s.store.CreateOrganization(ctx, org)
		
		// Create Role & Member
		roleID := uuid.New()
		s.store.CreateRole(ctx, &store.Role{
			ID: roleID, Name: "admin", Policies: []store.MCPPolicy{{Action: "*", Resource: "*"}}, CreatedAt: time.Now(),
		})
		s.store.AddMember(ctx, &store.Member{
			OrganizationID: orgID, UserID: userID, RoleID: roleID, JoinedAt: time.Now(),
		})
	}

	// 3. Issue Session Token
	token := fmt.Sprintf("mock-token-%s", user.ID)

	// Return JSON with Token
	return c.JSON(http.StatusOK, AuthResponse{
		Token: token,
		User:  user,
	})
}
