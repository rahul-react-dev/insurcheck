import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { hydrateAuth } from '../store/super-admin/superAdminSlice';
import AdminLayout from '../layouts/AdminLayout';

const ProtectedRoute = ({ children, requiredRole = 'super-admin' }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, isLoading } = useSelector(state => state.superAdmin);
  const location = useLocation();

  useEffect(() => {
    // Try to hydrate auth state if not authenticated or if user data is missing
    if (!isAuthenticated || !user) {
      console.log('🔄 ProtectedRoute: Attempting to hydrate auth state...');
      dispatch(hydrateAuth());
    }
  }, [dispatch, isAuthenticated, user]); // Dependencies include user to re-check if user data changes

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated and has the required role
  if (!isAuthenticated || !user || user.role !== requiredRole) {
    console.log(`🔐 ProtectedRoute: User not authenticated or insufficient role ('${user?.role}' vs '${requiredRole}'), redirecting to login`);
    return <Navigate to="/super-admin/login" state={{ from: location }} replace />;
  }

  console.log(`✅ ProtectedRoute: User authenticated and authorized for role '${requiredRole}'`);
  return <AdminLayout>{children}</AdminLayout>;
};

export default ProtectedRoute;