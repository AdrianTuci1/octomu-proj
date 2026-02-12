import React from 'react';
import { NavLink } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import './PageTabs.css';


const PageTabs = () => {
    const { currentProject } = useWorkspace();

    return (
        <div className="page-tabs-container">
            <nav className="page-tabs-nav">
                {!currentProject ? (
                    // Org View Tabs
                    <>
                        <TabItem to="/projects" label="Projects" />
                        <TabItem to="/settings" label="Settings" />
                        <TabItem to="/support" label="Support" />
                    </>
                ) : (
                    // Project View Tabs
                    <>
                        <TabItem to="/overview" label="Overview" />
                        <TabItem to="/auth-configs" label="Auth Configs" />
                        <TabItem to="/logs" label="Logs" />
                        <TabItem to="/settings" label="Settings" />
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
