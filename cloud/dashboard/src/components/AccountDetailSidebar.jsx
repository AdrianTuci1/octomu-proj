import React, { useState } from 'react';
import { X, Github, Copy, Check } from 'lucide-react';
import './AccountDetailSidebar.css';

const AccountDetailSidebar = ({ isOpen, onClose, account }) => {
    const [copiedField, setCopiedField] = useState(null);

    const handleCopy = (text, fieldId) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldId);
        setTimeout(() => setCopiedField(null), 2000);
    };

    if (!isOpen || !account) return null;

    const CopyButton = ({ text, id }) => (
        <button className="copy-mini-btn" onClick={() => handleCopy(text, id)}>
            {copiedField === id ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
        </button>
    );

    return (
        <div className="sidebar-overlay" onClick={onClose}>
            <div className="account-sidebar" onClick={e => e.stopPropagation()}>
                <div className="sidebar-header">
                    <div className="header-left">
                        <Github size={20} />
                        <h3 className="account-id-title">{account.id}</h3>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="sidebar-content">
                    {/* Top Grid for IDs */}
                    <div className="detail-grid">
                        <div className="grid-item">
                            <div className="field-label">Connected Account ID</div>
                            <div className="field-value-wrapper">
                                <span className="field-value">{account.id}</span>
                                <CopyButton text={account.id} id="account-id" />
                            </div>
                        </div>
                        <div className="grid-item">
                            <div className="field-label">User ID</div>
                            <div className="field-value-wrapper">
                                <span className="field-value">{account.userId}</span>
                                <CopyButton text={account.userId} id="user-id" />
                            </div>
                        </div>
                    </div>

                    {/* Sequential row details */}
                    <div className="detail-item">
                        <div className="field-label-group">
                            <div className="field-label">status</div>
                            <CopyButton text={account.status} id="status" />
                        </div>
                        <div className="field-value">{account.status}</div>
                    </div>

                    <div className="detail-item">
                        <div className="field-label-group">
                            <div className="field-label">access_token</div>
                            <CopyButton text={account.accessToken} id="access-token" />
                        </div>
                        <div className="field-value">{account.accessToken}</div>
                    </div>

                    <div className="detail-item">
                        <div className="field-label-group">
                            <div className="field-label">token_type</div>
                            <CopyButton text={account.tokenType} id="token-type" />
                        </div>
                        <div className="field-value">{account.tokenType}</div>
                    </div>

                    <div className="detail-item">
                        <div className="field-label-group">
                            <div className="field-label">scope</div>
                            <CopyButton text={account.scope} id="scope" />
                        </div>
                        <div className="field-value">{account.scope}</div>
                    </div>

                    <div className="detail-item">
                        <div className="field-label-group">
                            <div className="field-label">code_verifier</div>
                            <CopyButton text={account.codeVerifier} id="code-verifier" />
                        </div>
                        <div className="field-value">{account.codeVerifier}</div>
                    </div>

                    <div className="detail-item">
                        <div className="field-label-group">
                            <div className="field-label">callback_url</div>
                            <CopyButton text={account.callbackUrl} id="callback-url" />
                        </div>
                        <div className="field-value">{account.callbackUrl}</div>
                    </div>
                </div>

                <div className="sidebar-footer">
                    <button className="test-connection-btn">
                        Test Connection
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountDetailSidebar;
