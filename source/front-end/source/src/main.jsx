import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import "./index.css";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import DialogsProvider from './hooks/DialogsProvider';


import LabManagerDashboard from "./lab-manager pages/LabManagerDashboard";
import LabManagerHome from "./lab-manager pages/LabManagerHome";
import InventoryPage from "./lab-manager pages/InventoryPage";
import EmployeesPage from "./lab-manager pages/EmployeesPage";
import AlertsPage from "./lab-manager pages/AlertsPage";
import GridShow from './components/GridShow';
import GridCreate from './components/GridCreate';
import GridEdit from './components/GridEdit';

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
    children: [
      { index: true, element: <LabManagerHome /> },          // /labmanager-dashboard
    { path: "inventory",
      children: [
          // relative paths (no leading slash)
          { index: true, element: <InventoryPage /> }, // /labmanager-dashboard/inventory
          { path: ":materialId", element: <GridShow /> }, // /labmanager-dashboard/inventory/employees/:employeeId
          { path: "new", element: <GridCreate /> }, // /labmanager-dashboard/inventory/employees/new
          { path: ":inventoryId/edit", element: <GridEdit /> }, // /labmanager-dashboard/inventory/employees/:employeeId/edit
        ],},    // /labmanager-dashboard/inventory
    { path: "employees", element: <EmployeesPage /> },    // /labmanager-dashboard/employees
    { path: "alerts", element: <AlertsPage /> },      // /labmanager-dashboard/alerts
  ]
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
      <DialogsProvider>
        <RouterProvider router={router} />
      </DialogsProvider>
    </AuthProvider>
  </React.StrictMode>
);
