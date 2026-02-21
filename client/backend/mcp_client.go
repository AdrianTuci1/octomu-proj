package backend

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"os/exec"
	"sync"
	"sync/atomic"
)

// JSONRPCRequest represents a JSON-RPC 2.0 request
type JSONRPCRequest struct {
	JSONRPC string `json:"jsonrpc"`
	Method  string `json:"method"`
	Params  any    `json:"params,omitempty"`
	ID      int64  `json:"id"`
}

// JSONRPCNotification represents a JSON-RPC 2.0 notification
type JSONRPCNotification struct {
	JSONRPC string `json:"jsonrpc"`
	Method  string `json:"method"`
	Params  any    `json:"params,omitempty"`
}

// JSONRPCResponse represents a JSON-RPC 2.0 response
type JSONRPCResponse struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      int64           `json:"id"`
	Result  json.RawMessage `json:"result,omitempty"`
	Error   *JSONRPCError   `json:"error,omitempty"`
}

// JSONRPCError represents a JSON-RPC 2.0 error
type JSONRPCError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Data    any    `json:"data,omitempty"`
}

// MCPClient manages a persistent JSON-RPC session with an MCP server via Stdio
type MCPClient struct {
	cmd    *exec.Cmd
	stdin  io.WriteCloser
	stdout *bufio.Scanner
	seq    int64
	mu     sync.Mutex // serializes SendRequest calls
}

// NewMCPClient spawns the MCP server process and sets up pipes
func NewMCPClient(cmdName string, args []string, env []string) (*MCPClient, error) {
	cmd := exec.Command(cmdName, args...)
	cmd.Env = append(cmd.Environ(), env...)

	stdin, err := cmd.StdinPipe()
	if err != nil {
		return nil, err
	}

	stdoutPipe, err := cmd.StdoutPipe()
	if err != nil {
		return nil, err
	}

	stderrPipe, err := cmd.StderrPipe()
	if err != nil {
		return nil, err
	}

	if err := cmd.Start(); err != nil {
		return nil, err
	}

	// 10 MB buffer — Exa and other MCPs can return large JSON payloads
	const maxScannerBuf = 10 * 1024 * 1024

	// Read stderr in a separate goroutine
	go func() {
		scanner := bufio.NewScanner(stderrPipe)
		scanner.Buffer(make([]byte, maxScannerBuf), maxScannerBuf)
		for scanner.Scan() {
			fmt.Printf("[MCP-STDERR] %s\n", scanner.Text())
		}
	}()

	stdoutScanner := bufio.NewScanner(stdoutPipe)
	stdoutScanner.Buffer(make([]byte, maxScannerBuf), maxScannerBuf)

	return &MCPClient{
		cmd:    cmd,
		stdin:  stdin,
		stdout: stdoutScanner,
		seq:    0,
	}, nil
}

// Close terminates the MCP server process
func (c *MCPClient) Close() error {
	c.stdin.Close()
	return c.cmd.Process.Kill()
}

// SendRequest sends a JSON-RPC request and waits for a response with the matching ID.
// It is serialized via a mutex to prevent concurrent callers from racing on the stdout scanner.
func (c *MCPClient) SendRequest(method string, params any) (*JSONRPCResponse, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	id := atomic.AddInt64(&c.seq, 1)
	req := JSONRPCRequest{
		JSONRPC: "2.0",
		Method:  method,
		Params:  params,
		ID:      id,
	}

	bytes, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}

	fmt.Printf("[MCP] RAW SEND: %s\n", string(bytes))
	if _, err := fmt.Fprintf(c.stdin, "%s\n", string(bytes)); err != nil {
		return nil, err
	}

	for c.stdout.Scan() {
		line := c.stdout.Bytes()
		fmt.Printf("[MCP] RAW RECV: %s\n", string(line))

		var resp JSONRPCResponse
		if err := json.Unmarshal(line, &resp); err != nil {
			// Skip lines that aren't valid JSON-RPC (e.g., debug logs from the server)
			continue
		}

		if resp.ID == id {
			return &resp, nil
		}
	}

	if err := c.stdout.Err(); err != nil {
		return nil, err
	}

	return nil, fmt.Errorf("stream closed before response")
}

// SendNotification sends a JSON-RPC notification (no response expected)
func (c *MCPClient) SendNotification(method string, params any) error {
	req := JSONRPCNotification{
		JSONRPC: "2.0",
		Method:  method,
		Params:  params,
	}

	bytes, err := json.Marshal(req)
	if err != nil {
		return err
	}

	fmt.Printf("[MCP] RAW NOTIFY: %s\n", string(bytes))
	_, err = fmt.Fprintf(c.stdin, "%s\n", string(bytes))
	return err
}
