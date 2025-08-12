import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminLayout from '../layouts/AdminLayout';

const ProtectedRoute = ({ children, requiredRole = 'super-admin' }) => {
  const { user } = useSelector((state) => state.superAdmin);

  // Check if user is authenticated and has the required role
  if (!user || user.role !== requiredRole) {
    return <Navigate to="/super-admin/login" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

export default ProtectedRoute;