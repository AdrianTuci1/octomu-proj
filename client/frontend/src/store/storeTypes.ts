import { ViewType, IMessage, IChatSession, IPendingCommand, IResultItem, IMCPRegistryItem, IMCPTool } from '../domain/types';
import { UIState } from '../features/ui/state/UIState';
import { ResultsState } from '../features/results/state/ResultsState';
import { ExtensionState } from '../features/marketplace/state/ExtensionState';
import { ChatState } from '../features/chat/state/ChatState';
import { CommandState } from '../features/command/state/CommandState';
import { SettingsState } from '../features/settings/state/SettingsState';
import { AppCore } from '../features/core/domain/AppCore';

export interface IExtension {
    id: string;
    label: string;
    handle: string;
    subtitle: string;
    icon: string;
    type: 'ai_tool' | 'app_connector';
}

export type { IMessage, IChatSession, IPendingCommand, IResultItem, IMCPRegistryItem, IMCPTool };

export interface AppState {
    ui: UIState;
    chat: ChatState;
    results: ResultsState;
    marketplace: ExtensionState;
    settings: SettingsState;
    command: CommandState;
    core: AppCore;
}
