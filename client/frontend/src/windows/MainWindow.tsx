import React, { useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { TopBar } from '../components/TopBar';
import { ResultsList } from '../components/ResultsList';
import { Footer } from '../components/Footer';

export const MainWindow: React.FC = () => {
    const isChatMode = useStore(state => state.ui?.isChatMode ?? false);
    const currentView = useStore(state => state.ui?.currentView ?? 'chatHistory');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, [currentView]);

    return (
        <div className={`app-container ${isChatMode ? 'chat-mode' : ''}`}>
            <TopBar inputRef={inputRef} />
            <ResultsList />
            <Footer />
        </div>
    );
};
