export type MessageType = 'user' | 'ai' | 'system';
export type ViewType = 'main' | 'snippets' | 'history' | 'authorizations' | 'chatHistory';

export interface IMessage {
    id: string;
    content: string;
    type: MessageType;
    timestamp: string;
    mentionedExtension?: string;
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
    description?: string;
}

export interface IMCPRegistryItem {
    id: string;
    label: string;
    description: string;
    icon: string;
    type: 'cloud' | 'local_binary' | 'npm_package';
    public_url?: string;
    image_url?: string;
    install_cmd?: string;
    binary_path?: string;
    status: 'connected' | 'disconnected' | 'installing';
}

export interface IMCPTool {
    name: string;
    description: string;
    parameters: any;
}
