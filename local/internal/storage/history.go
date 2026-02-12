package storage

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/octomus/local/internal/core"
)

// AppendHistory saves an execution record to the history file
func (s *JSONStore) AppendHistory(record core.ExecutionRecord) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	historyPath := filepath.Join(filepath.Dir(s.FilePath), "history.jsonl")

	file, err := os.OpenFile(historyPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return fmt.Errorf("failed to open history file: %w", err)
	}
	defer file.Close()

	data, err := json.Marshal(record)
	if err != nil {
		return fmt.Errorf("failed to marshal history record: %w", err)
	}

	if _, err := file.Write(append(data, '\n')); err != nil {
		return fmt.Errorf("failed to write history record: %w", err)
	}

	return nil
}

// GetHistory returns the most recent execution records
func (s *JSONStore) GetHistory(limit int) ([]core.ExecutionRecord, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	historyPath := filepath.Join(filepath.Dir(s.FilePath), "history.jsonl")

	file, err := os.Open(historyPath)
	if err != nil {
		if os.IsNotExist(err) {
			return []core.ExecutionRecord{}, nil
		}
		return nil, err
	}
	defer file.Close()

	var records []core.ExecutionRecord
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		var record core.ExecutionRecord
		if err := json.Unmarshal(scanner.Bytes(), &record); err != nil {
			// Skip malformed lines? Or fail? Let's skip and log in real app, here return error
			return nil, fmt.Errorf("failed to parse history line: %w", err)
		}
		records = append(records, record)
	}

	if err := scanner.Err(); err != nil {
		return nil, err
	}

	// Reverse to get newest first
	for i, j := 0, len(records)-1; i < j; i, j = i+1, j-1 {
		records[i], records[j] = records[j], records[i]
	}

	if limit > 0 && len(records) > limit {
		records = records[:limit]
	}

	return records, nil
}
