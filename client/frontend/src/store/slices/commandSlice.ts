import { StateCreator } from 'zustand';
import { AppState, CommandSlice } from '../storeTypes';
import { ChatService } from '../../services/ChatService';
import { TerminalService } from '../../services/TerminalService';

export const createCommandSlice: StateCreator<AppState, [], [], CommandSlice> = (set, get) => ({
    results: [
        {
            id: 'walkthrough-1',
            label: 'Start supercharging your productivity',
            subtitle: '27% completed',
            category: 'Welcome to Octomus',
            type: 'walkthrough',
            progress: 27,
            accessory: 'Walkthrough'
        },
        // Suggestions
        {
            id: 'clip-1',
            label: 'Clipboard History',
            subtitle: 'Octomus',
            category: 'Suggestions',
            type: 'application',
            accessory: 'Command'
        },
        {
            id: 'finder-1',
            label: 'Ask Finder',
            mention: '@finder',
            category: 'Suggestions',
            type: 'ai_extension',
            accessory: 'AI Extension'
        },
        // Connect Your Apps
        {
            id: 'slack-conn',
            label: 'Slack',
            subtitle: 'Connect to search messages',
            category: 'Connect Your Apps',
            type: 'snippet',
            icon: 'Hash',
            accessory: 'App'
        },
        {
            id: 'gdrive-conn',
            label: 'Google Drive',
            subtitle: 'Connect to search files',
            category: 'Connect Your Apps',
            type: 'snippet',
            icon: 'FileText',
            accessory: 'App'
        },
        // Commands
        {
            id: 'browser-1',
            label: 'Ask Browser',
            mention: '@browser',
            category: 'Commands',
            type: 'ai_extension',
            accessory: 'AI Extension'
        }
    ],
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
    pendingCommand: null,

    setPendingCommand: (command) => set({ pendingCommand: command }),

    executeCommand: () => {
        const { pendingCommand } = get();
        if (!pendingCommand) return;

        const msg = TerminalService.createExecutionResultMessage(pendingCommand.command);

        set((state) => ({
            conversation: [...state.conversation, msg],
            pendingCommand: null,
            currentView: 'main'
        }));
    },

    rejectCommand: () => set({ pendingCommand: null }),

    handleChatSubmit: () => {
        const { query, typingQuery, isChatMode, selectedIndex, results, chatSessions, currentView, showMentions, extensions, addMention } = get();

        if (showMentions && selectedIndex >= 0) {
            const lastWord = typingQuery.split(' ').pop() || '';
            const filter = lastWord.startsWith('@') ? lastWord.slice(1).toLowerCase() : '';
            const filteredExts = extensions.filter(ex =>
                ex.label.toLowerCase().includes(filter) ||
                ex.handle.toLowerCase().includes(filter)
            );
            const selected = filteredExts[selectedIndex];
            if (selected) {
                addMention(selected);
                return;
            }
        }

        if (!isChatMode && currentView === 'chatHistory') {
            const filteredResults = results.filter(r =>
                r.label.toLowerCase().includes(typingQuery.toLowerCase()) ||
                r.category.toLowerCase().includes(typingQuery.toLowerCase())
            );

            if (typingQuery.trim() !== '') {
                const selected = filteredResults[selectedIndex];
                if (selected) {
                    if (selected.command) {
                        set({
                            pendingCommand: { id: Date.now().toString(), command: selected.command },
                            query: '',
                            typingQuery: '',
                            suggestion: ''
                        });
                    } else if (selected.type === 'ai_extension' && selected.mention) {
                        set({
                            isChatMode: true,
                            currentView: 'main',
                            query: selected.mention + ' ',
                            typingQuery: selected.mention + ' '
                        });
                    }
                    return;
                }
            } else if (selectedIndex >= filteredResults.length) {
                const historyIdx = selectedIndex - filteredResults.length;
                const selected = chatSessions[historyIdx];
                if (selected) {
                    set({ currentView: 'main', isChatMode: true });
                    return;
                }
            }
        }

        if (!query.trim()) return;

        const cmd = TerminalService.parseCommand(query);
        if (cmd) {
            set({ pendingCommand: cmd, query: '', typingQuery: '', currentView: 'main' });
            return;
        }

        if (isChatMode) {
            const userMsg = ChatService.createUserMessage(query);
            set((state) => ({
                conversation: [...state.conversation, userMsg],
                query: '',
                typingQuery: '',
                currentView: 'main'
            }));

            ChatService.createAiResponse(query).then(aiMsg => {
                set((state) => ({ conversation: [...state.conversation, aiMsg] }));
            });
        }
    }
});
