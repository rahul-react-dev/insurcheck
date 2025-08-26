import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "./store";
import { hydrateAuth } from "./store/super-admin/superAdminSlice";
import { hydrateAdminAuth } from "./store/admin/adminSlice";
import Login from "./pages/Login";
import SuperAdminLogin from "./pages/super-admin/SuperAdminLogin";
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import SubscriptionManagement from "./pages/super-admin/SubscriptionManagement";
import PaymentManagement from "./pages/super-admin/PaymentManagement";
import InvoiceGeneration from "./pages/super-admin/InvoiceGeneration";
import TenantActivityLogs from "./pages/super-admin/TenantActivityLogs";
import TenantStateManagement from "./pages/super-admin/TenantStateManagement";
import ForgotPassword from "./pages/super-admin/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import "./index.css";
import store from "./store";
import TenantManagement from './pages/super-admin/TenantManagement'; // Import the new TenantManagement component
import DeletedDocumentsManagement from './pages/super-admin/DeletedDocumentsManagement';
import SystemConfiguration from './pages/super-admin/SystemConfiguration';
// Import the new AnalyticsDashboard component
import AnalyticsDashboard from './pages/super-admin/AnalyticsDashboard';
import UsageAnalyticsDashboard from './pages/super-admin/UsageAnalyticsDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import ComplianceRules from './pages/admin/ComplianceRules';
import NotificationTemplates from './pages/admin/NotificationTemplates';
import Invoices from './pages/admin/Invoices';
import ComplianceAnalytics from './pages/admin/ComplianceAnalytics';
import AdminProtectedRoute from './components/AdminProtectedRoute';

// Notification Component
const NotificationContainer = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Global notification function
    window.showNotification = (message, type = 'info', duration = 5000) => {
      const id = Date.now() + Math.random();
      const notification = { id, message, type, duration };

      setNotifications(prev => [...prev, notification]);

      // Auto remove notification
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    };

    return () => {
      delete window.showNotification;
    };
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`max-w-md p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
            notification.type === 'success'
              ? 'bg-green-500 text-white'
              : notification.type === 'error'
              ? 'bg-red-500 text-white'
              : notification.type === 'warning'
              ? 'bg-yellow-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className={`fas ${
                notification.type === 'success'
                  ? 'fa-check-circle'
                  : notification.type === 'error'
                  ? 'fa-exclamation-circle'
                  : notification.type === 'warning'
                  ? 'fa-exclamation-triangle'
                  : 'fa-info-circle'
              }`}></i>
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-4 text-white hover:text-gray-200 focus:outline-none"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};


function App() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate auth state from localStorage on app startup
  useEffect(() => {
    console.log('🔄 Hydrating authentication state...');
    dispatch(hydrateAuth()); // Super admin auth
    dispatch(hydrateAdminAuth()); // Tenant admin auth
    setIsLoading(false);
  }, [dispatch]);


  // Debug store configuration
  React.useEffect(() => {
    const state = store.getState();
    console.log("🏪 App: Store state keys:", Object.keys(state));
    console.log("💳 App: Payment state exists:", !!state.payment);
    console.log("🔍 App: Initial payment state:", state.payment);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  return (
    <PersistGate loading={null} persistor={persistor}>
      <Router>
        <div className="App">
          <NotificationContainer />
          <Routes>
            {/* Regular Admin/Tenant routes */}
            <Route path="/login" element={<Login />} />

            {/* Super Admin routes */}
            <Route path="/super-admin/login" element={<SuperAdminLogin />} />
            <Route
              path="/super-admin/dashboard"
              element={
                <ProtectedRoute>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/tenants"
              element={
                <ProtectedRoute>
                  <TenantManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/subscriptions"
              element={
                <ProtectedRoute>
                  <SubscriptionManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/payments"
              element={
                <ProtectedRoute>
                  <PaymentManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/invoices"
              element={
                <ProtectedRoute>
                  <InvoiceGeneration />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/activity-logs"
              element={
                <ProtectedRoute>
                  <TenantActivityLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/tenant-management"
              element={
                <ProtectedRoute>
                  <TenantStateManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/forgot-password"
              element={<ForgotPassword />}
            />
            <Route
              path="/super-admin/deleted-documents"
              element={
                <ProtectedRoute>
                  <DeletedDocumentsManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/system-config"
              element={
                <ProtectedRoute>
                  <SystemConfiguration />
                </ProtectedRoute>
              }
            />
            {/* Add the new Analytics Dashboard route */}
            <Route
              path="/super-admin/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsDashboard />
                </ProtectedRoute>
              }
            />
            {/* Add the Usage Analytics Dashboard route */}
            <Route
              path="/super-admin/usage-analytics"
              element={
                <ProtectedRoute>
                  <UsageAnalyticsDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin/Tenant Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminProtectedRoute>
                  <AdminUsers />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/compliance-rules"
              element={
                <AdminProtectedRoute>
                  <ComplianceRules />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/notification-templates"
              element={
                <AdminProtectedRoute>
                  <NotificationTemplates />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/invoices"
              element={
                <AdminProtectedRoute>
                  <Invoices />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/compliance-analytics"
              element={
                <AdminProtectedRoute>
                  <ComplianceAnalytics />
                </AdminProtectedRoute>
              }
            />
            {/* Add more admin routes here as needed */}

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </PersistGate>
  );
}

export default App;