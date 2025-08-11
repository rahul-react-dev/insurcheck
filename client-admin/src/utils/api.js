import axios from 'axios';

const API_BASE_URL = 'https://4714f73d-e452-465c-a879-41dfeee32c0d-00-3hj62dyd2avsv.janeway.replit.dev/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
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

export const loginApi = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response;
  } catch (error) {
    // Ensure we don't cause page reloads on login errors
    throw error;
  }
};

export default api;