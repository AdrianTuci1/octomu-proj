import { create } from 'zustand';
import { AppState } from './storeTypes';
import { createUISlice } from './slices/uiSlice';
import { createChatSlice } from './slices/chatSlice';
import { createCommandSlice } from './slices/commandSlice';
import { createExtensionSlice } from './slices/extensionSlice';

export const useStore = create<AppState>()((...a) => ({
    ...createUISlice(...a),
    ...createChatSlice(...a),
    ...createCommandSlice(...a),
    ...createExtensionSlice(...a),
}));
