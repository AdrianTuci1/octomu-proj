import React from 'react';
import { Command, CornerDownLeft } from 'lucide-react';
import './Footer.css';

export const Footer: React.FC = () => {
    return (
        <div className="app-footer">
            <div className="footer-left">
                <Command size={14} className="octo-logo" />
            </div>

            <div className="footer-right">
                <div className="shortcut-group">
                    <span className="shortcut-label">Open Walkthrough</span>
                    <div className="shortcut-keys">
                        <div className="key-icon"><CornerDownLeft size={10} /></div>
                    </div>
                </div>

                <div className="divider" />

                <div className="shortcut-group">
                    <span className="shortcut-label">Actions</span>
                    <div className="shortcut-keys">
                        <div className="key-text">⌘</div>
                        <div className="key-text">K</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
