import { StateCreator } from 'zustand';
import { AppState, SettingsSlice } from '../storeTypes';

export const createSettingsSlice: StateCreator<AppState, [], [], SettingsSlice> = (set) => ({
    appearance: 'system',
    windowMode: 'default',
    hotkey: '⌥ Space',
    launchAtLogin: true,
    textSize: 'small',
    activeSettingsTab: 'general',

    setAppearance: (appearance) => set({ appearance }),
    setWindowMode: (windowMode) => set({ windowMode }),
    setHotkey: (hotkey) => set({ hotkey }),
    setLaunchAtLogin: (launchAtLogin) => set({ launchAtLogin }),
    setTextSize: (textSize) => set({ textSize }),
    setActiveSettingsTab: (activeSettingsTab) => set({ activeSettingsTab }),
});
