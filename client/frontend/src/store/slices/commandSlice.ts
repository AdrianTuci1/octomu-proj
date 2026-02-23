import { StateCreator } from 'zustand';
import { AppState, CommandSlice } from '../storeTypes';
import { IResultItem } from '../../domain/types';
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
        },
        {
            id: 'ext-google',
            label: 'Google Search',
            handle: 'google',
            description: 'Search the web instantly',
            icon: 'Search',
            type: 'ai_tool'
        },
        {
            id: 'ext-brew',
            label: 'Brew',
            handle: 'brew',
            description: 'Manage Homebrew packages',
            icon: 'Package',
            type: 'ai_tool'
        },
        {
            id: 'ext-translate',
            label: 'Translate',
            handle: 'translate',
            description: 'Translate text with Google Translate or DeepL',
            icon: 'Languages',
            type: 'ai_tool'
        },
        {
            id: 'ext-spotify',
            label: 'Spotify Control',
            handle: 'spotify',
            description: 'Control music playback',
            icon: 'Music',
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
            if (item.command.startsWith('system:')) {
                const sysCmd = item.command.split(':')[1];
                (window as any).go.main.App.ExecuteSystemCommand(sysCmd)
                    .then((res: string) => console.log('System command executed:', res))
                    .catch((err: any) => console.error('System command failed:', err));
                set({ query: '', typingQuery: '', suggestion: '' });
                return;
            }
            if (item.command === 'ui:settings') {
                set({ currentView: 'settings', query: '', typingQuery: '', suggestion: '' });
                return;
            }
            if (item.command === 'ui:confetti') {
                // Trigger confetti (could be a state change or direct DOM call)
                console.log('Confetti triggered!');
                set({ query: '', typingQuery: '', suggestion: '' });
                return;
            }
            if (item.command === 'ui:qr_code') {
                set({ currentView: 'main', query: '', typingQuery: '', suggestion: '', isChatMode: false });
                // QR code generation — dispatch event for QR modal handler
                window.dispatchEvent(new CustomEvent('octomus:qr_code'));
                return;
            }
            if (item.command === 'ui:manage_models') {
                set({ currentView: 'settings', query: '', typingQuery: '', suggestion: '' });
                return;
            }
            set({ pendingCommand: { id: Date.now().toString(), command: item.command }, query: '', typingQuery: '', suggestion: '' });
        } else if (item.type === 'application' && item.path) {
            // Launch the application using 'open' command
            // @ts-ignore
            window.go.main.App.ExecuteSystemCommand(`open "${item.path}"`)
                .catch((err: any) => console.error('Failed to open app:', err));
            set({ query: '', typingQuery: '', suggestion: '' });
        } else if (item.type === 'ai_extension' && item.mention) {
            const { addMention } = get() as any;
            set({ isChatMode: true, currentView: 'main' });
            if (addMention) {
                const ext = (get() as any).extensions.find((ex: any) => ex.handle === item.mention?.slice(1));
                if (ext) addMention(ext);
            }
        }
    },

    handleChatSubmit: async () => {
        await ChatCommandHandler.handleSubmit(set, get);
    },

    discoverApps: async () => {
        try {
            // @ts-ignore
            const raw = await window.go.main.App.GetInstalledApps();
            if (raw) {
                const apps: IResultItem[] = JSON.parse(raw);
                set(state => {
                    const existingIds = new Set(state.results.map(r => r.id));
                    const newApps = apps.filter(a => !existingIds.has(a.id));
                    return {
                        results: [...state.results, ...newApps]
                    };
                });
            }
        } catch (err) {
            console.error('Failed to discover apps:', err);
        }
    }
});
