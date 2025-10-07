import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ element, allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // Wait for checkAuth()

  if (!isAuthenticated) {
    // Not logged in → go to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Logged in but wrong role → redirect or show 403 page
    return <Navigate to="/unauthorized" replace />;
  }

  // Authenticated and allowed → render the component
  return element;
}
