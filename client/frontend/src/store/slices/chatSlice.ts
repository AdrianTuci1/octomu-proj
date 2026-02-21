import { StateCreator } from 'zustand';
import { AppState, ChatSlice } from '../storeTypes';

export const createChatSlice: StateCreator<AppState, [], [], ChatSlice> = (set, get) => ({
    conversation: [],
    chatSessions: [],

    addMessage: (message) => set((state) => ({
        conversation: [...state.conversation, message]
    })),

    selectChat: (id) => set({
        currentView: 'main',
        isChatMode: true
    }),

    resetChat: () => set({
        conversation: [],
        results: [] // Also clear results from commandSlice if needed
    })
});
