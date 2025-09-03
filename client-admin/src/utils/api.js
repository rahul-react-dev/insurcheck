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

// Helper function for making authenticated API calls with error isolation
export const apiCall = async (endpoint, options = {}) => {
  try {
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

    // Add request timeout and error isolation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(fullUrl, {
      headers: defaultHeaders,
      ...options,
      signal: controller.signal,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);
    console.log('[API] Response status:', response.status);
    console.log('[API] Response ok:', response.ok);

  if (!response.ok) {
    let error;
    try {
      error = await response.json();
    } catch (parseError) {
      // If response is not JSON, create a generic error
      error = {
        message: `HTTP ${response.status} Error`,
        status: response.status
      };
    }
    
    console.error('[API] Error response:', error);
    console.error('[API] URL:', fullUrl);
    console.error('[API] Status:', response.status);
    
    // Create an isolated error object that won't corrupt global state
    const apiError = new Error(error.message || `HTTP ${response.status} Error`);
    apiError.response = {
      status: response.status,
      data: error
    };
    apiError.url = fullUrl;
    apiError.timestamp = new Date().toISOString();
    
    // Critical: Don't let this error propagate to global error handlers
    throw apiError;
  }

  return response.json();
    
  } catch (error) {
    // Critical: Isolate errors to prevent blocking other API calls
    console.error('[API] 🚨 Request failed:', error);
    console.error('[API] 🎯 Endpoint:', endpoint);
    console.error('[API] 🔍 Error type:', error.name);
    console.error('[API] 📋 Full error:', error);
    
    // CRITICAL: Check if this is already a processed API error
    if (error.response && error.url) {
      // This is already our processed API error, don't double-wrap it
      console.error('[API] ⚠️ Re-throwing processed API error');
      throw error;
    }
    
    // Create isolated error that won't corrupt application state
    const isolatedError = new Error(error.message || 'Network Error');
    isolatedError.name = error.name || 'APIError';
    isolatedError.endpoint = endpoint;
    isolatedError.timestamp = new Date().toISOString();
    isolatedError.isIsolated = true; // Mark as isolated
    
    if (error.name === 'AbortError') {
      isolatedError.message = 'Request timeout - please try again';
    }
    
    console.error('[API] ✅ Created isolated error:', isolatedError);
    throw isolatedError;
  }
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
  getSubscriptionLimits: () => apiCall('/api/admin/users/subscription-limits'),
  
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

  // Notification Templates Management API
  getNotificationTemplates: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/admin/notification-templates?${queryString}`);
  },

  getNotificationTemplateStats: () => apiCall('/api/admin/notification-templates/stats'),

  createNotificationTemplate: (templateData) => apiCall('/api/admin/notification-templates', {
    method: 'POST',
    body: JSON.stringify(templateData),
  }),

  updateNotificationTemplate: (id, templateData) => apiCall(`/api/admin/notification-templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(templateData),
  }),

  deleteNotificationTemplate: (id) => apiCall(`/api/admin/notification-templates/${id}`, {
    method: 'DELETE',
  }),

  previewNotificationTemplate: (templateData) => apiCall('/api/admin/notification-templates/preview', {
    method: 'POST',
    body: JSON.stringify(templateData),
  }),

  getNotificationTemplateAuditLogs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/admin/notification-templates/audit-logs?${queryString}`);
  },

  // Admin Invoices Management API
  getInvoices: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/admin/invoices?${queryString}`);
  },

  getInvoiceStats: () => apiCall('/api/admin/invoices/stats'),

  getInvoiceDetails: (invoiceId) => apiCall(`/api/admin/invoices/${invoiceId}`),

  processPayment: (paymentData) => apiCall('/api/admin/invoices/pay', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  }),

  downloadReceipt: (invoiceId) => {
    return fetch(`${API_BASE_URL}/api/admin/invoices/${invoiceId}/receipt`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
  },

  exportInvoices: (format = 'csv', filters = {}) => {
    const queryString = new URLSearchParams({ format, ...filters }).toString();
    return fetch(`${API_BASE_URL}/api/admin/invoices/export?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
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
  
  // Usage Analytics
  getUsageAnalytics: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/super-admin/usage-analytics?${queryString}`);
  },
  getComplianceAnalytics: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/super-admin/compliance-analytics?${queryString}`);
  },
  exportUsageReport: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/super-admin/export-usage-report?${queryString}`);
  },
  
  // Tenant Analytics
  getTenantAnalytics: (filters) => {
    const queryString = new URLSearchParams(filters).toString();
    return apiCall(`/api/super-admin/tenant-analytics?${queryString}`);
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
  restoreDocument: (id) => apiCall(`/api/deleted-documents/${id}/restore`, {
    method: 'POST',
  }),
  recoverDocument: (id) => apiCall(`/api/deleted-documents/${id}/restore`, {
    method: 'POST',
  }),
  permanentlyDeleteDocument: (id) => apiCall(`/api/deleted-documents/${id}`, {
    method: 'DELETE',
  }),
  // S3 Document Operations
  viewDocument: (id) => apiCall(`/api/deleted-documents/${id}/view`),
  downloadDocument: (id) => apiCall(`/api/deleted-documents/${id}/download`),
  
  // Invoice Management
  generateInvoice: (tenantId) => apiCall(`/api/super-admin/invoice-generate/${tenantId}`, {
    method: 'POST',
  }),
  generateAllInvoices: () => apiCall('/api/super-admin/invoice-generate-all', {
    method: 'POST',
  }),
  downloadInvoice: (id) => apiCall(`/api/invoices/${id}/download`),
  getInvoiceLogs: (params) => {
    const queryString = new URLSearchParams(params || {}).toString();
    return apiCall(`/api/super-admin/invoice-logs?${queryString}`);
  },
  retryInvoiceGeneration: (logId) => apiCall(`/api/super-admin/invoice-retry/${logId}`, {
    method: 'POST',
  }),
  getInvoiceConfig: () => apiCall('/api/super-admin/invoice-config'),
  updateInvoiceConfig: (config) => apiCall('/api/super-admin/invoice-config', {
    method: 'POST',
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
  markPaid: (id) => apiCall(`/api/super-admin/invoices/${id}/paid`, {
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