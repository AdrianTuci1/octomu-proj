import React, { useState } from 'react';
import {
    Filter,
    Calendar,
    RefreshCw,
    Github,
    Mail,
    Slack,
    Database
} from 'lucide-react';
import './Logs.css';

const Logs = () => {
    const [activeTab, setActiveTab] = useState('Tools');

    const mockLogs = [
        {
            timestamp: 'FEB 11 3:10:30.62',
            toolkit: 'GitHub',
            icon: <Github size={16} />,
            name: 'GITHUB_CREATE_ISSUE',
            duration: '1250 ms',
            user: 'default',
            response: '{"success":true,"issue":{"number":42,"title":"Sample Issue"}}',
            error: false,
            sample: true
        },
        {
            timestamp: 'FEB 11 2:10:30.62',
            toolkit: 'Slack',
            icon: <Slack size={16} />,
            name: 'SLACK_SEND_MESSAGE',
            duration: '850 ms',
            user: 'default',
            response: '{"success":true,"message":"Message sent successfully"}',
            error: false,
            sample: true
        },
        {
            timestamp: 'FEB 11 1:10:30...',
            toolkit: 'Gmail',
            icon: <Mail size={16} />,
            name: 'GMAIL_SEND_EMAIL',
            duration: '2100 ms',
            user: 'default',
            response: '{"success":false,"error":"Invalid email address format"}',
            error: true,
            sample: true
        },
        {
            timestamp: 'FEB 11 0:10:30...',
            toolkit: 'Google Drive',
            icon: <Database size={16} />,
            name: 'GOOGLEDRIVE_UPLOA...',
            duration: '3500 ms',
            user: 'default',
            response: '{"success":false,"error":"File size exceeds maximum limit"}',
            error: true,
            sample: true
        }
    ];

    return (
        <div className="logs-page">
            <div className="logs-tabs">
                <button
                    className={`tab-btn ${activeTab === 'Tools' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Tools')}
                >
                    Tools
                </button>
                <button
                    className={`tab-btn ${activeTab === 'Triggers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Triggers')}
                >
                    Triggers
                </button>
            </div>

            <div className="logs-filter-bar">
                <div className="add-filters-container">
                    <Filter size={16} className="filter-icon" />
                    <input
                        type="text"
                        placeholder="Add filters"
                        className="filter-input"
                    />
                </div>

                <div className="time-range-select">
                    <Calendar size={16} />
                    <span>All time</span>
                </div>

                <button className="refresh-btn">
                    <RefreshCw size={16} />
                </button>
            </div>

            <div className="logs-table-container">
                <table className="logs-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Toolkit</th>
                            <th>Name</th>
                            <th>Duration</th>
                            <th>User</th>
                            <th>Response</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockLogs.map((log, index) => (
                            <tr key={index} className={log.error ? 'log-row-error' : ''}>
                                <td>
                                    <div className="timestamp-cell">
                                        {log.error && <div className="status-dot" />}
                                        {log.timestamp}
                                    </div>
                                </td>
                                <td>
                                    <div className="toolkit-cell">
                                        <span className="toolkit-icon">{log.icon}</span>
                                        {log.toolkit}
                                    </div>
                                </td>
                                <td>
                                    <div className="log-name-cell">
                                        {log.name}
                                        {log.sample && <span className="sample-badge">sample</span>}
                                    </div>
                                </td>
                                <td>{log.duration}</td>
                                <td>{log.user}</td>
                                <td>
                                    <div className="response-cell" title={log.response}>
                                        {log.response}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Logs;
