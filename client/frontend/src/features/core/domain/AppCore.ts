import { NavigationManager } from '../../ui/domain/NavigationManager';
import { ChatManager } from '../../chat/domain/ChatManager';
import { ExtensionManager } from '../../marketplace/domain/ExtensionManager';
import { ResultsManager } from '../../results/domain/ResultsManager';
import { CommandManager } from '../../command/domain/CommandManager';
import { SettingsManager } from '../../settings/domain/SettingsManager';

export class AppCore {
    constructor(
        public readonly navigation: NavigationManager,
        public readonly chat: ChatManager,
        public readonly marketplace: ExtensionManager,
        public readonly results: ResultsManager,
        public readonly command: CommandManager,
        public readonly settings: SettingsManager
    ) { }
}
