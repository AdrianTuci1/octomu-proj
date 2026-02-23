export type MessageType = 'user' | 'ai' | 'system';
export type ViewType = 'main' | 'snippets' | 'history' | 'authorizations' | 'chatHistory' | 'mcpDetail' | 'settings' | 'onboarding';

export interface IMessage {
    id: string;
    type: 'user' | 'ai' | 'system' | 'tool';
    content: string;
    timestamp: string;
}

export interface IChatSession {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: string;
}

export type ResultItemType = 'command' | 'application' | 'ai_extension' | 'walkthrough' | 'snippet';

export interface IResultItem {
    id: string;
    label: string;
    subtitle?: string;
    mention?: string; // e.g. "@finder"
    category: string; // e.g. "Suggestions", "Commands"
    type: ResultItemType;
    icon?: string; // Lucide icon name or emoji
    progress?: number; // 0-100 for walkthroughs
    command?: string;
    path?: string; // For applications
    iconBase64?: string; // Real app icons
    accessory?: string; // Right-aligned text like "Raycast" or "Command"
}

// Deprecated: migrate ISnippet to IResultItem
export interface ISnippet extends IResultItem { }

export interface IPendingCommand {
    id: string;
    command: string;
    args?: any;
    description?: string;
}

export interface IMCPRegistryItem {
    id: string;
    label: string;
    description: string;
    icon: string;
    type: 'cloud' | 'local_binary' | 'remote_http' | 'npm_package';

    // remote_http only: the JSON-RPC endpoint to call
    endpoint?: string;

    // local_binary only
    download_url?: string;
    install_cmd?: string;
    binary_path?: string;

    image_url?: string;
    status: 'connected' | 'disconnected' | 'installing';

    /** "none" | "api_key" | "oauth2" | "oauth" (legacy alias for oauth2) */
    auth_type?: 'none' | 'api_key' | 'oauth2' | 'oauth';

    auth_config?: {
        // Common
        placeholder?: string;
        help_text?: string;

        // API Key — local binary (env var)
        env_var_name?: string;

        // API Key — remote HTTP (header)
        header_name?: string;    // e.g. "Authorization"
        header_prefix?: string;  // e.g. "Bearer"

        // OAuth2 — all routes go through Octomus cloud
        authorization_url?: string; // cloud's /auth/start/:provider
        token_url?: string;         // cloud's /oauth/exchange/:provider
        /** "authorization_code" (browser login) | "client_credentials" (client_id + secret) */
        grant_type?: 'authorization_code' | 'client_credentials';
        scopes?: string[];
        redirect_uri?: string;      // "octomus://oauth/callback"
    };

    /** Runtime-only: API key entered by the user (not persisted in this object) */
    apiKey?: string;
    isEnabled?: boolean; // New: manual toggle to stop background process
}

/** Connection info passed to Wails remote MCP calls */
export interface IRemoteConnectInfo {
    mcpId: string;
    endpoint: string;
    token: string;
}

export interface IMCPTool {
    name: string;
    description: string;
    inputSchema?: any;   // Standard MCP format from tools/list
    parameters?: any;    // Legacy / cloud mock format
}
