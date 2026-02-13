import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import './PageTabs.css';


const PageTabs = () => {
    const { currentOrg, currentProject } = useWorkspace();
    const { orgId, projectId } = useParams();

    // Fall back to context org if param is missing
    const effectiveOrgId = orgId || currentOrg?.id || 'default';

    return (
        <div className="page-tabs-container">
            <nav className="page-tabs-nav">
                {!currentProject ? (
                    // Org View Tabs
                    <>
                        <TabItem to={`/${effectiveOrgId}/projects`} label="Projects" />
                        <TabItem to={`/${effectiveOrgId}/settings/team`} label="Settings" />
                        <TabItem to="/support" label="Support" />
                    </>
                ) : (
                    // Project View Tabs
                    <>
                        <TabItem to={`/${effectiveOrgId}/${projectId}/overview`} label="Overview" />
                        <TabItem to={`/${effectiveOrgId}/${projectId}/auth-configs`} label="Auth Configs" />
                        <TabItem to={`/${effectiveOrgId}/${projectId}/logs`} label="Logs" />
                        <TabItem to={`/${effectiveOrgId}/${projectId}/settings/general`} label="Settings" />
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
