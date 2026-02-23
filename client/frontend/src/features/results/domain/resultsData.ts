import { IResultItem } from '../../../domain/types';
import { WINDOW_MANAGEMENT_RESULTS } from '../../../store/slices/results/windowManagement';
import { SYSTEM_ACTIONS_RESULTS } from '../../../store/slices/results/systemActions';
import { AI_COMMANDS_RESULTS } from '../../../store/slices/results/aiCommands';
import { UTILITIES_RESULTS } from '../../../store/slices/results/utilities';
import { EXTENSIONS_RESULTS } from '../../../store/slices/results/extensions';
import { OCTOMUS_SETTINGS_RESULTS } from '../../../store/slices/results/octomusSettings';

const WELCOME_RESULTS: IResultItem[] = [
    {
        id: 'welcome-walkthrough',
        label: 'Welcome to Octomus',
        subtitle: 'Take a quick tour of Octomus features',
        category: 'Tutorial',
        type: 'walkthrough',
        icon: 'Sparkles',
        progress: 0
    },
    {
        id: 'mcp-marketplace',
        label: 'Explore Marketplace',
        subtitle: 'Browse and install new MCP integrations',
        category: 'Marketplace',
        type: 'command',
        icon: 'LayoutGrid'
    }
];

export const DEFAULT_RESULTS: IResultItem[] = [
    ...WELCOME_RESULTS,
    ...EXTENSIONS_RESULTS,
    ...AI_COMMANDS_RESULTS,
    ...UTILITIES_RESULTS,
    ...WINDOW_MANAGEMENT_RESULTS,
    ...SYSTEM_ACTIONS_RESULTS,
    ...OCTOMUS_SETTINGS_RESULTS,
];
