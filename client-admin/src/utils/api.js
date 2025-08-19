import axios from 'axios';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (import.meta.env.DEV) {
    const hostname = window.location.hostname;
    if (hostname.includes('replit.dev')) {
      // Replace the port in the Replit URL
      const serverUrl = hostname.replace('-3000-', '-5000-');
      return `${window.location.protocol}//${serverUrl}/api`;
    }
    return 'http://localhost:5000/api';
  }

  return `${window.location.protocol}//${window.location.hostname}:5000/api`;
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Function to show session expired popup
const showSessionExpiredPopup = () => {
  // Remove any existing popup
  const existingPopup = document.getElementById('session-expired-popup');
  if (existingPopup) {
    existingPopup.remove();
  }

  // Create popup HTML
  const popup = document.createElement('div');
  popup.id = 'session-expired-popup';
  popup.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="
        background: white;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        width: 90%;
        text-align: center;
      ">
        <div style="
          width: 60px;
          height: 60px;
          margin: 0 auto 16px;
          background: #fee2e2;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="24" height="24" fill="#dc2626" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <h3 style="
          margin: 0 0 8px;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        ">
          Session Expired
        </h3>
        <p style="
          margin: 0 0 20px;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
        ">
          Your session has expired. Please login again to continue.
        </p>
        <button id="session-expired-ok" style="
          background: #3b82f6;
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
          Login Again
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  // Handle OK button click
  document.getElementById('session-expired-ok').onclick = () => {
    popup.remove();
    
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    
    // Redirect to appropriate login page
    const currentPath = window.location.pathname;
    if (currentPath.includes('/admin/') && !currentPath.includes('/super-admin/')) {
      window.location.href = '/admin/login';
    } else {
      window.location.href = '/super-admin/login';
    }
  };
};

// Response interceptor for handling responses and errors
api.interceptors.response.use(
  (response) => {
    // If the response data contains user info and token, update local storage
    if (response.data && response.data.user && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('isAuthenticated', 'true'); // Mark as authenticated
    }
    // If the response data contains just the token (e.g., refresh token), update it
    else if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data; // Return only the data part
  },
  (error) => {
    console.error('API Error:', error);

    // Handle network/connection errors first
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      const networkError = {
        status: 0,
        message: 'Unable to connect to server. Please check if the server is running.',
        errors: [],
        timestamp: new Date().toISOString()
      };
      return Promise.reject(networkError);
    }

    // Handle different types of errors
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Check if it's a token expiration or invalid token
          const isTokenExpired = data?.message?.includes('expired') || 
                                 data?.message?.includes('invalid') ||
                                 data?.error?.includes('expired') ||
                                 data?.error?.includes('invalid') ||
                                 error.message?.includes('expired');

          // Clear authentication data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('isAuthenticated');

          // Only show popup and redirect if not already on login page
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/login')) {
            if (isTokenExpired) {
              // Show session expired popup for token expiration
              showSessionExpiredPopup();
            } else {
              // Direct redirect for other 401 errors
              if (currentPath.includes('/admin/') && !currentPath.includes('/super-admin/')) {
                window.location.href = '/admin/login';
              } else {
                window.location.href = '/super-admin/login';
              }
            }
          }
          break;

        case 403:
          // Forbidden - insufficient permissions
          console.error('Access forbidden - insufficient permissions');
          break;

        case 404:
          // Not found
          console.error('Resource not found');
          break;

        case 422:
          // Validation error
          console.error('Validation error:', data);
          break;

        case 429:
          // Rate limit exceeded
          console.error('Rate limit exceeded');
          break;

        case 500:
          // Server error
          console.error('Server error:', data?.message || 'Internal server error');
          break;

        default:
          console.error('API error:', data?.message || error.message);
      }

      // Create a standardized error object
      const apiError = {
        status,
        message: data?.message || error.message || 'An error occurred',
        errors: data?.errors || [],
        timestamp: new Date().toISOString()
      };

      return Promise.reject(apiError);
    } else if (error.request) {
      // Network error
      const networkError = {
        status: 0,
        message: 'Network error - please check your connection',
        errors: [],
        timestamp: new Date().toISOString()
      };

      console.error('Network error:', error.request);
      return Promise.reject(networkError);
    } else {
      // Something else happened
      const unknownError = {
        status: 0,
        message: error.message || 'An unknown error occurred',
        errors: [],
        timestamp: new Date().toISOString()
      };

      console.error('Unknown error:', error.message);
      return Promise.reject(unknownError);
    }
  }
);

// Auth APIs
export const authAPI = {
  superAdminLogin: (credentials) => api.post('/auth/login', { ...credentials, role: 'super-admin' }),
  adminLogin: (credentials) => api.post('/auth/login', { ...credentials, role: 'tenant-admin' }),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email })
};

// Legacy export for backward compatibility
export const loginApi = authAPI.superAdminLogin;

// Tenant Management APIs
export const tenantAPI = {
  getAll: (params) => api.get('/tenants', { params }),
  create: (data) => api.post('/tenants', data),
  update: (id, data) => api.put(`/tenants/${id}`, data),
  delete: (id) => api.delete(`/tenants/${id}`),
  getUsers: (id) => api.get(`/tenants/${id}/users`),
  assignSubscription: (id, subscriptionData) => api.post(`/tenants/${id}/subscription`, subscriptionData),
  updateTrial: (id, trialData) => api.put(`/tenants/${id}/trial`, trialData),
};

// Subscription Management APIs
export const subscriptionAPI = {
  getPlans: () => api.get('/subscription-plans'),
  createPlan: (data) => api.post('/subscription-plans', data),
  updatePlan: (id, data) => api.put(`/subscription-plans/${id}`, data),
  deletePlan: (id) => api.delete(`/subscription-plans/${id}`),
  getSubscriptions: (params) => api.get('/subscriptions', { params }),
  createSubscription: (data) => api.post('/subscriptions', data),
  updateSubscription: (id, data) => api.put(`/subscriptions/${id}`, data),
  cancelSubscription: (id) => api.put(`/subscriptions/${id}/cancel`),
};

// Payment Management APIs  
export const paymentAPI = {
  getAll: (params) => api.get('/super-admin/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  processRefund: (id, data) => api.post(`/payments/${id}/refund`, data),
  exportPayments: (params) => api.get('/payments/export', { params, responseType: 'blob' }),
};

// Invoice Management APIs
export const invoiceAPI = {
  getAll: (params) => api.get('/super-admin/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  generate: (data) => api.post('/invoices/generate', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  send: (id) => api.post(`/invoices/${id}/send`),
  retry: (id) => api.post(`/invoices/${id}/retry`),
  markPaid: (id) => api.post(`/super-admin/invoices/${id}/paid`),
  downloadPDF: (id) => api.get(`/super-admin/invoices/${id}/download`),
  exportInvoices: (params) => api.get('/super-admin/invoices/export', { params, responseType: 'blob' }),
};

// Invoice Configuration APIs
export const invoiceConfigAPI = {
  getAll: () => {
    console.log('📡 Making API call to /invoice-configs');
    return api.get('/invoice-configs');
  },
  update: (tenantId, config) => {
    console.log('📡 Making API call to update invoice config for tenant:', tenantId);
    return api.post('/invoice-configs', { tenantId, config });
  },
};

// Activity Logs APIs
export const activityLogAPI = {
  getAll: (params) => api.get('/activity-logs', { params }),
  getById: (id) => api.get(`/activity-logs/${id}`),
  export: (params) => api.get('/activity-logs/export', { params, responseType: 'blob' }),
};

// Deleted Documents APIs
export const deletedDocumentAPI = {
  getAll: (params) => api.get('/deleted-documents', { params }),
  restore: (id) => api.post(`/deleted-documents/${id}/restore`),
  permanentDelete: (id) => api.delete(`/deleted-documents/${id}/permanent`),
  bulkRestore: (ids) => api.post('/deleted-documents/bulk-restore', { ids }),
  bulkDelete: (ids) => api.post('/deleted-documents/bulk-delete', { ids }),
};

// System Configuration APIs
export const systemConfigAPI = {
  getAll: () => api.get('/system-config'),
  update: (key, data) => api.put(`/system-config/${key}`, data),
  create: (data) => api.post('/system-config', data),
  delete: (key) => api.delete(`/system-config/${key}`),
};

// Analytics & Metrics APIs
export const analyticsAPI = {
  getSystemMetrics: () => api.get('/system-metrics'),
  getAnalytics: (params) => api.get('/analytics', { params }),
  exportAnalytics: (params) => api.get('/analytics/export', { params, responseType: 'blob' }),
};

// System Health APIs
export const systemAPI = {
  health: () => api.get('/health'),
  status: () => api.get('/system/status'),
  logs: (params) => api.get('/system/logs', { params }),
};

// User Management APIs (for admin panel)
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  resetPassword: (id) => api.post(`/users/${id}/reset-password`),
  toggleStatus: (id) => api.put(`/users/${id}/toggle-status`),
};

// Super Admin APIs
export const superAdminAPI = {
  // Authentication
  login: (credentials) => api.post('/auth/super-admin/login', credentials),

  // System metrics and dashboard
  getSystemMetrics: () => api.get('/system-metrics'),
  getErrorLogs: (params) => api.get('/activity-logs', { params: { ...params, level: 'error' } }),
  exportErrorLogs: (data) => api.post('/activity-logs/export', data),

  // Tenants
  getTenants: (params) => api.get('/tenants', { params }),
  createTenant: (data) => api.post('/tenants', data),
  updateTenant: (id, data) => api.put(`/tenants/${id}`, data),
  deleteTenant: (id) => api.delete(`/tenants/${id}`),
  getTenantUsers: (id) => api.get(`/tenants/${id}/users`),

  // Subscription Plans
  getSubscriptionPlans: (params) => api.get('/subscription-plans', { params }),
  createSubscriptionPlan: (data) => api.post('/subscription-plans', data),
  updateSubscriptionPlan: (id, data) => api.put(`/subscription-plans/${id}`, data),
  deleteSubscriptionPlan: (id) => api.delete(`/subscription-plans/${id}`),
  
  // Tenant Plan Assignment
  assignSubscriptionToTenant: (tenantId, data) => api.post(`/tenants/${tenantId}/subscription`, data),
  getSubscriptions: (params) => api.get('/subscriptions', { params }),
  createSubscription: (data) => api.post('/subscriptions', data),
  updateSubscription: (id, data) => api.put(`/subscriptions/${id}`, data),
  cancelSubscription: (id) => api.patch(`/subscriptions/${id}/cancel`),

  // Payments & Invoices
  getPayments: (params) => api.get('/super-admin/payments', { params }),
  getInvoices: (params) => api.get('/super-admin/invoices', { params }),
  generateInvoice: (data) => api.post('/super-admin/invoices/generate', data),
  updateInvoiceStatus: (id, status) => api.patch(`/invoices/${id}/status`, { status }),
  downloadInvoice: (id) => api.get(`/invoices/${id}/download`, { responseType: 'blob' }),

  // Activity Logs
  getActivityLogs: (params) => api.get('/activity-logs', { params }),
  exportActivityLogs: (params) => api.post('/activity-logs/export', params),

  // Deleted Documents
  getDeletedDocuments: (params) => api.get('/super-admin/deleted-documents', { params }),
  restoreDocument: (id) => api.post(`/super-admin/deleted-documents/${id}/restore`),
  permanentlyDeleteDocument: (id) => api.delete(`/super-admin/deleted-documents/${id}/permanent`),

  // System Configuration
  getSystemConfig: () => api.get('/super-admin/system-config'),
  updateSystemConfig: (key, value) => api.put(`/super-admin/system-config/${key}`, { value }),

  // Analytics
  getAnalytics: (params) => api.get('/super-admin/analytics', { params }),
  getDashboardStats: () => api.get('/super-admin/dashboard-stats'),
  getTenantAnalytics: (tenantId, params) => api.get(`/super-admin/tenants/${tenantId}/analytics`, { params }),
  exportAnalytics: (params) => api.post('/super-admin/analytics/export', params),

  // Users
  getUsers: (params) => api.get('/super-admin/users', { params }),
  createUser: (data) => api.post('/super-admin/users', data),
  updateUser: (id, data) => api.put(`/super-admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/super-admin/users/${id}`),

  // Tenant State Management
  getTenantStates: (params) => api.get('/tenant-states', { params }),
  updateTenantState: (id, data) => api.put(`/tenant-states/${id}`, data),

  // Test endpoints
  runTests: () => api.get('/test/super-admin-features')
};

export default api;