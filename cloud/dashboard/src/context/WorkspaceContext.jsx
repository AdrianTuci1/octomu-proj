import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api, QueryBuilder } from '../services/index.js';

const WorkspaceContext = createContext();

export const useWorkspace = () => {
    const context = useContext(WorkspaceContext);
    if (!context) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider');
    }
    return context;
};

export const WorkspaceProvider = ({ children }) => {
    const [organizations, setOrganizations] = useState([]);
    const [currentOrg, setCurrentOrg] = useState(null);
    const [currentProject, setCurrentProject] = useState(null);
    const [projects, setProjects] = useState([]);
    const location = useLocation();

    // Fetch organizations on mount
    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                const orgs = await api.organizations.list();
                setOrganizations(orgs);
                if (orgs.length > 0 && !currentOrg) {
                    // Check url first to see if we should set a specific org
                    // For now default to first one if nothing set
                    // The existing URL sync effect will handle the rest
                    // But we need initial state
                    const pathParts = location.pathname.split('/').filter(Boolean);
                    const reserved = ['marketplace', 'support', 'projects', 'organizations'];
                    if (pathParts.length > 0 && !reserved.includes(pathParts[0])) {
                        const org = orgs.find(o => o.id === pathParts[0]);
                        if (org) {
                            setCurrentOrg(org);
                        } else {
                            setCurrentOrg(orgs[0]);
                        }
                    } else {
                        setCurrentOrg(orgs[0]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch organizations", error);
            }
        };
        fetchOrgs();
    }, []);

    // Fetch projects when currentOrg changes
    useEffect(() => {
        const fetchProjects = async () => {
            if (currentOrg) {
                try {
                    const query = new QueryBuilder()
                        .where('orgId', currentOrg.id)
                        .build();
                    const fetchedProjects = await api.projects.list(query);
                    setProjects(fetchedProjects);

                    // Also try to restore currentProject if it was lost or if URL dictates it
                    // This is handled by URL sync effect, but we need projects loaded first
                } catch (error) {
                    console.error("Failed to fetch projects", error);
                    setProjects([]);
                }
            } else {
                setProjects([]);
            }
        };
        fetchProjects();
    }, [currentOrg?.id]); // Only re-run if ID changes

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
                    // We need to look in the *fetched* projects, or wait for them
                    // Since this effect runs on location change, projects might not be loaded yet if we just navigated
                    // But if we are mounting, projects are empty initially.
                    // We can rely on a separate effect or just check `projects` state
                    const project = projects.find(p => p.id === secondPart);
                    if (project) {
                        if (!currentProject || currentProject.id !== project.id) {
                            setCurrentProject(project);
                        }
                    } else if (projects.length > 0) {
                        // Projects loaded but ID not found? Maybe invalid ID or project belongs to another org
                        // Don't auto-set null unless we are sure.
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
    }, [location.pathname, organizations, projects]); // Added projects dependency

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

        const project = projects.find(p => p.id === projectId);
        if (project) {
            setCurrentProject(project);
        }
    };

    // Enrich currentOrg with projects for backward compatibility
    const contextCurrentOrg = currentOrg ? { ...currentOrg, projects } : null;

    const value = {
        organizations,
        currentOrg: contextCurrentOrg,
        currentProject,
        selectOrg,
        selectProject,
        projects // Expose raw projects list too
    };

    return (
        <WorkspaceContext.Provider value={value}>
            {children}
        </WorkspaceContext.Provider>
    );
};
