import React from 'react';
import {
    Sparkles,
    Cloud,
    Palette,
    Clipboard,
    Calendar,
    Globe,
    Monitor,
    FileText,
    Puzzle,
    Link as LinkIcon,
    Scissors,
    Shield,
    Settings,
    Code,
    Cpu,
    Info,
    LayoutDashboard
} from 'lucide-react';
import './AccountSettings.css';

export const AccountSettings: React.FC = () => {
    return (
        <div className="account-settings-container">
            <div className="account-hero">
                <div className="account-icon-hero">
                    <LayoutDashboard size={48} color="rgba(255,255,255,0.8)" />
                </div>
                <h1>Get Started</h1>
                <p>You need to log in or create an account to view your organizations, manage your custom extensions, and upgrade to Pro.</p>

                <div className="auth-buttons">
                    <button className="btn-signup">Sign Up</button>
                    <button className="btn-login">Log In</button>
                </div>
            </div>

            <div className="account-lists">
                <div className="account-section">
                    <div className="account-section-title">Pro</div>
                    <ul className="account-list">
                        <li className="account-list-item">
                            <Sparkles className="icon" size={16} />
                            <span>Octomus AI</span>
                            <span className="pro-tag">Pro</span>
                            <Info className="info-btn" size={14} />
                        </li>
                        <li className="account-list-item">
                            <Cloud className="icon" size={16} />
                            <span>Cloud Sync</span>
                            <span className="pro-tag">Pro</span>
                            <Info className="info-btn" size={14} />
                        </li>
                        <li className="account-list-item">
                            <Palette className="icon" size={16} />
                            <span>Custom Themes</span>
                            <span className="pro-tag">Pro</span>
                            <Info className="info-btn" size={14} />
                        </li>
                        <li className="account-list-item">
                            <Clipboard className="icon" size={16} />
                            <span>Unlimited Clipboard History</span>
                            <span className="pro-tag">Pro</span>
                            <Info className="info-btn" size={14} />
                        </li>
                        <li className="account-list-item">
                            <Calendar className="icon" size={16} />
                            <span>Scheduled Exports</span>
                            <span className="pro-tag">Pro</span>
                            <Info className="info-btn" size={14} />
                        </li>
                        <li className="account-list-item">
                            <Globe className="icon" size={16} />
                            <span>Translator</span>
                            <span className="pro-tag">Pro</span>
                            <Info className="info-btn" size={14} />
                        </li>
                        <li className="account-list-item">
                            <Monitor className="icon" size={16} />
                            <span>Custom Window Management Commands</span>
                            <span className="pro-tag">Pro</span>
                            <Info className="info-btn" size={14} />
                        </li>
                        <li className="account-list-item">
                            <FileText className="icon" size={16} />
                            <span>Unlimited Notes</span>
                            <span className="pro-tag">Pro</span>
                            <Info className="info-btn" size={14} />
                        </li>
                    </ul>
                </div>

                <div className="account-section">
                    <div className="account-section-title">Organizations</div>
                    <ul className="account-list">
                        <li className="account-list-item">
                            <Puzzle className="icon" size={16} />
                            <span>Private Extensions</span>
                            <Info className="info-btn" size={14} />
                        </li>
                        <li className="account-list-item">
                            <LinkIcon className="icon" size={16} />
                            <span>Shared Quicklinks</span>
                            <Info className="info-btn" size={14} />
                        </li>
                        <li className="account-list-item">
                            <Scissors className="icon" size={16} />
                            <span>Shared Snippets</span>
                            <Info className="info-btn" size={14} />
                        </li>
                        <li className="account-list-item">
                            <Shield className="icon" size={16} />
                            <span>Pro Features for All Members</span>
                            <span className="pro-tag">Pro</span>
                            <Info className="info-btn" size={14} />
                        </li>
                    </ul>
                </div>

                <div className="account-section">
                    <div className="account-section-title">Developer</div>
                    <ul className="account-list">
                        <li className="account-list-item">
                            <Code className="icon" size={16} />
                            <span>Developer API</span>
                            <Info className="info-btn" size={14} />
                        </li>
                        <li className="account-list-item">
                            <Cpu className="icon" size={16} />
                            <span>Custom Extensions</span>
                            <Info className="info-btn" size={14} />
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
