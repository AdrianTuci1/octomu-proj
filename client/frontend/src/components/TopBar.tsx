import React from 'react';
import { ChevronLeft, X, RotateCcw } from 'lucide-react';
import { useStore } from '../store/useStore';
import { MentionsOverlay } from './MentionsOverlay';
import './TopBar.css';

interface TopBarProps {
    inputRef: React.RefObject<HTMLInputElement>;
}

export const TopBar: React.FC<TopBarProps> = ({ inputRef }) => {
    const { core } = useStore();
    const {
        currentView,
        isChatMode,
        showMentions,
        activeMentions,
        toolRecommendations,
        query,
        suggestion,
        selectedIndex
    } = useStore(state => state.ui);
    const { extensions } = useStore(state => state.command);

    // Determine if we are currently typing a mention trigger
    const lastWord = query.split(' ').pop() || '';
    const isTypingMention = isChatMode && lastWord.startsWith('@');

    // Find what should be shown inside the pending chip
    let selectedExtensionLabel = lastWord.slice(1);
    if (isTypingMention) {
        const filter = lastWord.slice(1).toLowerCase();
        const filteredExts = extensions.filter(ex =>
            ex.label.toLowerCase().includes(filter) ||
            ex.handle.toLowerCase().includes(filter)
        );
        if (filteredExts[selectedIndex]) {
            selectedExtensionLabel = filteredExts[selectedIndex].label;
        }
    }

    const acceptSuggestion = () => {
        if (suggestion) {
            core.navigation.setQuery(query + suggestion);
        }
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && query === '') {
            if (activeMentions.length > 0) {
                core.navigation.removeMention(activeMentions[activeMentions.length - 1].id);
            } else if (currentView !== 'chatHistory') {
                core.navigation.goBack();
            }
            return;
        }

        if (e.key === 'Tab') {
            e.preventDefault();
            core.navigation.toggleChat();
            return;
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            core.navigation.moveSelectionUp();
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            core.navigation.moveSelectionDown();
            return;
        }

        if (e.key === 'ArrowRight' || e.key === 'End') {
            if (suggestion && inputRef.current?.selectionStart === query.length) {
                e.preventDefault();
                acceptSuggestion();
            }
            return;
        }

        if (e.key === 'ArrowLeft' && currentView !== 'chatHistory') {
            core.navigation.goBack();
            return;
        }

        if (e.key === 'Enter') {
            if (isChatMode) {
                core.command.handleChatSubmit();
            } else {
                core.navigation.handleEnterSelection();
            }
        }
    };

    return (
        <div className={`top-bar ${isChatMode ? 'chat-mode' : ''}`}>
            {currentView !== 'chatHistory' && (
                <button className="back-button" onClick={() => core.navigation.goBack()}>
                    <ChevronLeft size={18} />
                </button>
            )}
            <div className="search-container">
                <div className="input-with-chips">
                    {isChatMode && activeMentions.map(m => (
                        <div key={m.id} className="mention-chip">
                            <span className="chip-at">@</span>
                            <span className="chip-label">{m.handle}</span>
                            <button className="chip-remove" onClick={() => core.navigation.removeMention(m.id)}>
                                <X size={10} />
                            </button>
                        </div>
                    ))}

                    {/* Visual "pending" chip when typing @ */}
                    {isTypingMention && (
                        <div className="mention-chip pending">
                            <span className="chip-at">@</span>
                            <span className="chip-label">{selectedExtensionLabel}</span>
                            <MentionsOverlay />
                        </div>
                    )}

                    <div className="input-wrapper">
                        <div className="suggestion-ghost">
                            <span className="query-text">{isTypingMention ? "" : query}</span>
                            <span className="suggestion-text">{suggestion}</span>
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            className="search-input"
                            placeholder={isChatMode ? "Ask Octomus anything..." : "Search for apps and commands..."}
                            value={isTypingMention ? lastWord : query}
                            onChange={(e) => core.navigation.setQuery(e.target.value)}
                            onKeyDown={onKeyDown}
                            style={isTypingMention ? { opacity: 0, position: 'absolute', width: '1px' } : {}}
                        />

                        {toolRecommendations.length > 0 && (
                            <div className="tool-recommendations">
                                {toolRecommendations.map((rec: string, i: number) => (
                                    <div
                                        key={i}
                                        className="recommendation-chip"
                                        onClick={() => core.navigation.setQuery(rec + ' ')}
                                    >
                                        {rec}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {!isChatMode ? (
                    <div className="tab-hint-outer" onClick={() => core.navigation.toggleChat()}>
                        <span className="hint-text">Ask AI</span>
                        <div className="hint-key">Tab</div>
                    </div>
                ) : (
                    <div className="tab-hint-outer active" onClick={() => core.navigation.toggleChat()}>
                        <span className="hint-text">Search</span>
                        <div className="hint-key">Tab</div>
                    </div>
                )}

            </div>
            {isChatMode && (
                <button
                    className="reset-chat-button"
                    onClick={() => core.chat.resetChat()}
                    title="Reset Conversation"
                >
                    <RotateCcw size={18} />
                </button>
            )}
        </div>
    );
};
