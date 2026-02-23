import { IResultItem } from '../../../domain/types';

export const SYSTEM_ACTIONS_RESULTS: IResultItem[] = [
    {
        id: 'sys-trash',
        label: 'Empty Trash',
        subtitle: 'Golește coșul de gunoi instantaneu',
        category: 'System',
        type: 'command',
        command: 'system:empty_trash',
        icon: 'Trash2',
        accessory: 'System'
    },
    {
        id: 'sys-appearance',
        label: 'Toggle System Appearance',
        subtitle: 'Schimbă rapid între Light Mode și Dark Mode',
        category: 'System',
        type: 'command',
        command: 'system:toggle_appearance',
        icon: 'Moon',
        accessory: 'System'
    },
    {
        id: 'sys-sleep',
        label: 'Sleep',
        subtitle: 'Pune Mac-ul în modul sleep',
        category: 'System',
        type: 'command',
        command: 'system:sleep',
        icon: 'MoonStar',
        accessory: 'System'
    },
    {
        id: 'sys-restart',
        label: 'Restart',
        subtitle: 'Repornește Mac-ul',
        category: 'System',
        type: 'command',
        command: 'system:restart',
        icon: 'RefreshCw',
        accessory: 'System'
    },
    {
        id: 'sys-eject',
        label: 'Eject All Disks',
        subtitle: 'Ejectează toate discurile externe în siguranță',
        category: 'System',
        type: 'command',
        command: 'system:eject_all',
        icon: 'HardDrive',
        accessory: 'System'
    },
    {
        id: 'sys-force-quit',
        label: 'Force Quit',
        subtitle: 'Închide forțat aplicația din față',
        category: 'System',
        type: 'command',
        command: 'system:force_quit',
        icon: 'XCircle',
        accessory: 'System'
    },
    {
        id: 'sys-kill-process',
        label: 'Kill Process',
        subtitle: 'Închide forțat un proces blocat',
        category: 'System',
        type: 'command',
        command: 'system:kill_process',
        icon: 'Skull',
        accessory: 'System'
    },
    {
        id: 'sys-ask-kill',
        label: 'Ask Kill Process',
        subtitle: 'Alege ce proces vrei să închizi',
        category: 'System',
        type: 'command',
        command: 'system:ask_kill_process',
        icon: 'AlertOctagon',
        accessory: 'System'
    },
    {
        id: 'sys-replace-spotlight',
        label: 'Replace Spotlight with Octomus',
        subtitle: 'Setează Octomus ca înlocuitor pentru Spotlight',
        category: 'System',
        type: 'command',
        command: 'system:replace_spotlight',
        icon: 'Command',
        accessory: 'System'
    },
    {
        id: 'sys-emoji',
        label: 'Emoji Picker',
        subtitle: 'Cel mai rapid mod de a insera un emoji',
        category: 'System',
        type: 'command',
        command: 'system:emoji_picker',
        icon: 'Smile',
        accessory: 'System'
    },
    {
        id: 'sys-recent-files',
        label: 'Recent Files',
        subtitle: 'Listă cu ultimele fișiere deschise',
        category: 'System',
        type: 'command',
        command: 'system:recent_files',
        icon: 'Clock',
        accessory: 'System'
    },
    {
        id: 'sys-downloads',
        label: 'Downloads Folder',
        subtitle: 'Acces instant la ultimele fișiere descărcate',
        category: 'System',
        type: 'command',
        command: 'system:open_downloads',
        icon: 'Download',
        accessory: 'System'
    },
    {
        id: 'sys-search-menu',
        label: 'Search Menu Items',
        subtitle: 'Caută prin meniurile aplicației active',
        category: 'System',
        type: 'command',
        command: 'system:search_menu',
        icon: 'Menu',
        accessory: 'System'
    },
    {
        id: 'sys-focus-session',
        label: 'Start Focus Session',
        subtitle: 'Începe o sesiune de focus fără distrageri',
        category: 'System',
        type: 'command',
        command: 'system:focus_session',
        icon: 'Target',
        accessory: 'System'
    },
    {
        id: 'sys-color-picker',
        label: 'Color Picker',
        subtitle: 'Extrage codul HEX/RGB de oriunde de pe ecran',
        category: 'System',
        type: 'command',
        command: 'system:color_picker',
        icon: 'Pipette',
        accessory: 'System'
    },
    {
        id: 'sys-speedtest',
        label: 'Speedtest',
        subtitle: 'Rulează un test de viteză a internetului instantaneu',
        category: 'System',
        type: 'command',
        command: 'system:speedtest',
        icon: 'Gauge',
        accessory: 'System'
    },
    {
        id: 'sys-ip-geo',
        label: 'IP Geolocation',
        subtitle: 'Vezi IP-ul tău public și detaliile rețelei',
        category: 'System',
        type: 'command',
        command: 'system:ip_geo',
        icon: 'Globe',
        accessory: 'System'
    },
    {
        id: 'sys-calendar',
        label: 'My Schedule',
        subtitle: 'Vezi calendarul și intră în call-uri cu un click',
        category: 'System',
        type: 'command',
        command: 'system:open_calendar',
        icon: 'Calendar',
        accessory: 'System'
    },
];
