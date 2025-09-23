import axios from 'axios';

import { API_BASE_URL } from './config.js';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000, // 30 second timeout
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
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response error:', error);

    // Don't redirect on login page errors
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      // Only redirect if not on login page
      // window.location.href = '/login';
    }

    // Return a properly formatted error
    return Promise.reject(error);
  }
);

// Auth API functions
export const authApi = {
  login: async (credentials) => {
    try {
      if (import.meta.env.DEV) {
        console.log('[API] Login request initiated');
      }
      const response = await api.post('/auth/login', credentials);
      if (import.meta.env.DEV) {
        console.log('[API] Login response received');
      }
      return response;
    } catch (error) {
      console.error('[API] Login error:', error.response?.status || 'Network error');
      throw error;
    }
  },

  signup: async (userData) => {
    try {
      if (import.meta.env.DEV) {
        console.log('[API] Signup request initiated');
      }
      const response = await api.post('/auth/signup', userData);
      if (import.meta.env.DEV) {
        console.log('[API] Signup response received');
      }
      return response;
    } catch (error) {
      console.error('[API] Signup error:', error.response?.status || 'Network error');
      throw error;
    }
  },

  checkEmail: async (email) => {
    try {
      if (import.meta.env.DEV) {
        console.log('[API] Check email request initiated');
      }
      const response = await api.post('/auth/check-email', { email });
      if (import.meta.env.DEV) {
        console.log('[API] Check email response received');
      }
      return response;
    } catch (error) {
      console.error('[API] Check email error:', error.response?.status || 'Network error');
      throw error;
    }
  },

  logout: () => {
    return api.post('/auth/logout');
  }
};

// Generic API request function (similar to client-admin's apiCall)
export const apiRequest = async (endpoint, options = {}) => {
  try {
    if (import.meta.env.DEV) {
      console.log('[API] Making request to:', endpoint);
    }
    if (import.meta.env.DEV) {
      console.log('[API] Options:', options);
    }
    
    // Remove the /api prefix if it's already included in the endpoint
    const cleanEndpoint = endpoint.startsWith('/api') ? endpoint.replace('/api', '') : endpoint;
    
    const config = {
      method: options.method || 'GET',
      url: cleanEndpoint,
      ...options,
    };

    // Handle request body
    if (options.body) {
      config.data = JSON.parse(options.body);
      delete config.body;
    }

    const response = await api(config);
    if (import.meta.env.DEV) {
      console.log('[API] Response received successfully');
    }
    return response.data;
    
  } catch (error) {
    console.error('[API] Request failed:', error);
    console.error('[API] Endpoint:', endpoint);
    
    // Extract error message from response
    let errorMessage = 'Network error';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Create a consistent error object
    const apiError = new Error(errorMessage);
    apiError.response = error.response;
    apiError.status = error.response?.status;
    apiError.data = error.response?.data;
    
    throw apiError;
  }
};

// Add email verification functions to authApi
authApi.verifyEmail = async (tokenData) => {
  try {
    if (import.meta.env.DEV) {
      console.log('[API] Verify email request initiated');
    }
    const response = await api.post('/auth/verify-email', tokenData);
    if (import.meta.env.DEV) {
      console.log('[API] Verify email response received');
    }
    return response.data;
  } catch (error) {
    console.error('[API] Verify email error:', error.response?.status || 'Network error');
    throw error;
  }
};

authApi.resendVerification = async (emailData) => {
  try {
    if (import.meta.env.DEV) {
      console.log('[API] Resend verification request initiated');
    }
    const response = await api.post('/auth/resend-verification', emailData);
    if (import.meta.env.DEV) {
      console.log('[API] Resend verification response received');
    }
    return response.data;
  } catch (error) {
    console.error('[API] Resend verification error:', error.response?.status || 'Network error');
    throw error;
  }
};

// Password reset functions
authApi.forgotPassword = async (emailData) => {
  try {
    if (import.meta.env.DEV) {
      console.log('[API] Forgot password request initiated');
    }
    const response = await api.post('/auth/forgot-password', emailData);
    if (import.meta.env.DEV) {
      console.log('[API] Forgot password response received');
    }
    return response.data;
  } catch (error) {
    console.error('[API] Forgot password error:', error.response?.status || 'Network error');
    throw error;
  }
};

authApi.validateResetToken = async (token) => {
  try {
    if (import.meta.env.DEV) {
      console.log('[API] Validate reset token request initiated');
    }
    const response = await api.get(`/auth/validate-reset-token?token=${encodeURIComponent(token)}`);
    if (import.meta.env.DEV) {
      console.log('[API] Validate reset token response received');
    }
    return response.data;
  } catch (error) {
    console.error('[API] Validate reset token error:', error.response?.status || 'Network error');
    throw error;
  }
};

authApi.resetPassword = async (resetData) => {
  try {
    if (import.meta.env.DEV) {
      console.log('[API] Reset password request initiated');
    }
    const response = await api.post('/auth/reset-password', resetData);
    if (import.meta.env.DEV) {
      console.log('[API] Reset password response received');
    }
    return response.data;
  } catch (error) {
    console.error('[API] Reset password error:', error.response?.status || 'Network error');
    throw error;
  }
};

// User API functions for audit logs and other user-specific operations
export const userApi = {
  // Audit logs functionality
  getActivityLogs: async (params = {}) => {
    try {
      if (import.meta.env.DEV) {
        console.log('[API] Get activity logs request initiated');
        console.log('[API] Params:', params);
      }
      const response = await api.get('/user/activity-logs', { params });
      if (import.meta.env.DEV) {
        console.log('[API] Activity logs response received');
      }
      return response.data;
    } catch (error) {
      console.error('[API] Activity logs error:', error.response?.status || 'Network error');
      throw error;
    }
  },

  // Add other user-specific endpoints here as needed
  getProfile: async () => {
    try {
      if (import.meta.env.DEV) {
        console.log('[API] Get profile request initiated');
      }
      const response = await api.get('/user/profile');
      if (import.meta.env.DEV) {
        console.log('[API] Profile response received');
      }
      return response.data;
    } catch (error) {
      console.error('[API] Profile error:', error.response?.status || 'Network error');
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      if (import.meta.env.DEV) {
        console.log('[API] Update profile request initiated');
      }
      const response = await api.put('/user/profile', profileData);
      if (import.meta.env.DEV) {
        console.log('[API] Update profile response received');
      }
      return response.data;
    } catch (error) {
      console.error('[API] Update profile error:', error.response?.status || 'Network error');
      throw error;
    }
  }
};

// Legacy export for backward compatibility
export const loginApi = authApi.login;
export const logoutApi = authApi.logout;

export default api;