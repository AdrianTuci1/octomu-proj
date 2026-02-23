import { StateCreator } from 'zustand';
import { IMCPRegistryItem, IMCPTool } from '../../../domain/types';
import { AppState } from '../../../store/storeTypes';

export interface ExtensionState {
    registry: IMCPRegistryItem[];
    tools: Record<string, IMCPTool[]>;
    fetchingTools: Record<string, boolean>;
    toolErrors: Record<string, string | null>;
    installProgress: Record<string, number>;
}

export const createExtensionSlice: StateCreator<AppState, [], [], ExtensionState> = (set, get) => ({
    registry: [],
    tools: {},
    fetchingTools: {},
    toolErrors: {},
    installProgress: {},
});
