import { StateCreator } from 'zustand';
import { IResultItem } from '../../../domain/types';
import { AppState } from '../../../store/storeTypes';
import { DEFAULT_RESULTS } from '../domain/resultsData';

export interface ResultsState {
    results: IResultItem[];
    selectedIndex: number;
    typingQuery: string;
}

export const createResultsSlice: StateCreator<AppState, [], [], ResultsState> = (set, get) => ({
    results: DEFAULT_RESULTS,
    selectedIndex: 0,
    typingQuery: '',
});
