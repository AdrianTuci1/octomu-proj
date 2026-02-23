import { StateCreator } from 'zustand';
import { AppState, UISlice } from '../storeTypes';

export const createUISlice: StateCreator<AppState, [], [], UISlice> = (set, get) => ({
    query: '',
    typingQuery: '',
    suggestion: '',
    selectedIndex: 0,
    currentView: 'chatHistory',
    isChatMode: false,
    showMentions: false,
    activeMentions: [],
    toolRecommendations: [],
    selectedIntegrationId: null,

    setQuery: (query) => {
        const { results, isChatMode } = get();
        let suggestion = '';
        let showMentions = false;

        if (isChatMode && query.includes('@')) {
            const lastWord = query.split(' ').pop() || '';
            if (lastWord.startsWith('@')) {
                showMentions = true;
            }
        }

        if (query.trim() !== '' && !isChatMode) {
            const match = results.find(r =>
                r.label.toLowerCase().startsWith(query.toLowerCase()) ||
                (r.command && r.command.toLowerCase().startsWith(query.toLowerCase()))
            );

            if (match) {
                const baseText = match.label.toLowerCase().startsWith(query.toLowerCase())
                    ? match.label
                    : match.command || '';
                suggestion = baseText.slice(query.length);
            }
        }

        set({
            query,
            typingQuery: query,
            suggestion,
            selectedIndex: showMentions ? 0 : 0,
            showMentions
        });
    },

    setCurrentView: (view) => set({ currentView: view }),
    setIsChatMode: (isChatMode) => set({ isChatMode }),

    addMention: (extension) => {
        const { activeMentions } = get();
        if (!activeMentions.find(m => m.id === extension.id)) {
            let recommendations: string[] = [];
            if (extension.handle === 'google') {
                recommendations = ['Open in New Tab', 'Open in New Window'];
            }

            set({
                activeMentions: [...activeMentions, extension],
                toolRecommendations: recommendations,
                query: '',
                typingQuery: '',
                showMentions: false,
                selectedIndex: 0
            });
        }
    },

    removeMention: (id) => {
        const { activeMentions } = get();
        set({
            activeMentions: activeMentions.filter(m => m.id !== id),
            toolRecommendations: []
        });
    },

    goBack: () => {
        const { currentView } = get();
        if (currentView === 'mcpDetail') {
            set({ currentView: 'authorizations' });
        } else if (currentView !== 'chatHistory') {
            set({
                currentView: 'chatHistory',
                isChatMode: false,
                selectedIndex: 0,
                query: '',
                typingQuery: '',
                suggestion: '',
                showMentions: false,
                activeMentions: []
            });
        }
    },

    toggleChat: () => {
        const { isChatMode } = get();
        if (isChatMode) {
            // Switching from Chat to Search
            set({
                isChatMode: false,
                currentView: 'chatHistory',
                selectedIndex: 0,
                query: '',
                typingQuery: '',
                suggestion: '',
                showMentions: false,
                activeMentions: []
            });
        } else {
            // Switching from Search to Chat
            set({
                isChatMode: true,
                currentView: 'main',
                selectedIndex: 0,
                query: '',
                typingQuery: '',
                suggestion: '',
                showMentions: false,
                activeMentions: [],
                toolRecommendations: []
            });
        }
    },


    moveSelectionUp: () => {
        const { selectedIndex, typingQuery, results, chatSessions, showMentions, extensions, currentView, registry } = get();

        if (showMentions) {
            set({ selectedIndex: Math.max(0, selectedIndex - 1) });
            return;
        }

        if (currentView === 'authorizations') {
            set({ selectedIndex: Math.max(0, selectedIndex - 1) });
            return;
        }

        const filteredResults = typingQuery.trim() === ''
            ? results
            : results.filter(r =>
                r.label.toLowerCase().includes(typingQuery.toLowerCase()) ||
                r.category.toLowerCase().includes(typingQuery.toLowerCase())
            );

        let totalItems = filteredResults.length;
        if (typingQuery.trim() === '') {
            totalItems += chatSessions.length;
        }

        const newIndex = Math.max(0, selectedIndex - 1);
        set({ selectedIndex: newIndex });
    },

    moveSelectionDown: () => {
        const { selectedIndex, typingQuery, results, chatSessions, showMentions, extensions, currentView, registry } = get();

        if (showMentions) {
            const lastWord = typingQuery.split(' ').pop() || '';
            const filter = lastWord.startsWith('@') ? lastWord.slice(1).toLowerCase() : '';
            const filteredExts = extensions.filter(ex =>
                ex.label.toLowerCase().includes(filter) ||
                ex.handle.toLowerCase().includes(filter)
            );
            set({ selectedIndex: Math.min(filteredExts.length - 1, selectedIndex + 1) });
            return;
        }

        if (currentView === 'authorizations') {
            set({ selectedIndex: Math.min(registry.length - 1, selectedIndex + 1) });
            return;
        }

        const filteredResults = typingQuery.trim() === ''
            ? results
            : results.filter(r =>
                r.label.toLowerCase().includes(typingQuery.toLowerCase()) ||
                r.category.toLowerCase().includes(typingQuery.toLowerCase())
            );

        let totalItems = filteredResults.length;
        if (typingQuery.trim() === '') {
            totalItems += chatSessions.length;
        }

        const newIndex = Math.min(totalItems - 1, selectedIndex + 1);
        if (newIndex >= 0) {
            set({ selectedIndex: newIndex });
        }
    },

    setSelectedIntegrationId: (id) => set({ selectedIntegrationId: id })
});
