// Centralized API configuration
export const getApiBaseUrl = () => {
  // First check for environment variable (production)
  if (import.meta.env.VITE_API_BASE_URL) {
    if (import.meta.env.DEV) {
      console.log('[API] Using environment API URL:', import.meta.env.VITE_API_BASE_URL);
    }
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // If running in development (localhost or Replit), use relative URLs
    // The Vite proxy will forward /api requests to localhost:5000
    if (hostname === 'localhost' || hostname === '127.0.0.1' || 
        hostname.includes('replit.dev') || hostname.includes('repl.co')) {
      if (import.meta.env.DEV) {
        console.log('[API] Using relative URL with Vite proxy');
      }
      return ''; // Empty string means relative to current origin
    }
    
    // Fallback - same origin
    return window.location.origin;
  }
  
  // Fallback for server-side rendering
  return '';
};

export const API_BASE_URL = getApiBaseUrl();