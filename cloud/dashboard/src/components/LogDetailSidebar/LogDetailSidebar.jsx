import React from 'react';
import { X, Github, ChevronDown, Clock, Package } from 'lucide-react';
import './LogDetailSidebar.css';

const LogDetailSidebar = ({ log, onClose }) => {
    if (!log) return null;

    // Helper to format JSON for display
    const renderJSON = (data) => {
        try {
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            return JSON.stringify(parsed, null, 2);
        } catch (e) {
            return data;
        }
    };

    return (
        <div className={`log-detail-sidebar ${log ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="breadcrumb">
                    <Github size={18} />
                    <span className="breadcrumb-main">GITHUB</span>
                    <span className="breadcrumb-separator">›</span>
                    <span className="breadcrumb-sub">GITHUB_CREATE_ISSUE</span>
                </div>
                <button className="close-btn" onClick={onClose}>
                    <X size={20} />
                </button>
            </div>

            <div className="sidebar-content">
                <div className="meta-card">
                    <div className="card-header">
                        <div className="log-id">
                            <Package size={18} />
                            <span>demo-log-tool-success-1</span>
                        </div>
                        <div className="log-time">
                            <Clock size={14} />
                            <span>Apr 11, 58086 09:57:49</span>
                        </div>
                    </div>

                    <div className="card-body">
                        <table className="meta-table">
                            <tbody>
                                <tr>
                                    <td>TOOLKIT</td>
                                    <td>
                                        <div className="toolkit-val">
                                            <Github size={14} />
                                            <span>{log.toolkit}</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>TOOL</td>
                                    <td>
                                        <div className="tool-val">
                                            <Github size={14} />
                                            <span>{log.name}</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>DURATION</td>
                                    <td>{log.duration}</td>
                                </tr>
                                <tr>
                                    <td>USER ID</td>
                                    <td>{log.user}</td>
                                </tr>
                                <tr>
                                    <td>CONNECTION ID</td>
                                    <td>demo-account-1</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="data-section">
                    <div className="section-title">REQUEST</div>
                    <div className="json-container">
                        <div className="json-header">
                            <span className="items-count">{"{ 1 Items ⌄ }"}</span>
                        </div>
                        <pre className="json-block">
                            {renderJSON({ action_name: log.name })}
                        </pre>
                    </div>
                </div>

                <div className="data-section">
                    <div className="section-title">RESPONSE</div>
                    <div className="json-container">
                        <div className="json-header">
                            <span className="items-count">{"{ 2 Items ⌄ }"}</span>
                        </div>
                        <pre className="json-block">
                            {renderJSON(log.response)}
                        </pre>
                    </div>
                </div>
            </div>

            <div className="sidebar-footer">
                <button className="chat-bubble-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2 22l5-1.338c1.47.851 3.179 1.338 5 1.338 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default LogDetailSidebar;
