
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/super-admin/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  superAdminLogin: (credentials) => api.post('/auth/super-admin/login', credentials),
  adminLogin: (credentials) => api.post('/auth/admin/login', credentials),
};

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

export default api;
