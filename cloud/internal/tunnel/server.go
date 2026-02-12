package tunnel

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/labstack/echo/v4"
	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

// Message types matching the local client
const (
	MsgTypeRequest  = "request"
	MsgTypeResponse = "response"
)

type TunnelMessage struct {
	ID      string            `json:"id"`
	Type    string            `json:"type"`
	Method  string            `json:"method,omitempty"`
	URL     string            `json:"url,omitempty"`
	Headers map[string]string `json:"headers,omitempty"`
	Body    []byte            `json:"body,omitempty"`
	Status  int               `json:"status,omitempty"`
	Error   string            `json:"error,omitempty"`
}

type Manager struct {
	// Map of ClientID/Token -> Connection
	conns map[string]*Connection
	mu    sync.RWMutex
}

type Connection struct {
	Conn     *websocket.Conn
	Pending  map[string]chan *TunnelMessage
	mu       sync.Mutex
	WriteGap sync.Mutex // Ensure single writer
}

func NewManager() *Manager {
	return &Manager{
		conns: make(map[string]*Connection),
	}
}

// HandleConnect upgrades the connection and registers the tunnel
func (m *Manager) HandleConnect(c echo.Context) error {
	// 1. Upgrade
	conn, err := websocket.Accept(c.Response(), c.Request(), &websocket.AcceptOptions{
		InsecureSkipVerify: true, // Allow all origins for now
	})
	if err != nil {
		return err
	}

	// 2. Identify Client
	// Ideally we get a token or we generate a session ID
	clientID := c.QueryParam("token")
	if clientID == "" {
		// Assign a temporary ephemeral ID if none provided (anonymous mode)
		clientID = fmt.Sprintf("anon-%d", time.Now().UnixNano())
	}

	clientConn := &Connection{
		Conn:    conn,
		Pending: make(map[string]chan *TunnelMessage),
	}

	// 3. Register
	m.mu.Lock()
	m.conns[clientID] = clientConn
	m.mu.Unlock()

	defer func() {
		m.mu.Lock()
		delete(m.conns, clientID)
		m.mu.Unlock()
		conn.Close(websocket.StatusInternalError, "connection closed")
	}()

	// 4. Send the assigned ClientID back to the user (so they know their URL)
	// We can do this via a custom welcome message or headers.
	// For now, let's log it.
	log.Printf("Client connected: %s", clientID)

	// 5. Read Loop
	for {
		var msg TunnelMessage
		err := wsjson.Read(c.Request().Context(), conn, &msg)
		if err != nil {
			log.Printf("Tunnel read error for %s: %v", clientID, err)
			return nil
		}

		if msg.Type == MsgTypeResponse {
			clientConn.mu.Lock()
			ch, ok := clientConn.Pending[msg.ID]
			if ok {
				ch <- &msg
				delete(clientConn.Pending, msg.ID)
			}
			clientConn.mu.Unlock()
		}
	}
}

// ProxyRequest sends an HTTP request through the tunnel and waits for response
func (m *Manager) ProxyRequest(ctx context.Context, clientID string, req *http.Request) (*TunnelMessage, error) {
	m.mu.RLock()
	conn, ok := m.conns[clientID]
	m.mu.RUnlock()

	if !ok {
		return nil, fmt.Errorf("tunnel not found: %s", clientID)
	}

	// Read body
	// ... (simplified for now, assuming small body)
	
	reqID := fmt.Sprintf("%d", time.Now().UnixNano())
	msg := TunnelMessage{
		ID:     reqID,
		Type:   MsgTypeRequest,
		Method: req.Method,
		URL:    req.URL.String(),
		// Body: ...
	}

	respCh := make(chan *TunnelMessage, 1)

	conn.mu.Lock()
	conn.Pending[reqID] = respCh
	conn.mu.Unlock()

	// Serialize writes
	conn.WriteGap.Lock()
	err := wsjson.Write(ctx, conn.Conn, msg)
	conn.WriteGap.Unlock()
	
	if err != nil {
		return nil, fmt.Errorf("failed to write to tunnel: %w", err)
	}

	select {
	case resp := <-respCh:
		return resp, nil
	case <-ctx.Done():
		return nil, ctx.Err()
	case <-time.After(30 * time.Second):
		return nil, fmt.Errorf("timeout waiting for tunnel response")
	}
}

// Handler returns the HTTP handler for requests destined to a tunnel
func (m *Manager) HandleProxy(c echo.Context) error {
	clientID := c.Param("clientID")
	
	resp, err := m.ProxyRequest(c.Request().Context(), clientID, c.Request())
	if err != nil {
		return c.JSON(http.StatusBadGateway, map[string]string{"error": err.Error()})
	}

	return c.JSON(resp.Status, json.RawMessage(resp.Body))
}
