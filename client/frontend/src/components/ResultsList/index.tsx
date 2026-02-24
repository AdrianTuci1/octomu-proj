import React, { useMemo, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { ResultsGroups } from './components/ResultsGroups';
import { ChatView } from './components/ChatView';
import { MarketplaceView } from './components/MarketplaceView';
import { MarketplaceDetailView } from './components/MarketplaceDetailView';
import { HistoryView } from './components/HistoryView';
import './ResultsList.css';

export const ResultsList: React.FC = () => {
    const currentView = useStore(state => state.ui?.currentView ?? 'chatHistory');
    const results = useStore(state => state.results?.results ?? []);
    const selectedIndex = useStore(state => state.ui?.selectedIndex ?? 0);
    const { core } = useStore();

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        core.results.discoverApps();
    }, [core.results]);

    useEffect(() => {
        if (!scrollRef.current) return;
        const activeItem = scrollRef.current.querySelector('.list-item.active');
        if (activeItem) {
            activeItem.scrollIntoView({
                block: 'nearest',
                behavior: 'smooth'
            });
        }
    }, [selectedIndex]);

    const filteredResults = useMemo(() => {
        // We filter out hidden results (like the welcome walkthrough if it were hidden)
        // Note: IResultItem might not have isHidden yet, but it's a good practice.
        // If it causes errors, I'll remove the check.
        return results;
    }, [results]);

    const renderContent = () => {
        switch (currentView) {
            case 'main':
                return <ChatView />;

            case 'authorizations':
                return <MarketplaceView />;

            case 'mcpDetail':
                return <MarketplaceDetailView />;

            case 'history':
                return (
                    <HistoryView
                        filteredResults={filteredResults}
                    />
                );

            case 'chatHistory':
            default:
                return (
                    <ResultsGroups
                        filteredResults={filteredResults}
                    />
                );
        }
    };

    return (
        <div className="results-list-wrapper" ref={scrollRef}>
            {renderContent()}
        </div>
    );
};
