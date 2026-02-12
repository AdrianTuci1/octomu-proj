import React, { useState } from 'react';
import { Search, GitBranch, ChevronDown } from 'lucide-react';

const ToolsTriggersView = () => {
    const [activeSubTab, setActiveSubTab] = useState('tools');
    const [searchQuery, setSearchQuery] = useState('');

    const tools = [
        { name: 'Accept a repository invitation', description: 'Accepts a PENDING repository invitation that has been issued to the authen...' },
        { name: 'Add email for auth user', description: 'Adds one or more email addresses (which will be initially unverified) to the ...' },
        { name: 'Add app access restrictions', description: 'Adds GitHub Apps to the list of apps allowed to push to a protected branch....' },
        { name: 'Add a repository collaborator', description: 'Adds a GitHub user as a repository collaborator, or updates their permissio...' },
        { name: 'Add a repository to an app inst...', description: 'Adds a repository to a GitHub App installation, granting the app access; req...' },
        { name: 'Add a selected repository to a ...', description: "Grants a specified repository access to an authenticated user's existing Co..." },
        { name: 'Add assignees to an issue', description: 'Adds assignees to a GitHub issue. This action only adds users - it does not ...' },
        { name: 'Add labels to an issue', description: 'Adds labels (provided in the request body) to a repository issue; labels that ...' },
        { name: 'Add org runner labels', description: 'Adds new custom labels to an existing self-hosted runner for an organizatio...' },
    ];

    const filteredTools = tools.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="tab-content tools-triggers-tab">
            {/* Sub-navigation and Actions */}
            <div className="tools-header-actions">
                <div className="sub-nav-pills">
                    <button
                        className={`sub-nav-pill ${activeSubTab === 'tools' ? 'active' : ''}`}
                        onClick={() => setActiveSubTab('tools')}
                    >
                        Tools
                    </button>
                    <button
                        className={`sub-nav-pill ${activeSubTab === 'triggers' ? 'active' : ''}`}
                        onClick={() => setActiveSubTab('triggers')}
                    >
                        Triggers
                    </button>
                </div>

                <div className="header-right-actions">
                    <button className="secondary-btn icon-btn">
                        <GitBranch size={14} />
                        View changes
                    </button>
                    <div className="version-selector">
                        <span className="version-label">Version:</span>
                        <button className="version-btn">
                            latest (20260212...)
                            <ChevronDown size={14} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="tools-content-header">
                <h2 className="tools-title">Tools</h2>
                <div className="tools-search">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search tools"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="tools-list">
                {filteredTools.map((tool, index) => (
                    <div key={index} className="tool-item">
                        <div className="tool-name">{tool.name}</div>
                        <div className="tool-description">{tool.description}</div>
                    </div>
                ))}
                {filteredTools.length === 0 && (
                    <div className="no-results">No tools found matching your search.</div>
                )}
            </div>
        </div>
    );
};

export default ToolsTriggersView;
