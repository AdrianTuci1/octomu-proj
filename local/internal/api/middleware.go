package api

import (
	"net/http"
	"time"

	"github.com/octomus/local/internal/security"
)

// AuthMiddleware handles token-based authentication
func AuthMiddleware(next http.Handler, tokenManager *security.TokenManager, authRequired bool) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// If auth is not required, proceed immediately
		if !authRequired {
			next.ServeHTTP(w, r)
			return
		}

		// Check for token in query parameter (priority, to set cookie)
		queryToken := r.URL.Query().Get("token")
		if queryToken != "" {
			if tokenManager.ValidateToken(queryToken) {
				// Valid token in query, set cookie and redirect to strip token from URL
				http.SetCookie(w, &http.Cookie{
					Name:     "auth_token",
					Value:    queryToken,
					Path:     "/",
					HttpOnly: true,
					Secure:   r.TLS != nil, // Secure only if HTTPS is used (proxies handles this usually)
					SameSite: http.SameSiteStrictMode,
					Expires:  time.Now().Add(24 * time.Hour),
				})

				// Remove token from URL to avoid leaking it in history/logs
				// We rebuild the URL without the token param
				q := r.URL.Query()
				q.Del("token")
				r.URL.RawQuery = q.Encode()
				
				// Redirect to cleaning URL if it was a GET request
				if r.Method == http.MethodGet {
					http.Redirect(w, r, r.URL.String(), http.StatusFound)
					return
				}
				
				// For non-GET, we accept it but the redirect above is better UX for browser loading
				next.ServeHTTP(w, r)
				return
			}
		}

		// Check Authorization header
		// Format: Authorization: into-the-octomus <token> (or Bearer)
		// Let's stick to Bearer for standard
		// (Implementation skipped for brevity if we rely on cookies/query for web dash)

		// Check for token in cookie
		cookie, err := r.Cookie("auth_token")
		if err == nil && cookie.Value != "" {
			if tokenManager.ValidateToken(cookie.Value) {
				next.ServeHTTP(w, r)
				return
			}
		}

		// If we are here, no valid credential found
		w.Header().Set("WWW-Authenticate", `Basic realm="Restricted"`)
		http.Error(w, "Unauthorized: Access denied. Please start with correct token.", http.StatusUnauthorized)
	})
}
