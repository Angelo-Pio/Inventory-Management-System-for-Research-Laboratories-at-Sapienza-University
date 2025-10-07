import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import "./index.css";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import LabManagerDashboard from "./pages/LabManagerDashboard";
import ResearcherDashboard from "./pages/ResearcherDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" /> },
  { path: "/login", element: <Login /> },
  {
    path: "/admin-dashboard",
    element: (
      <ProtectedRoute element={<AdminDashboard />} allowedRoles={["admin"]} />
    ),
  },
  {
    path: "/labmanager-dashboard",
    element: (
      <ProtectedRoute
        element={<LabManagerDashboard />}
        allowedRoles={["labmanager"]}
      />
    ),
  },
  {
    path: "/researcher-dashboard",
    element: (
      <ProtectedRoute
        element={<ResearcherDashboard />}
        allowedRoles={["researcher"]}
      />
    ),
  },
  {
    path: "/unauthorized",
    element: <div>403 - Unauthorized</div>,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
