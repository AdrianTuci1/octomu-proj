import React from 'react';
import { Pencil, Copy } from 'lucide-react';
import './ProjectSettings.css';

const GeneralSettings = ({ projectName }) => {
    const projectId = "pr_lvsCvEj5iQyu"; // Mock Id from screenshot

    return (
        <div className="general-settings">
            <h2 className="settings-section-title">General Settings</h2>
            <p className="settings-section-subtitle">Manage your project details.</p>

            <div className="settings-card">
                <div className="settings-row">
                    <div className="settings-label">Project Details</div>
                    <div className="settings-input-wrapper">
                        <span className="settings-label" style={{ width: '100px' }}>Project Name</span>
                        <input
                            type="text"
                            className="input-field"
                            value={projectName || "adrian.tucicovenco_workspace_first_projec..."}
                            readOnly
                        />
                        <button className="btn-outline">
                            <Pencil size={14} />
                            Rename
                        </button>
                    </div>
                </div>
                <div className="settings-row">
                    <div className="settings-label"></div>
                    <div className="settings-input-wrapper">
                        <span className="settings-label" style={{ width: '100px' }}>Project Id</span>
                        <input
                            type="text"
                            className="input-field"
                            value={projectId}
                            readOnly
                        />
                        <button className="btn-icon">
                            <Copy size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="settings-card">
                <div className="card-header">
                    <h3 className="card-title">Debug info for support</h3>
                    <button className="btn-outline">
                        <Copy size={14} />
                        Copy debug bundle
                    </button>
                </div>
                <p className="debug-desc">
                    Contains non-secret identifiers (project, org, member). Share with Composio support when requested.
                </p>
                <div className="debug-box">
                    {`@project_id: pr_IvsCvEj5iQyu
@org_id: ok_FlcDvN_e_0sS
@org_member_email: adrian.tucicovenco@gmail.com
@user_id: a8838117-879c-407d-aad7-b25ae0c52326
@playground_test_user_id: pg-test-a8838117-879c-407d-aad7-b25ae0c52326`}
                </div>
            </div>

            <div className="danger-zone">
                <h3 className="danger-title">Delete project <span className="text-danger">(danger zone)</span></h3>
            </div>
        </div>
    );
};

export default GeneralSettings;
