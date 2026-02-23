import { IMessage, AppState } from '../../../store/storeTypes';
import { IChatInfrastructure } from '../infrastructure/ChatInfrastructure';

export interface IChatStore {
    getState(): AppState;
    setState(state: Partial<AppState> | ((state: AppState) => Partial<AppState>)): void;
}

export class ChatManager {
    constructor(
        private infrastructure: IChatInfrastructure,
        private store: IChatStore
    ) { }

    private setChatState(changes: Partial<AppState['chat']>) {
        this.store.setState(state => ({
            chat: { ...state.chat, ...changes }
        }));
    }

    addMessage(message: IMessage) {
        const { conversation } = this.store.getState().chat;
        this.setChatState({
            conversation: [...conversation, message]
        });
    }

    selectChat(id: string) {
        const { chatSessions } = this.store.getState().chat;
        const session = chatSessions.find(s => s.id === id);
        if (session) {
            console.log(`[ChatManager] Selecting chat: ${session.title}`);
        }
    }

    resetChat() {
        this.setChatState({
            conversation: []
        });
    }
}
