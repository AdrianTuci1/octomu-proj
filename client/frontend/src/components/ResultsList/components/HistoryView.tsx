import React from 'react';
import * as LucideIcons from 'lucide-react';
import { MessageSquare } from 'lucide-react';
import { IResultItem, IChatSession } from '../../../domain/types';
import './HistoryView.css';

interface HistoryViewProps {
    sections: Record<string, IResultItem[]>;
    filteredResults: IResultItem[];
    selectedIndex: number;
    typingQuery: string;
    chatSessions: IChatSession[];
    handleResultSelection: (item: IResultItem) => void;
    selectChat: (id: string) => void;
    renderIcon: (iconName?: string) => React.ReactNode;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
    sections,
    filteredResults,
    selectedIndex,
    typingQuery,
    chatSessions,
    handleResultSelection,
    selectChat,
    renderIcon
}) => {
    return (
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
                                    onClick={() => handleResultSelection(item)}
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
    );
};
