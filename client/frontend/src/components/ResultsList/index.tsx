import React, { useEffect, useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import { useStore } from '../../store/useStore';
import { IResultItem } from '../../domain/types';
import { DEFAULT_RESULTS } from '../../store/slices/resultsData';
import { ChatView } from './components/ChatView';
import { HistoryView } from './components/HistoryView';
import { MarketplaceView } from './components/MarketplaceView';
import { MarketplaceDetailView } from './components/MarketplaceDetailView';
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
        executeCommand,
        rejectCommand,
        selectChat,
        connectExtension,
        selectedIntegrationId,
        setSelectedIntegrationId,
        handleResultSelection,
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

    const activeResults: IResultItem[] = results.length > 0 ? results : DEFAULT_RESULTS;

    const filteredResults = typingQuery.trim() === ''
        ? activeResults
        : activeResults.filter((r: IResultItem) =>
            r.label.toLowerCase().includes(typingQuery.toLowerCase()) ||
            r.category.toLowerCase().includes(typingQuery.toLowerCase())
        );

    const sections: Record<string, IResultItem[]> = {};
    filteredResults.forEach((item: IResultItem) => {
        if (!sections[item.category]) sections[item.category] = [];
        sections[item.category].push(item);
    });

    const renderIcon = (iconName?: string) => {
        const icon = iconName ? (LucideIcons as any)[iconName] : null;
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
                <HistoryView
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
                    connectExtension={connectExtension}
                    fetchTools={fetchTools}
                    renderIcon={renderIcon}
                    installProgress={installProgress}
                />
            )}
        </div>
    );
};
