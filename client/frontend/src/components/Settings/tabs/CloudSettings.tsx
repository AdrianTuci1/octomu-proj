import React from 'react';
import {
    Cloud,
    Search,
    Type,
    Command,
    Link as LinkIcon,
    Scissors,
    FileText,
    Puzzle,
    Sparkles,
    Palette,
    Monitor,
    Clipboard,
    Code,
    Shield,
    Settings,
    Info,
    MoveUpRight,
    ArrowRightLeft
} from 'lucide-react';
import './CloudSettings.css';

export const CloudSettings: React.FC = () => {
    return (
        <div className="cloud-settings-container">
            <div className="cloud-hero">
                <ArrowRightLeft className="cloud-icon-hero" />
                <h1>Cloud Sync</h1>
                <p>Enable cloud sync to keep settings and data synchronized across your Apple devices.</p>

                <input type="checkbox" className="cloud-toggle" />

                <div className="pro-promo-card">
                    <span className="pro-badge-small">Pro</span>
                    <div className="pro-promo-content">
                        <div className="pro-promo-title">Try Octomus Pro For Free</div>
                        <div className="pro-promo-subtitle">Get access to Cloud Sync + Many more features</div>
                    </div>
                    <MoveUpRight size={14} color="var(--settings-text-secondary)" />
                </div>
            </div>

            <div className="cloud-lists">
                <div className="cloud-list-section">
                    <div className="cloud-list-title">Synced</div>
                    <ul className="cloud-list">
                        <li className="cloud-list-item"><Search className="icon" size={16} /> <span>Search History</span></li>
                        <li className="cloud-list-item"><Type className="icon" size={16} /> <span>Aliases</span></li>
                        <li className="cloud-list-item"><Command className="icon" size={16} /> <span>Hotkeys</span></li>
                        <li className="cloud-list-item"><LinkIcon className="icon" size={16} /> <span>Quicklinks</span></li>
                        <li className="cloud-list-item"><Scissors className="icon" size={16} /> <span>Snippets</span></li>
                        <li className="cloud-list-item"><FileText className="icon" size={16} /> <span>Octomus Notes</span></li>
                        <li className="cloud-list-item"><Puzzle className="icon" size={16} /> <span>Extensions and Settings</span></li>
                        <li className="cloud-list-item"><Sparkles className="icon" size={16} /> <span>AI Chats, Presets & Commands</span></li>
                        <li className="cloud-list-item"><Palette className="icon" size={16} /> <span>Themes</span></li>
                        <li className="cloud-list-item"><Monitor className="icon" size={16} /> <span>Custom Window Management</span></li>
                    </ul>
                </div>

                <div className="cloud-list-section">
                    <div className="cloud-list-title">Not Synced</div>
                    <ul className="cloud-list">
                        <li className="cloud-list-item"><Clipboard className="icon" size={16} /> <span>Clipboard History</span></li>
                        <li className="cloud-list-item"><Code className="icon" size={16} /> <span>Script Commands</span></li>
                        <li className="cloud-list-item">
                            <Shield className="icon" size={16} />
                            <span>Credentials and Passwords</span>
                            <Info className="info-icon" />
                        </li>
                        <li className="cloud-list-item">
                            <Settings className="icon" size={16} />
                            <span>General and Advanced Settings</span>
                            <Info className="info-icon" />
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
