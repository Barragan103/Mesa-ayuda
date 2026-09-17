import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardEmployee from './pages/DashboardEmployee';
import AdminLayout from './components/AdminLayout';
import EmployeeLayout from './components/EmployeeLayout';
import UserManagement from './pages/UserManagement';
import HelpRequest from './pages/HelpRequest';
import SoftwareIssueManagement from './pages/SoftwareIssueManagement';
import HardwareIssueManagement from './pages/HardwareIssueManagement';
import OtherIssueManagement from './pages/OtherIssueManagement';
import AreaManagement from './pages/AreaManagement';
import HelpRequestManagement from './pages/HelpRequestManagement';
import ChatPage from './pages/ChatPage';
import MyTickets from './pages/MyTickets'
import Chat from './pages/Chat';
import ProblemStats from './pages/ProblemStats';

function ProtectedRoute({
  children,
  roles,
}: {
  children: JSX.Element;
  roles: ('ADMIN' | 'EMPLOYEE')[];
}) {
  const { state } = useAuth();
  if (!state.token) {
    return <Navigate to="/login" replace />;
  }
  if (!roles.includes(state.role!)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard-admin"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminLayout>
                <DashboardAdmin />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-admin/users"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminLayout>
                  <UserManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-admin/software-issue"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminLayout>
                  <SoftwareIssueManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-admin/hardware-issue"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminLayout>
                  <HardwareIssueManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          /><Route
            path="/dashboard-admin/other-issue"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminLayout>
                  <OtherIssueManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          /><Route
            path="/dashboard-admin/area"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminLayout>
                  <AreaManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-admin/help-requests"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminLayout>
                  <HelpRequestManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-admin/chat/:helpRequestId"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminLayout>
                  <ChatPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-admin/problem-stats"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminLayout>
                <ProblemStats />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-employee"
            element={
              <ProtectedRoute roles={['EMPLOYEE']}>
                <EmployeeLayout>
                <DashboardEmployee />
                </EmployeeLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/dashboard-employee/request-help"
            element={
              <ProtectedRoute roles={['EMPLOYEE']}>
                <EmployeeLayout>
                  <HelpRequest />
                </EmployeeLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-employee/mis-tickets"
            element={
              <ProtectedRoute roles={['EMPLOYEE']}>
                <EmployeeLayout>
                <MyTickets />
                </EmployeeLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-employee/chat/:id"
            element={
              <ProtectedRoute roles={['EMPLOYEE']}>
                <EmployeeLayout>
                <Chat />
                </EmployeeLayout>
              </ProtectedRoute>
            }
          />


          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    
  );
}
