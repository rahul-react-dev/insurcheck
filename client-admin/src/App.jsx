import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "./store";
import Login from "./pages/Login";
import SuperAdminLogin from "./pages/super-admin/SuperAdminLogin";
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import SubscriptionManagement from "./pages/super-admin/SubscriptionManagement";
import PaymentManagement from "./pages/super-admin/PaymentManagement";
import InvoiceGeneration from './pages/super-admin/InvoiceGeneration';
import ForgotPassword from "./pages/super-admin/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import "./index.css";

function App() {
  return (
    <PersistGate loading={null} persistor={persistor}>
      <Router>
        <div className="App">
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
              path="/super-admin/invoice-generation"
              element={<InvoiceGeneration />}
            />
            <Route
              path="/super-admin/forgot-password"
              element={<ForgotPassword />}
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </PersistGate>
  );
}

export default App;