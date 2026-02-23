import { StateCreator } from 'zustand';
import { IExtension, AppState } from '../../../store/storeTypes';
import { IPendingCommand } from '../../../domain/types';

export interface CommandState {
    allowedTools: string[];
    pendingCommand: IPendingCommand | null;
    sessionArtifacts: any[];
    extensions: IExtension[];
    setPendingCommand: (pendingCommand: IPendingCommand | null) => void;
    allowTool: (name: string) => void;
    rejectCommand: () => void;
}

export const createCommandSlice: StateCreator<AppState, [], [], CommandState> = (set, get) => ({
    allowedTools: [],
    pendingCommand: null,
    sessionArtifacts: [],
    extensions: [
        {
            id: 'ext-llm',
            label: 'Octomus LLM',
            handle: 'ai',
            subtitle: 'Powerful general purpose AI',
            icon: 'Sparkles',
            type: 'ai_tool'
        },
        {
            id: 'ext-img',
            label: 'Image Generation',
            handle: 'image',
            subtitle: 'Generate stunning visuals',
            icon: 'Image',
            type: 'ai_tool'
        },
        {
            id: 'ext-photo',
            label: 'Photo Analysis',
            handle: 'photo',
            subtitle: 'Analyze and describe images',
            icon: 'Camera',
            type: 'ai_tool'
        },
        {
            id: 'ext-slack',
            label: 'Slack',
            handle: 'slack',
            subtitle: 'Search workspace messages',
            icon: 'Hash',
            type: 'app_connector'
        },
        {
            id: 'ext-google',
            label: 'Google Search',
            handle: 'google',
            subtitle: 'Search the web instantly',
            icon: 'Search',
            type: 'ai_tool'
        },
        {
            id: 'ext-brew',
            label: 'Brew',
            handle: 'brew',
            subtitle: 'Manage Homebrew packages',
            icon: 'Package',
            type: 'ai_tool'
        },
        {
            id: 'ext-translate',
            label: 'Translate',
            handle: 'translate',
            subtitle: 'Translate text with Google Translate or DeepL',
            icon: 'Languages',
            type: 'ai_tool'
        },
        {
            id: 'ext-spotify',
            label: 'Spotify Control',
            handle: 'spotify',
            subtitle: 'Control music playback',
            icon: 'Music',
            type: 'app_connector'
        }
    ] as any,

    setPendingCommand: (pendingCommand) => set(s => ({
        command: { ...s.command, pendingCommand }
    })),
    allowTool: (name) => set(s => ({
        command: { ...s.command, allowedTools: [...s.command.allowedTools, name] }
    })),
    rejectCommand: () => set(s => ({
        command: { ...s.command, pendingCommand: null }
    })),
});
