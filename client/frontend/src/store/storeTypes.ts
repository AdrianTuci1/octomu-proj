import { ViewType, IMessage, IChatSession, IPendingCommand, IResultItem, IMCPRegistryItem, IMCPTool } from '../domain/types';

export interface IExtension {
    id: string;
    label: string;
    handle: string; // e.g. "finder"
    description: string;
    icon: string;
    type: 'ai_tool' | 'app_connector';
}

export interface UISlice {
    query: string;
    typingQuery: string;
    suggestion: string;
    selectedIndex: number;
    currentView: ViewType;
    isChatMode: boolean;
    showMentions: boolean;
    activeMentions: IExtension[]; // Added: currently active context chips
    setQuery: (query: string) => void;
    setCurrentView: (view: ViewType) => void;
    setIsChatMode: (isChatMode: boolean) => void;
    addMention: (extension: IExtension) => void;
    removeMention: (id: string) => void;
    goBack: () => void;
    toggleChat: () => void;
    moveSelectionUp: () => void;
    moveSelectionDown: () => void;
}

export interface ChatSlice {
    conversation: IMessage[];
    chatSessions: IChatSession[];
    addMessage: (message: IMessage) => void;
    selectChat: (id: string) => void;
}

export interface CommandSlice {
    results: IResultItem[];
    extensions: IExtension[];
    pendingCommand: IPendingCommand | null;
    setPendingCommand: (command: IPendingCommand | null) => void;
    executeCommand: () => void;
    rejectCommand: () => void;
    handleChatSubmit: () => void;
}

export interface ExtensionSlice {
    registry: IMCPRegistryItem[];
    tools: Record<string, IMCPTool[]>;
    fetchRegistry: () => Promise<void>;
    fetchTools: (id: string) => Promise<void>;
    connectExtension: (id: string) => Promise<void>;
}

export type AppState = UISlice & ChatSlice & CommandSlice & ExtensionSlice;
