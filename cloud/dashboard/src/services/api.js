import { User, Organization, Project, AuthConfig, Log } from '../models/index.js';
import { organizations as initialOrgs } from '../data/workspaces.js';
import { OrganizationsService } from './OrganizationsService.js';
import { ProjectsService } from './ProjectsService.js';
import { AuthConfigsService } from './AuthConfigsService.js';
import { LogsService } from './LogsService.js';

// --- Mock Data Initialization ---
// We flat-map the hierarchical data into flat "tables" for our services to simulate a normalized DB
let orgsStore = [];
let projectsStore = [];
let authConfigsStore = [];
let logsStore = [];

const initializeData = () => {
    initialOrgs.forEach(orgData => {
        const org = new Organization(orgData);
        // We will store projects separately, so remove them from org object for "normalization" if desired
        // But for our simple mock, we can keep them or just extract them.
        // Let's extract to be more "service-like"

        const projectsData = org.projects || [];
        org.projects = []; // Clear for now, relation is by ID usually, or we keep it for now for simple relation

        orgsStore.push(org);

        projectsData.forEach(projData => {
            const proj = new Project(projData);
            // Link back
            proj.orgId = org.id;

            // Extract AuthConfigs
            let configs = proj.authConfigs || [];
            if (configs.length === 0) {
                // Mock defaults
                configs = [
                    new AuthConfig({
                        id: 'ac_M_oqfVDa9Yl4',
                        name: 'github-production',
                        provider: 'GitHub',
                        status: 'active',
                        credentials: { clientId: 'Ov23li...', clientSecret: '******' }
                    }),
                    new AuthConfig({
                        id: 'ac_test_123',
                        name: 'google-calendar-dev',
                        provider: 'Google Calendar',
                        status: 'inactive',
                        credentials: { clientId: '12345...', clientSecret: '******' }
                    })
                ];
            }

            configs.forEach(ac => {
                const authConfig = new AuthConfig(ac);
                authConfig.projectId = proj.id;
                authConfig.orgId = org.id;
                authConfigsStore.push(authConfig);
            });
            proj.authConfigs = []; // Clear from project object

            // Extract Logs
            let logs = proj.logs || [];
            if (logs.length === 0) {
                logs = [
                    new Log({ id: 'log-1', message: 'Project created', level: 'info' }),
                    new Log({ id: 'log-2', message: 'Auth config added', level: 'info' })
                ];
            }

            logs.forEach(l => {
                const log = new Log(l);
                log.projectId = proj.id;
                log.orgId = org.id;
                logsStore.push(log);
            });
            proj.logs = [];

            projectsStore.push(proj);
        });
    });
};

initializeData();

// --- Service Instantiation ---
const organizationsService = new OrganizationsService(orgsStore);
const projectsService = new ProjectsService(projectsStore);
const authConfigsService = new AuthConfigsService(authConfigsStore);
const logsService = new LogsService(logsStore);

// --- Facade ---
export const api = {
    organizations: organizationsService,
    projects: projectsService,
    authConfigs: authConfigsService,
    logs: logsService,

    // Maintain backward compatibility helper if needed, or preferably update consumers
    getOrganizations: () => api.organizations.list(),
    getProjects: (orgId) => api.projects.list({ filters: { orgId } }),
    getAuthConfigs: (orgId, projectId) => api.authConfigs.list({ filters: { projectId } }),
    getAuthConfig: (orgId, projectId, authConfigId) => api.authConfigs.get(authConfigId),
    getLogs: (orgId, projectId) => api.logs.list({ filters: { projectId } })
};
