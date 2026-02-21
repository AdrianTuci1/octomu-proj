import { IResultItem } from '../../domain/types';

export const DEFAULT_RESULTS: IResultItem[] = [
    {
        id: 'walkthrough-1',
        label: 'Start supercharging your productivity',
        subtitle: '27% completed',
        category: 'Welcome to Octomus',
        type: 'walkthrough',
        progress: 27,
        accessory: 'Walkthrough'
    },
    // Suggestions
    {
        id: 'clip-1',
        label: 'Clipboard History',
        subtitle: 'Octomus',
        category: 'Suggestions',
        type: 'application',
        accessory: 'Command'
    },
    {
        id: 'finder-1',
        label: 'Ask Finder',
        mention: '@finder',
        category: 'Suggestions',
        type: 'ai_extension',
        accessory: 'AI Extension'
    },
    // Connect Your Apps
    {
        id: 'slack-conn',
        label: 'Slack',
        subtitle: 'Connect to search messages',
        category: 'Connect Your Apps',
        type: 'snippet',
        icon: 'Hash',
        accessory: 'App'
    },
    {
        id: 'gdrive-conn',
        label: 'Google Drive',
        subtitle: 'Connect to search files',
        category: 'Connect Your Apps',
        type: 'snippet',
        icon: 'FileText',
        accessory: 'App'
    },
    // Commands
    {
        id: 'browser-1',
        label: 'Ask Browser',
        mention: '@browser',
        category: 'Commands',
        type: 'ai_extension',
        accessory: 'AI Extension'
    },
    // Marketplace
    {
        id: 'mcp-marketplace',
        label: 'MCP Marketplace',
        subtitle: 'Browse and authorize MCPs',
        category: 'Integrations',
        type: 'snippet',
        icon: 'Layout',
        accessory: 'Directory'
    }
];
