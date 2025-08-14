import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminLayout from '../layouts/AdminLayout';

const ProtectedRoute = ({ children, requiredRole = 'super-admin' }) => {
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.superAdmin);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated and has the required role
  if (!isAuthenticated || !user || user.role !== requiredRole) {
    console.log('🔐 User not authenticated or insufficient role, redirecting to login');
    return <Navigate to="/super-admin/login" replace />;
  }

  console.log('✅ User authenticated, rendering protected route');
  return <AdminLayout>{children}</AdminLayout>;
};

export default ProtectedRoute;