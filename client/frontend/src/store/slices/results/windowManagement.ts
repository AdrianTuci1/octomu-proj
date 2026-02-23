import { IResultItem } from '../../../domain/types';

export const WINDOW_MANAGEMENT_RESULTS: IResultItem[] = [
    {
        id: 'win-max',
        label: 'Maximize',
        subtitle: 'Extinde fereastra curentă pe tot ecranul',
        category: 'Window Management',
        type: 'command',
        command: 'system:maximize',
        icon: 'Maximize2',
        accessory: 'System'
    },
    {
        id: 'win-almost-max',
        label: 'Almost Maximize',
        subtitle: 'Mărește fereastra, dar lasă un pic de spațiu pe margini',
        category: 'Window Management',
        type: 'command',
        command: 'system:almost_maximize',
        icon: 'Maximize',
        accessory: 'System'
    },
    {
        id: 'win-half-left',
        label: 'Left Half',
        subtitle: 'Împarte ecranul — fereastra pe stânga',
        category: 'Window Management',
        type: 'command',
        command: 'system:left_half',
        icon: 'PanelLeft',
        accessory: 'System'
    },
    {
        id: 'win-half-right',
        label: 'Right Half',
        subtitle: 'Împarte ecranul — fereastra pe dreapta',
        category: 'Window Management',
        type: 'command',
        command: 'system:right_half',
        icon: 'PanelRight',
        accessory: 'System'
    },
    {
        id: 'win-reasonable',
        label: 'Reasonable Size',
        subtitle: 'Aduce fereastra la o dimensiune centrală, optimă pentru citit',
        category: 'Window Management',
        type: 'command',
        command: 'system:reasonable_size',
        icon: 'AlignCenter',
        accessory: 'System'
    },
];
