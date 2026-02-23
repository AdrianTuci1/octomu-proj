import { IResultItem } from '../../../domain/types';

export const EXTENSIONS_RESULTS: IResultItem[] = [
    {
        id: 'ext-google',
        label: 'Search Google',
        subtitle: 'Caută direct pe Google fără să deschizi browserul',
        mention: '@google',
        category: 'Search',
        type: 'ai_extension',
        icon: 'Search',
        accessory: 'Search'
    },
    {
        id: 'ext-brew',
        label: 'Brew',
        subtitle: 'Administrează pachetele Homebrew (install/update) din terminal',
        mention: '@brew',
        category: 'Developer',
        type: 'ai_extension',
        icon: 'Package',
        accessory: 'App'
    },
    {
        id: 'ext-spotify',
        label: 'Spotify Control',
        subtitle: 'Control media (play/next/search) direct din Octomus',
        mention: '@spotify',
        category: 'Music',
        type: 'ai_extension',
        icon: 'Music',
        accessory: 'App'
    },
];
