import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import LandingPage from './pages/LandingPage';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import SystemLogs from './pages/admin/SystemLogs';
import AgentActivity from './pages/admin/AgentActivity';

// Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import TeamManagement from './pages/manager/TeamManagement';
import AiInsights from './pages/manager/AiInsights';
import Reports from './pages/manager/Reports';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeTasks from './pages/employee/EmployeeTasks';

// Shared Pages
import TaskBoard from './pages/shared/TaskBoard';
import ProfilePage from './pages/shared/ProfilePage';

// Placeholder components for dashboard content
const NotFound = () => <div className="p-8 text-2xl font-bold text-red-500">404 Not Found</div>;

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/resetpassword/:token" element={<ResetPassword />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="tasks" element={<TaskBoard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="logs" element={<SystemLogs />} />
          <Route path="agents" element={<AgentActivity />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Protected Manager Routes */}
        <Route
          path="/manager"
          element={
            <PrivateRoute allowedRoles={['manager']}>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="tasks" element={<TaskBoard />} />
          <Route path="team" element={<TeamManagement />} />
          <Route path="ai-insights" element={<AiInsights />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Protected Employee Routes */}
        <Route
          path="/employee"
          element={
            <PrivateRoute allowedRoles={['employee']}>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="tasks" element={<EmployeeTasks />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
