import React from 'react';
import { Search, ArrowUpDown, Copy, Plus, MoreVertical, Check, ArrowUpRight, Trash2 } from 'lucide-react';
import ConnectedAccountSidebar from './ConnectedAccountSidebar';
import './ConnectedAccountsView.css';

const ConnectedAccountsView = ({ config, copyToClipboard, onConnectClick, onSelectAccount }) => {
    // Mock accounts data
    const accounts = [
        {
            id: 'ca_kng5VSxcbA1Y',
            userId: 'pg-test-a8838117-879c-407d-aa...',
            status: 'ACTIVE',
            accessToken: 'gho_...',
            tokenType: 'bearer',
            scope: 'codespace,gist,notifications,project,repo,user,workflow',
            codeVerifier: 'fae9...',
            callbackUrl: 'https://backend.composio.dev/api/v1/auth-apps/add',
            createdAt: 'Feb 12, 2026'
        }
    ];

    const [activeMenu, setActiveMenu] = React.useState(null);

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

    const [selectedAccount, setSelectedAccount] = React.useState(null);

    const handleSelectAccount = (account) => {
        setSelectedAccount(account);
    };

    const handleCloseSidebar = () => {
        setSelectedAccount(null);
    };

    if (accounts.length === 0) {
        return (
            <div className="tab-content connected-accounts-tab">
                <div className="content-filters">
                    <div className="filters-left">
                        <select className="ui-select">
                            <option>All Statuses</option>
                        </select>
                        <select className="ui-select">
                            <option>Account ID</option>
                        </select>
                        <div className="ui-search">
                            <Search size={14} />
                            <input type="text" placeholder="Search by Account ID" />
                        </div>
                    </div>
                    <div className="filters-right">
                        <button className="ui-sort-btn">
                            <ArrowUpDown size={14} />
                            Created: Latest
                        </button>
                    </div>
                </div>

                <div className="minimalist-empty-state">
                    <div className="empty-state-text">
                        <h2>Let's connect users to your app</h2>
                        <p>Connected accounts are active accounts of users connected to your agents</p>
                    </div>
                    <div className="empty-state-actions">
                        <button className="secondary-btn action-card-btn" onClick={() => copyToClipboard(config.id)}>
                            <Copy size={14} /> Copy Auth Config ID
                        </button>
                        <button className="primary-btn action-card-btn" onClick={onConnectClick}>
                            <Plus size={14} /> Connect Account
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="tab-content connected-accounts-tab">
            <div className="content-filters">
                <div className="filters-left">
                    <select className="ui-select">
                        <option>All Statuses</option>
                    </select>
                    <select className="ui-select">
                        <option>Account ID</option>
                    </select>
                    <div className="ui-search">
                        <Search size={14} />
                        <input type="text" placeholder="Search by Account ID" />
                    </div>
                </div>
                <div className="filters-right">
                    <button className="ui-sort-btn">
                        <ArrowUpDown size={14} />
                        Created: Latest
                    </button>
                </div>
            </div>

            <div className="accounts-table-container">
                <table className="accounts-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>USER ID</th>
                            <th>STATUS</th>
                            <th>CREATED</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map(acc => (
                            <tr key={acc.id} onClick={() => handleSelectAccount(acc)}>
                                <td className="mono">{acc.id}</td>
                                <td className="mono">{acc.userId}</td>
                                <td>
                                    <span className={`status-badge ${acc.status.toLowerCase()}`}>
                                        {acc.status}
                                    </span>
                                </td>
                                <td>{acc.createdAt}</td>
                                <td className="actions-cell">
                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                        <button
                                            className={`more-btn ${activeMenu === acc.id ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenu(activeMenu === acc.id ? null : acc.id);
                                            }}
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                        {activeMenu === acc.id && (
                                            <div className="context-menu" onClick={(e) => e.stopPropagation()}>
                                                <button className="menu-item">
                                                    <span>Disable</span>
                                                    <Check size={14} />
                                                </button>
                                                <button className="menu-item">
                                                    <span>Check Logs</span>
                                                    <ArrowUpRight size={14} />
                                                </button>
                                                <button className="menu-item">
                                                    <span>Add trigger</span>
                                                    <Plus size={14} />
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
                        ))}
                    </tbody>
                </table>
            </div>

            <ConnectedAccountSidebar
                isOpen={!!selectedAccount}
                onClose={handleCloseSidebar}
                account={selectedAccount}
            />
        </div>
    );
};

export default ConnectedAccountsView;
