import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
    const [currentProject, setCurrentProject] = useState(null);
    const location = useLocation();

    // Synchronize workspace state with URL
    useEffect(() => {
        const pathParts = location.pathname.split('/').filter(Boolean);
        if (pathParts.length === 0) return;

        const firstPart = pathParts[0];

        // Skip reserved top-level paths
        const reserved = ['marketplace', 'support', 'projects', 'organizations'];
        if (reserved.includes(firstPart)) return;

        const org = organizations.find(o => o.id === firstPart);
        if (org) {
            if (!currentOrg || currentOrg.id !== org.id) {
                setCurrentOrg(org);
            }

            // Check for project ID in second part
            if (pathParts.length >= 2) {
                const secondPart = pathParts[1];
                if (secondPart !== 'settings' && secondPart !== 'projects') {
                    // It's likely a project ID
                    const project = org.projects.find(p => p.id === secondPart);
                    if (project) {
                        if (!currentProject || currentProject.id !== project.id) {
                            setCurrentProject(project);
                        }
                    }
                } else {
                    // It's /:orgId/settings/... or /:orgId/projects/...
                    // So project should be null
                    if (currentProject !== null) {
                        setCurrentProject(null);
                    }
                }
            } else {
                // It's just /:orgId
                if (currentProject !== null) {
                    setCurrentProject(null);
                }
            }
        }
    }, [location.pathname]);

    const selectOrg = (orgId) => {
        const org = organizations.find(o => o.id === orgId);
        if (org) {
            setCurrentOrg(org);
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
