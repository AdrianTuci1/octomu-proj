import React from 'react';
import { Key, Trash2 } from 'lucide-react';
import './ProjectSettings.css';

const APIKeysSettings = () => {
    const apiKeys = [
        { name: 'Composio-Playground', key: 'ak_cdi*****0cz', created: 'Feb 11, 202' }
    ];

    return (
        <div className="api-keys-settings">
            <div className="api-keys-header">
                <h2 className="settings-section-title" style={{ margin: 0 }}>API Keys</h2>
                <button className="new-key-btn">
                    <Key size={16} />
                    New API key
                </button>
            </div>

            <div className="settings-table-card">
                <table className="settings-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>API Key</th>
                            <th>Created</th>
                            <th style={{ width: '40px' }}>
                                <Trash2 size={14} />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {apiKeys.map((item, index) => (
                            <tr key={index}>
                                <td>{item.name}</td>
                                <td className="text-mono">{item.key}</td>
                                <td>{item.created}</td>
                                <td>
                                    <button className="btn-delete-icon">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default APIKeysSettings;
