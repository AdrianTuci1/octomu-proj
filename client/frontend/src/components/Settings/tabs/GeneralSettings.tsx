import React from 'react';
import { useStore } from '../../../store/useStore';
import { Monitor, Moon, Sun, MonitorCheck } from 'lucide-react';

export const GeneralSettings: React.FC = () => {
    const { appearance, windowMode, hotkey, launchAtLogin } = useStore(state => state.settings) ?? {};
    const { core } = useStore();

    const setAppearance = (v: 'light' | 'dark' | 'system') => core.settings.setAppearance(v);
    const setWindowMode = (v: 'default' | 'compact') => core.settings.setWindowMode(v);
    const setHotkey = (v: string) => core.settings.setHotkey(v);
    const setLaunchAtLogin = (v: boolean) => core.settings.setLaunchAtLogin(v);

    return (
        <div className="settings-tab-content">
            <div className="settings-group">
                <div className="settings-row">
                    <div className="settings-label">Startup</div>
                    <div className="settings-control">
                        <label className="checkbox-container">
                            <input
                                type="checkbox"
                                checked={launchAtLogin}
                                onChange={(e) => setLaunchAtLogin(e.target.checked)}
                            />
                            <span>Launch Octomus at login</span>
                        </label>
                    </div>
                </div>

                <div className="settings-row">
                    <div className="settings-label">Octomus Hotkey</div>
                    <div className="settings-control">
                        <div className="hotkey-input" onClick={() => {/* Record hotkey logic */ }}>
                            {hotkey}
                        </div>
                        <div className="settings-hint">How to replace Spotlight with Octomus manually</div>
                    </div>
                </div>
            </div>

            <div className="settings-group">
                <div className="settings-row">
                    <div className="settings-label">Appearance</div>
                    <div className="settings-control">
                        <div className="appearance-toggle">
                            <button
                                className={appearance === 'light' ? 'active' : ''}
                                onClick={() => setAppearance('light')}
                            >
                                <Sun size={16} /> <span>Light</span>
                            </button>
                            <button
                                className={appearance === 'dark' ? 'active' : ''}
                                onClick={() => setAppearance('dark')}
                            >
                                <Moon size={16} /> <span>Dark</span>
                            </button>
                            <button
                                className={appearance === 'system' ? 'active' : ''}
                                onClick={() => setAppearance('system')}
                            >
                                <Monitor size={16} /> <span>System</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="settings-row">
                    <div className="settings-label">Window Mode</div>
                    <div className="settings-control">
                        <div className="window-mode-toggle">
                            <div
                                className={`mode-option ${windowMode === 'default' ? 'active' : ''}`}
                                onClick={() => setWindowMode('default')}
                            >
                                <div className="mode-preview default"></div>
                                <span>Default</span>
                            </div>
                            <div
                                className={`mode-option ${windowMode === 'compact' ? 'active' : ''}`}
                                onClick={() => setWindowMode('compact')}
                            >
                                <div className="mode-preview compact"></div>
                                <span>Compact</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
