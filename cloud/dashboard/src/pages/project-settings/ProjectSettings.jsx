import React, { useState } from 'react';
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
    const [activeTab, setActiveTab] = useState('General');

    const tabs = ['General', 'API Keys', 'Webhook', 'Auth Screen', 'Project Configuration'];

    return (
        <div className="project-settings-page">
            <div className="project-settings-header">
                <h1 className="project-settings-title">Project Settings</h1>
                <button className="back-link">
                    <ArrowLeft size={16} />
                    Go to Org Settings
                </button>
            </div>

            <div className="settings-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        className={`settings-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="settings-content">
                {activeTab === 'General' && <GeneralSettings projectName={currentProject?.name} />}
                {activeTab === 'API Keys' && <APIKeysSettings />}
                {activeTab === 'Webhook' && <WebhookSettings />}
                {activeTab === 'Auth Screen' && <AuthScreenSettings />}
                {activeTab === 'Project Configuration' && <ProjectConfigurationSettings />}

                {!tabs.includes(activeTab) && (
                    <div className="empty-state">
                        <p className="text-secondary">{activeTab} settings coming soon.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectSettings;
