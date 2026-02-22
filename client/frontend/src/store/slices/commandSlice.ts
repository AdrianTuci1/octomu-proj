import { StateCreator } from 'zustand';
import { AppState, CommandSlice } from '../storeTypes';
import { DEFAULT_RESULTS } from './resultsData';
import { ToolExecutionHandler } from './commands/ToolExecutionHandler';
import { ChatCommandHandler } from './commands/ChatCommandHandler';

export const createCommandSlice: StateCreator<AppState, [], [], CommandSlice> = (set, get) => ({
    results: DEFAULT_RESULTS,
    extensions: [
        {
            id: 'ext-llm',
            label: 'Octomus LLM',
            handle: 'ai',
            description: 'Powerful general purpose AI',
            icon: 'Sparkles',
            type: 'ai_tool'
        },
        {
            id: 'ext-img',
            label: 'Image Generation',
            handle: 'image',
            description: 'Generate stunning visuals',
            icon: 'Image',
            type: 'ai_tool'
        },
        {
            id: 'ext-photo',
            label: 'Photo Analysis',
            handle: 'photo',
            description: 'Analyze and describe images',
            icon: 'Camera',
            type: 'ai_tool'
        },
        {
            id: 'ext-slack',
            label: 'Slack',
            handle: 'slack',
            description: 'Search workspace messages',
            icon: 'Hash',
            type: 'app_connector'
        }
    ] as any,
    allowedTools: [],
    pendingCommand: null,
    sessionArtifacts: [],

    setPendingCommand: (command) => set({ pendingCommand: command }),

    allowTool: (name) => set(state => ({
        allowedTools: [...state.allowedTools, name]
    })),

    executeCommand: async () => {
        await ToolExecutionHandler.execute(set, get);
    },

    rejectCommand: () => set({ pendingCommand: null }),

    handleResultSelection: (item) => {
        if (item.id === 'mcp-marketplace') {
            set({ currentView: 'authorizations', query: '', typingQuery: '', suggestion: '', selectedIndex: 0 });
            const { fetchRegistry } = get() as any;
            if (fetchRegistry) fetchRegistry();
            return;
        }

        if (item.command) {
            set({ pendingCommand: { id: Date.now().toString(), command: item.command }, query: '', typingQuery: '', suggestion: '' });
        } else if (item.type === 'ai_extension' && item.mention) {
            set({ isChatMode: true, currentView: 'main', query: item.mention + ' ', typingQuery: item.mention + ' ' });
        }
    },

    handleChatSubmit: async () => {
        await ChatCommandHandler.handleSubmit(set, get);
    }
});
