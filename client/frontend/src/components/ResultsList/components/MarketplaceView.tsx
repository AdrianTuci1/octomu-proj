import React from 'react';
import * as LucideIcons from 'lucide-react';
import { IntegrationCard } from './IntegrationCard';
import { IMCPRegistryItem } from '../../../domain/types';
import './MarketplaceView.css';

interface MarketplaceViewProps {
    registry: IMCPRegistryItem[];
    selectedIntegrationId: string | null;
    setSelectedIntegrationId: (id: string | null) => void;
    connectExtension: (id: string) => void;
    tools: Record<string, any[]>;
    renderIcon: (iconName?: string) => React.ReactNode;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
    registry,
    selectedIntegrationId,
    setSelectedIntegrationId,
    connectExtension,
    tools,
    renderIcon
}) => {
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
                    {registry.map((app) => (
                        <IntegrationCard
                            key={app.id}
                            app={app}
                            selectedIntegrationId={selectedIntegrationId}
                            setSelectedIntegrationId={setSelectedIntegrationId}
                            renderIcon={renderIcon}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
