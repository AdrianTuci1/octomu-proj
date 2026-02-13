import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import GeneralSettings from './GeneralSettings';
import APIKeysSettings from './APIKeysSettings';
import WebhookSettings from './WebhookSettings';
import AuthScreenSettings from './AuthScreenSettings';
import ProjectConfigurationSettings from './ProjectConfigurationSettings';
import './ProjectSettings.css';

const ProjectSettings = () => {
    const { currentProject } = useWorkspace();
    const { orgId, projectId, tab } = useParams();
    const navigate = useNavigate();

    const tabs = [
        { id: 'general', label: 'General' },
        { id: 'api-keys', label: 'API Keys' },
        { id: 'webhook', label: 'Webhook' },
        { id: 'auth-screen', label: 'Auth Screen' },
        { id: 'project-configuration', label: 'Project Configuration' }
    ];

    const activeTab = tab || 'general';

    const handleTabChange = (tabId) => {
        navigate(`/${orgId}/${projectId}/settings/${tabId}`);
    };

    return (
        <div className="project-settings-page">
            <div className="project-settings-header">
                <h1 className="project-settings-title">Project Settings</h1>
                <button
                    className="back-link-i"
                    onClick={() => navigate(`/${orgId}/settings`)}
                >
                    <ArrowLeft size={16} />
                    Go to Org Settings
                </button>
            </div>

            <div className="settings-tabs">
                {tabs.map(t => (
                    <button
                        key={t.id}
                        className={`settings-tab ${activeTab === t.id ? 'active' : ''}`}
                        onClick={() => handleTabChange(t.id)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="settings-content">
                {activeTab === 'general' && <GeneralSettings projectName={currentProject?.name} />}
                {activeTab === 'api-keys' && <APIKeysSettings />}
                {activeTab === 'webhook' && <WebhookSettings />}
                {activeTab === 'auth-screen' && <AuthScreenSettings />}
                {activeTab === 'project-configuration' && <ProjectConfigurationSettings />}

                {!tabs.find(t => t.id === activeTab) && (
                    <div className="empty-state">
                        <p className="text-secondary">Settings coming soon.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectSettings;
