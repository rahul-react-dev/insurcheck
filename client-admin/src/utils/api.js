import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV 
    ? 'http://localhost:5000/api' 
    : `${window.location.protocol}//${window.location.hostname}:5000/api`
);

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

// Response interceptor for handling responses and errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);

    // Handle different types of errors
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear local storage and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          // Only redirect if not already on login page
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/login')) {
            if (currentPath.includes('/admin/')) {
              window.location.href = '/admin/login';
            } else {
              window.location.href = '/super-admin/login';
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
  superAdminLogin: (credentials) => api.post('/auth/super-admin/login', credentials),
  adminLogin: (credentials) => api.post('/auth/admin/login', credentials),
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
  getAll: (params) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  processRefund: (id, data) => api.post(`/payments/${id}/refund`, data),
  exportPayments: (params) => api.get('/payments/export', { params, responseType: 'blob' }),
};

// Invoice Management APIs
export const invoiceAPI = {
  getAll: (params) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  generate: (data) => api.post('/invoices/generate', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  send: (id) => api.post(`/invoices/${id}/send`),
  markPaid: (id, data) => api.put(`/invoices/${id}/mark-paid`, data),
  downloadPDF: (id) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
  exportInvoices: (params) => api.get('/invoices/export', { params, responseType: 'blob' }),
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

  // Dashboard & Metrics
  getSystemMetrics: () => api.get('/system-metrics'),
  getErrorLogs: (params) => api.get('/activity-logs', { params: { ...params, level: 'error' } }),
  exportErrorLogs: (data) => api.post('/activity-logs/export', data),

  // Tenants
  getTenants: (params) => api.get('/tenants', { params }),
  createTenant: (data) => api.post('/tenants', data),
  updateTenant: (id, data) => api.put(`/tenants/${id}`, data),
  deleteTenant: (id) => api.delete(`/tenants/${id}`),
  getTenantUsers: (id) => api.get(`/tenants/${id}/users`),

  // Subscriptions & Plans
  getSubscriptionPlans: (params) => api.get('/subscription-plans', { params }),
  createSubscriptionPlan: (data) => api.post('/subscription-plans', data),
  updateSubscriptionPlan: (id, data) => api.put(`/subscription-plans/${id}`, data),
  deleteSubscriptionPlan: (id) => api.delete(`/subscription-plans/${id}`),
  getSubscriptions: (params) => api.get('/subscriptions', { params }),
  createSubscription: (data) => api.post('/subscriptions', data),
  updateSubscription: (id, data) => api.put(`/subscriptions/${id}`, data),
  cancelSubscription: (id) => api.patch(`/subscriptions/${id}/cancel`),

  // Payments & Invoices
  getPayments: (params) => api.get('/payments', { params }),
  getInvoices: (params) => api.get('/invoices', { params }),
  generateInvoice: (data) => api.post('/invoices/generate', data),
  updateInvoiceStatus: (id, status) => api.patch(`/invoices/${id}/status`, { status }),
  downloadInvoice: (id) => api.get(`/invoices/${id}/download`, { responseType: 'blob' }),

  // Activity Logs
  getActivityLogs: (params) => api.get('/activity-logs', { params }),
  exportActivityLogs: (params) => api.post('/activity-logs/export', params),

  // Deleted Documents
  getDeletedDocuments: (params) => api.get('/deleted-documents', { params }),
  restoreDocument: (id) => api.post(`/deleted-documents/${id}/restore`),
  permanentlyDeleteDocument: (id) => api.delete(`/deleted-documents/${id}/permanent`),

  // System Configuration
  getSystemConfig: () => api.get('/system-config'),
  updateSystemConfig: (key, data) => api.put(`/system-config/${key}`, data),
  createSystemConfig: (data) => api.post('/system-config', data),

  // Analytics
  getAnalytics: (params) => api.get('/analytics', { params }),
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getTenantAnalytics: (tenantId, params) => api.get(`/analytics/tenant/${tenantId}`, { params }),

  // Users
  getUsers: (params) => api.get('/users', { params }),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),

  // Tenant State Management
  getTenantStates: (params) => api.get('/tenant-states', { params }),
  updateTenantState: (id, data) => api.put(`/tenant-states/${id}`, data),

  // Test endpoints
  runTests: () => api.get('/test/super-admin-features')
};

export default api;