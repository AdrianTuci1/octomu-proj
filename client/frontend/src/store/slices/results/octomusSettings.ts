import { IResultItem } from '../../../domain/types';

export const OCTOMUS_SETTINGS_RESULTS: IResultItem[] = [
    {
        id: 'ui-settings',
        label: 'Settings',
        subtitle: 'Gestionează setările generale, AI și extensiile Octomus',
        category: 'Utility',
        type: 'command',
        command: 'ui:settings',
        icon: 'Settings',
        accessory: 'Command'
    },
    {
        id: 'mcp-marketplace',
        label: 'Connect MCPs',
        subtitle: 'Explorează și conectează noi capabilități prin Model Context Protocol',
        category: 'Utility',
        type: 'command',
        command: 'mcp:marketplace',
        icon: 'PackagePlus',
        accessory: 'Marketplace'
    },
];
