import React, { useState } from 'react';
import { Info, Trash2, CornerDownLeft } from 'lucide-react';

const ManageAuthConfigView = () => {
    const [scopes, setScopes] = useState([
        'repo',
        'user',
        'gist',
        'notifications',
        'project',
        'workflow',
        'codespace'
    ]);
    const [newScope, setNewScope] = useState('');

    const handleAddScope = (e) => {
        if (e.key === 'Enter' && newScope.trim()) {
            if (!scopes.includes(newScope.trim())) {
                setScopes([...scopes, newScope.trim()]);
            }
            setNewScope('');
        }
    };

    const removeScope = (scopeToRemove) => {
        setScopes(scopes.filter(scope => scope !== scopeToRemove));
    };

    return (
        <div className="tab-content manage-auth-tab">
            <h2 className="manage-title">Manage Auth Config</h2>

            <div className="manage-section">
                <h3 className="section-label">Manage Scopes</h3>
                <div className="scopes-container">
                    <div className="scope-input-wrapper">
                        <input
                            className="manage-input"
                            type="text"
                            placeholder="Add a new scope"
                            value={newScope}
                            onChange={(e) => setNewScope(e.target.value)}
                            onKeyDown={handleAddScope}
                        />
                        <CornerDownLeft size={16} className="input-icon" />
                    </div>

                    <div className="scopes-list">
                        {scopes.map((scope, index) => (
                            <div key={index} className="scope-row">
                                <span className="scope-text">{scope}</span>
                                <button className="delete-scope-btn" onClick={() => removeScope(scope)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <a href="#" className="scopes-help-link">
                    <Info size={16} />
                    What do these scopes mean?
                </a>
            </div>

            <div className="manage-section">
                <h3 className="section-label">Tools Available For Execution</h3>
                <div className="scope-input-wrapper">
                    <input
                        className="manage-input"
                        type="text"
                        placeholder="Select tools to restrict to"
                    />
                    <CornerDownLeft size={16} className="input-icon" />
                </div>
            </div>

            <div className="manage-actions">
                <button className="primary-btn save-config-btn">
                    Save Auth Config
                </button>
            </div>
        </div>
    );
};

export default ManageAuthConfigView;
