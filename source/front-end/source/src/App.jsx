import  { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import LabManagerDashboard from './pages/LabManagerDashboard';
import ResearcherDashboard from './pages/ResearcherDashboard';
import { getUserRole, getUserId, checkAuth } from './services/authServices';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    try {
      const userRole = getUserRole();
      const userId = getUserId();
      
      if (userRole && userId) {
        // Optionally verify with backend
        const isAuthenticated = await checkAuth();
        
        if (isAuthenticated) {
          setUser({
            id: userId,
            role: userRole
          });
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public route - Login */}
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/dashboard" replace /> : <Login onLogin={setUser} />
          } 
        />
        
        {/* Protected routes - Dashboards */}
        <Route 
          path="/dashboard" 
          element={
            user ? (
              <DashboardRouter user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* Individual dashboard routes */}
        <Route 
          path="/admin-dashboard" 
          element={
            user?.role === 'admin' ? (
              <AdminDashboard user={user} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        
        <Route 
          path="/lab-manager-dashboard" 
          element={
            user?.role === 'lab_manager' ? (
              <LabManagerDashboard user={user} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        
        <Route 
          path="/researcher-dashboard" 
          element={
            user?.role === 'researcher' ? (
              <ResearcherDashboard user={user} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        
        {/* Default redirect */}
        <Route 
          path="/" 
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
        />
        
        {/* Catch all - redirect to appropriate page */}
        <Route 
          path="*" 
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </Router>
  );
}

// Dashboard router component to redirect based on role
const DashboardRouter = ({ user }) => {
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin-dashboard" replace />;
    case 'lab_manager':
      return <Navigate to="/lab-manager-dashboard" replace />;
    case 'researcher':
      return <Navigate to="/researcher-dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default App;