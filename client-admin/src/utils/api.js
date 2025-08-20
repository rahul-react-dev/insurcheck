// API configuration for admin frontend
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin 
  : 'http://localhost:5000';

// Helper function for making authenticated API calls
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('adminToken');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: defaultHeaders,
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(JSON.stringify(error));
  }

  return response.json();
};

// Admin authentication API
export const adminAuthApi = {
  login: (credentials) => apiCall('/api/auth/admin-login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  forgotPassword: (email) => apiCall('/api/auth/admin-forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  
  getDashboardStats: () => apiCall('/api/admin/dashboard-stats'),
};

// Super Admin API (for backward compatibility)
export const superAdminAPI = {
  login: (credentials) => apiCall('/api/auth/super-admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  getSystemMetrics: () => apiCall('/api/system-metrics'),
  
  getErrorLogs: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/activity-logs?${queryString}`);
  },
  
  exportErrorLogs: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/activity-logs/export?${queryString}`);
  },
};