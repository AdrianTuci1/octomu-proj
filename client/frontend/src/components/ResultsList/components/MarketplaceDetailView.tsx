import React, { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { IMCPRegistryItem, IMCPTool } from '../../../domain/types';
import './MarketplaceDetailView.css';

interface MarketplaceDetailViewProps {
    mcp: IMCPRegistryItem;
    tools: IMCPTool[];
    fetchingTools: Record<string, boolean>;
    toolFetchErrors: Record<string, string | null>;
    connectExtension: (id: string, apiKey?: string) => void;
    disconnectExtension: (id: string) => void;
    fetchTools: (id: string) => void;
    renderIcon: (iconName?: string) => React.ReactNode;
    installProgress: Record<string, number>;
}

export const MarketplaceDetailView: React.FC<MarketplaceDetailViewProps> = ({
    mcp,
    tools,
    fetchingTools,
    toolFetchErrors,
    connectExtension,
    disconnectExtension,
    fetchTools,
    renderIcon,
    installProgress
}) => {
    const [apiKey, setApiKey] = useState('');
    const [clientId, setClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);


    const isFetching = fetchingTools[mcp.id] || false;
    const fetchError = toolFetchErrors[mcp.id] || null;

    const isClientCredentials = (mcp.auth_type === 'oauth2' || mcp.auth_type === 'oauth') &&
        mcp.auth_config?.grant_type === 'client_credentials';
    const isOAuthBrowser = (mcp.auth_type === 'oauth2' || mcp.auth_type === 'oauth') &&
        mcp.auth_config?.grant_type !== 'client_credentials';

    useEffect(() => {
        if (mcp.status === 'connected' && (!tools || tools.length === 0) && !isFetching && !fetchError) {
            fetchTools(mcp.id);
        }
    }, [mcp.id, mcp.status, tools, fetchTools, isFetching, fetchError]);

    const handleConnect = () => {
        if (mcp.auth_type === 'api_key' && !apiKey.trim()) return;
        if (isClientCredentials && (!clientId.trim() || !clientSecret.trim())) return;

        if (isClientCredentials) {
            // Pass client_id::client_secret joined — extensionSlice splits them
            connectExtension(mcp.id, `${clientId.trim()}::${clientSecret.trim()}`);
        } else {
            connectExtension(mcp.id, apiKey);
        }
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
                        {mcp.type === 'cloud' ? 'Cloud Integration' :
                            mcp.type === 'remote_http' ? 'Remote Integration' : 'Local Extension'}
                    </div>
                </div>
                <div className="mcp-detail-header-actions">
                    <div className={`status-badge ${mcp.status}`}>
                        {mcp.status}
                    </div>
                    {mcp.status === 'connected' && (
                        <div className="mcp-header-actions-group">
                            {showDisconnectConfirm ? (
                                <div className="disconnect-confirm-bubble">
                                    <span>Are you sure?</span>
                                    <button
                                        className="btn-confirm-yes"
                                        onClick={() => {
                                            disconnectExtension(mcp.id);
                                            setShowDisconnectConfirm(false);
                                        }}
                                    >
                                        Yes
                                    </button>
                                    <button
                                        className="btn-confirm-no"
                                        onClick={() => setShowDisconnectConfirm(false)}
                                    >
                                        No
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className="btn-disconnect-header"
                                    onClick={() => setShowDisconnectConfirm(true)}
                                    title="Disconnect Extension"
                                >
                                    <LucideIcons.LogOut size={14} />
                                    Disconnect
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>



            <div className="mcp-detail-content">
                <div className="mcp-description-section">
                    <div className="mcp-detail-section-title">Description</div>
                    {mcp.description}
                </div>

                {/* API Key — single password input */}
                {mcp.status === 'disconnected' && mcp.auth_type === 'api_key' && (
                    <div className="mcp-auth-section">
                        <div className="mcp-detail-section-title">Authentication Required</div>
                        <div className="api-key-input-wrapper">
                            <input
                                type="password"
                                className="api-key-input"
                                placeholder={mcp.auth_config?.placeholder || 'Enter API Key'}
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

                {/* OAuth2 Client Credentials — client_id + client_secret inputs */}
                {mcp.status === 'disconnected' && isClientCredentials && (
                    <div className="mcp-auth-section">
                        <div className="mcp-detail-section-title">Authentication Required</div>
                        <div className="api-key-input-wrapper">
                            <input
                                type="text"
                                className="api-key-input"
                                placeholder="Client ID"
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                            />
                            <input
                                type="password"
                                className="api-key-input"
                                style={{ marginTop: 8 }}
                                placeholder="Client Secret"
                                value={clientSecret}
                                onChange={(e) => setClientSecret(e.target.value)}
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

                {/* OAuth2 Authorization Code — no inputs, just info + button opens browser */}
                {mcp.status === 'disconnected' && isOAuthBrowser && (
                    <div className="mcp-auth-section">
                        <div className="mcp-detail-section-title">Authorization Required</div>
                        <div className="api-key-help">
                            <LucideIcons.Info size={12} />
                            {mcp.auth_config?.help_text || 'You will be redirected to authorize access in your browser.'}
                        </div>
                    </div>
                )}


                {mcp.status === 'connected' && (
                    <div className="mcp-tools-section">
                        <div className="mcp-detail-section-title">Available Tools</div>

                        {isFetching ? (
                            <div className="mcp-tools-loading">
                                <LucideIcons.RefreshCw size={24} className="spinner" />
                                <span>Loading tools from {mcp.label}...</span>
                            </div>
                        ) : fetchError ? (
                            <div className="mcp-no-tools error">
                                <LucideIcons.AlertCircle size={24} />
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Failed to fetch tools</div>
                                    <div style={{ fontSize: 12, opacity: 0.8 }}>{fetchError}</div>
                                </div>
                                <button
                                    className="btn-detail-primary"
                                    style={{ marginTop: 12, padding: '8px 20px' }}
                                    onClick={() => fetchTools(mcp.id)}
                                >
                                    Retry
                                </button>
                            </div>
                        ) : tools && tools.length > 0 ? (
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
                        ) : (
                            <div className="mcp-no-tools">
                                No tools found for this extension.
                            </div>
                        )}
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
                            mcp.auth_type === 'oauth2' || mcp.auth_type === 'oauth' ? 'Authorize & Connect' : 'Install & Connect'}
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
                    <div className="mcp-connected-controls">
                        <button
                            className="btn-refresh-tools"
                            onClick={() => {
                                console.log(`[MarketplaceDetailView] Manual refresh for ${mcp.id}`);
                                fetchTools(mcp.id);
                            }}
                            title="Refresh Tools"
                        >
                            <LucideIcons.RefreshCw size={14} />
                            Refresh Tools
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};
