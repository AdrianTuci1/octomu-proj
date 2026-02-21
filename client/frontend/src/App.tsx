import React, { useEffect, useRef } from 'react';
import { useStore } from './store/useStore';
import { TopBar } from './components/TopBar';
import { ResultsList } from './components/ResultsList';
import { Footer } from './components/Footer';
import './style.css';
import './App.css';

function App() {
    const { isChatMode, currentView, fetchRegistry } = useStore();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchRegistry();
    }, [fetchRegistry]);

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
}

export default App;
