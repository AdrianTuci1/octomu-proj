import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Marketplace from './pages/Marketplace';
import Settings from './pages/Settings';
import Projects from './pages/Projects';
import Overview from './pages/Overview';
import AuthConfigs from './pages/AuthConfigs';
import Logs from './pages/Logs';
import AuthConfigDetail from './pages/AuthConfigDetail';
import CreateProject from './pages/CreateProject';
import CreateOrganization from './pages/CreateOrganization';
import DashboardLayout from './layouts/DashboardLayout';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import Support from './pages/Support';
import CreateTicket from './pages/CreateTicket';
import './App.css';

const AppRoutes = () => {
  const { currentOrg } = useWorkspace();
  const defaultOrgId = currentOrg?.id || 'org1';

  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        {/* Root and Fallback redirects */}
        <Route path="/" element={<Navigate to={`/${defaultOrgId}/projects`} replace />} />
        <Route path="/projects" element={<Navigate to={`/${defaultOrgId}/projects`} replace />} />
        <Route path="/settings" element={<Navigate to={`/${defaultOrgId}/settings/team`} replace />} />

        {/* Organization Level Routes */}
        <Route path="/:orgId/projects" element={<Projects />} />
        <Route path="/:orgId/projects/new" element={<CreateProject />} />
        <Route path="/organizations/new" element={<CreateOrganization />} />
        <Route path="/:orgId/settings" element={<Navigate to="team" replace />} />
        <Route path="/:orgId/settings/:tab" element={<Settings />} />

        {/* Project Level Routes */}
        <Route path="/:orgId/:projectId/overview" element={<Overview />} />
        <Route path="/:orgId/:projectId/auth-configs" element={<AuthConfigs />} />
        <Route path="/:orgId/:projectId/auth-configs/:id" element={<AuthConfigDetail />} />
        <Route path="/:orgId/:projectId/logs" element={<Logs />} />
        <Route path="/:orgId/:projectId/settings" element={<Navigate to="general" replace />} />
        <Route path="/:orgId/:projectId/settings/:tab" element={<Settings />} />

        {/* Support Routes */}
        <Route path="/support" element={<Support />} />
        <Route path="/support/new" element={<CreateTicket />} />

        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="*" element={<Navigate to={`/${defaultOrgId}/projects`} replace />} />
      </Route>
    </Routes>
  );
};

const MobileNotice = () => (
  <div className="mobile-notice">
    Our app works best on desktop devices
  </div>
);

function App() {
  return (
    <div className="app-main-container">
      <MobileNotice />
      <Router>
        <WorkspaceProvider>
          <AppRoutes />
        </WorkspaceProvider>
      </Router>
    </div>
  );
}

export default App;


