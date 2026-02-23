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
    toolRecommendations: string[]; // Added: context-specific recommendations (e.g. for @google)
    selectedIntegrationId: string | null;
    setQuery: (query: string) => void;
    setCurrentView: (view: ViewType) => void;
    setIsChatMode: (isChatMode: boolean) => void;
    addMention: (extension: IExtension) => void;
    removeMention: (id: string) => void;
    setSelectedIntegrationId: (id: string | null) => void;
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
    resetChat: () => void;
}

export interface CommandSlice {
    results: IResultItem[];
    extensions: IExtension[];
    allowedTools: string[];
    pendingCommand: IPendingCommand | null;
    sessionArtifacts: any[]; // Technical schemas 'pinned' to the session
    setPendingCommand: (command: IPendingCommand | null) => void;
    executeCommand: () => void;
    allowTool: (name: string) => void;
    rejectCommand: () => void;
    handleChatSubmit: () => Promise<void>;
    handleResultSelection: (item: IResultItem) => void;
    discoverApps: () => Promise<void>;
}

export interface ExtensionSlice {
    registry: IMCPRegistryItem[];
    tools: Record<string, IMCPTool[]>;
    fetchingTools: Record<string, boolean>; // Added: id -> true if currently fetching
    toolFetchErrors: Record<string, string | null>; // Added: id -> error message if failed
    installProgress: Record<string, number>; // Added: id -> percentage
    fetchRegistry: () => Promise<void>;
    fetchTools: (id: string) => Promise<void>;
    connectExtension: (id: string, apiKey?: string) => Promise<void>;
    disconnectExtension: (id: string) => Promise<void>;
    toggleExtension: (id: string) => Promise<void>;
}


export interface SettingsSlice {
    appearance: 'light' | 'dark' | 'system';
    windowMode: 'default' | 'compact';
    hotkey: string;
    launchAtLogin: boolean;
    textSize: 'small' | 'large';
    activeSettingsTab: 'general' | 'extensions' | 'ai' | 'advanced';

    setAppearance: (appearance: 'light' | 'dark' | 'system') => void;
    setWindowMode: (windowMode: 'default' | 'compact') => void;
    setHotkey: (hotkey: string) => void;
    setLaunchAtLogin: (launchAtLogin: boolean) => void;
    setTextSize: (textSize: 'small' | 'large') => void;
    setActiveSettingsTab: (tab: 'general' | 'extensions' | 'ai' | 'advanced') => void;
}

export type AppState = UISlice & ChatSlice & CommandSlice & ExtensionSlice & SettingsSlice;
