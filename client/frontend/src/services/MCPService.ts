import { ApiService } from './ApiService';
import { IMCPRegistryItem } from '../domain/types';
import * as App from '../../bindings/client/app';


export interface IMCPToolsResponse {
    mcp_id: string;
    tools: any[];
}

export interface IAuthStartResponse {
    provider: string;
    auth_url: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// MCPService
//
// Provides a unified interface for both local binary MCPs and remote HTTP MCPs.
//
// Local binary  → ListTools / ExecuteBinary call Wails Go bindings (stdio JSON-RPC)
// Remote HTTP   → ListToolsRemote / ExecuteRemoteTool call Wails Go bindings (HTTP JSON-RPC)
//
// The Wails bindings handle all transport details. The frontend only needs to
// dispatch based on the `type` field of the registry item.
// ─────────────────────────────────────────────────────────────────────────────
export class MCPService extends ApiService {

    // ── Cloud REST (proxied via our backend MVP server) ──────────────────────

    static async fetchRegistry(): Promise<{ registry: IMCPRegistryItem[] }> {
        return this.get<{ registry: IMCPRegistryItem[] }>('/v1/mcp/directory');
    }

    static async fetchTools(id: string): Promise<IMCPToolsResponse> {
        return this.get<IMCPToolsResponse>(`/v1/mcp/inspect/${id}`);
    }

    static async installMCP(id: string): Promise<{ message: string; status: string }> {
        return this.post<{ message: string; status: string }>(`/v1/mcp/install/${id}`, {});
    }

    // ── OAuth (cloud initiates, deep link returns token to Wails) ───────────

    /**
     * Step 1: Ask cloud for the OAuth authorization URL.
     * The cloud builds the URL using its own Client ID (secret stays server-side).
     */
    static async startOAuthFlow(mcpId: string): Promise<IAuthStartResponse> {
        return this.get<IAuthStartResponse>(`/v1/auth/start/${mcpId}`);
    }

    /**
     * Step 1.5 (Alternative for Client Credentials or manual exchange):
     * Exchange a code or credentials for an access token via the cloud.
     */
    static async exchangeToken(mcpId: string, payload: {
        grant_type: 'authorization_code' | 'client_credentials';
        code?: string;
        client_id?: string;
        client_secret?: string;
        scopes?: string[];
    }): Promise<{ access_token: string }> {
        return this.post<{ access_token: string }>(`/v1/oauth/exchange/${mcpId}`, payload);
    }

    /**
     * Securely exchange tokens locally in the Wails backend.
     * Use this for client_credentials to keep secrets off the cloud.
     */
    static async exchangeTokenSecurely(
        mcpId: string,
        tokenUrl: string,
        clientId: string,
        clientSecret: string,
        scopes: string[] = []
    ): Promise<string> {
        return App.ExchangeToken(mcpId, tokenUrl, clientId, clientSecret, scopes);
    }


    /**
     * Step 2: Open the system browser so the user can log in.
     * After login, the cloud redirects to octomus://oauth/callback?token=...
     * which is intercepted by the Wails URL scheme handler.
     */
    static async openOAuthBrowser(authUrl: string): Promise<void> {
        return App.OpenOAuthBrowser(authUrl);
    }

    // ── Keychain (macOS Keychain via security CLI) ───────────────────────────

    /** Save a credential (token, API key) to macOS Keychain */
    static async saveCredential(key: string, value: string): Promise<void> {
        return App.SaveCredential(key, value);
    }

    /** Retrieve a credential from macOS Keychain. Returns '' if not found. */
    static async getCredential(key: string): Promise<string> {
        return App.GetCredential(key);
    }

    /** Check if a credential exists in Keychain */
    static async hasCredential(key: string): Promise<boolean> {
        return App.HasCredential(key);
    }

    /** Remove a credential from Keychain */
    static async deleteCredential(key: string): Promise<void> {
        return App.DeleteCredential(key);
    }

    // ── Local Binary MCP (stdio JSON-RPC) ───────────────────────────────────

    static async listLocalTools(mcpId: string, apiKey: string, envVarName: string): Promise<string> {
        return App.ListTools(mcpId, apiKey, envVarName);
    }

    static async executeLocalTool(
        mcpId: string,
        toolName: string,
        args: Record<string, unknown>,
        apiKey: string,
        envVarName: string,
    ): Promise<string> {
        return App.ExecuteBinary(mcpId, toolName, args, apiKey, envVarName);
    }

    static async checkBinary(mcpId: string): Promise<boolean> {
        return App.CheckBinary(mcpId);
    }

    static async downloadBinary(mcpId: string, url: string): Promise<string> {
        return App.DownloadBinary(mcpId, url);
    }

    // ── Remote HTTP MCP (HTTP JSON-RPC with Bearer token) ───────────────────

    /**
     * Fetch the tool schema from a remote HTTP MCP server.
     * Token is read from Keychain if empty string is passed.
     */
    static async listRemoteTools(mcpId: string, endpoint: string, token = ''): Promise<string> {
        return App.ListToolsRemote(mcpId, endpoint, token);
    }

    /**
     * Execute a tool on a remote HTTP MCP server.
     * Token is read from Keychain if empty string is passed.
     */
    static async executeRemoteTool(
        mcpId: string,
        endpoint: string,
        token: string,
        toolName: string,
        args: Record<string, unknown>,
    ): Promise<string> {
        return App.ExecuteRemoteTool(mcpId, endpoint, token, toolName, args);
    }

    // ── Unified dispatch helpers ─────────────────────────────────────────────

    /**
     * Unified listTools — dispatches based on the MCP registry item type.
     * For remote MCPs, the token is read from Keychain automatically if not provided.
     */
    static async listTools(item: IMCPRegistryItem, token = ''): Promise<string> {
        if (item.type === 'remote_http') {
            if (!item.endpoint) throw new Error(`Remote MCP '${item.id}' has no endpoint configured`);
            return MCPService.listRemoteTools(item.id, item.endpoint, token);
        }
        // local_binary
        return MCPService.listLocalTools(item.id, item.apiKey ?? '', item.auth_config?.env_var_name ?? '');
    }

    /**
     * Unified executeTool — dispatches based on the MCP registry item type.
     */
    static async executeTool(
        item: IMCPRegistryItem,
        toolName: string,
        args: Record<string, unknown>,
        token = '',
    ): Promise<string> {
        if (item.type === 'remote_http') {
            if (!item.endpoint) throw new Error(`Remote MCP '${item.id}' has no endpoint configured`);
            return MCPService.executeRemoteTool(item.id, item.endpoint, token, toolName, args);
        }
        return MCPService.executeLocalTool(
            item.id, toolName, args,
            item.apiKey ?? '',
            item.auth_config?.env_var_name ?? '',
        );
    }
}

