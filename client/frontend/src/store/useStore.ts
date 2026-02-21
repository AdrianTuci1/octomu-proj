import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppState } from './storeTypes';
import { createUISlice } from './slices/uiSlice';
import { createChatSlice } from './slices/chatSlice';
import { createCommandSlice } from './slices/commandSlice';
import { createExtensionSlice } from './slices/extensionSlice';

export const useStore = create<AppState>()(
    persist(
        (...a) => ({
            ...createUISlice(...a),
            ...createChatSlice(...a),
            ...createCommandSlice(...a),
            ...createExtensionSlice(...a),
        }),
        {
            name: 'octomus-storage',
            version: 3, // Bumped to clear stale tools cache
            storage: createJSONStorage(() => localStorage),
            partialize: (state: AppState) => ({
                registry: state.registry || [],
                tools: state.tools || {},
                allowedTools: state.allowedTools || [],
                chatSessions: state.chatSessions || [],
                conversation: state.conversation || []
            }),
        }
    )
);
