import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard1';
import Tasks from './pages/Tasks';
import Inventory from './pages/Inventory';
import UserManagement from './pages/UerManagement';
import Login from './pages/Login';
import CreateJob from './pages/CreateJob';
import CreateTask from './pages/CreateTask';

import './styles/theme.css';

// PrivateRoute now checks authReady before rendering
const PrivateRoute = ({ children }) => {
  const { user, authReady } = useAuth();

  if (!authReady) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="tasks/:id" element={<Tasks />} />
        <Route path="createjob" element={<CreateJob />} />
        <Route path="createtask" element={<CreateTask />} />
        <Route path="users" element={<UserManagement />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
