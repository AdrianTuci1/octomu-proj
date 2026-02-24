import { AppState } from '../../../store/storeTypes';
import { SaveCredential } from '../../../../bindings/client/app';

export interface ISettingsStore {
    getState(): AppState;
    setState(state: Partial<AppState> | ((state: AppState) => Partial<AppState>)): void;
}

export class SettingsManager {
    constructor(private store: ISettingsStore) { }

    private setSettingsState(changes: Partial<AppState['settings']>) {
        this.store.setState(state => ({
            settings: { ...state.settings, ...changes }
        }));
    }

    setAppearance(appearance: 'light' | 'dark' | 'system') {
        this.setSettingsState({ appearance });
    }

    setWindowMode(windowMode: 'default' | 'compact') {
        this.setSettingsState({ windowMode });
    }

    setHotkey(hotkey: string) {
        this.setSettingsState({ hotkey });
    }

    setLaunchAtLogin(launchAtLogin: boolean) {
        this.setSettingsState({ launchAtLogin });
    }

    setTextSize(textSize: 'small' | 'large') {
        this.setSettingsState({ textSize });
    }

    setActiveSettingsTab(tab: 'general' | 'extensions' | 'ai' | 'advanced') {
        this.setSettingsState({ activeSettingsTab: tab });
    }

    async setOnboardingCompleted(completed: boolean) {
        this.setSettingsState({ onboardingCompleted: completed });
        // Sync with backend keychain
        try {
            await SaveCredential("onboarding_completed", completed ? "true" : "false");
        } catch (err) {
            console.error('[SettingsManager] Failed to save onboarding status:', err);
        }
    }
}
