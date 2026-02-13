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
import { WorkspaceProvider } from './context/WorkspaceContext';
import Support from './pages/Support';
import CreateTicket from './pages/CreateTicket';
import './App.css';

function App() {
  return (
    <Router>
      <WorkspaceProvider>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/projects" replace />} />

            {/* Organization Level Routes */}
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/new" element={<CreateProject />} />
            <Route path="/organizations/new" element={<CreateOrganization />} />
            <Route path="/:orgId/projects" element={<Projects />} />
            <Route path="/:orgId/settings" element={<Settings />} />
            <Route path="/:orgId/settings/:tab" element={<Settings />} />

            {/* Project Level Routes */}
            <Route path="/:orgId/:projectId/overview" element={<Overview />} />
            <Route path="/:orgId/:projectId/auth-configs" element={<AuthConfigs />} />
            <Route path="/:orgId/:projectId/auth-configs/:id" element={<AuthConfigDetail />} />
            <Route path="/:orgId/:projectId/logs" element={<Logs />} />
            <Route path="/:orgId/:projectId/settings" element={<Settings />} />
            <Route path="/:orgId/:projectId/settings/:tab" element={<Settings />} />

            {/* Shared Routes */}
            <Route path="/settings" element={<Settings />} />

            {/* Support Routes */}
            <Route path="/support" element={<Support />} />
            <Route path="/support/new" element={<CreateTicket />} />

            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="*" element={<Navigate to="/projects" replace />} />
          </Route>
        </Routes>
      </WorkspaceProvider>
    </Router>
  );
}

export default App;


