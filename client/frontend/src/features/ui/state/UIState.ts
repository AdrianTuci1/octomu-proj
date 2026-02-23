import { StateCreator } from 'zustand';
import { ViewType } from '../../../domain/types';
import { IExtension, AppState } from '../../../store/storeTypes';

export interface UIState {
    query: string;
    typingQuery: string;
    suggestion: string;
    selectedIndex: number;
    currentView: ViewType;
    isChatMode: boolean;
    showMentions: boolean;
    activeMentions: IExtension[];
    toolRecommendations: string[];
    selectedIntegrationId: string | null;
}

export const createUISlice: StateCreator<AppState, [], [], UIState> = (set, get) => ({
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
});
