import React from 'react';
import { IMCPRegistryItem } from '../../../domain/types';
import './IntegrationCard.css';

interface IntegrationCardProps {
    app: IMCPRegistryItem;
    selectedIntegrationId: string | null;
    setSelectedIntegrationId: (id: string | null) => void;
    renderIcon: (iconName?: string) => React.ReactNode;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
    app,
    selectedIntegrationId,
    setSelectedIntegrationId,
    renderIcon
}) => {
    const isSelected = selectedIntegrationId === app.id;

    return (
        <div
            className={`integration-card ${isSelected ? 'selected' : ''}`}
            onClick={() => setSelectedIntegrationId(app.id)}
        >
            <div className="integration-header">
                <div className="integration-icon">
                    {app.image_url ? (
                        <img src={`http://localhost:8081${app.image_url}`} alt={app.label} className="app-image" />
                    ) : (
                        renderIcon(app.icon)
                    )}
                </div>
                <div className="integration-info">
                    <span className="integration-label">{app.label}</span>
                    <span className="integration-type">
                        • {app.type === 'cloud' ? 'Cloud' : 'Local'}
                    </span>
                </div>
                <div className={`status-badge ${app.status}`}>
                    {app.status}
                </div>
            </div>
        </div>
    );
};
