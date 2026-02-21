export type MessageType = 'user' | 'ai' | 'system';
export type ViewType = 'main' | 'snippets' | 'history' | 'authorizations' | 'chatHistory' | 'mcpDetail';

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
    type: 'cloud' | 'local_binary' | 'npm_package';
    public_url?: string;
    download_url?: string;
    image_url?: string;
    install_cmd?: string;
    binary_path?: string;
    status: 'connected' | 'disconnected' | 'installing';
    auth_type?: 'none' | 'api_key' | 'oauth';
    auth_config?: {
        placeholder?: string;
        help_text?: string;
        env_var_name?: string;
    };
    apiKey?: string;
}

export interface IMCPTool {
    name: string;
    description: string;
    inputSchema?: any;   // Standard MCP format from tools/list
    parameters?: any;    // Legacy / cloud mock format
}
