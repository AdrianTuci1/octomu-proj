package core

import (
    "bufio"
    "encoding/json"
    "fmt"
    "io"
    "os/exec"
    "sync/atomic"
)

type JSONRPCRequest struct {
    JSONRPC string `json:"jsonrpc"`
    Method  string `json:"method"`
    Params  any    `json:"params,omitempty"`
    ID      int64  `json:"id"`
}

type JSONRPCNotification struct {
    JSONRPC string `json:"jsonrpc"`
    Method  string `json:"method"`
    Params  any    `json:"params,omitempty"`
}

type JSONRPCResponse struct {
    JSONRPC string          `json:"jsonrpc"`
    ID      int64           `json:"id"`
    Result  json.RawMessage `json:"result,omitempty"`
    Error   *JSONRPCError   `json:"error,omitempty"`
}

type JSONRPCError struct {
    Code    int    `json:"code"`
    Message string `json:"message"`
    Data    any    `json:"data,omitempty"`
}

type MCPClient struct {
    cmd     *exec.Cmd
    stdin   io.WriteCloser
    stdout  *bufio.Scanner
    seq     int64
}

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
    
    if err := cmd.Start(); err != nil {
        return nil, err
    }
    
    return &MCPClient{
        cmd:    cmd,
        stdin:  stdin,
        stdout: bufio.NewScanner(stdoutPipe),
        seq:    0,
    }, nil
}

func (c *MCPClient) Close() error {
    c.stdin.Close()
    return c.cmd.Process.Kill()
}

func (c *MCPClient) SendRequest(method string, params any) (*JSONRPCResponse, error) {
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
    
    if _, err := fmt.Fprintf(c.stdin, "%s\n", string(bytes)); err != nil {
        return nil, err
    }
    
    // Read loop until we find the response with matching ID
    // Simplification: We blindly read the next line assuming it's the response
    // In real implementation, we need to handle async notifications and out-of-order responses
    for c.stdout.Scan() {
        line := c.stdout.Bytes()
        var resp JSONRPCResponse
        if err := json.Unmarshal(line, &resp); err != nil {
            // Might be a log line or invalid JSON, skip
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
    
    _, err = fmt.Fprintf(c.stdin, "%s\n", string(bytes))
    return err
}
