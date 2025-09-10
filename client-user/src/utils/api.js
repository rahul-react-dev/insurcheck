import axios from 'axios';

// API configuration for user frontend
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // If running in development (localhost or Replit), point to server port
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('[API] Using localhost server URL');
      return 'http://localhost:3000'; // Server runs on port 3000
    } else if (hostname.includes('replit.dev') || hostname.includes('repl.co')) {
      console.log('[API] Using Replit server URL');
      // For Replit, construct URL to point to port 3000
      const protocol = window.location.protocol;
      const baseUrl = hostname.replace(/:\d+$/, ''); // Remove any existing port
      return `${protocol}//${baseUrl}:3000`;
    }
    
    // Production - same origin (when frontend and backend are served from same port)
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

// Generic API request function
export const apiRequest = async (url, options = {}) => {
  try {
    const config = {
      method: options.method || 'GET',
      url: url,
      ...options,
    };

    // If there's a body, parse it as JSON
    if (options.body) {
      config.data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
    }

    console.log('[API] Request:', config.method, config.url, config.data);
    const response = await api(config);
    console.log('[API] Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] Error:', error);
    
    // Return error in a consistent format
    if (error.response?.data) {
      throw error.response.data;
    } else {
      throw { success: false, message: error.message || 'Network error occurred' };
    }
  }
};

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