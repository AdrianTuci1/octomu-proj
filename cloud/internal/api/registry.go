package api

import (
	"fmt"
	"io"
	"net/http"

	"github.com/labstack/echo/v4"
)

// HandleRegistry proxies requests to the official MCP registry
func (s *Server) HandleRegistry(c echo.Context) error {
	// Add search query parameter handling if needed
	query := c.Request().URL.Query().Encode()
	url := "https://registry.modelcontextprotocol.io/v0.1/servers"
	if query != "" {
		url += "?" + query
	}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": fmt.Sprintf("Failed to create request: %v", err)})
	}

	// Forward necessary headers if any, or set user agent
	req.Header.Set("User-Agent", "Octomus-Cloud/0.1.0")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return c.JSON(http.StatusBadGateway, map[string]string{"error": fmt.Sprintf("Failed to fetch registry: %v", err)})
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		// Try to read error body
		body, _ := io.ReadAll(resp.Body)
		return c.JSON(http.StatusBadGateway, map[string]string{
			"error": fmt.Sprintf("Registry returned status: %d", resp.StatusCode),
			"body":  string(body),
		})
	}

	// Copy headers
	c.Response().Header().Set("Content-Type", "application/json")
	c.Response().Header().Set("Cache-Control", "public, max-age=300") // 5 min cache

	// Stream the response body directly to the client
	_, err = io.Copy(c.Response().Writer, resp.Body)
	if err != nil {
		return err
	}
	
	return nil
}
