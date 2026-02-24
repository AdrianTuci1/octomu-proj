import { ViewType } from '../../../domain/types';
import { IExtension, AppState } from '../../../store/storeTypes';
import { WindowService } from '../infrastructure/WindowService';

export interface INavigationStore {
    getState(): AppState;
    setState(state: Partial<AppState> | ((state: AppState) => Partial<AppState>)): void;
}

const PANEL_VIEWS: ViewType[] = ['settings', 'onboarding'];

export class NavigationManager {
    constructor(
        private store: INavigationStore,
        private windowService: WindowService
    ) { }

    private setUIState(changes: Partial<AppState['ui']>) {
        this.store.setState(state => ({
            ui: { ...state.ui, ...changes }
        }));
    }

    setCurrentView(view: ViewType) {
        this.setUIState({ currentView: view });
        this.windowService.applyLayout(
            PANEL_VIEWS.includes(view) ? 'panel' : 'compact'
        );
    }

    setSelectedIntegrationId(id: string | null) {
        this.setUIState({ selectedIntegrationId: id });
    }

    setQuery(query: string) {
        const state = this.store.getState();
        const results = state.results?.results ?? [];
        const isChatMode = state.ui?.isChatMode ?? false;

        let suggestion = '';
        let showMentions = false;

        if (isChatMode && query.includes('@')) {
            const lastWord = query.split(' ').pop() || '';
            if (lastWord.startsWith('@')) {
                showMentions = true;
            }
        }

        if (query.trim() !== '' && !isChatMode) {
            const match = results.find((r: any) =>
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

        this.setUIState({
            query,
            typingQuery: query,
            suggestion,
            selectedIndex: 0,
            showMentions
        });
    }

    addMention(extension: IExtension) {
        const state = this.store.getState();
        const activeMentions = state.ui?.activeMentions ?? [];

        if (!activeMentions.find((m: any) => m.id === extension.id)) {
            let recommendations: string[] = [];
            if (extension.handle === 'google') {
                recommendations = ['Open in New Tab', 'Open in New Window'];
            }

            this.setUIState({
                activeMentions: [...activeMentions, extension],
                toolRecommendations: recommendations,
                query: '',
                typingQuery: '',
                showMentions: false,
                selectedIndex: 0
            });
        }
    }

    removeMention(id: string) {
        const state = this.store.getState();
        const activeMentions = state.ui?.activeMentions ?? [];
        this.setUIState({
            activeMentions: activeMentions.filter((m: any) => m.id !== id),
            toolRecommendations: []
        });
    }

    clearMentions() {
        this.setUIState({
            activeMentions: [],
            toolRecommendations: []
        });
    }

    goBack() {
        const currentView = this.store.getState().ui?.currentView;
        if (PANEL_VIEWS.includes(currentView)) {
            // Return from panel views to main search
            this.switchToSearch();
        } else if (currentView === 'mcpDetail') {
            this.setCurrentView('authorizations');
        } else if (currentView !== 'chatHistory') {
            this.switchToSearch();
        }
    }

    toggleChat() {
        const isChatMode = this.store.getState().ui?.isChatMode;
        if (isChatMode) {
            this.switchToSearch();
        } else {
            this.switchToChat();
        }
    }

    private switchToSearch() {
        this.setUIState({
            isChatMode: false,
            currentView: 'chatHistory',
            selectedIndex: 0,
            query: '',
            typingQuery: '',
            suggestion: '',
            showMentions: false,
            activeMentions: []
        });
        this.windowService.applyLayout('compact');
    }

    private switchToChat() {
        this.setUIState({
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
        this.windowService.applyLayout('compact');
    }

    moveSelectionUp() {
        const state = this.store.getState();
        const { selectedIndex, showMentions, currentView } = state.ui ?? {};

        if (showMentions || currentView === 'authorizations') {
            this.setUIState({ selectedIndex: Math.max(0, (selectedIndex ?? 0) - 1) });
            return;
        }

        const newIndex = Math.max(0, (selectedIndex ?? 0) - 1);
        this.setUIState({ selectedIndex: newIndex });
    }

    moveSelectionDown() {
        const state = this.store.getState();
        const { selectedIndex, typingQuery, showMentions, currentView } = state.ui ?? {};
        const results = state.results?.results ?? [];
        const chatSessions = state.chat?.chatSessions ?? [];
        const extensions = state.command?.extensions ?? [];
        const registry = state.marketplace?.registry ?? [];

        if (showMentions) {
            const lastWord = typingQuery.split(' ').pop() || '';
            const filter = lastWord.startsWith('@') ? lastWord.slice(1).toLowerCase() : '';
            const filteredExts = extensions.filter((ex: any) =>
                ex.label.toLowerCase().includes(filter) ||
                ex.handle.toLowerCase().includes(filter)
            );
            this.setUIState({ selectedIndex: Math.min(filteredExts.length - 1, selectedIndex + 1) });
            return;
        }

        if (currentView === 'authorizations') {
            this.setUIState({ selectedIndex: Math.min(registry.length - 1, selectedIndex + 1) });
            return;
        }

        const filteredResults = this.getFilteredResultsForHistory(results, typingQuery);

        let totalItems = filteredResults.length;
        if (typingQuery.trim() === '') {
            totalItems += chatSessions.length;
        }

        const newIndex = Math.min(totalItems - 1, selectedIndex + 1);
        if (newIndex >= 0) {
            this.setUIState({ selectedIndex: newIndex });
        }
    }

    handleEnterSelection() {
        const state = this.store.getState();
        const { selectedIndex, typingQuery, currentView, showMentions } = state.ui ?? {};
        const results = state.results?.results ?? [];
        const chatSessions = state.chat?.chatSessions ?? [];
        const extensions = state.command?.extensions ?? [];
        const registry = state.marketplace?.registry ?? [];
        const resultsManager = state.core?.results;
        const chatManager = state.core?.chat;

        // Handle mentions overlay selection
        if (showMentions) {
            const lastWord = typingQuery.split(' ').pop() || '';
            const filter = lastWord.startsWith('@') ? lastWord.slice(1).toLowerCase() : '';
            const filteredExts = extensions.filter((ex: any) =>
                ex.label.toLowerCase().includes(filter) ||
                ex.handle.toLowerCase().includes(filter)
            );
            if (filteredExts[selectedIndex]) {
                this.addMention(filteredExts[selectedIndex]);
            }
            return;
        }

        // Handle marketplace view
        if (currentView === 'authorizations') {
            if (registry[selectedIndex]) {
                this.setSelectedIntegrationId(registry[selectedIndex].id);
                this.setCurrentView('mcpDetail');
            }
            return;
        }

        // Handle history view (when typing)
        if (currentView === 'history' || typingQuery.trim() !== '') {
            const filteredResults = this.getFilteredResultsForHistory(results, typingQuery);

            // Check if we're selecting a result item
            if (selectedIndex < filteredResults.length && filteredResults[selectedIndex]) {
                resultsManager.handleResultSelection(filteredResults[selectedIndex]);
                return;
            }

            // Check if we're selecting a chat session (only when not typing)
            if (typingQuery.trim() === '') {
                const sessionIndex = selectedIndex - filteredResults.length;
                if (sessionIndex >= 0 && sessionIndex < chatSessions.length) {
                    chatManager.selectChat(chatSessions[sessionIndex].id);
                }
            }
            return;
        }

        // Handle chatHistory view (ResultsGroups - when not typing)
        const selectableItems = this.getSelectableItemsForResultsGroups(results);

        // Check if we're selecting a result item
        if (selectedIndex < selectableItems.length && selectableItems[selectedIndex]) {
            resultsManager.handleResultSelection(selectableItems[selectedIndex]);
            return;
        }

        // Check if we're selecting a chat session
        const sessionIndex = selectedIndex - selectableItems.length;
        if (sessionIndex >= 0 && sessionIndex < chatSessions.length) {
            chatManager.selectChat(chatSessions[sessionIndex].id);
        }
    }

    private getFilteredResultsForHistory(results: any[], typingQuery: string) {
        // Filter out welcome walkthrough from history view
        const baseResults = results.filter((r: any) => r.id !== 'welcome-walkthrough');

        if (typingQuery.trim() === '') {
            return baseResults;
        }

        return baseResults.filter((r: any) =>
            r.label.toLowerCase().includes(typingQuery.toLowerCase()) ||
            r.category.toLowerCase().includes(typingQuery.toLowerCase())
        );
    }

    private getSelectableItemsForResultsGroups(results: any[]) {
        // Match the order in ResultsGroups: suggestions, integrations, commands, apps
        // Excluding welcome-walkthrough
        const suggestionIds = ['ext-google', 'ai-improve', 'util-calculator', 'util-snippets', 'mcp-marketplace'];

        const suggestions = suggestionIds
            .map(id => results.find((r: any) => r.id === id))
            .filter((r): r is any => !!r);

        const integrations = results.filter((item: any) =>
            item.type === 'ai_extension' &&
            !suggestionIds.includes(item.id) &&
            item.id !== 'welcome-walkthrough'
        );

        const apps = results.filter((item: any) => item.category === 'Apps');

        const commands = results.filter((item: any) =>
            !suggestionIds.includes(item.id) &&
            item.type !== 'ai_extension' &&
            item.category !== 'Apps' &&
            item.id !== 'welcome-walkthrough'
        );

        return [...suggestions, ...integrations, ...commands, ...apps];
    }
}
