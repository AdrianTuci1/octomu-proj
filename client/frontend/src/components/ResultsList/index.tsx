import React, { useEffect, useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import { useStore } from '../../store/useStore';
import { IResultItem, IChatSession, IMCPRegistryItem } from '../../domain/types';
import { DEFAULT_RESULTS } from '../../store/slices/resultsData';
import { ChatView } from './components/ChatView';
import { ResultsGroups } from './components/ResultsGroups';
import { MarketplaceView } from './components/MarketplaceView';
import { MarketplaceDetailView } from './components/MarketplaceDetailView';
import { SettingsView } from '../Settings/SettingsView';

import './ResultsList.css';

export const ResultsList: React.FC = () => {
    const {
        currentView,
        conversation,
        chatSessions,
        results,
        typingQuery,
        selectedIndex,
        pendingCommand,
        registry,
        tools,
        fetchingTools,
        toolFetchErrors,
        executeCommand,
        rejectCommand,
        selectChat,
        connectExtension,
        disconnectExtension,
        toggleExtension,
        selectedIntegrationId,
        setSelectedIntegrationId,
        handleResultSelection,
        discoverApps,
        fetchTools,
        setCurrentView,
        allowTool,
        installProgress
    } = useStore();

    const scrollRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        discoverApps();
    }, [discoverApps]);

    const activeResults: IResultItem[] = results.length > 0 ? results : DEFAULT_RESULTS;

    let filteredResults = typingQuery.trim() === ''
        ? [
            {
                id: 'welcome-walkthrough',
                label: 'Welcome to Octomus',
                category: 'Welcome',
                type: 'walkthrough',
                progress: 10,
                icon: 'Zap',
                accessory: 'Getting Started'
            } as IResultItem,
            ...activeResults
        ]
        : activeResults.filter((r: IResultItem) =>
            r.label.toLowerCase().includes(typingQuery.toLowerCase()) ||
            r.category.toLowerCase().includes(typingQuery.toLowerCase()) ||
            (r.mention && r.mention.toLowerCase().includes(typingQuery.toLowerCase()))
        );

    // If searching, enforce specific rules
    if (typingQuery.trim() !== '') {
        const genuineMatches = activeResults.filter((r: IResultItem) =>
            r.label.toLowerCase().includes(typingQuery.toLowerCase()) ||
            r.category.toLowerCase().includes(typingQuery.toLowerCase()) ||
            (r.mention && r.mention.toLowerCase().includes(typingQuery.toLowerCase()))
        );

        const searchFilesItem = activeResults.find(r => r.id === 'util-search-files');

        if (genuineMatches.length > 0) {
            // Actual matches exist: show them first
            filteredResults = genuineMatches;
            // Add Search Files at the end if it's not already there (unless user wants it strictly pinned?)
            // User said: "search files apare doar daca rezultatul nu exista"
            // I'll take it as "if genuine results exist, Search Files is NOT at the top".
            if (searchFilesItem && !filteredResults.find(r => r.id === searchFilesItem.id)) {
                filteredResults.push(searchFilesItem);
            }
        } else {
            // No matches found: "Search Files" should be first
            filteredResults = searchFilesItem ? [searchFilesItem] : [];
        }

        // Fill with activeResults if too short to avoid empty list
        if (filteredResults.length < 5) {
            const fillers = activeResults
                .filter(r => !filteredResults.find(fr => fr.id === r.id))
                .slice(0, 10 - filteredResults.length);
            filteredResults = [...filteredResults, ...fillers];
        }
    }

    const sections: Record<string, IResultItem[]> = {};
    filteredResults.forEach((item: IResultItem) => {
        if (!sections[item.category]) sections[item.category] = [];
        sections[item.category].push(item);
    });

    const renderIcon = (item: IResultItem | IMCPRegistryItem) => {
        if ('iconBase64' in item && item.iconBase64) {
            return <img src={`data: image / png; base64, ${item.iconBase64} `} alt="" style={{ width: 14, height: 14, objectFit: 'contain' }} />;
        }
        const icon = item.icon ? (LucideIcons as any)[item.icon] : null;
        if (icon) {
            const IconComponent = icon;
            return <IconComponent size={14} />;
        }
        return <LucideIcons.Command size={14} />;
    };

    return (
        <div className="results-list" ref={scrollRef}>
            {currentView === 'main' && (
                <ChatView
                    conversation={conversation}
                    pendingCommand={pendingCommand}
                    executeCommand={executeCommand}
                    rejectCommand={rejectCommand}
                    allowTool={allowTool}
                />
            )}

            {currentView === 'chatHistory' && (
                <ResultsGroups
                    sections={sections}
                    filteredResults={filteredResults}
                    selectedIndex={selectedIndex}
                    typingQuery={typingQuery}
                    chatSessions={chatSessions}
                    handleResultSelection={handleResultSelection}
                    selectChat={selectChat}
                    renderIcon={renderIcon}
                />
            )}

            {currentView === 'authorizations' && (
                <MarketplaceView
                    registry={registry}
                    selectedIndex={selectedIndex}
                    selectedIntegrationId={selectedIntegrationId}
                    setSelectedIntegrationId={(id) => {
                        setSelectedIntegrationId(id);
                        if (id) setCurrentView('mcpDetail');
                    }}
                    connectExtension={connectExtension}
                    tools={tools}
                    renderIcon={renderIcon}
                />
            )}

            {currentView === 'mcpDetail' && selectedIntegrationId && (
                <MarketplaceDetailView
                    mcp={registry.find(r => r.id === selectedIntegrationId) || {
                        id: selectedIntegrationId,
                        label: 'Loading...',
                        description: '',
                        icon: 'Package',
                        type: 'cloud',
                        status: 'disconnected'
                    } as any}
                    tools={tools[selectedIntegrationId] || []}
                    fetchingTools={fetchingTools}
                    toolFetchErrors={toolFetchErrors}
                    connectExtension={connectExtension}
                    disconnectExtension={disconnectExtension}
                    toggleExtension={toggleExtension}
                    fetchTools={fetchTools}
                    renderIcon={renderIcon}
                    installProgress={installProgress}
                />

            )}
            {currentView === 'settings' && <SettingsView />}
        </div>
    );
};
