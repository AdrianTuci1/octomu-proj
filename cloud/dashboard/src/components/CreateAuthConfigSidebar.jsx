import React, { useState, useEffect } from 'react';
import {
    X,
    Search,
    ArrowLeft,
    Trash2,
    Mail,
    Box,
    Github,
    Calendar,
    FileText,
    Table,
    Slack,
    Zap,
    Atom,
    Twitter,
    HardDrive
} from 'lucide-react';
import './CreateAuthConfigSidebar.css';

const TOOLKITS = [
    { id: 'gmail', name: 'Gmail', icon: Mail, authMethods: ['OAUTH2'], defaultScopes: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/contacts.readonly'] },
    { id: 'composio', name: 'Composio', icon: Box, authMethods: ['NO_AUTH'], defaultScopes: [] },
    { id: 'github', name: 'GitHub', icon: Github, authMethods: ['OAUTH2'], defaultScopes: ['repo', 'user'] },
    { id: 'google_calendar', name: 'Google Calendar', icon: Calendar, authMethods: ['OAUTH2'], defaultScopes: ['https://www.googleapis.com/auth/calendar.readonly'] },
    { id: 'notion', name: 'Notion', icon: FileText, authMethods: ['OAUTH2', 'API_KEY'], defaultScopes: [] },
    { id: 'google_sheets', name: 'Google Sheets', icon: Table, authMethods: ['OAUTH2'], defaultScopes: ['https://www.googleapis.com/auth/spreadsheets'] },
    { id: 'slack', name: 'Slack', icon: Slack, authMethods: ['OAUTH2'], defaultScopes: ['channels:read', 'chat:write'] },
    { id: 'supabase', name: 'Supabase', icon: Zap, authMethods: ['OAUTH2', 'API_KEY'], defaultScopes: [] },
    { id: 'outlook', name: 'Outlook', icon: Mail, authMethods: ['OAUTH2'], defaultScopes: ['Mail.Read'] },
    { id: 'perplexity', name: 'Perplexity AI', icon: Atom, authMethods: ['API_KEY'], defaultScopes: [] },
    { id: 'twitter', name: 'Twitter', icon: Twitter, authMethods: ['OAUTH2'], defaultScopes: ['tweet.read', 'users.read'] },
    { id: 'google_drive', name: 'Google Drive', icon: HardDrive, authMethods: ['OAUTH2'], defaultScopes: ['https://www.googleapis.com/auth/drive.readonly'] },
];

const CreateAuthConfigSidebar = ({ isOpen, onClose, onCreate }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedToolkit, setSelectedToolkit] = useState(null);
    const [configName, setConfigName] = useState('');
    const [authMethod, setAuthMethod] = useState('');
    const [scopes, setScopes] = useState([]);
    const [newScope, setNewScope] = useState('');
    const [useDeveloperCredentials, setUseDeveloperCredentials] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            // Delay reset to allow closing animation to complete
            const timer = setTimeout(() => {
                setSelectedToolkit(null);
                setSearchQuery('');
                setConfigName('');
                setAuthMethod('');
                setScopes([]);
                setUseDeveloperCredentials(false);
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const filteredToolkits = TOOLKITS.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectToolkit = (toolkit) => {
        setSelectedToolkit(toolkit);
        const randomSuffix = Math.random().toString(36).substring(2, 6);
        setConfigName(`${toolkit.id}-${randomSuffix}`);
        setAuthMethod(toolkit.authMethods[0]);
        setScopes(toolkit.defaultScopes);
    };

    const handleBack = () => {
        setSelectedToolkit(null);
    };

    const handleAddScope = (e) => {
        if (e.key === 'Enter' && newScope.trim()) {
            if (!scopes.includes(newScope.trim())) {
                setScopes([...scopes, newScope.trim()]);
            }
            setNewScope('');
        }
    };

    const handleRemoveScope = (index) => {
        setScopes(scopes.filter((_, i) => i !== index));
    };

    const handleCreate = () => {
        const newConfig = {
            id: `ac_${Math.random().toString(36).substring(2, 12)}`,
            name: configName,
            toolkit: selectedToolkit.name,
            authType: authMethod,
            scopes: scopes,
            useDeveloperCredentials,
            status: 'ENABLED',
            lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            connections: 0
        };
        onCreate(newConfig);
        onClose();
    };

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
            <div className={`create-auth-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    {selectedToolkit ? (
                        <div className="header-top">
                            <div className="header-left">
                                <button className="back-btn" onClick={handleBack}>
                                    <ArrowLeft size={18} />
                                </button>
                                <div className="toolkit-info">
                                    <selectedToolkit.icon size={20} className="toolkit-icon" />
                                    <h2>{selectedToolkit.name}</h2>
                                </div>
                            </div>
                            <button className="close-btn" onClick={onClose}>
                                <X size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="header-main">
                            <div className="header-top">
                                <h2>Create Auth Config</h2>
                                <button className="close-btn" onClick={onClose}>
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="search-box">
                                <Search size={16} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search toolkits..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="sidebar-content">
                    {!selectedToolkit ? (
                        <div className="toolkit-selection">
                            <div className="toolkit-list">
                                {filteredToolkits.map(toolkit => (
                                    <div
                                        key={toolkit.id}
                                        className="toolkit-item"
                                        onClick={() => handleSelectToolkit(toolkit)}
                                    >
                                        <div className="toolkit-name">
                                            <toolkit.icon size={18} className="toolkit-icon" />
                                            <span>{toolkit.name}</span>
                                        </div>
                                        <div className="toolkit-badges">
                                            {toolkit.authMethods.map(m => (
                                                <span key={m} className={`badge badge-${m.toLowerCase()}`}>{m}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="config-form">
                            <div className="form-body">
                                <div className="form-group">
                                    <label>Auth Config Name <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        value={configName}
                                        onChange={(e) => setConfigName(e.target.value)}
                                        placeholder="Enter config name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Authentication Method <span className="required">*</span></label>
                                    <div className="auth-methods-list">
                                        {selectedToolkit.authMethods.map(method => (
                                            <div
                                                key={method}
                                                className={`auth-method-card ${authMethod === method ? 'selected' : ''}`}
                                                onClick={() => setAuthMethod(method)}
                                            >
                                                <div className="radio-circle">
                                                    {authMethod === method && <div className="radio-inner" />}
                                                </div>
                                                <div className="method-info">
                                                    <span className="method-name">{method}</span>
                                                    <span className="method-desc">
                                                        {method === 'OAUTH2'
                                                            ? 'Secure, user-friendly login process for authentication'
                                                            : 'Direct authentication using a private API key'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Manage Scopes</label>
                                    <div className="scope-input-container">
                                        <input
                                            type="text"
                                            placeholder="Enter a scope to add"
                                            value={newScope}
                                            onChange={(e) => setNewScope(e.target.value)}
                                            onKeyDown={handleAddScope}
                                        />
                                        <div className="enter-icon">↵</div>
                                    </div>
                                    {scopes.length > 0 && (
                                        <div className="scopes-list">
                                            {scopes.map((scope, index) => (
                                                <div key={index} className="scope-item">
                                                    <span>{scope}</span>
                                                    <button onClick={() => handleRemoveScope(index)}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group toggle-group">
                                    <div className="toggle-info">
                                        <span className="toggle-label">Use your own developer credentials</span>
                                    </div>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={useDeveloperCredentials}
                                            onChange={(e) => setUseDeveloperCredentials(e.target.checked)}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button className="create-btn" onClick={handleCreate}>
                                    Create {selectedToolkit.name} Auth Config
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CreateAuthConfigSidebar;
