import React from 'react';
import { useStore } from '../../../store/useStore';
import { Monitor, Moon, Sun, Command, ExternalLink, CircleDashed as SystemIcon, Type } from 'lucide-react';
import './GeneralSettings.css';

const SettingSection: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="settings-group">
        {children}
    </div>
);

const SettingItem: React.FC<{ label: string, children: React.ReactNode }> = ({ label, children }) => (
    <div className="settings-row">
        <div className="settings-label">{label}</div>
        <div className="settings-control">
            {children}
        </div>
    </div>
);

export const GeneralSettings: React.FC = () => {
    const { appearance, windowMode, hotkey, launchAtLogin, textSize } = useStore(state => state.settings) ?? {};
    const { core } = useStore();

    const setAppearance = (v: 'light' | 'dark' | 'system') => core.settings.setAppearance(v);
    const setWindowMode = (v: 'default' | 'compact') => core.settings.setWindowMode(v);
    const setHotkey = (v: string) => core.settings.setHotkey(v);
    const setLaunchAtLogin = (v: boolean) => core.settings.setLaunchAtLogin(v);
    const setTextSize = (v: 'small' | 'large') => core.settings.setTextSize(v);

    return (
        <div className="settings-tab-content">
            <SettingSection>
                <SettingItem label="Startup">
                    <label className="checkbox-container">
                        <input
                            type="checkbox"
                            checked={launchAtLogin}
                            onChange={(e) => setLaunchAtLogin(e.target.checked)}
                        />
                        <span>Launch Octomus at login</span>
                    </label>
                </SettingItem>

                <SettingItem label="Octomus Hotkey">
                    <button className="hotkey-button" onClick={() => {/* Record hotkey logic */ }}>
                        <Command size={14} /> <span>{hotkey?.split('+')[1] || 'Space'}</span>
                    </button>
                    <a className="settings-hint" href="#">How to replace Spotlight with Octomus manually</a>
                </SettingItem>

                <SettingItem label="Menu Bar Icon">
                    <label className="checkbox-container">
                        <input
                            type="checkbox"
                            checked={true}
                            onChange={() => { }}
                        />
                        <span>Show Octomus in menu bar</span>
                    </label>
                </SettingItem>
            </SettingSection>

            <div className="settings-separator" />

            <SettingSection>
                <SettingItem label="Text Size">
                    <div className="text-size-selector">
                        <div
                            className={`text-size-option small ${textSize === 'small' ? 'active' : ''}`}
                            onClick={() => setTextSize('small')}
                        >
                            Aa
                        </div>
                        <div
                            className={`text-size-option large ${textSize === 'large' ? 'active' : ''}`}
                            onClick={() => setTextSize('large')}
                        >
                            Aa
                        </div>
                    </div>
                </SettingItem>

                <SettingItem label="Appearance">
                    <div className="appearance-selector">
                        <div
                            className={`appearance-option ${appearance === 'light' ? 'active' : ''}`}
                            onClick={() => setAppearance('light')}
                        >
                            <div className="appearance-card">
                                <Sun size={18} />
                            </div>
                            <span>Light</span>
                        </div>
                        <div
                            className={`appearance-option ${appearance === 'dark' ? 'active' : ''}`}
                            onClick={() => setAppearance('dark')}
                        >
                            <div className="appearance-card">
                                <Moon size={18} />
                            </div>
                            <span>Dark</span>
                        </div>
                        <div
                            className={`appearance-option ${appearance === 'system' ? 'active' : ''}`}
                            onClick={() => setAppearance('system')}
                        >
                            <div className="appearance-card system-card">
                                <SystemIcon size={18} />
                            </div>
                            <span>System</span>
                        </div>
                    </div>
                </SettingItem>

                <div className="pro-card">
                    <div className="pro-card-content">
                        <div className="pro-card-title">
                            <span className="pro-badge-small">Pro</span>
                            <span>Unlock Custom Themes</span>
                        </div>
                        <div className="pro-card-description">
                            Try Octomus Pro with our 14 day free trial
                        </div>
                    </div>
                    <ExternalLink size={16} color="var(--settings-text-secondary)" />
                </div>
            </SettingSection>

            <SettingSection>
                <SettingItem label="Window Mode">
                    <div className="window-mode-selector">
                        <div
                            className={`mode-option ${windowMode === 'default' ? 'active' : ''}`}
                            onClick={() => setWindowMode('default')}
                        >
                            <div className="mode-preview default">
                                <div className="mode-inner" />
                            </div>
                            <span>Default</span>
                        </div>
                        <div
                            className={`mode-option ${windowMode === 'compact' ? 'active' : ''}`}
                            onClick={() => setWindowMode('compact')}
                        >
                            <div className="mode-preview compact">
                                <div className="mode-inner" />
                            </div>
                            <span>Compact</span>
                        </div>
                    </div>
                </SettingItem>

                <SettingItem label="Favorites">
                    <label className="checkbox-container">
                        <input
                            type="checkbox"
                            checked={true}
                            onChange={() => { }}
                        />
                        <span>Show favorites in compact mode</span>
                    </label>
                </SettingItem>
            </SettingSection>
        </div>
    );
};
