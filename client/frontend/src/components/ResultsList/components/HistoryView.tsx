import React, { useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { MessageSquare } from 'lucide-react';
import { IResultItem } from '../../../domain/types';
import { useStore } from '../../../store/useStore';
import { ResultIcon } from '../../shared/ResultIcon';
import './HistoryView.css';

interface HistoryViewProps {
    filteredResults: IResultItem[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ filteredResults }) => {
    const { core } = useStore();
    const { selectedIndex, typingQuery } = useStore(state => state.ui);
    const { chatSessions } = useStore(state => state.chat);

    // Filter out welcome walkthrough from history view
    const historyResults = useMemo(() => {
        return filteredResults.filter(item => item.id !== 'welcome-walkthrough');
    }, [filteredResults]);

    const hasResults = historyResults.length > 0;
    const hasChatSessions = typingQuery.trim() === '' && chatSessions.length > 0;
    const showEmptyState = !hasResults && !hasChatSessions;

    return (
        <div className="scroll-content">
            {hasResults && (
                <div className="sections-container">
                    <div className="result-section">
                        <div className="section-title">Results</div>
                        {historyResults.map((item) => {
                            const globalIndex = historyResults.indexOf(item);
                            return (
                                <div
                                    key={item.id}
                                    className={`list-item result-item ${selectedIndex === globalIndex ? 'active' : ''}`}
                                    onClick={() => core.results.handleResultSelection(item)}
                                >
                                    <div className="item-icon" data-category={item.category}>
                                        <ResultIcon item={item} />
                                    </div>
                                    <div className="item-content">
                                        <div className="item-main">
                                            <span className="item-label">{item.label}</span>
                                            {item.mention && <span className="item-mention">{item.mention}</span>}
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
                </div>
            )}

            {hasChatSessions && (
                <div className="chat-history-list">
                    <div className="section-title">Recent Conversations</div>
                    {chatSessions.map((session, index) => {
                        const historyIndex = historyResults.length + index;
                        return (
                            <div
                                key={session.id}
                                className={`list-item chat-session-item ${selectedIndex === historyIndex ? 'active' : ''}`}
                                onClick={() => core.chat.selectChat(session.id)}
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

            {showEmptyState && (
                <div className="empty-state">
                    <LucideIcons.Search size={24} className="empty-icon" />
                    <p>No matches found for "{typingQuery}"</p>
                </div>
            )}
        </div>
    );
};
