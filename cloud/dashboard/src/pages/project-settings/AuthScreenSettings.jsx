import React, { useState } from 'react';
import {
    Plus,
    Box,
    ShieldCheck,
    Key,
    ArrowRight,
    LayoutGrid
} from 'lucide-react';
import './ProjectSettings.css';

const AuthScreenSettings = () => {
    const [appTitle, setAppTitle] = useState('Composio');

    return (
        <div className="auth-screen-settings">
            <h2 className="settings-section-title">Auth Screen Configuration</h2>
            <p className="settings-section-subtitle">Configure the auth screen for your project</p>

            <div className="auth-screen-layout">
                <div className="auth-form-column">
                    <div className="settings-card logo-upload-card">
                        <div className="logo-placeholder">
                            <LayoutGrid size={32} />
                        </div>
                        <div className="logo-upload-info">
                            <h3 className="card-title" style={{ marginBottom: '4px' }}>App Logo</h3>
                            <p className="upload-text">Please choose a 256×256 or higher quality image</p>
                            <button className="btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}>
                                <Plus size={14} /> Choose Logo
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 className="card-title" style={{ fontSize: '0.875rem', marginBottom: '8px' }}>App Title</h3>
                        <p className="upload-text">This will be displayed in the auth screen.</p>
                        <input
                            type="text"
                            className="input-field"
                            style={{ maxWidth: 'none', width: '100%', boxSizing: 'border-box' }}
                            value={appTitle}
                            onChange={(e) => setAppTitle(e.target.value)}
                        />
                    </div>

                    <button className="btn-save">Save Changes</button>

                    <div className="auth-info-card">
                        <p style={{ margin: 0 }}>
                            Auth screens are visible to your users when you use Composio's hosted auth links. <a href="#" style={{ color: '#2563eb' }}>Read more about it here</a>
                        </p>
                    </div>
                </div>

                <div className="preview-column">
                    <div className="auth-preview-card">
                        <div className="preview-main-content">
                            <div className="logo-comparison">
                                <div className="connector-line"></div>
                                <div className="logo-box">
                                    <Box size={32} strokeWidth={2.5} />
                                </div>
                                <div className="logo-box">
                                    <div style={{ background: '#000', borderRadius: '4px', padding: '4px' }}>
                                        <LayoutGrid size={24} color="white" />
                                    </div>
                                </div>
                            </div>

                            <h2 className="preview-title">
                                {appTitle} wants to connect to your Intercom
                            </h2>

                            <div className="preview-bullets">
                                <div className="bullet-item">
                                    <div className="bullet-icon">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <p className="bullet-text">Only connect your account to apps you have verified.</p>
                                </div>
                                <div className="bullet-item">
                                    <div className="bullet-icon">
                                        <Key size={20} />
                                    </div>
                                    <p className="bullet-text">By linking your account, you allow {appTitle} to interact with your data.</p>
                                </div>
                            </div>
                        </div>

                        <div className="preview-actions">
                            <button className="btn-continue">
                                Continue <ArrowRight size={16} />
                            </button>
                            <div className="preview-footer">
                                Secured by <Box size={12} className="footer-icon" /> Composio
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthScreenSettings;
