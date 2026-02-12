# Maintained MCP Servers

This document lists the official and well-maintained Model Context Protocol (MCP) servers that are easy to install and integrate with Octomus Cloud.

## Managed Servers

These servers can be installed directly using `npx`. They are managed by the official MCP community or the respective vendors.

### 1. GitHub
Access live GitHub context, including issues, pull requests, and code files.
- **Install Command**: `npx -y @modelcontextprotocol/server-github`
- **Required Env Vars**:
  - `GITHUB_PERSONAL_ACCESS_TOKEN`: A GitHub PAT with repo scope.

### 2. Notion
Enhance your AI assistant with information from your Notion workspace.
- **Install Command**: `npx -y @modelcontextprotocol/server-notion`
- **Required Env Vars**:
  - `NOTION_API_KEY`: Your Notion Integration Token.

### 3. Trello
Manage boards, cards, and lists directly.
- **Install Command**: `npx -y @modelcontextprotocol/server-trello`
- **Required Env Vars**:
  - `TRELLO_API_KEY`: Your Trello developer key.
  - `TRELLO_TOKEN`: Your Trello member token.

### 4. ClickUp
Task management and productivity integration.
- **Install Command**: `npx -y @modelcontextprotocol/server-clickup`
- **Required Env Vars**:
  - `CLICKUP_API_TOKEN`: Your ClickUp personal API token.

---

## Installation via Octomus Cloud
You can also browse and install these servers through the [MCP Marketplace](http://localhost:5173/mcps) in the Octomus Cloud dashboard.
