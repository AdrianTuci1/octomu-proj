import React, { useEffect, useRef, useState } from 'react';
import { useStore } from './store/useStore';
import { TopBar } from './components/TopBar';
import { ResultsList } from './components/ResultsList';
import { Footer } from './components/Footer';
import { SettingsView } from './components/Settings/SettingsView';
import { OnboardingView } from './components/Onboarding/OnboardingView';
import { EventsOn } from '../wailsjs/runtime/runtime';
import './style.css';
import './App.css';

type PanelType = 'none' | 'settings' | 'onboarding';

function App() {
    const isChatMode = useStore(state => state.ui?.isChatMode ?? false);
    const currentView = useStore(state => state.ui?.currentView ?? 'chatHistory');
    const { core } = useStore();
    const inputRef = useRef<HTMLInputElement>(null);
    const [activePanel, setActivePanel] = useState<PanelType>('none');

    useEffect(() => {
        core.marketplace.initialize();
    }, [core.marketplace]);

    useEffect(() => {
        inputRef.current?.focus();
    }, [currentView]);

    // Listen for panel open/close events from Go backend
    useEffect(() => {
        const unsubscribeOpen = EventsOn('octomus:open-panel', (panelType: string) => {
            setActivePanel(panelType as PanelType);
        });

        const unsubscribeClose = EventsOn('octomus:close-panel', () => {
            setActivePanel('none');
        });

        return () => {
            unsubscribeOpen();
            unsubscribeClose();
        };
    }, []);

    // Render panel view if active
    if (activePanel === 'settings') {
        return (
            <div className="panel-container">
                <SettingsView />
            </div>
        );
    }

    if (activePanel === 'onboarding') {
        return (
            <div className="panel-container">
                <OnboardingView />
            </div>
        );
    }

    // Render main launcher
    return (
        <div className={`app-container ${isChatMode ? 'chat-mode' : ''}`}>
            <TopBar inputRef={inputRef} />
            <ResultsList />
            <Footer />
        </div>
    );
}

export default App;
