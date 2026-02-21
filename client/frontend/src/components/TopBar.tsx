import React from 'react';
import { ChevronLeft, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { MentionsOverlay } from './MentionsOverlay';
import './TopBar.css';

interface TopBarProps {
    inputRef: React.RefObject<HTMLInputElement>;
}

export const TopBar: React.FC<TopBarProps> = ({ inputRef }) => {
    const {
        currentView,
        isChatMode,
        showMentions,
        activeMentions,
        extensions, // Added
        selectedIndex, // Added
        query,
        suggestion,
        setQuery,
        removeMention,
        handleChatSubmit,
        goBack,
        toggleChat,
        moveSelectionUp,
        moveSelectionDown
    } = useStore();

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
            setQuery(query + suggestion);
        }
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && query === '' && activeMentions.length > 0) {
            removeMention(activeMentions[activeMentions.length - 1].id);
            return;
        }

        if (e.key === 'Tab') {
            e.preventDefault();
            toggleChat();
            return;
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            moveSelectionUp();
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            moveSelectionDown();
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
            goBack();
            return;
        }

        if (e.key === 'Enter') {
            handleChatSubmit();
        }
    };

    return (
        <div className={`top-bar ${isChatMode ? 'chat-mode' : ''}`}>
            {currentView !== 'chatHistory' && (
                <button className="back-button" onClick={goBack}>
                    <ChevronLeft size={18} />
                </button>
            )}
            <div className="search-container">
                <div className="input-with-chips">
                    {isChatMode && activeMentions.map(m => (
                        <div key={m.id} className="mention-chip">
                            <span className="chip-at">@</span>
                            <span className="chip-label">{m.handle}</span>
                            <button className="chip-remove" onClick={() => removeMention(m.id)}>
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
                            placeholder={isChatMode ? (activeMentions.length > 0 || isTypingMention ? "" : "Ask Octomus anything...") : "Search for apps and commands..."}
                            value={isTypingMention ? lastWord : query} // Keep typing visible if needed, or hide it
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={onKeyDown}
                            style={isTypingMention ? { opacity: 0, position: 'absolute', width: '1px' } : {}}
                        />
                    </div>
                </div>

                {!isChatMode && (
                    <div className="tab-hint-outer" onClick={toggleChat}>
                        <span className="hint-text">Ask AI</span>
                        <div className="hint-key">Tab</div>
                    </div>
                )}
            </div>
        </div>
    );
};
