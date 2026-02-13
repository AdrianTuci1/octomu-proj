import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Plus,
    Play,
    FileText,
    Copy,
    Github
} from 'lucide-react';
import './AuthConfigDetail.css';
import { useWorkspace } from '../../context/WorkspaceContext';
import { api } from '../../services/api.js';

// Import View Components
import ConnectedAccountsView from './ConnectedAccountsView';
import ActiveTriggersView from './ActiveTriggersView';
import ToolsTriggersView from './ToolsTriggersView';
import ManageAuthConfigView from './ManageAuthConfigView';
import ConnectAccountModal from '../../components/ConnectAccountModal';
import AccountDetailSidebar from '../../components/AccountDetailSidebar';

const AuthConfigDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('connected-accounts');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);

    const { currentOrg, currentProject } = useWorkspace();
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchConfig = async () => {
            if (currentOrg && currentProject && id) {
                setLoading(true);
                try {
                    const data = await api.authConfigs.get(id);
                    setConfig(data);
                } catch (error) {
                    console.error("Failed to fetch auth config", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchConfig();
    }, [currentOrg, currentProject, id]);

    const tabs = [
        { id: 'connected-accounts', label: 'Connected Accounts' },
        { id: 'active-triggers', label: 'Active Triggers' },
        { id: 'tools-triggers', label: 'Tools & Trigger Types' },
        { id: 'manage-auth', label: 'Manage Auth Config' },
    ];

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Could add a toast notification here
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!config) return <div className="p-8">Auth Config not found</div>;

    return (
        <div className="auth-config-detail">
            {/* Detail Header */}
            <div className="detail-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate(`/${currentOrg.id}/${currentProject.id}/auth-configs`)}>
                        <ChevronLeft size={20} />
                    </button>
                    <div className="config-icon-wrapper">
                        <Github size={20} />
                    </div>
                    <h1 className="config-title">{config.name}</h1>
                </div>
                <div className="header-right">
                    <button className="secondary-btn">
                        <Plus size={14} /> Add Trigger
                    </button>
                    <button className="secondary-btn">
                        <FileText size={14} /> Logs
                    </button>
                    <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
                        <Plus size={14} /> Connect Account
                    </button>
                </div>
            </div>

            {/* Custom Tabs */}
            <div className="detail-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`detail-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="detail-layout">
                {/* Main Content Area */}
                <div className="detail-main">
                    {activeTab === 'connected-accounts' && (
                        <ConnectedAccountsView
                            config={config}
                            copyToClipboard={copyToClipboard}
                            onConnectClick={() => setIsModalOpen(true)}
                            onSelectAccount={(acc) => setSelectedAccount(acc)}
                        />
                    )}
                    {activeTab === 'active-triggers' && (
                        <ActiveTriggersView config={config} copyToClipboard={copyToClipboard} />
                    )}
                    {activeTab === 'tools-triggers' && (
                        <ToolsTriggersView />
                    )}
                    {activeTab === 'manage-auth' && (
                        <ManageAuthConfigView />
                    )}
                </div>

                {/* Sidebar Metadata */}
                <aside className="detail-sidebar">
                    <div className="sidebar-section">
                        <h4 className="sidebar-label">AUTHENTICATION METHOD</h4>
                        <span className="badge badge-blue">OAUTH2</span>
                    </div>

                    <div className="sidebar-section">
                        <h4 className="sidebar-label">AUTH CONFIG ID</h4>
                        <div className="copy-field">
                            <span className="field-value">{config.id}</span>
                            <button className="copy-icon-btn" onClick={() => copyToClipboard(config.id)}>
                                <Copy size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h4 className="sidebar-label">TOOLKIT SLUG</h4>
                        <div className="copy-field">
                            <span className="field-value">{config.provider}</span>
                            <button className="copy-icon-btn" onClick={() => copyToClipboard(config.provider)}>
                                <Copy size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h4 className="sidebar-label">CREATED AT</h4>
                        <span className="field-value">{config.createdAt}</span>
                    </div>
                </aside>
            </div>
            <ConnectAccountModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                config={config}
            />

            <AccountDetailSidebar
                isOpen={!!selectedAccount}
                onClose={() => setSelectedAccount(null)}
                account={selectedAccount}
            />
        </div>
    );
};

export default AuthConfigDetail;
