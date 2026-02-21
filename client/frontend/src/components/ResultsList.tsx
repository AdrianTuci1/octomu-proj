import React from 'react';
import * as LucideIcons from 'lucide-react';
import { MessageSquare, Layout } from 'lucide-react';
import { useStore } from '../store/useStore';
import { InterpreterBlock } from './InterpreterBlock';
import { IResultItem } from '../domain/types';
import './ResultsList.css';

export const ResultsList: React.FC = () => {
    const {
        currentView,
        conversation,
        chatSessions,
        results,
        typingQuery,
        selectedIndex,
        pendingCommand,
        registry,
        tools, // Added
        executeCommand,
        rejectCommand,
        selectChat,
        setPendingCommand,
        connectExtension
    } = useStore();

    const filteredResults = results.filter(r =>
        r.label.toLowerCase().includes(typingQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(typingQuery.toLowerCase())
    );

    const sections: Record<string, IResultItem[]> = {};
    filteredResults.forEach(item => {
        if (!sections[item.category]) sections[item.category] = [];
        sections[item.category].push(item);
    });

    const renderIcon = (iconName?: string) => {
        const icon = iconName ? (LucideIcons as any)[iconName] : null;
        if (icon) {
            const IconComponent = icon;
            return <IconComponent size={14} />;
        }
        return <LucideIcons.Command size={14} />;
    };

    return (
        <div className="results-list">
            {currentView === 'main' && (
                <div className="chat-view">
                    {conversation.length === 0 && !pendingCommand ? (
                        <div className="chat-empty-state">
                            <div className="empty-content">
                                <div className="empty-icon-wrapper">
                                    <Layout size={32} className="pulsing-icon" />
                                </div>
                                <h3 className="empty-title">Conversations & Tools</h3>
                                <p className="empty-text">
                                    Manage and continue your conversations here. <br />
                                    Mention specific tools with <span className="highlight">@</span> to boost accuracy and unlock specialized capabilities.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="messages-container">
                            {conversation.map(msg => (
                                <div key={msg.id} className={`message ${msg.type}`}>
                                    <div className="msg-bubble">{msg.content}</div>
                                    <div className="msg-meta">{msg.timestamp}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {pendingCommand && (
                        <div className="pending-area">
                            <InterpreterBlock
                                pendingCommand={pendingCommand}
                                onApprove={executeCommand}
                                onReject={rejectCommand}
                            />
                        </div>
                    )}
                </div>
            )}

            {currentView === 'chatHistory' && (
                <div className="scroll-content">
                    <div className="sections-container">
                        {Object.entries(sections).map(([category, items]) => (
                            <div key={category} className="result-section">
                                <div className="section-title">{category}</div>
                                {items.map((item) => {
                                    const globalIndex = filteredResults.indexOf(item);
                                    return (
                                        <div
                                            key={item.id}
                                            className={`list-item result-item ${selectedIndex === globalIndex ? 'active' : ''}`}
                                            onClick={() => {
                                                if (item.command) setPendingCommand({ id: Date.now().toString(), command: item.command });
                                            }}
                                        >
                                            <div className="item-icon">
                                                {renderIcon(item.icon)}
                                            </div>
                                            <div className="item-content">
                                                <div className="item-main">
                                                    <span className="item-label">{item.label}</span>
                                                    {item.mention && <span className="item-mention">{item.mention}</span>}
                                                    {item.subtitle && <span className="item-subtitle-inline">{item.subtitle}</span>}
                                                </div>
                                                {item.type === 'walkthrough' && item.progress !== undefined && (
                                                    <div className="progress-container">
                                                        <div className="progress-bar" style={{ width: `${item.progress}%` }} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="item-accessory">{item.accessory}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {typingQuery.trim() === '' && chatSessions.length > 0 && (
                        <div className="chat-history-list">
                            <div className="section-title">Recent Conversations</div>
                            {chatSessions.map((session, index) => {
                                const historyIndex = filteredResults.length + index;
                                return (
                                    <div
                                        key={session.id}
                                        className={`list-item chat-session-item ${selectedIndex === historyIndex ? 'active' : ''}`}
                                        onClick={() => selectChat(session.id)}
                                    >
                                        <div className="item-icon">
                                            <MessageSquare size={14} />
                                        </div>
                                        <div className="item-content">
                                            <div className="item-main">
                                                <span className="item-label">{session.title}</span>
                                            </div>
                                            <div className="item-subtitle">{session.lastMessage}</div>
                                        </div>
                                        <div className="item-accessory">{session.timestamp}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {filteredResults.length === 0 && chatSessions.length === 0 && (
                        <div className="empty-state">
                            <LucideIcons.Search size={24} className="empty-icon" />
                            <p>No matches found for "{typingQuery}"</p>
                        </div>
                    )}
                </div>
            )}

            {currentView === 'authorizations' && (
                <div className="scroll-content integrations-view">
                    <div className="section-title">Integrations Marketplace</div>
                    <div className="integrations-grid">
                        {registry.map((app) => (
                            <div key={app.id} className="integration-card">
                                <div className="integration-header">
                                    <div className="integration-icon">
                                        {app.image_url ? (
                                            <img src={`http://localhost:8080${app.image_url}`} alt={app.label} className="app-image" />
                                        ) : (
                                            renderIcon(app.icon)
                                        )}
                                    </div>
                                    <div className="integration-info">
                                        <div className="integration-label">{app.label}</div>
                                        <div className="integration-type">
                                            {app.type === 'cloud' ? 'Cloud' : 'Local Binary'}
                                        </div>
                                    </div>
                                    <div className={`status-badge ${app.status}`}>
                                        {app.status}
                                    </div>
                                </div>
                                <div className="integration-desc">{app.description}</div>

                                {app.status === 'connected' && tools[app.id] && (
                                    <div className="integration-tools">
                                        <div className="tools-label">Available Tools:</div>
                                        <div className="tools-list">
                                            {tools[app.id].map(tool => (
                                                <div key={tool.name} className="tool-tag">
                                                    <LucideIcons.Wrench size={10} />
                                                    {tool.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="integration-actions">
                                    {app.status === 'disconnected' && (
                                        <button
                                            className="btn-primary"
                                            onClick={() => connectExtension(app.id)}
                                        >
                                            {app.type === 'cloud' ? 'Authorize' : 'Connect'}
                                        </button>
                                    )}
                                    {app.status === 'installing' && (
                                        <div className="install-progress">
                                            <div className="progress-spinner" />
                                            <span>Preparing...</span>
                                        </div>
                                    )}
                                    {app.status === 'connected' && (
                                        <div className="connected-badge">
                                            <LucideIcons.Check size={12} />
                                            Connected
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
