package tunnel

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"time"

	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

// TunnelClient handles the connection to Octomus Cloud
type TunnelClient struct {
	CloudURL string
	Token    string
	Handler  http.Handler
	conn     *websocket.Conn
	sendCh   chan TunnelMessage
}

// TunnelMessage represents the structure of messages exchanged over the tunnel
type TunnelMessage struct {
	ID      string            `json:"id"`
	Type    string            `json:"type"` // "request", "response", "ping", "pong", "function_call"
	Method  string            `json:"method,omitempty"`
	URL     string            `json:"url,omitempty"`
	Headers map[string]string `json:"headers,omitempty"`
	Body    json.RawMessage   `json:"body,omitempty"`
	Status  int               `json:"status,omitempty"`
	Error   string            `json:"error,omitempty"`
}

func NewTunnelClient(cloudURL, token string, handler http.Handler) *TunnelClient {
	return &TunnelClient{
		CloudURL: cloudURL,
		Token:    token,
		Handler:  handler,
		sendCh:   make(chan TunnelMessage, 100), // Buffer for outgoing messages
	}
}

// Start establishes the WebSocket connection and starts the read/write loops
func (c *TunnelClient) Start(ctx context.Context) error {
	u, err := url.Parse(c.CloudURL)
	if err != nil {
		return fmt.Errorf("invalid cloud URL: %w", err)
	}

	// Add auth token to query params if present
	if c.Token != "" {
		q := u.Query()
		q.Set("token", c.Token)
		u.RawQuery = q.Encode()
	}

	log.Printf("Connecting to Octomus Cloud at %s...", u.String())

	// Add a timeout for dialing
	ctxDial, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	conn, _, err := websocket.Dial(ctxDial, u.String(), nil)
	if err != nil {
		return fmt.Errorf("failed to dial: %w", err)
	}
	c.conn = conn

	log.Println("Connected to Octomus Cloud Tunnel")

	// Start loops
	go c.readLoop(ctx)
	go c.writeLoop(ctx)

	return nil
}

func (c *TunnelClient) readLoop(ctx context.Context) {
	defer c.conn.Close(websocket.StatusInternalError, "local server shutting down")

	for {
		var msg TunnelMessage
		err := wsjson.Read(ctx, c.conn, &msg)
		if err != nil {
			log.Printf("Tunnel read error: %v", err)
			return
		}

		if msg.Type == "request" {
			// Handle request in a goroutine to not block reading
			go c.handleRequest(ctx, msg)
		}
	}
}

func (c *TunnelClient) writeLoop(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		case msg := <-c.sendCh:
			// Write with a timeout context to prevent blocking forever on a stuck connection
			writeCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
			err := wsjson.Write(writeCtx, c.conn, msg)
			cancel()
			if err != nil {
				log.Printf("Tunnel write error for msg %s: %v", msg.ID, err)
				// Consider closing connection here or handling reconnection logic
			}
		}
	}
}

func (c *TunnelClient) handleRequest(ctx context.Context, msg TunnelMessage) {
	// Reconstruct HTTP Request
	targetURL := "http://localhost" + msg.URL 
	req, err := http.NewRequest(msg.Method, targetURL, bytes.NewReader(msg.Body))
	if err != nil {
		c.sendError(msg.ID, 500, "Failed to create request")
		return
	}

	// Set Headers
	for k, v := range msg.Headers {
		req.Header.Set(k, v)
	}

	// Capture Response
	rw := &responseWriter{
		header: http.Header{},
		status: 200, 
	}

	c.Handler.ServeHTTP(rw, req)

	// Send Response back via Tunnel
	respMsg := TunnelMessage{
		ID:      msg.ID,
		Type:    "response",
		Status:  rw.status,
		Headers: make(map[string]string),
		Body:    rw.bodyBytes(),
	}

	for k, v := range rw.header {
		if len(v) > 0 {
			respMsg.Headers[k] = v[0] 
		}
	}

	c.sendCh <- respMsg
}

func (c *TunnelClient) sendError(id string, status int, errorMsg string) {
	msg := TunnelMessage{
		ID:     id,
		Type:   "response",
		Status: status,
		Error:  errorMsg,
	}
	c.sendCh <- msg
}

// responseWriter captures the response from the http.Handler
type responseWriter struct {
	header http.Header
	body   *bytes.Buffer
	status int
}

func (rw *responseWriter) Header() http.Header {
	return rw.header
}

func (rw *responseWriter) Write(b []byte) (int, error) {
	if rw.body == nil {
		rw.body = new(bytes.Buffer)
	}
	return rw.body.Write(b)
}

func (rw *responseWriter) WriteHeader(statusCode int) {
	rw.status = statusCode
}

func (rw *responseWriter) bodyBytes() []byte {
	if rw.body == nil {
		return nil
	}
	return rw.body.Bytes()
}
