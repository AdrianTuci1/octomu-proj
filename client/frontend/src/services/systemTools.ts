/**
 * System Tools for the Sync & Execute Protocol
 * These abstract technical MCP details into two high-level routes.
 */

export const ROUTER_TOOLS = [
    {
        name: "mcp_sync",
        description: "Searches all connected extensions for tools that match your intent (e.g., 'list servers', 'send message'). Returns matched tool names and summaries. Discovered technical schemas are automatically 'pinned' to your session memory (Artifacts).",
        inputSchema: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "What functionality are you looking for?"
                }
            },
            required: ["query"]
        }
    },
    {
        name: "mcp_execute",
        description: "Executes a technical tool once its schema has been sync'd/discovered. You MUST call mcp_sync first if you don't know the exact parameters.",
        inputSchema: {
            type: "object",
            properties: {
                mcpId: { type: "string", description: "The extension ID" },
                toolName: { type: "string", description: "The tool name to run" },
                arguments: { type: "object", description: "The arguments for the tool" }
            },
            required: ["mcpId", "toolName", "arguments"]
        }
    }
];
