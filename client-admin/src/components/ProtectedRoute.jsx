
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminLayout from '../layouts/AdminLayout';

const ProtectedRoute = ({ children, requiredRole = 'super-admin' }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/super-admin/login" replace />;
  }

  // Check if user has required role
  if (user.role !== requiredRole) {
    return <Navigate to="/super-admin/login" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

export default ProtectedRoute;
