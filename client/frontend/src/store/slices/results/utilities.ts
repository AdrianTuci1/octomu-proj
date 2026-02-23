import { IResultItem } from '../../../domain/types';

export const UTILITIES_RESULTS: IResultItem[] = [
    {
        id: 'util-clipboard',
        label: 'Clipboard History',
        subtitle: 'Accesează tot ce ai copiat (text, imagini, link-uri)',
        category: 'Utilities',
        type: 'application',
        icon: 'Clipboard',
        accessory: 'Octomus'
    },
    {
        id: 'util-snippets',
        label: 'Snippets',
        subtitle: 'Inserează rapid texte repetitive prin scurtături (ex: ;mail)',
        category: 'Utilities',
        type: 'application',
        icon: 'FileText',
        accessory: 'Octomus'
    },
    {
        id: 'util-calculator',
        label: 'Calculator',
        subtitle: 'Calcule complexe, conversii valutare și de unități',
        category: 'Utilities',
        type: 'application',
        icon: 'Calculator',
        accessory: 'Octomus'
    },
    {
        id: 'util-quicklinks',
        label: 'QuickLinks',
        subtitle: 'Creează scurtături către URL-uri sau foldere specifice',
        category: 'Utilities',
        type: 'application',
        icon: 'Link',
        accessory: 'Octomus'
    },
    {
        id: 'util-floating-notes',
        label: 'Floating Notes',
        subtitle: 'O notiță mică, mereu vizibilă, pentru idei rapide',
        category: 'Utilities',
        type: 'application',
        icon: 'StickyNote',
        accessory: 'Octomus'
    },
    {
        id: 'util-search-files',
        label: 'Search Files',
        subtitle: 'Căutare ultra-rapidă de fișiere cu previzualizare',
        category: 'Utilities',
        type: 'application',
        icon: 'FolderSearch',
        accessory: 'Octomus'
    },
    {
        id: 'util-manage-models',
        label: 'Manage Models',
        subtitle: 'Gestionează modelele AI disponibile',
        category: 'Utilities',
        type: 'command',
        command: 'ui:manage_models',
        icon: 'BrainCircuit',
        accessory: 'Octomus'
    },
    {
        id: 'util-confetti',
        label: 'Confetti',
        subtitle: 'Lansează confetti pe ecran (perfect când termini un task)!',
        category: 'Effects',
        type: 'command',
        command: 'ui:confetti',
        icon: 'PartyPopper',
        accessory: 'Octomus'
    },
    {
        id: 'util-qr',
        label: 'Make QR Code',
        subtitle: 'Generează un QR din text sau URL',
        category: 'Utilities',
        type: 'command',
        command: 'ui:qr_code',
        icon: 'QrCode',
        accessory: 'Octomus'
    },
    {
        id: 'util-translate',
        label: 'Translate',
        subtitle: 'Traducere rapidă cu Google Translate sau DeepL',
        category: 'Utilities',
        type: 'ai_extension',
        mention: '@translate',
        icon: 'Languages',
        accessory: 'App'
    },
];
