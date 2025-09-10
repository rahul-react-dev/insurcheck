import axios from 'axios';

// API configuration for user frontend
// Use relative URLs since server serves the frontend on same port
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // If running in development (localhost or Replit), use relative URLs
    if (hostname === 'localhost' || hostname === '127.0.0.1' || 
        hostname.includes('replit.dev') || hostname.includes('repl.co')) {
      console.log('[API] Using relative URL');
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

// Legacy export for backward compatibility
export const loginApi = authApi.login;
export const logoutApi = authApi.logout;

export default api;