// Centralized API configuration
export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // PRIORITY 1: Development environments (localhost or Replit) - use relative URLs
    // The Vite proxy will forward /api requests to localhost:5000
    if (hostname === 'localhost' || hostname === '127.0.0.1' || 
        hostname.includes('replit.dev') || hostname.includes('repl.co')) {
      if (import.meta.env.DEV) {
        console.log('[API] Development environment detected:', hostname);
        console.log('[API] Using relative URL with Vite proxy');
      }
      return ''; // Empty string means relative to current origin
    }
    
    // PRIORITY 2: Production domains - check environment variable first, then fallback to mapping
    if (hostname === 'dev-user.insurcheck.ai') {
      const envUrl = import.meta.env.VITE_API_BASE_URL;
      if (envUrl) {
        console.log('[API] Using environment API URL for dev-user:', envUrl);
        return envUrl;
      }
      console.log('[API] Using fallback production API URL for dev-user domain');
      return 'https://dev-api.insurcheck.ai';
    }
    
    if (hostname === 'prod-user.insurcheck.ai') {
      const envUrl = import.meta.env.VITE_API_BASE_URL;
      if (envUrl) {
        console.log('[API] Using environment API URL for prod-user:', envUrl);
        return envUrl;
      }
      console.log('[API] Using fallback production API URL for prod-user domain');
      return 'https://prod-api.insurcheck.ai';
    }
    
    // PRIORITY 3: Other environments - check environment variable or use origin
    if (import.meta.env.VITE_API_BASE_URL) {
      console.log('[API] Using environment API URL for unknown domain:', import.meta.env.VITE_API_BASE_URL);
      return import.meta.env.VITE_API_BASE_URL;
    }
    
    // Fallback - same origin
    console.log('[API] Using same origin fallback:', window.location.origin);
    return window.location.origin;
  }
  
  // Fallback for server-side rendering
  return '';
};

export const API_BASE_URL = getApiBaseUrl();