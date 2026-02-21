# Octomus Cloud MVP

This directory contains the Minimum Viable Product (MVP) server for Octomus Cloud, built in Go using the `gin` HTTP framework.

## Purpose

Octomus Cloud acts as the central mediator and intelligent proxy for the Octomus Desktop client. Its primary responsibilities include:

1. **OAuth Mediation:** It safely initiates and handles OAuth `code` exchanges with third-party providers (like Slack, Google Drive, Jira) so that the local desktop client doesn't need to manage OAuth secrets directly.
2. **MCP Routing:** It proxies requests from the local client to external "Model Context Protocol" (MCP) servers provided by the connected SaaS tools.
3. **LLM Orchestration:** It takes user queries from the desktop client, enriches them with data fetched from MCPs, and sends them to the primary LLM (Google Gemini).

## API Endpoints (v1)

### Apps Catalog
- `GET /v1/apps` - Returns the list of available MCP-compatible SaaS tools and horizontal integrations.

### Auth & Connection
- `GET /v1/auth/start/:provider` - Returns the OAuth authorization URL for a specific provider (e.g., `slack`, `gdrive`).
- `GET /v1/auth/callback/:provider` - The redirect target for OAuth providers to return the short-lived `code`.

### Execution
- `POST /v1/chat` - The primary endpoint where the client sends user messages. Expects `{"query": "string", "context": ["@slack"]}`

## Running the Server

Make sure you have Go installed (1.20+ recommended).

```bash
cd mvp
go run main.go
```

The server will start on `http://localhost:8080`.
