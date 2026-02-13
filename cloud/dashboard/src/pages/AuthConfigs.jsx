import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Grid,
    Search,
    Github,
    MoreVertical,
    ArrowUpDown,
    Mail,
    Box,
    Calendar,
    FileText,
    Table,
    Slack,
    Zap,
    Atom,
    Twitter,
    HardDrive,
    Check,
    ArrowUpRight,
    Trash2
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { api } from '../services/api.js';
import CreateAuthConfigSidebar from '../components/CreateAuthConfigSidebar';
import './AuthConfigs.css';

const ICON_MAP = {
    'Gmail': Mail,
    'Composio': Box,
    'GitHub': Github,
    'Google Calendar': Calendar,
    'Notion': FileText,
    'Google Sheets': Table,
    'Slack': Slack,
    'Supabase': Zap,
    'Outlook': Mail,
    'Perplexity AI': Atom,
    'Twitter': Twitter,
    'Google Drive': HardDrive
};

const AuthConfigs = () => {
    const navigate = useNavigate();
    const { currentOrg, currentProject } = useWorkspace();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [configs, setConfigs] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [activeMenu, setActiveMenu] = React.useState(null);

    React.useEffect(() => {
        const fetchConfigs = async () => {
            if (currentOrg && currentProject) {
                setLoading(true);
                try {
                    const query = new QueryBuilder()
                        .where('projectId', currentProject.id)
                        .build();

                    const data = await api.authConfigs.list(query);
                    setConfigs(data);
                } catch (error) {
                    console.error("Failed to fetch auth configs", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchConfigs();
    }, [currentOrg, currentProject]);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeMenu && !event.target.closest('.actions-cell')) {
                setActiveMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeMenu]);

    const handleCreateConfig = (newConfig) => {
        setConfigs([newConfig, ...configs]);
    };

    if (!currentProject) {
        return <div className="p-8">Please select a project to view auth configs.</div>;
    }

    if (loading) {
        return <div className="p-8">Loading auth configs...</div>;
    }

    return (
        <div className="auth-configs-page">
            <div className="auth-configs-header">
                <h1 className="auth-configs-title">Auth Configs</h1>
                <div className="header-actions">
                    <button className="secondary-btn">
                        <Grid size={16} />
                        Browse All Toolkits
                    </button>
                    <button className="primary-btn" onClick={() => setIsSidebarOpen(true)}>
                        <Plus size={16} />
                        Create Auth Config
                    </button>
                </div>
            </div>

            <div className="filter-bar">
                <div className="filters-left">
                    <select className="filter-select" defaultValue="all">
                        <option value="all">All toolkits</option>
                    </select>
                    <select className="filter-select" defaultValue="all">
                        <option value="all">All Statuses</option>
                    </select>
                    <select className="filter-select" defaultValue="all">
                        <option value="all">All Auth</option>
                    </select>
                </div>

                <div className="search-container">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search Auth Configs"
                        className="search-input"
                    />
                </div>

                <select className="sort-select" defaultValue="updated">
                    <option value="updated">Last Updated: La...</option>
                </select>
            </div>

            {configs.length > 0 ? (
                <div className="auth-table-container">
                    <table className="auth-table">
                        <thead>
                            <tr>
                                <th>Auth Config Name</th>
                                <th>Auth Config ID</th>
                                <th>Connections</th>
                                <th>Auth Type</th>
                                <th>Last Updated</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {configs.map((config) => {
                                const IconComponent = ICON_MAP[config.provider] || Github;
                                return (
                                    <tr key={config.id} onClick={() => navigate(`/${currentOrg.id}/${currentProject.id}/auth-configs/${config.id}`)} style={{ cursor: 'pointer' }}>
                                        <td>
                                            <div className="config-name-cell">
                                                <div className="config-icon">
                                                    <IconComponent size={18} />
                                                </div>
                                                {config.name}
                                            </div>
                                        </td>
                                        <td className="id-cell">{config.id}</td>
                                        <td>{config.connections || 0}</td>
                                        <td>
                                            <span className="badge badge-blue">{config.authType || 'OAUTH2'}</span>
                                        </td>
                                        <td>{config.lastUpdated || 'Just now'}</td>
                                        <td>
                                            <span className="badge badge-green">{config.status}</span>
                                        </td>
                                        <td className="actions-cell">
                                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                                <button
                                                    className={`more-btn ${activeMenu === config.id ? 'active' : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenu(activeMenu === config.id ? null : config.id);
                                                    }}
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                                {activeMenu === config.id && (
                                                    <div className="context-menu" onClick={(e) => e.stopPropagation()}>
                                                        <button className="menu-item">
                                                            <span>Disable</span>
                                                            <Check size={14} />
                                                        </button>
                                                        <button className="menu-item">
                                                            <span>Check Logs</span>
                                                            <ArrowUpRight size={14} />
                                                        </button>
                                                        <div className="menu-separator" />
                                                        <button className="menu-item delete">
                                                            <span>Delete</span>
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state-container">
                    <div className="empty-state-content">
                        <h2 className="empty-state-title">Let's get ready to Create Auth Configs for your toolkits</h2>
                        <p className="empty-state-description">
                            Auth configs allow you to securely manage authentication for your service integrations.
                        </p>
                        <div className="centered-action">
                            <button className="primary-btn" onClick={() => setIsSidebarOpen(true)}>
                                <Plus size={16} />
                                Create an Auth Config
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <CreateAuthConfigSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onCreate={handleCreateConfig}
            />
        </div>
    );
};

export default AuthConfigs;
