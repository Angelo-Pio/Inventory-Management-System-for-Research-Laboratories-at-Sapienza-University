// App.jsx (updated)
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import LabManagerDashboard from './pages/LabManagerDashboard';
import ResearcherDashboard from './pages/ResearcherDashboard';
import { getUserRole, getUserId, checkAuth } from './services/authServices';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   checkUserAuth();
  // }, []);

  // const checkUserAuth = async () => {
  //   try {
  //     const userRole = getUserRole();
  //     const userId = getUserId();

  //     if (userRole && userId) {
  //       const isAuthenticated = await checkAuth();
  //       if (isAuthenticated) {
  //         setUser({
  //           id: userId,
  //           role: userRole,
  //           email: '' // fetch if needed
  //         });
  //       } else {
  //         setUser(null);
  //       }
  //     } else {
  //       setUser(null);
  //     }
  //   } catch (error) {
  //     console.error('Auth check failed:', error);
  //     setUser(null);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  //     </div>
  //   );
  // }

  return (
    <Router>
      <Routes>
        {/* Public route - Login */}
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={setUser} />}
        />

        {/* Dashboard landing: declaratively redirect based on role */}
        <Route
          path="/dashboard"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : user.role === 'admin' ? (
              <Navigate to="/admin-dashboard" replace />
            ) : user.role === 'lab_manager' ? (
              <Navigate to="/lab-manager-dashboard" replace />
            ) : user.role === 'researcher' ? (
              <Navigate to="/researcher-dashboard" replace />
            ) : (
              // fallback for unknown role
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Role-protected dashboards */}
        <Route
          path="/admin-dashboard"
          element={
            user?.role === 'admin' ? <AdminDashboard user={user} /> : <Navigate to="/dashboard" replace />
          }
        />
        <Route
          path="/lab-manager-dashboard"
          element={
            user?.role === 'lab_manager' ? <LabManagerDashboard user={user} /> : <Navigate to="/dashboard" replace />
          }
        />
        <Route
          path="/researcher-dashboard"
          element={
            user?.role === 'researcher' ? <ResearcherDashboard user={user} /> : <Navigate to="/dashboard" replace />
          }
        />

        {/* Root and catch-all */}
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
