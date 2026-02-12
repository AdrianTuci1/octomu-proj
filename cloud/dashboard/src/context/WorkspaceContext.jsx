import React, { createContext, useState, useContext, useEffect } from 'react';
import { organizations } from '../data/workspaces';

const WorkspaceContext = createContext();

export const useWorkspace = () => {
    const context = useContext(WorkspaceContext);
    if (!context) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider');
    }
    return context;
};

export const WorkspaceProvider = ({ children }) => {
    const [currentOrg, setCurrentOrg] = useState(organizations[0]);
    const [currentProject, setCurrentProject] = useState(null); // Start with no project selected (Org View)

    const selectOrg = (orgId) => {
        const org = organizations.find(o => o.id === orgId);
        if (org) {
            setCurrentOrg(org);
            // Default to null (Org View) when switching orgs
            setCurrentProject(null);
        }
    };

    const selectProject = (projectId) => {
        if (!currentOrg) return;

        if (projectId === null) {
            setCurrentProject(null);
            return;
        }

        const project = currentOrg.projects.find(p => p.id === projectId);
        if (project) {
            setCurrentProject(project);
        }
    };

    const value = {
        organizations,
        currentOrg,
        currentProject,
        selectOrg,
        selectProject
    };

    return (
        <WorkspaceContext.Provider value={value}>
            {children}
        </WorkspaceContext.Provider>
    );
};
