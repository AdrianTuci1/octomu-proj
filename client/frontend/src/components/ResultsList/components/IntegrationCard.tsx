import React from 'react';
import { IMCPRegistryItem } from '../../../domain/types';
import { ResultIcon } from '../../shared/ResultIcon';
import './IntegrationCard.css';

interface IntegrationCardProps {
    app: IMCPRegistryItem;
    isKeyboardFocused?: boolean;
    selectedIntegrationId: string | null;
    setSelectedIntegrationId: (id: string | null) => void;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
    app,
    isKeyboardFocused = false,
    selectedIntegrationId,
    setSelectedIntegrationId
}) => {
    const isSelected = selectedIntegrationId === app.id;

    return (
        <div
            className={`integration-card ${isSelected ? 'selected' : ''} ${isKeyboardFocused ? 'keyboard-focused' : ''}`}
            onClick={() => setSelectedIntegrationId(app.id)}
        >
            <div className="integration-header">
                <div className="integration-icon">
                    {app.image_url ? (
                        <img src={`http://localhost:8081${app.image_url}`} alt={app.label} className="app-image" />
                    ) : (
                        <ResultIcon item={app} />
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

