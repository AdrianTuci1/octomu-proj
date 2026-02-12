import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import ProjectSettings from './project-settings/ProjectSettings';
import './Settings.css';

const Settings = () => {
    const { currentProject } = useWorkspace();

    if (currentProject) {
        return <ProjectSettings />;
    }

    return <OrgSettings />;
};

const OrgSettings = () => {
    const [activeTab, setActiveTab] = useState('team');

    return (
        <div className="settings-container">
            <div className="page-header">
                <h1 className="page-title">Organisation Settings</h1>

                <div className="tabs-nav">
                    <button
                        className={`tab-link ${activeTab === 'team' ? 'active' : ''}`}
                        onClick={() => setActiveTab('team')}
                    >
                        Team Members
                    </button>
                    <button
                        className={`tab-link ${activeTab === 'general' ? 'active' : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        General Settings
                    </button>
                    <button
                        className={`tab-link ${activeTab === 'billing' ? 'active' : ''}`}
                        onClick={() => setActiveTab('billing')}
                    >
                        Billing
                    </button>
                </div>
            </div>

            <div className="settings-content">
                {activeTab === 'team' && <TeamMembersSection />}
                {activeTab === 'general' && <div>General Settings Content</div>}
                {activeTab === 'billing' && <div>Billing Content</div>}
            </div>
        </div>
    );
};

const TeamMembersSection = () => {
    const members = [
        {
            id: 1,
            name: 'adrian.tucicovenco@gmail.com',
            role: 'ADMIN',
            status: 'ACTIVE',
            joined: '2026-02-11'
        }
    ];

    return (
        <div>
            <div className="section-header">
                <div className="section-title">
                    <h3>Team Members & Invites</h3>
                    <p className="section-subtitle">Manage your organization's team members and pending invites.</p>
                </div>
                <button className="btn-primary-dark">Invite Member</button>
            </div>

            <div className="settings-table-container">
                <table className="settings-table">
                    <thead>
                        <tr>
                            <th>Member</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map(member => (
                            <tr key={member.id}>
                                <td>{member.name}</td>
                                <td>
                                    <span className="role-badge">{member.role}</span>
                                </td>
                                <td>
                                    <span className="status-badge">{member.status}</span>
                                </td>
                                <td>{member.joined}</td>
                                <td>
                                    <button className="action-menu-btn">
                                        <MoreVertical size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Settings;
