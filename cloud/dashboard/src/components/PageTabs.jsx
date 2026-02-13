import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import './PageTabs.css';


const PageTabs = () => {
    const { currentProject } = useWorkspace();
    const { orgId, projectId } = useParams();

    // Workaround for when orgId isn't in URL (fall back to project context if available)
    const effectiveOrgId = orgId || currentProject?.orgId; // Context might need orgId on projects

    return (
        <div className="page-tabs-container">
            <nav className="page-tabs-nav">
                {!currentProject ? (
                    // Org View Tabs
                    <>
                        <TabItem to={orgId ? `/${orgId}/projects` : "/projects"} label="Projects" />
                        <TabItem to={orgId ? `/${orgId}/settings/team` : "/settings"} label="Settings" />
                        <TabItem to="/support" label="Support" />
                    </>
                ) : (
                    // Project View Tabs
                    <>
                        <TabItem to={`/${orgId}/${projectId}/overview`} label="Overview" />
                        <TabItem to={`/${orgId}/${projectId}/auth-configs`} label="Auth Configs" />
                        <TabItem to={`/${orgId}/${projectId}/logs`} label="Logs" />
                        <TabItem to={`/${orgId}/${projectId}/settings/general`} label="Settings" />
                    </>
                )}
            </nav>
        </div>
    );
};

const TabItem = ({ to, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `page-tab-link ${isActive ? 'active' : ''}`
        }
    >
        {label}
    </NavLink>
);

export default PageTabs;
