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
        const { results } = state.results;
        const { isChatMode } = state.ui;

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
        const { activeMentions } = state.ui;

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
        const { activeMentions } = state.ui;
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
        const { currentView } = this.store.getState().ui;
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
        const { isChatMode } = this.store.getState().ui;
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
        const { selectedIndex, showMentions, currentView } = state.ui;

        if (showMentions || currentView === 'authorizations') {
            this.setUIState({ selectedIndex: Math.max(0, selectedIndex - 1) });
            return;
        }

        const newIndex = Math.max(0, selectedIndex - 1);
        this.setUIState({ selectedIndex: newIndex });
    }

    moveSelectionDown() {
        const state = this.store.getState();
        const { selectedIndex, typingQuery, showMentions, currentView } = state.ui;
        const { results } = state.results;
        const { chatSessions } = state.chat;
        const { extensions } = state.command;
        const { registry } = state.marketplace;

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

        const filteredResults = typingQuery.trim() === ''
            ? results
            : results.filter((r: any) =>
                r.label.toLowerCase().includes(typingQuery.toLowerCase()) ||
                r.category.toLowerCase().includes(typingQuery.toLowerCase())
            );

        let totalItems = filteredResults.length;
        if (typingQuery.trim() === '') {
            totalItems += chatSessions.length;
        }

        const newIndex = Math.min(totalItems - 1, selectedIndex + 1);
        if (newIndex >= 0) {
            this.setUIState({ selectedIndex: newIndex });
        }
    }
}
