package storage

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/octomus/local/internal/core"
	"golang.org/x/oauth2"
	_ "modernc.org/sqlite" // Import sqlite driver
)

// SQLiteStore implements core.ServerStorage using SQLite
type SQLiteStore struct {
	db *sql.DB
}

// NewSQLiteStore initializes the SQLite database
func NewSQLiteStore(dataDir string) (*SQLiteStore, error) {
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create data directory: %w", err)
	}

	dbPath := filepath.Join(dataDir, "octomus.db")
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open sqlite database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping sqlite database: %w", err)
	}

	store := &SQLiteStore{db: db}
	if err := store.initSchema(); err != nil {
		db.Close()
		return nil, err
	}

	return store, nil
}

func (s *SQLiteStore) initSchema() error {
	// Servers table
	_, err := s.db.Exec(`
		CREATE TABLE IF NOT EXISTS servers (
			name TEXT PRIMARY KEY,
			command TEXT NOT NULL,
			args TEXT,
			env TEXT,
			description TEXT
		);
	`)
	if err != nil {
		return fmt.Errorf("failed to create servers table: %w", err)
	}

	// History table
	_, err = s.db.Exec(`
		CREATE TABLE IF NOT EXISTS history (
			id TEXT PRIMARY KEY,
			timestamp TEXT NOT NULL,
			tool_name TEXT NOT NULL,
			method TEXT,
			arguments TEXT,
			status TEXT,
			duration_ms INTEGER,
			result TEXT,
			error TEXT
		);
	`)
	if err != nil {
		return fmt.Errorf("failed to create history table: %w", err)
	}

	// Tokens table
	_, err = s.db.Exec(`
		CREATE TABLE IF NOT EXISTS tokens (
			provider TEXT PRIMARY KEY,
			access_token TEXT NOT NULL,
			refresh_token TEXT,
			expiry DATETIME
		);
	`)
	if err != nil {
		return fmt.Errorf("failed to create tokens table: %w", err)
	}

	return nil
}

// Close closes the database connection
func (s *SQLiteStore) Close() error {
	return s.db.Close()
}

// --- ServerStorage Implementation ---

func (s *SQLiteStore) SaveServer(server core.MCPServerConfig) error {
	argsJson, err := json.Marshal(server.Args)
	if err != nil {
		return fmt.Errorf("failed to marshal args: %w", err)
	}
	envJson, err := json.Marshal(server.Env)
	if err != nil {
		return fmt.Errorf("failed to marshal env: %w", err)
	}

	query := `
		INSERT INTO servers (name, command, args, env, description)
		VALUES (?, ?, ?, ?, ?)
		ON CONFLICT(name) DO UPDATE SET
			command=excluded.command,
			args=excluded.args,
			env=excluded.env,
			description=excluded.description;
	`
	_, err = s.db.Exec(query, server.Name, server.Command, string(argsJson), string(envJson), server.Description)
	if err != nil {
		return fmt.Errorf("failed to save server: %w", err)
	}
	return nil
}

func (s *SQLiteStore) ListServers() ([]core.MCPServerConfig, error) {
	rows, err := s.db.Query("SELECT name, command, args, env, description FROM servers")
	if err != nil {
		return nil, fmt.Errorf("failed to list servers: %w", err)
	}
	defer rows.Close()

	var servers []core.MCPServerConfig
	for rows.Next() {
		var srv core.MCPServerConfig
		var argsJson, envJson string
		if err := rows.Scan(&srv.Name, &srv.Command, &argsJson, &envJson, &srv.Description); err != nil {
			return nil, err
		}

		if err := json.Unmarshal([]byte(argsJson), &srv.Args); err != nil {
			return nil, fmt.Errorf("failed to unmarshal args for %s: %w", srv.Name, err)
		}
		if err := json.Unmarshal([]byte(envJson), &srv.Env); err != nil {
			return nil, fmt.Errorf("failed to unmarshal env for %s: %w", srv.Name, err)
		}
		servers = append(servers, srv)
	}
	return servers, nil
}

func (s *SQLiteStore) GetServer(name string) (*core.MCPServerConfig, error) {
	row := s.db.QueryRow("SELECT name, command, args, env, description FROM servers WHERE name = ?", name)

	var srv core.MCPServerConfig
	var argsJson, envJson string
	if err := row.Scan(&srv.Name, &srv.Command, &argsJson, &envJson, &srv.Description); err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("server not found")
		}
		return nil, err
	}

	if err := json.Unmarshal([]byte(argsJson), &srv.Args); err != nil {
		return nil, fmt.Errorf("failed to unmarshal args: %w", err)
	}
	if err := json.Unmarshal([]byte(envJson), &srv.Env); err != nil {
		return nil, fmt.Errorf("failed to unmarshal env: %w", err)
	}

	return &srv, nil
}

func (s *SQLiteStore) AppendHistory(record core.ExecutionRecord) error {
	argsJson, err := json.Marshal(record.Arguments)
	if err != nil {
		return fmt.Errorf("failed to marshal arguments: %w", err)
	}
	resultJson, err := json.Marshal(record.Result)
	if err != nil {
		return fmt.Errorf("failed to marshal result: %w", err)
	}

	// Ensure timestamp is uniform
	if record.Timestamp == "" {
		record.Timestamp = time.Now().UTC().Format(time.RFC3339)
	}

	query := `
		INSERT INTO history (id, timestamp, tool_name, method, arguments, status, duration_ms, result, error)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`
	_, err = s.db.Exec(query,
		record.ID,
		record.Timestamp,
		record.ToolName,
		record.Method,
		string(argsJson),
		record.Status,
		record.DurationMs,
		string(resultJson),
		record.Error,
	)
	if err != nil {
		return fmt.Errorf("failed to append history: %w", err)
	}
	return nil
}

func (s *SQLiteStore) GetHistory(limit int) ([]core.ExecutionRecord, error) {
	query := "SELECT id, timestamp, tool_name, method, arguments, status, duration_ms, result, error FROM history ORDER BY timestamp DESC"
	var rows *sql.Rows
	var err error

	if limit > 0 {
		query += " LIMIT ?"
		rows, err = s.db.Query(query, limit)
	} else {
		rows, err = s.db.Query(query)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get history: %w", err)
	}
	defer rows.Close()

	var records []core.ExecutionRecord
	for rows.Next() {
		var rec core.ExecutionRecord
		var argsJson, resultJson string
		if err := rows.Scan(
			&rec.ID,
			&rec.Timestamp,
			&rec.ToolName,
			&rec.Method,
			&argsJson,
			&rec.Status,
			&rec.DurationMs,
			&resultJson,
			&rec.Error,
		); err != nil {
			return nil, err
		}

		if err := json.Unmarshal([]byte(argsJson), &rec.Arguments); err != nil {
			// Don't fail entire list for one bad record, maybe log?
			// For now, simpler to just return empty map or proceed
		}
		if err := json.Unmarshal([]byte(resultJson), &rec.Result); err != nil {
			// Same
		}
		records = append(records, rec)
	}
	return records, nil
}

// --- TokenStorage Implementation ---

func (s *SQLiteStore) SaveToken(provider string, token *oauth2.Token) error {
	data, err := json.Marshal(token)
	if err != nil {
		return err
	}

	_, err = s.db.Exec(`
		INSERT INTO tokens (provider, access_token, refresh_token, expiry)
		VALUES (?, ?, ?, ?)
		ON CONFLICT(provider) DO UPDATE SET
			access_token=excluded.access_token,
			refresh_token=excluded.refresh_token,
			expiry=excluded.expiry
	`, provider, string(data), token.RefreshToken, token.Expiry)
	return err
}

func (s *SQLiteStore) GetToken(provider string) (*oauth2.Token, error) {
	var data string
	var refreshToken string
	var expiry time.Time

	err := s.db.QueryRow("SELECT access_token, refresh_token, expiry FROM tokens WHERE provider = ?", provider).Scan(&data, &refreshToken, &expiry)
	if err != nil {
		return nil, err
	}

	var token oauth2.Token
	if err := json.Unmarshal([]byte(data), &token); err != nil {
		return nil, err
	}
	return &token, nil
}
