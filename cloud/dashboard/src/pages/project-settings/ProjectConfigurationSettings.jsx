import React, { useState } from 'react';
import './ProjectSettings.css';

const ProjectConfigurationSettings = () => {
    const [settings, setSettings] = useState({
        twoFactor: true,
        maskSecrets: true,
        requireApiKey: false,
        enableLinkFlow: false,
        logStorage: 'Store All Logs Data',
        urlExpiry: 3600
    });

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="project-configuration-settings">
            <h2 className="settings-section-title">Project Configuration</h2>
            <p className="settings-section-subtitle">Manage system-level configurations for your project</p>

            <div className="config-list">
                <div className="config-item">
                    <div className="config-info">
                        <h3 className="config-title">Two-Factor Authentication</h3>
                        <p className="config-desc">Require entity and connected account IDs for all actions.</p>
                    </div>
                    <div className="config-actions">
                        <span className={`status-badge ${settings.twoFactor ? 'enabled' : 'disabled'}`}>
                            {settings.twoFactor ? 'Enabled' : 'Disabled'}
                        </span>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={settings.twoFactor}
                                onChange={() => handleToggle('twoFactor')}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>

                <div className="config-item">
                    <div className="config-info">
                        <h3 className="config-title">Mask Connected Account Secrets</h3>
                        <p className="config-desc">Hide sensitive information in connected account details.</p>
                    </div>
                    <div className="config-actions">
                        <span className={`status-badge ${settings.maskSecrets ? 'enabled' : 'disabled'}`}>
                            {settings.maskSecrets ? 'Enabled' : 'Disabled'}
                        </span>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={settings.maskSecrets}
                                onChange={() => handleToggle('maskSecrets')}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>

                <div className="config-item">
                    <div className="config-info">
                        <h3 className="config-title">Require API Key for MCP</h3>
                        <p className="config-desc">Require API key authentication for MCP connections.</p>
                    </div>
                    <div className="config-actions">
                        <span className={`status-badge ${settings.requireApiKey ? 'enabled' : 'disabled'}`}>
                            {settings.requireApiKey ? 'Enabled' : 'Disabled'}
                        </span>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={settings.requireApiKey}
                                onChange={() => handleToggle('requireApiKey')}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>

                <div className="config-item">
                    <div className="config-info">
                        <h3 className="config-title">Enable Link Flow for Managed Auth</h3>
                        <p className="config-desc">
                            Use Link Auth flow for OAuth connections with Composio-managed credentials.<br />
                            No changes if you use your own client_id and client_secret.
                        </p>
                    </div>
                    <div className="config-actions">
                        <span className={`status-badge ${settings.enableLinkFlow ? 'enabled' : 'disabled'}`}>
                            {settings.enableLinkFlow ? 'Enabled' : 'Disabled'}
                        </span>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={settings.enableLinkFlow}
                                onChange={() => handleToggle('enableLinkFlow')}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>

                <div className="config-item">
                    <div className="config-info">
                        <h3 className="config-title">Log storage configuration</h3>
                        <p className="config-desc">Control how logs are stored in your project</p>
                    </div>
                    <div className="config-actions">
                        <select
                            className="select-control"
                            value={settings.logStorage}
                            onChange={(e) => setSettings(prev => ({ ...prev, logStorage: e.target.value }))}
                        >
                            <option>Store All Logs Data</option>
                            <option>Store Only Errors</option>
                            <option>No Logs</option>
                        </select>
                    </div>
                </div>

                <div className="config-item">
                    <div className="config-info">
                        <h3 className="config-title">Signed URL File Expiry</h3>
                        <p className="config-desc">Set the expiry duration (in seconds) for signed URLs used in file operations.</p>
                    </div>
                    <div className="config-actions" style={{ gap: '0.75rem' }}>
                        <input
                            type="number"
                            className="input-small"
                            value={settings.urlExpiry}
                            onChange={(e) => setSettings(prev => ({ ...prev, urlExpiry: parseInt(e.target.value) }))}
                        />
                        <span className="config-desc">seconds</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectConfigurationSettings;
