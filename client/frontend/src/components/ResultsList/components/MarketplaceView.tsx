import React from 'react';
import * as LucideIcons from 'lucide-react';
import { IntegrationCard } from './IntegrationCard';
import { useStore } from '../../../store/useStore';
import './MarketplaceView.css';

export const MarketplaceView: React.FC = () => {
    const { core } = useStore();
    const { registry } = useStore(state => state.marketplace);
    const { selectedIndex, selectedIntegrationId } = useStore(state => state.ui);

    return (
        <div className="scroll-content integrations-view">
            <div className="section-title">Integrations Marketplace</div>
            {registry.length === 0 ? (
                <div className="empty-state">
                    <LucideIcons.CloudOff size={24} className="empty-icon" />
                    <p>No integrations available in the directory.</p>
                </div>
            ) : (
                <div className="integrations-grid">
                    {registry.map((app, index) => (
                        <IntegrationCard
                            key={app.id}
                            app={app}
                            isKeyboardFocused={index === selectedIndex}
                            selectedIntegrationId={selectedIntegrationId}
                            setSelectedIntegrationId={(id) => {
                                core.navigation.setSelectedIntegrationId(id);
                                if (id) core.navigation.setCurrentView('mcpDetail');
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
