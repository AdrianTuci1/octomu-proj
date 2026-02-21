import React, { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { IMCPRegistryItem, IMCPTool } from '../../../domain/types';
import './MarketplaceDetailView.css';

interface MarketplaceDetailViewProps {
    mcp: IMCPRegistryItem;
    tools: IMCPTool[];
    connectExtension: (id: string, apiKey?: string) => void;
    fetchTools: (id: string) => void;
    renderIcon: (iconName?: string) => React.ReactNode;
    installProgress: Record<string, number>;
}

export const MarketplaceDetailView: React.FC<MarketplaceDetailViewProps> = ({
    mcp,
    tools,
    connectExtension,
    fetchTools,
    renderIcon,
    installProgress
}) => {
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        if (mcp.status === 'connected' && (!tools || tools.length === 0)) {
            fetchTools(mcp.id);
        }
    }, [mcp.id, mcp.status, tools, fetchTools]);

    const handleConnect = () => {
        if (mcp.auth_type === 'api_key' && !apiKey.trim()) {
            // Internal validation or shake effect could go here
            return;
        }
        connectExtension(mcp.id, apiKey);
    };

    return (
        <div className="mcp-detail-view">
            <div className="mcp-detail-header">
                <div className="mcp-detail-icon">
                    {mcp.image_url ? (
                        <img src={`http://localhost:8081${mcp.image_url}`} alt={mcp.label} className="app-image" />
                    ) : (
                        renderIcon(mcp.icon)
                    )}
                </div>
                <div className="mcp-detail-header-info">
                    <div className="mcp-detail-title">{mcp.label}</div>
                    <div className="mcp-detail-type">
                        {mcp.type === 'cloud' ? 'Cloud Integration' : 'Local Extension'}
                    </div>
                </div>
                <div className={`status-badge ${mcp.status}`}>
                    {mcp.status}
                </div>
            </div>

            <div className="mcp-detail-content">
                <div className="mcp-description-section">
                    <div className="mcp-detail-section-title">Description</div>
                    {mcp.description}
                </div>

                {mcp.status === 'disconnected' && mcp.auth_type === 'api_key' && (
                    <div className="mcp-auth-section">
                        <div className="mcp-detail-section-title">Authentication Required</div>
                        <div className="api-key-input-wrapper">
                            <input
                                type="password"
                                className="api-key-input"
                                placeholder={mcp.auth_config?.placeholder || "Enter API Key"}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                            />
                            {mcp.auth_config?.help_text && (
                                <div className="api-key-help">
                                    <LucideIcons.Info size={12} />
                                    {mcp.auth_config.help_text}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {mcp.status === 'connected' && tools && tools.length > 0 && (
                    <div className="mcp-tools-section">
                        <div className="mcp-detail-section-title">Available Tools</div>
                        <div className="mcp-tools-grid">
                            {tools.map(tool => (
                                <div key={tool.name} className="mcp-tool-item">
                                    <div className="mcp-tool-name">
                                        <LucideIcons.Wrench size={14} />
                                        {tool.name}
                                    </div>
                                    <div className="mcp-tool-description">{tool.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="mcp-actions-footer">
                {mcp.status === 'disconnected' && (
                    <button
                        className="btn-detail-primary"
                        onClick={handleConnect}
                        disabled={mcp.auth_type === 'api_key' && !apiKey.trim()}
                    >
                        {mcp.auth_type === 'api_key' ? 'Verify & Connect' :
                            mcp.auth_type === 'oauth' ? 'Authorize & Connect' : 'Install & Connect'}
                    </button>
                )}
                {mcp.status === 'installing' && (
                    <div className="mcp-status-banner installing">
                        <div className="installing-progress-container">
                            <div className="progress-info">
                                <span className="progress-text">Connecting & Downloading...</span>
                                <span className="progress-percentage">{installProgress[mcp.id] || 0}%</span>
                            </div>
                            <div className="progress-bar-bg">
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${installProgress[mcp.id] || 0}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}
                {mcp.status === 'connected' && (
                    <div className="mcp-status-banner connected">
                        <LucideIcons.CheckCircle size={16} />
                        Successfully Connected
                    </div>
                )}
            </div>
        </div>
    );
};
