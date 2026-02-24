import { useCallback } from 'react';
import { AppCore } from '../features/core/domain/AppCore';

interface KeyboardNavigationOptions {
    core: AppCore;
    query: string;
    suggestion: string;
    isChatMode: boolean;
    activeMentions: Array<{ id: string }>;
    currentView: string;
    inputRef: React.RefObject<HTMLInputElement>;
}

export const useKeyboardNavigation = ({
    core,
    query,
    suggestion,
    isChatMode,
    activeMentions,
    currentView,
    inputRef
}: KeyboardNavigationOptions) => {
    const acceptSuggestion = useCallback(() => {
        if (suggestion) {
            core.navigation.setQuery(query + suggestion);
        }
    }, [core, query, suggestion]);

    const onKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && query === '') {
            if ((activeMentions?.length ?? 0) > 0) {
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
    }, [core, query, suggestion, isChatMode, activeMentions, currentView, inputRef, acceptSuggestion]);

    return { onKeyDown, acceptSuggestion };
};