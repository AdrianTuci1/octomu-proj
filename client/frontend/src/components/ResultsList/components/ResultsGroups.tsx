import React from 'react';
import { IResultItem } from '../../../domain/types';
import { HistoryView } from './HistoryView';
import { MessageSquare } from 'lucide-react';
import './HistoryView.css';

interface ResultsGroupsProps {
    sections: Record<string, IResultItem[]>;
    filteredResults: IResultItem[];
    selectedIndex: number;
    typingQuery: string;
    chatSessions: any[];
    handleResultSelection: (item: IResultItem) => void;
    selectChat: (id: string) => void;
    renderIcon: (item: IResultItem) => React.ReactNode;
}

export const ResultsGroups: React.FC<ResultsGroupsProps> = (props) => {
    const {
        filteredResults,
        selectedIndex,
        typingQuery,
        chatSessions,
        handleResultSelection,
        selectChat,
        renderIcon,
    } = props;

    // Dispatch to HistoryView if searching
    if (typingQuery.trim() !== '') {
        return <HistoryView {...props} />;
    }

    // Welcome item is now prepended to filteredResults at index 0 in the parent
    const welcomeWalkthrough = filteredResults.find(r => r.id === 'welcome-walkthrough');

    // Specific initial suggestions as requested by user
    const suggestionIds = ['ext-google', 'ai-improve', 'util-calculator', 'util-snippets', 'mcp-marketplace'];
    const suggestions = suggestionIds
        .map(id => filteredResults.find(r => r.id === id))
        .filter((r): r is IResultItem => !!r);

    // Apps: items from the 'Apps' category (Finder applications)
    const apps = filteredResults.filter(item => item.category === 'Apps');

    // Commands: all items except those already in suggestions, apps, or the welcome item
    const commands = filteredResults.filter(item =>
        !suggestionIds.includes(item.id) &&
        item.category !== 'Apps' &&
        item.id !== 'welcome-walkthrough'
    );

    const renderItem = (item: IResultItem) => {
        // In grouped view, the selectedIndex refers to the flattened filteredResults.
        const globalIndex = filteredResults.indexOf(item);
        const isActive = globalIndex !== -1 && globalIndex === selectedIndex;

        return (
            <div
                key={item.id}
                className={`list-item result-item ${isActive ? 'active' : ''}`}
                onClick={() => handleResultSelection(item)}
            >
                <div className="item-icon" data-category={item.category}>
                    {renderIcon(item)}
                </div>
                <div className="item-content">
                    <div className="item-main">
                        <span className="item-label">{item.label}</span>
                        {item.mention && <span className="item-mention">{item.mention}</span>}
                    </div>
                </div>
                <div className="item-accessory">{item.accessory}</div>
            </div>
        );
    };

    return (
        <div className="scroll-content">
            <div className="sections-container">
                {/* 1. Welcome to Octomus */}
                {welcomeWalkthrough && (
                    <div className="result-section">
                        <div className="section-title">Welcome to Octomus</div>
                        {renderItem(welcomeWalkthrough)}
                    </div>
                )}

                {/* 2. Suggestions */}
                {suggestions.length > 0 && (
                    <div className="result-section">
                        <div className="section-title">Suggestions</div>
                        {suggestions.map(item => renderItem(item))}
                    </div>
                )}

                {/* 3. Commands */}
                {commands.length > 0 && (
                    <div className="result-section">
                        <div className="section-title">Commands</div>
                        {commands.map(item => renderItem(item))}
                    </div>
                )}

                {/* 4. Apps */}
                {apps.length > 0 && (
                    <div className="result-section">
                        <div className="section-title">Apps</div>
                        {apps.map(item => renderItem(item))}
                    </div>
                )}

                {/* 5. Recent Conversations */}
                {chatSessions.length > 0 && (
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
            </div>
        </div>
    );
};
