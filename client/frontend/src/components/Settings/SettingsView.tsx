import React from 'react';
import { useStore } from '../../store/useStore';
import { Settings, Puzzle, Sparkles, Zap, User, Cloud, Shield, Info, X } from 'lucide-react';
import { GeneralSettings } from './tabs/GeneralSettings';
import { AISettings } from './tabs/AISettings';
import { ExtensionSettings } from './tabs/ExtensionSettings';
import './SettingsView.css';

export const SettingsView: React.FC = () => {
    const { activeSettingsTab } = useStore(state => state.settings);
    const { core } = useStore();

    const tabs: Array<{ id: string, label: string, icon: any, badge?: string }> = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'extensions', label: 'Extensions', icon: Puzzle },
        { id: 'ai', label: 'AI', icon: Sparkles, badge: '35' },
        { id: 'cloud', label: 'Cloud Sync', icon: Cloud, badge: 'Pro' },
        { id: 'account', label: 'Account', icon: User },
        { id: 'organizations', label: 'Organizations', icon: Shield },
        { id: 'advanced', label: 'Advanced', icon: Zap },
        { id: 'about', label: 'About', icon: Info },
    ];

    const renderContent = () => {
        switch (activeSettingsTab) {
            case 'general': return <GeneralSettings />;
            case 'ai': return <AISettings />;
            case 'extensions': return <ExtensionSettings />;
            default: return <div className="settings-placeholder">Settings for {activeSettingsTab} coming soon...</div>;
        }
    };

    return (
        <div className="settings-overlay">
            <div className="settings-window">
                <div className="settings-header">
                    <div className="settings-title">Raycast Settings</div>
                    <button className="close-settings" onClick={() => core.navigation.goBack()}>
                        <X size={16} />
                    </button>
                    <div className="settings-tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`settings-tab ${activeSettingsTab === tab.id ? 'active' : ''}`}
                                onClick={() => core.settings.setActiveSettingsTab(tab.id as any)}
                            >
                                <tab.icon size={20} />
                                <span>{tab.label}</span>
                                {tab.badge && <span className={`tab-badge ${tab.badge === 'Pro' ? 'pro' : ''}`}>{tab.badge}</span>}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="settings-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};
