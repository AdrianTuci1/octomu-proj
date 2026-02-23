import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppState } from './storeTypes';
import { createUISlice } from '../features/ui/state/UIState';
import { createChatSlice } from '../features/chat/state/ChatState';
import { createCommandSlice } from '../features/command/state/CommandState';
import { createExtensionSlice } from '../features/marketplace/state/ExtensionState';
import { createSettingsSlice } from '../features/settings/state/SettingsState';
import { createResultsSlice } from '../features/results/state/ResultsState';
import { AppCore } from '../features/core/domain/AppCore';
import { NavigationManager } from '../features/ui/domain/NavigationManager';
import { ChatManager } from '../features/chat/domain/ChatManager';
import { ExtensionManager } from '../features/marketplace/domain/ExtensionManager';
import { ResultsManager } from '../features/results/domain/ResultsManager';
import { CommandManager } from '../features/command/domain/CommandManager';
import { SettingsManager } from '../features/settings/domain/SettingsManager';
import { ChatInfrastructure } from '../features/chat/infrastructure/ChatInfrastructure';
import { ExtensionInfrastructure } from '../features/marketplace/infrastructure/ExtensionInfrastructure';
import { ResultsInfrastructure } from '../features/results/infrastructure/ResultsInfrastructure';
import { CommandInfrastructure } from '../features/command/infrastructure/CommandInfrastructure';
import { WindowService } from '../features/ui/infrastructure/WindowService';

export const useStore = create<AppState>()(
    persist(
        (set, get, store) => {
            // 1. Initialize Infrastructures
            const chatInfra = new ChatInfrastructure();
            const extInfra = new ExtensionInfrastructure();
            const resInfra = new ResultsInfrastructure();
            const cmdInfra = new CommandInfrastructure();
            const windowService = new WindowService();

            // 2. Initialize Managers with root store access
            const managers = {
                navigation: new NavigationManager({ getState: get, setState: set } as any, windowService),
                chat: new ChatManager(chatInfra, { getState: get, setState: set } as any),
                marketplace: new ExtensionManager(extInfra, { getState: get, setState: set } as any),
                results: new ResultsManager(resInfra, { getState: get, setState: set } as any),
                command: new CommandManager({ getState: get, setState: set } as any, cmdInfra),
                settings: new SettingsManager({ getState: get, setState: set } as any)
            };

            const core = new AppCore(
                managers.navigation,
                managers.chat,
                managers.marketplace,
                managers.results,
                managers.command,
                managers.settings
            );

            // 3. Combine Slices into namespaced structure
            return {
                ui: createUISlice(set, get, store),
                chat: createChatSlice(set, get, store),
                results: createResultsSlice(set, get, store),
                marketplace: createExtensionSlice(set, get, store),
                settings: createSettingsSlice(set, get, store),
                command: createCommandSlice(set, get, store),
                core
            };
        },
        {
            name: 'octomus-storage',
            version: 5, // Bumped for namespaced architecture
            storage: createJSONStorage(() => localStorage),
            partialize: (state: AppState) => ({
                marketplace: {
                    registry: state.marketplace.registry,
                    tools: state.marketplace.tools,
                },
                chat: {
                    chatSessions: state.chat.chatSessions,
                    conversation: state.chat.conversation
                },
                settings: state.settings
            }),
        }
    )
);
