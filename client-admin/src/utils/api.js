// API configuration for admin frontend
// Use relative URLs since Vite proxy will handle the backend forwarding
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // If running in development (localhost or Replit), use relative URLs
    // The Vite proxy will forward /api requests to localhost:5000
    if (hostname === 'localhost' || hostname === '127.0.0.1' || 
        hostname.includes('replit.dev') || hostname.includes('repl.co')) {
      console.log('[API] Using relative URL with Vite proxy');
      return ''; // Empty string means relative to current origin
    }
    
    // Production - same origin
    return window.location.origin;
  }
  
  // Fallback for server-side rendering
  return '';
};

export const API_BASE_URL = getApiBaseUrl();
console.log('[API] Configured API_BASE_URL:', API_BASE_URL);

// Helper function for making authenticated API calls
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('adminToken');
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  
  // Debug logging
  console.log('[API] Making request to:', fullUrl);
  console.log('[API] Base URL:', API_BASE_URL);
  console.log('[API] Endpoint:', endpoint);
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(fullUrl, {
    headers: defaultHeaders,
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  console.log('[API] Response status:', response.status);
  console.log('[API] Response ok:', response.ok);

  if (!response.ok) {
    const error = await response.json();
    console.error('[API] Error response:', error);
    throw new Error(JSON.stringify(error));
  }

  return response.json();
};

// Admin authentication API
export const adminAuthApi = {
  login: (credentials) => apiCall('/api/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  forgotPassword: (email) => apiCall('/api/auth/admin/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  
  getDashboardStats: () => apiCall('/api/admin/dashboard-stats'),
  
  // Admin Users Management API
  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/admin/users?${queryString}`);
  },
  
  inviteUser: (userData) => apiCall('/api/admin/users/invite', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  exportUsers: (format = 'csv', search = '') => {
    const queryString = new URLSearchParams({ format, search }).toString();
    return fetch(`${API_BASE_URL}/api/admin/users/export?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
  },
  
  getUserStats: () => apiCall('/api/admin/users/stats'),
  
  // Compliance Rules Management API
  getComplianceRules: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/admin/compliance-rules?${queryString}`);
  },
  
  getComplianceRuleStats: () => apiCall('/api/admin/compliance-rules/stats'),
  
  createComplianceRule: (ruleData) => apiCall('/api/admin/compliance-rules', {
    method: 'POST',
    body: JSON.stringify(ruleData),
  }),
  
  updateComplianceRule: (id, ruleData) => apiCall(`/api/admin/compliance-rules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(ruleData),
  }),
  
  deleteComplianceRule: (id) => apiCall(`/api/admin/compliance-rules/${id}`, {
    method: 'DELETE',
  }),
  
  previewComplianceRule: (ruleData) => apiCall('/api/admin/compliance-rules/preview', {
    method: 'POST',
    body: JSON.stringify(ruleData),
  }),
  
  getComplianceRuleAuditLogs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/admin/compliance-rules/audit-logs?${queryString}`);
  },
};

// Super Admin API (comprehensive - all required methods)
export const superAdminAPI = {
  // Authentication
  login: (credentials) => apiCall('/api/auth/super-admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  // Dashboard & Analytics
  getDashboardStats: () => apiCall('/api/system-metrics'),
  getSystemMetrics: () => apiCall('/api/system-metrics'),
  getAnalytics: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/analytics?${queryString}`);
  },
  getDetailedAnalytics: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/analytics/detailed?${queryString}`);
  },
  getTenantAnalytics: (tenantId, params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/analytics/tenant/${tenantId}?${queryString}`);
  },
  exportAnalytics: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/analytics/export?${queryString}`);
  },
  
  // Activity Logs & Monitoring
  getActivityLogs: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/activity-logs?${queryString}`);
  },
  getErrorLogs: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/activity-logs?${queryString}`);
  },
  exportActivityLogs: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/activity-logs/export?${queryString}`);
  },
  
  // Tenant Management
  getTenants: (params) => {
    const queryString = new URLSearchParams(params || {}).toString();
    return apiCall(`/api/tenants?${queryString}`);
  },
  getTenantsList: () => apiCall('/api/tenants'),
  createTenant: (data) => apiCall('/api/tenants', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateTenant: (id, data) => apiCall(`/api/tenants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteTenant: (id) => apiCall(`/api/tenants/${id}`, {
    method: 'DELETE',
  }),
  getTenantUsers: (tenantId, params) => {
    const queryString = new URLSearchParams(params || {}).toString();
    return apiCall(`/api/tenants/${tenantId}/users?${queryString}`);
  },
  
  // Tenant State Management
  getTenantStates: (params) => {
    const queryString = new URLSearchParams(params || {}).toString();
    return apiCall(`/api/tenant-states?${queryString}`);
  },
  updateTenantState: (id, data) => apiCall(`/api/tenant-states/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Subscription Management
  getSubscriptions: (params) => {
    const queryString = new URLSearchParams(params || {}).toString();
    return apiCall(`/api/subscriptions?${queryString}`);
  },
  createSubscription: (data) => apiCall('/api/subscriptions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateSubscription: (id, data) => apiCall(`/api/subscriptions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  cancelSubscription: (id) => apiCall(`/api/subscriptions/${id}/cancel`, {
    method: 'POST',
  }),
  assignSubscriptionToTenant: (tenantId, data) => apiCall(`/api/tenants/${tenantId}/subscription`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Subscription Plans
  getSubscriptionPlans: (params) => {
    const queryString = new URLSearchParams(params || {}).toString();
    return apiCall(`/api/subscription-plans?${queryString}`);
  },
  createSubscriptionPlan: (data) => apiCall('/api/subscription-plans', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateSubscriptionPlan: (id, data) => apiCall(`/api/subscription-plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteSubscriptionPlan: (id) => apiCall(`/api/subscription-plans/${id}`, {
    method: 'DELETE',
  }),
  
  // Document Management
  getDeletedDocuments: (params) => {
    const queryString = new URLSearchParams(params || {}).toString();
    return apiCall(`/api/documents/deleted?${queryString}`);
  },
  bulkDeleteDocuments: (documentIds) => apiCall('/api/documents/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ documentIds }),
  }),
  bulkRestoreDocuments: (documentIds) => apiCall('/api/documents/bulk-restore', {
    method: 'POST',
    body: JSON.stringify({ documentIds }),
  }),
  restoreDocument: (id) => apiCall(`/api/documents/${id}/restore`, {
    method: 'POST',
  }),
  permanentlyDeleteDocument: (id) => apiCall(`/api/documents/${id}`, {
    method: 'DELETE',
  }),
  
  // Invoice Management
  generateInvoice: (tenantId) => apiCall(`/api/invoices/generate/${tenantId}`, {
    method: 'POST',
  }),
  downloadInvoice: (id) => apiCall(`/api/invoices/${id}/download`),
  getInvoiceLogs: (params) => {
    const queryString = new URLSearchParams(params || {}).toString();
    return apiCall(`/api/invoices/logs?${queryString}`);
  },
  retryInvoiceGeneration: (logId) => apiCall(`/api/invoices/retry/${logId}`, {
    method: 'POST',
  }),
  getInvoiceConfig: () => apiCall('/api/invoices/config'),
  updateInvoiceConfig: (config) => apiCall('/api/invoices/config', {
    method: 'PUT',
    body: JSON.stringify(config),
  }),
  
  // System Configuration
  getSystemConfig: () => apiCall('/api/system-config'),
  createSystemConfig: (data) => apiCall('/api/system-config', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateSystemConfig: (key, data) => apiCall(`/api/system-config/${key}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  batchUpdateSystemConfig: (updates) => apiCall('/api/system-config/batch', {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  
  // Tenant Configuration
  getTenantConfig: (tenantId) => apiCall(`/api/tenant-config/${tenantId}`),
  batchUpdateTenantConfig: (tenantId, updates) => apiCall(`/api/tenant-config/${tenantId}/batch`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
};

// Payment API (for payment management)
export const paymentAPI = {
  getAll: (params) => {
    const queryString = new URLSearchParams(params || {}).toString();
    return apiCall(`/api/payments?${queryString}`);
  },
  getById: (id) => apiCall(`/api/payments/${id}`),
  create: (data) => apiCall('/api/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`/api/payments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`/api/payments/${id}`, {
    method: 'DELETE',
  }),
};

// Invoice API (for invoice management)
export const invoiceAPI = {
  getAll: (params) => {
    const queryString = new URLSearchParams(params || {}).toString();
    return apiCall(`/api/invoices?${queryString}`);
  },
  getById: (id) => apiCall(`/api/invoices/${id}`),
  create: (data) => apiCall('/api/invoices', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`/api/invoices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  markPaid: (id) => apiCall(`/api/invoices/${id}/mark-paid`, {
    method: 'POST',
  }),
  delete: (id) => apiCall(`/api/invoices/${id}`, {
    method: 'DELETE',
  }),
};

// Tenant API (for tenant operations)
export const tenantAPI = {
  getAll: (params) => {
    const queryString = new URLSearchParams(params || {}).toString();
    return apiCall(`/api/tenants?${queryString}`);
  },
  getById: (id) => apiCall(`/api/tenants/${id}`),
  create: (data) => apiCall('/api/tenants', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`/api/tenants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`/api/tenants/${id}`, {
    method: 'DELETE',
  }),
};

// Subscription API (for subscription management)
export const subscriptionAPI = {
  getAll: (params) => {
    const queryString = new URLSearchParams(params || {}).toString();
    return apiCall(`/api/subscriptions?${queryString}`);
  },
  getById: (id) => apiCall(`/api/subscriptions/${id}`),
  create: (data) => apiCall('/api/subscriptions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`/api/subscriptions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  cancel: (id) => apiCall(`/api/subscriptions/${id}/cancel`, {
    method: 'POST',
  }),
  delete: (id) => apiCall(`/api/subscriptions/${id}`, {
    method: 'DELETE',
  }),
};