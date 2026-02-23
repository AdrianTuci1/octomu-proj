import { IResultItem } from '../../../domain/types';
import { AppState } from '../../../store/storeTypes';
import { IResultsInfrastructure } from '../infrastructure/ResultsInfrastructure';

export interface IResultsStore {
    getState(): AppState;
    setState(state: Partial<AppState> | ((state: AppState) => Partial<AppState>)): void;
}

export class ResultsManager {
    constructor(
        private infrastructure: IResultsInfrastructure,
        private store: IResultsStore
    ) { }

    private setResultsState(changes: Partial<AppState['results']>) {
        this.store.setState(state => ({
            results: { ...state.results, ...changes }
        }));
    }

    private setUIState(changes: Partial<AppState['ui']>) {
        this.store.setState(state => ({
            ui: { ...state.ui, ...changes }
        }));
    }

    async discoverApps() {
        try {
            const apps = await this.infrastructure.getInstalledApps();
            const { results } = this.store.getState().results;
            const existingIds = new Set(results.map(r => r.id));
            const newApps = apps.filter(a => !existingIds.has(a.id));

            if (newApps.length > 0) {
                this.setResultsState({ results: [...results, ...newApps] });
            }
        } catch (err) {
            console.error('[ResultsManager] App discovery failed:', err);
        }
    }

    async handleResultSelection(item: IResultItem) {
        if (item.id === 'mcp-marketplace') {
            this.navigateToMarketplace();
            return;
        }

        if (item.command) {
            await this.handleCommandSelection(item.command);
        } else if (item.type === 'application' && item.path) {
            await this.infrastructure.launchApp(item.path);
            this.clearInput();
        } else if (item.type === 'ai_extension' && item.mention) {
            this.handleMentionSelection(item.mention);
        }
    }

    private navigateToMarketplace() {
        this.setUIState({
            currentView: 'authorizations',
            typingQuery: '',
            selectedIndex: 0
        });
    }

    private async handleCommandSelection(command: string) {
        if (command.startsWith('system:')) {
            const sysCmd = command.split(':')[1];
            await this.infrastructure.executeSystemCommand(sysCmd);
            this.clearInput();
            return;
        }

        const uiCommandMap: Record<string, () => void> = {
            'ui:settings': () => this.setUIState({ currentView: 'settings' }),
            'ui:confetti': () => console.log('Confetti!'),
            'ui:qr_code': () => {
                this.setUIState({
                    currentView: 'main',
                    isChatMode: false
                });
                window.dispatchEvent(new CustomEvent('octomus:qr_code'));
            },
            'ui:manage_models': () => this.setUIState({ currentView: 'settings' }),
        };

        if (uiCommandMap[command]) {
            uiCommandMap[command]();
            this.clearInput();
        } else {
            this.store.setState(state => ({
                command: {
                    ...state.command,
                    pendingCommand: { id: Date.now().toString(), command }
                }
            }));
            this.clearInput();
        }
    }

    private handleMentionSelection(mention: string) {
        this.setUIState({
            isChatMode: true,
            currentView: 'main'
        });
        const { extensions } = this.store.getState().command;
        const ext = extensions.find((ex: any) => ex.handle === mention.slice(1));
        if (ext) {
            const { activeMentions } = this.store.getState().ui;
            this.setUIState({ activeMentions: [...activeMentions, ext] });
        }
    }

    private clearInput() {
        this.setUIState({ typingQuery: '' });
    }
}
