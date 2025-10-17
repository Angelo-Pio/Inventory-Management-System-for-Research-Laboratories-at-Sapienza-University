import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import "./index.css";
import DialogsProvider from "./hooks/DialogsProvider";

import Login from "./pages/Login";

import AdminDashboard from "./admin pages/AdminDashboard";
import DepartmentPage from "./admin pages/DepartmentPage";
import DepartmentCreate from "./components/DepartmentCreate"

import LabManagerDashboard from "./lab-manager pages/LabManagerDashboard";
import LabManagerHome from "./lab-manager pages/LabManagerHome";
import InventoryPage from "./lab-manager pages/InventoryPage";
import EmployeesPage from "./lab-manager pages/UserPage";
import AlertsPage from "./lab-manager pages/AlertsPage";
import MaterialCreate from "./components/MaterialCreate";
import UserCreate from "./components/UserCreate"

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
    children:[
       {index: true, element: <EmployeesPage />},
       { path: "new", element: <UserCreate/> },
       { path: "departments", children:[
        {index:true,  element: <DepartmentPage/> },
        {path:"new", element:<DepartmentCreate/>}
       ]}
    ]
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
      { index: true, element: <LabManagerHome /> },
      {
        path: "inventory",
        children: [
          { index: true, element: <InventoryPage /> },
          { path: "new", element: <MaterialCreate /> },
        ],
      },
      { path: "employees", children:[
        {index:true,element: <EmployeesPage /> },
          { path: "new", element: <UserCreate/> },

        
      ]  },
      { path: "alerts", element: <AlertsPage /> },
    ],
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
