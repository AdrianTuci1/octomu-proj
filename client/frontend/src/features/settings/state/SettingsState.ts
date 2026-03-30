import { StateCreator } from 'zustand';
import { AppState } from '../../../store/storeTypes';

export interface SettingsState {
    appearance: 'light' | 'dark' | 'system';
    windowMode: 'default' | 'compact';
    hotkey: string;
    launchAtLogin: boolean;
    textSize: 'small' | 'large';
    activeSettingsTab: 'general' | 'extensions' | 'ai' | 'cloud' | 'account' | 'organizations' | 'advanced' | 'about';
    onboardingCompleted: boolean;
}

export const createSettingsSlice: StateCreator<AppState, [], [], SettingsState> = (set) => ({
    appearance: 'dark',
    windowMode: 'default',
    hotkey: 'Cmd+Space',
    launchAtLogin: true,
    textSize: 'small',
    activeSettingsTab: 'general',
    onboardingCompleted: false,
});
