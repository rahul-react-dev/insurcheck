
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminTenantLayout from '../layouts/AdminTenantLayout';

const AdminProtectedRoute = ({ children, requiredRole = ['tenant-admin', 'admin'] }) => {
  const { user, isAuthenticated } = useSelector((state) => state.admin);

  // Check if user is authenticated and has the required role
  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check if user has one of the required roles
  const hasRequiredRole = Array.isArray(requiredRole) 
    ? requiredRole.includes(user.role)
    : user.role === requiredRole;

  if (!hasRequiredRole) {
    return <Navigate to="/admin/login" replace />;
  }

  return <AdminTenantLayout>{children}</AdminTenantLayout>;
};

export default AdminProtectedRoute;
