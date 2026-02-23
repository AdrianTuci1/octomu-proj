import { IResultItem } from '../../../domain/types';

export const AI_COMMANDS_RESULTS: IResultItem[] = [
    {
        id: 'ai-ask',
        label: 'Ask AI',
        subtitle: 'Chat direct cu modele AI (GPT-4, Claude, Gemini)',
        category: 'AI Commands',
        type: 'ai_extension',
        mention: '@ai',
        command: 'ai:ask',
        icon: 'Sparkles',
        accessory: 'AI'
    },
    {
        id: 'ai-fix-grammar',
        label: 'Fix Spelling & Grammar',
        subtitle: 'Corectează automat textul selectat',
        category: 'AI Commands',
        type: 'ai_extension',
        mention: '@ai',
        command: 'ai:fix_grammar',
        icon: 'CheckSquare',
        accessory: 'AI'
    },
    {
        id: 'ai-explain',
        label: 'Explain Code',
        subtitle: 'Explică logica unui fragment de cod copiat',
        category: 'AI Commands',
        type: 'ai_extension',
        mention: '@ai',
        command: 'ai:explain_code',
        icon: 'Code',
        accessory: 'AI'
    },
    {
        id: 'ai-tone-casual',
        label: 'Change Tone to Casual',
        subtitle: 'Transformă textul într-unul mai relaxat',
        category: 'AI Commands',
        type: 'ai_extension',
        mention: '@ai',
        command: 'ai:tone_casual',
        icon: 'MessageCircle',
        accessory: 'AI'
    },
    {
        id: 'ai-tone-confident',
        label: 'Change Tone to Confident',
        subtitle: 'Transformă textul într-unul mai încrezător',
        category: 'AI Commands',
        type: 'ai_extension',
        mention: '@ai',
        command: 'ai:tone_confident',
        icon: 'Zap',
        accessory: 'AI'
    },
    {
        id: 'ai-tone-friendly',
        label: 'Change Tone to Friendly',
        subtitle: 'Transformă textul într-unul mai prietenos',
        category: 'AI Commands',
        type: 'ai_extension',
        mention: '@ai',
        command: 'ai:tone_friendly',
        icon: 'Heart',
        accessory: 'AI'
    },
    {
        id: 'ai-tone-professional',
        label: 'Change Tone to Professional',
        subtitle: 'Transformă textul într-unul mai profesionist',
        category: 'AI Commands',
        type: 'ai_extension',
        mention: '@ai',
        command: 'ai:tone_professional',
        icon: 'Briefcase',
        accessory: 'AI'
    },
    {
        id: 'ai-improve',
        label: 'Improve Writing',
        subtitle: 'Îmbunătățește textul selectat',
        category: 'AI Commands',
        type: 'ai_extension',
        mention: '@ai',
        command: 'ai:improve_writing',
        icon: 'PenTool',
        accessory: 'AI'
    },
    {
        id: 'ai-make-longer',
        label: 'Make Longer',
        subtitle: 'Extinde textul selectat cu mai mult conținut',
        category: 'AI Commands',
        type: 'ai_extension',
        mention: '@ai',
        command: 'ai:make_longer',
        icon: 'ArrowUpRight',
        accessory: 'AI'
    },
    {
        id: 'ai-make-shorter',
        label: 'Make Shorter',
        subtitle: 'Scurtează textul selectat păstrând esența',
        category: 'AI Commands',
        type: 'ai_extension',
        mention: '@ai',
        command: 'ai:make_shorter',
        icon: 'Minimize2',
        accessory: 'AI'
    },
];
