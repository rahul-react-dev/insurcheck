import axios from 'axios';

// API configuration for user frontend
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
      console.log('[API] Login request:', credentials);
      const response = await api.post('/auth/login', credentials);
      console.log('[API] Login response:', response.data);
      return response;
    } catch (error) {
      console.error('[API] Login error:', error);
      throw error;
    }
  },

  signup: async (userData) => {
    try {
      console.log('[API] Signup request:', userData);
      const response = await api.post('/auth/signup', userData);
      console.log('[API] Signup response:', response.data);
      return response;
    } catch (error) {
      console.error('[API] Signup error:', error);
      throw error;
    }
  },

  checkEmail: async (email) => {
    try {
      console.log('[API] Check email request:', email);
      const response = await api.post('/auth/check-email', { email });
      console.log('[API] Check email response:', response.data);
      return response;
    } catch (error) {
      console.error('[API] Check email error:', error);
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
    console.log('[API] Making request to:', endpoint);
    console.log('[API] Options:', options);
    
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
    console.log('[API] Response:', response.data);
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
    console.log('[API] Verify email request:', tokenData);
    const response = await api.post('/auth/verify-email', tokenData);
    console.log('[API] Verify email response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] Verify email error:', error);
    throw error;
  }
};

authApi.resendVerification = async (emailData) => {
  try {
    console.log('[API] Resend verification request:', emailData);
    const response = await api.post('/auth/resend-verification', emailData);
    console.log('[API] Resend verification response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] Resend verification error:', error);
    throw error;
  }
};

// Legacy export for backward compatibility
export const loginApi = authApi.login;
export const logoutApi = authApi.logout;

export default api;