import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink } from 'lucide-react';
import './ConnectedAccountSidebar.css';

const ConnectedAccountSidebar = ({ isOpen, onClose, account }) => {
    const [copiedField, setCopiedField] = useState(null);

    // Guard to prevent rendering issues if account is null but keep component mounted
    const safeAccount = account || {
        id: '',
        userId: '',
        status: '',
        accessToken: '',
        tokenType: '',
        scope: '',
        codeVerifier: '',
        callbackUrl: ''
    };

    const handleCopy = (text, field) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
            <div className={`account-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-title">
                        <span className="github-icon-placeholder">
                            <i className="devicon-github-original"></i>
                        </span>
                        {safeAccount.id}
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="sidebar-content">
                    <div className="detail-group">
                        <div className="sidebar-detail-row">
                            <div className="detail-label">Connected Account ID</div>
                            <div className="detail-value-container">
                                <span className="detail-value mono">{safeAccount.id}</span>
                                <button
                                    className="sidebar-copy-btn"
                                    onClick={() => handleCopy(safeAccount.id, 'id')}
                                >
                                    {copiedField === 'id' ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>

                        <div className="sidebar-detail-row">
                            <div className="detail-label">User ID</div>
                            <div className="detail-value-container">
                                <span className="detail-value mono">{safeAccount.userId}</span>
                                {/* User ID usually doesn't need copy, but we can add if needed */}
                            </div>
                        </div>
                    </div>

                    <div className="detail-separator" />

                    <div className="detail-group">
                        <div className="sidebar-detail-row">
                            <div className="detail-label">status</div>
                            <div className="detail-value-container">
                                <span className="detail-value">{safeAccount.status}</span>
                                <button
                                    className="sidebar-copy-btn"
                                    onClick={() => handleCopy(safeAccount.status, 'status')}
                                >
                                    {copiedField === 'status' ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="detail-separator" />

                    <div className="detail-group">
                        <div className="sidebar-detail-row">
                            <div className="detail-label">access_token</div>
                            <div className="detail-value-container">
                                <span className="detail-value mono">{safeAccount.accessToken}</span>
                                <button
                                    className="sidebar-copy-btn"
                                    onClick={() => handleCopy(safeAccount.accessToken, 'accessToken')}
                                >
                                    {copiedField === 'accessToken' ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="detail-separator" />

                    <div className="detail-group">
                        <div className="sidebar-detail-row">
                            <div className="detail-label">token_type</div>
                            <div className="detail-value-container">
                                <span className="detail-value mono">{safeAccount.tokenType}</span>
                                <button
                                    className="sidebar-copy-btn"
                                    onClick={() => handleCopy(safeAccount.tokenType, 'tokenType')}
                                >
                                    {copiedField === 'tokenType' ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="detail-separator" />

                    <div className="detail-group">
                        <div className="sidebar-detail-row">
                            <div className="detail-label">scope</div>
                            <div className="detail-value-container">
                                <span className="detail-value mono wrap-text">{safeAccount.scope}</span>
                                <button
                                    className="sidebar-copy-btn"
                                    onClick={() => handleCopy(safeAccount.scope, 'scope')}
                                >
                                    {copiedField === 'scope' ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="detail-separator" />

                    <div className="detail-group">
                        <div className="sidebar-detail-row">
                            <div className="detail-label">code_verifier</div>
                            <div className="detail-value-container">
                                <span className="detail-value mono">{safeAccount.codeVerifier}</span>
                                <button
                                    className="sidebar-copy-btn"
                                    onClick={() => handleCopy(safeAccount.codeVerifier, 'codeVerifier')}
                                >
                                    {copiedField === 'codeVerifier' ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="detail-separator" />

                    <div className="detail-group">
                        <div className="sidebar-detail-row">
                            <div className="detail-label">callback_url</div>
                            <div className="detail-value-container">
                                <span className="detail-value mono wrap-text">{safeAccount.callbackUrl}</span>
                                <button
                                    className="sidebar-copy-btn"
                                    onClick={() => handleCopy(safeAccount.callbackUrl, 'callbackUrl')}
                                >
                                    {copiedField === 'callbackUrl' ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="sidebar-footer">
                    <button className="test-connection-btn">
                        Test Connection
                    </button>
                </div>
            </div>
        </>
    );
};

export default ConnectedAccountSidebar;
