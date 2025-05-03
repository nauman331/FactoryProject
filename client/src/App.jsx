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
import TaskDetails from './pages/TaskDetails';
import CategoryManager from './pages/CategoryManager';

import './styles/theme.css';

// PrivateRoute checks authReady before rendering
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
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route index element={<Inventory />} />
        <Route path="tasks/:id" element={<Tasks />} />
        <Route path="task/:id" element={<TaskDetails />} />
        <Route path="createjob" element={<CreateJob />} />
        <Route path="createtask" element={<CreateTask />} />
        <Route path="categories" element={<CategoryManager />} />
        <Route path="users" element={<UserManagement />} />
      </Route>

      {/* Catch-all: redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
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
