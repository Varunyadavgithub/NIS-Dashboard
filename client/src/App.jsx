import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { PERMISSIONS } from "./config/roles";

// Components
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import Dashboard from "./pages/Dashboard";
import Guards from "./pages/Guards";
import Clients from "./pages/Clients";
import Deployments from "./pages/Deployments";
import Attendance from "./pages/Attendance";
import Payroll from "./pages/Payroll";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Settings from "./pages/Settings";

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes */}
            <Route path="/" element={<Layout />}>
              {/* Dashboard - All authenticated users */}
              <Route
                index
                element={
                  <ProtectedRoute permissions={[PERMISSIONS.VIEW_DASHBOARD]}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Guards */}
              <Route
                path="guards"
                element={
                  <ProtectedRoute permissions={[PERMISSIONS.VIEW_GUARDS]}>
                    <Guards />
                  </ProtectedRoute>
                }
              />

              {/* Clients */}
              <Route
                path="clients"
                element={
                  <ProtectedRoute permissions={[PERMISSIONS.VIEW_CLIENTS]}>
                    <Clients />
                  </ProtectedRoute>
                }
              />

              {/* Deployments */}
              <Route
                path="deployments"
                element={
                  <ProtectedRoute permissions={[PERMISSIONS.VIEW_DEPLOYMENTS]}>
                    <Deployments />
                  </ProtectedRoute>
                }
              />

              {/* Attendance */}
              <Route
                path="attendance"
                element={
                  <ProtectedRoute permissions={[PERMISSIONS.VIEW_ATTENDANCE]}>
                    <Attendance />
                  </ProtectedRoute>
                }
              />

              {/* Payroll */}
              <Route
                path="payroll"
                element={
                  <ProtectedRoute permissions={[PERMISSIONS.VIEW_PAYROLL]}>
                    <Payroll />
                  </ProtectedRoute>
                }
              />

              {/* Reports */}
              <Route
                path="reports"
                element={
                  <ProtectedRoute permissions={[PERMISSIONS.VIEW_REPORTS]}>
                    <Reports />
                  </ProtectedRoute>
                }
              />

              {/* Users - Admin only */}
              <Route
                path="users"
                element={
                  <ProtectedRoute permissions={[PERMISSIONS.VIEW_USERS]}>
                    <Users />
                  </ProtectedRoute>
                }
              />

              {/* Settings */}
              <Route
                path="settings"
                element={
                  <ProtectedRoute permissions={[PERMISSIONS.VIEW_SETTINGS]}>
                    <Settings />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#333",
              color: "#fff",
              borderRadius: "10px",
              padding: "16px",
            },
            success: {
              iconTheme: {
                primary: "#22c55e",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
