import React, { useMemo } from 'react';
import { IResultItem } from '../../../domain/types';
import { HistoryView } from './HistoryView';
import { MessageSquare } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import { ResultIcon } from '../../shared/ResultIcon';
import './HistoryView.css';

interface ResultsGroupsProps {
    filteredResults: IResultItem[];
}

export const ResultsGroups: React.FC<ResultsGroupsProps> = ({ filteredResults }) => {
    const { core } = useStore();
    const { selectedIndex, typingQuery } = useStore(state => state.ui);
    const { chatSessions } = useStore(state => state.chat);

    // Dispatch to HistoryView if searching
    if (typingQuery.trim() !== '') {
        return <HistoryView filteredResults={filteredResults} />;
    }

    // Build a flat list of selectable items (excluding welcome walkthrough for navigation)
    // Welcome walkthrough is visible but not selectable via keyboard navigation
    const welcomeWalkthrough = filteredResults.find(r => r.id === 'welcome-walkthrough');

    // Specific initial suggestions as requested by user
    const suggestionIds = ['ext-google', 'ai-improve', 'util-calculator', 'util-snippets', 'mcp-marketplace'];
    const suggestions = suggestionIds
        .map(id => filteredResults.find(r => r.id === id))
        .filter((r): r is IResultItem => !!r);

    // Integrations: items with type 'ai_extension' (extensions, AI commands, etc.)
    const integrations = filteredResults.filter(item =>
        item.type === 'ai_extension' &&
        !suggestionIds.includes(item.id) &&
        item.id !== 'welcome-walkthrough'
    );

    // Apps: items from the 'Apps' category (Finder applications)
    const apps = filteredResults.filter(item => item.category === 'Apps');

    // Commands: all items except those already in suggestions, integrations, apps, or the welcome item
    const commands = filteredResults.filter(item =>
        !suggestionIds.includes(item.id) &&
        item.type !== 'ai_extension' &&
        item.category !== 'Apps' &&
        item.id !== 'welcome-walkthrough'
    );

    // Create flat list for selection (excluding welcome walkthrough)
    const selectableItems = useMemo(() => {
        return [
            ...suggestions,
            ...integrations,
            ...commands,
            ...apps
        ];
    }, [suggestions, integrations, commands, apps]);

    const getItemIndex = (item: IResultItem): number => {
        return selectableItems.findIndex(r => r.id === item.id);
    };

    const renderItem = (item: IResultItem, isWelcomeWalkthrough = false) => {
        // For welcome walkthrough, it's always first but not selectable via keyboard
        // For other items, use the selectableItems index
        const globalIndex = isWelcomeWalkthrough ? -1 : getItemIndex(item);
        const isActive = !isWelcomeWalkthrough && globalIndex !== -1 && globalIndex === selectedIndex;

        return (
            <div
                key={item.id}
                className={`list-item result-item ${isActive ? 'active' : ''}`}
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

                {/* 3. Integrations */}
                {integrations.length > 0 && (
                    <div className="result-section">
                        <div className="section-title">Integrations</div>
                        {integrations.map(item => renderItem(item))}
                    </div>
                )}

                {/* 4. Commands */}
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
                            const historyIndex = selectableItems.length + index;
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
            </div>
        </div>
    );
};
