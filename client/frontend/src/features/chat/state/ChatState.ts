import { StateCreator } from 'zustand';
import { IMessage, IChatSession } from '../../../domain/types';
import { AppState } from '../../../store/storeTypes';

export interface ChatState {
    conversation: IMessage[];
    chatSessions: IChatSession[];
}

export const createChatSlice: StateCreator<AppState, [], [], ChatState> = (set, get) => ({
    conversation: [],
    chatSessions: [],
});
