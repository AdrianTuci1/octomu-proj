import { AppState } from '../../../store/storeTypes';
import { ICommandInfrastructure } from '../infrastructure/CommandInfrastructure';

export interface ICommandStore {
    getState: () => AppState;
    setState: (state: Partial<AppState> | ((state: AppState) => Partial<AppState>)) => void;
}

export class CommandManager {
    constructor(
        private store: ICommandStore,
        private infrastructure: ICommandInfrastructure
    ) { }

    async handleChatSubmit() {
        const state = this.store.getState();
        const query = state.ui?.query ?? '';
        const activeMentions = state.ui?.activeMentions ?? [];
        const chat = state.core?.chat;
        const navigation = state.core?.navigation;

        if (!query.trim() && activeMentions.length === 0) return;

        // 1. Add user message
        const fullContent = activeMentions.length > 0
            ? `${activeMentions.map(m => `@${m.handle}`).join(' ')} ${query}`
            : query;

        chat.addMessage({
            id: Date.now().toString(),
            type: 'user',
            content: fullContent,
            timestamp: new Date().toLocaleTimeString()
        });

        // 2. Clear query and mentions
        navigation.setQuery('');
        navigation.clearMentions();

        // 3. Process with AI
        console.log('[CommandManager] Processing submission:', fullContent);

        setTimeout(() => {
            chat.addMessage({
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: `I've received your request: "${fullContent}". How can I help further?`,
                timestamp: new Date().toLocaleTimeString()
            });
        }, 1000);
    }

    async executeCommand() {
        const state = this.store.getState();
        const pendingCommand = state.command?.pendingCommand;
        const chat = state.core?.chat;

        if (!pendingCommand || !chat) return;

        chat.addMessage({
            id: Date.now().toString(),
            type: 'system',
            content: `Executing ${pendingCommand.command}...`,
            timestamp: new Date().toLocaleTimeString()
        });

        try {
            const result = await this.infrastructure.executeSystemCommand(pendingCommand.command, []);

            chat.addMessage({
                id: (Date.now() + 1).toString(),
                type: 'tool',
                content: result || 'Command executed successfully.',
                timestamp: new Date().toLocaleTimeString()
            });
        } catch (error: any) {
            chat.addMessage({
                id: (Date.now() + 1).toString(),
                type: 'system',
                content: `Error: ${error.message || 'Execution failed'}`,
                timestamp: new Date().toLocaleTimeString()
            });
        } finally {
            this.store.setState(s => ({
                command: { ...s.command, pendingCommand: null }
            }));
        }
    }
}
