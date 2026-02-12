package storage

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"

	"github.com/octomus/local/internal/core"
)

// Storage defines the interface for data persistence
type Storage interface {
	SaveServer(server core.MCPServerConfig) error
	ListServers() ([]core.MCPServerConfig, error)
	GetServer(name string) (*core.MCPServerConfig, error)
}

// JSONStore implements Storage using a local JSON file
type JSONStore struct {
	FilePath string
	mu       sync.RWMutex
}

func NewJSONStore(basePath string) (*JSONStore, error) {
	// Ensure directory exists
	if err := os.MkdirAll(basePath, 0755); err != nil {
		return nil, fmt.Errorf("failed to create data directory: %w", err)
	}
	return &JSONStore{
		FilePath: filepath.Join(basePath, "data.json"),
	}, nil
}

func (s *JSONStore) load() (map[string]core.MCPServerConfig, error) {
	data := make(map[string]core.MCPServerConfig)

	fileData, err := os.ReadFile(s.FilePath)
	if err != nil {
		if os.IsNotExist(err) {
			return data, nil // Return empty map if file doesn't exist
		}
		return nil, err
	}

	if len(fileData) == 0 {
		return data, nil
	}

	if err := json.Unmarshal(fileData, &data); err != nil {
		return nil, fmt.Errorf("failed to parse data.json: %w", err)
	}

	return data, nil
}

func (s *JSONStore) save(data map[string]core.MCPServerConfig) error {
	fileData, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.FilePath, fileData, 0644)
}

func (s *JSONStore) SaveServer(server core.MCPServerConfig) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	data, err := s.load()
	if err != nil {
		return err
	}

	data[server.Name] = server
	return s.save(data)
}

func (s *JSONStore) ListServers() ([]core.MCPServerConfig, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	data, err := s.load()
	if err != nil {
		return nil, err
	}

	servers := make([]core.MCPServerConfig, 0, len(data))
	for _, server := range data {
		servers = append(servers, server)
	}
	return servers, nil
}

func (s *JSONStore) GetServer(name string) (*core.MCPServerConfig, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	data, err := s.load()
	if err != nil {
		return nil, err
	}

	server, exists := data[name]
	if !exists {
		return nil, fmt.Errorf("server not found")
	}
	return &server, nil
}
