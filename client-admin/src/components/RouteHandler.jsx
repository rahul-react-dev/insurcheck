import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Smart route handler that redirects unknown routes to appropriate login pages
 * while preserving existing route functionality
 */
const RouteHandler = () => {
  const location = useLocation();
  const path = location.pathname;
  
  // Define valid routes to avoid redirecting existing routes
  const validSuperAdminRoutes = [
    '/super-admin/login',
    '/super-admin/dashboard',
    '/super-admin/tenants',
    '/super-admin/subscriptions',
    '/super-admin/payments',
    '/super-admin/invoices',
    '/super-admin/activity-logs',
    '/super-admin/tenant-management',
    '/super-admin/forgot-password',
    '/super-admin/deleted-documents',
    '/super-admin/system-config',
    '/super-admin/analytics'
  ];
  
  const validAdminRoutes = [
    '/admin/login',
    '/admin/dashboard',
    '/admin/users',
    '/admin/compliance-rules',
    '/admin/notification-templates',
    '/admin/invoices',
    '/admin/compliance-analytics'
  ];
  
  // Check if the current path is a valid route
  const isValidSuperAdminRoute = validSuperAdminRoutes.includes(path);
  const isValidAdminRoute = validAdminRoutes.includes(path);
  
  // Handle super-admin routes
  if (path.startsWith('/super-admin/')) {
    if (!isValidSuperAdminRoute) {
      console.log(`🔄 Redirecting unknown super-admin route ${path} to /super-admin/login`);
      return <Navigate to="/super-admin/login" replace />;
    }
    return null; // Let the defined routes handle it
  }
  
  // Handle admin routes
  if (path.startsWith('/admin/')) {
    if (!isValidAdminRoute) {
      console.log(`🔄 Redirecting unknown admin route ${path} to /admin/login`);
      return <Navigate to="/admin/login" replace />;
    }
    return null; // Let the defined routes handle it
  }
  
  // Handle base paths
  if (path === '/admin') {
    console.log(`🔄 Redirecting /admin to /admin/login`);
    return <Navigate to="/admin/login" replace />;
  }
  
  if (path === '/super-admin') {
    console.log(`🔄 Redirecting /super-admin to /super-admin/login`);
    return <Navigate to="/super-admin/login" replace />;
  }
  
  // Default fallback
  console.log(`🔄 Redirecting unknown route ${path} to /login`);
  return <Navigate to="/login" replace />;
};

export default RouteHandler;