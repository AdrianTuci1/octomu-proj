package api

import (
	"encoding/json"
	"net/http"

	"github.com/octomus/local/internal/auth"
	"github.com/octomus/local/internal/core"
	"github.com/octomus/local/internal/security"
)

type Response struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	Version string `json:"version"`
	Data    any    `json:"data,omitempty"`
}

func NewHandler(orchestrator *core.Orchestrator, tokenManager *security.TokenManager, authRequired bool) http.Handler {
	mux := http.NewServeMux()

	// 1. Unprotected Routes
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(Response{
			Status:  "ok",
			Message: "Octomus Local is running",
			Version: "0.1.0",
		})
	})

	// 2. Protected Routes (Everything else)
	// We create a sub-handler for the actual application logic
	appMux := http.NewServeMux()

	// Serve Frontend
	fs := http.FileServer(http.Dir("./frontend/dist"))

	appMux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		// Check if file exists in dist
		path := "./frontend/dist" + r.URL.Path
		if _, err := os.Stat(path); os.IsNotExist(err) {
			// If not found, serve index.html for SPA routing
			http.ServeFile(w, r, "./frontend/dist/index.html")
			return
		}
		// Otherwise serve the file
		fs.ServeHTTP(w, r)
	})

	// Agentic API Endpoints

	appMux.HandleFunc("GET /sync", func(w http.ResponseWriter, r *http.Request) {
		syncInfo, err := orchestrator.GetToolSyncInfo()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(syncInfo)
	})

	appMux.HandleFunc("POST /execute", func(w http.ResponseWriter, r *http.Request) {
		var req core.ExecutionRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		result, err := orchestrator.ExecuteTool(req)
		// Even if execution logically "failed" inside the tool, we might return 200 with result.Status="error"
		// If the orchestrator itself failed (e.g. system error), returns 500.
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(result)
	})

	// Admin / Management Endpoints

	appMux.HandleFunc("GET /api/history", func(w http.ResponseWriter, r *http.Request) {
		history, err := orchestrator.GetHistory()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(Response{
			Status: "ok",
			Data:   history,
		})
	})

	appMux.HandleFunc("GET /api/servers", func(w http.ResponseWriter, r *http.Request) {
		servers, err := orchestrator.ListServers()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(Response{
			Status: "ok",
			Data:   servers,
		})
	})

	appMux.HandleFunc("POST /api/servers", func(w http.ResponseWriter, r *http.Request) {
		var config core.MCPServerConfig
		if err := json.NewDecoder(r.Body).Decode(&config); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if err := orchestrator.RegisterServer(config); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(Response{
			Status:  "ok",
			Message: "Server registered successfully",
		})
	})

	appMux.HandleFunc("GET /api/registry", RegistryHandler)

	appMux.HandleFunc("GET /api/spec", func(w http.ResponseWriter, r *http.Request) {
		// Determine base URL
		// If accessing via tunnel, the Host header might be the tunnel URL?
		// Or we construct it based on configuration.
		// For now, let's use the request Host, but maybe we should allow override or detect "X-Forwarded-Host".
		
		scheme := "http"
		if r.TLS != nil || r.Header.Get("X-Forwarded-Proto") == "https" {
			scheme = "https"
		}
		host := r.Host
		baseURL := fmt.Sprintf("%s://%s", scheme, host)
		
		// If cloud tunnel is active and we want to expose that URL:
		// But the spec is generated dynamically. 
		// Ideally the user configures the "Public URL".
		// For now, let's use what we see.
		
		spec := GenerateSpec(baseURL)
		w.Header().Set("Content-Type", "application/json")
		w.Write(spec)
	})

	// Auth Routes
	// Note: We cast GetStorage() result to auth.TokenStorage interface essentially
	// But since SQLiteStore implements it (if we updated it), we need to make sure interface matches.
	// Orchestrator GetStorage returns core.ServerStorage.
	// core.ServerStorage needs to include SaveToken/GetToken or we need type assertion.
	// Best approach: Add SaveToken/GetToken to core.ServerStorage interface.

	// For now, let's assume we update core interface too.
	authService := auth.NewAuthService(orchestrator.GetStorage())
	appMux.HandleFunc("GET /auth/login", authService.LoginHandler)
	appMux.HandleFunc("GET /auth/callback", authService.CallbackHandler)

	// Wrap the application mux with the AuthMiddleware
	// We handle the wrapping manually here because AuthMiddleware returns http.Handler
	// But we strive to return a strict http.Handler from NewHandler
	
	// Implementation note: The AuthMiddleware needs to wrap the *entire* appMux
	// except for the public /health check which is on the root `mux`.
	
	// So we mount the shielded appMux onto root mux with a catch-all
	mux.Handle("/", AuthMiddleware(appMux, tokenManager, authRequired))

	return mux
}
