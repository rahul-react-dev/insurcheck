import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const usePageLoader = (minLoadTime = 800) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const location = useLocation();

  useEffect(() => {
    const startTime = Date.now();
    setIsLoading(true);

    // Set different messages based on the route
    const routeMessages = {
      '/': 'Loading homepage...',
      '/login': 'Loading login...',
      '/signup': 'Loading signup...',
      '/dashboard': 'Loading dashboard...',
      '/forgot-password': 'Loading password reset...',
      '/verify-email': 'Loading email verification...',
      '/terms': 'Loading terms...',
      '/privacy': 'Loading privacy policy...'
    };

    setLoadingMessage(routeMessages[location.pathname] || 'Loading page...');

    // Simulate minimum loading time for better UX
    const timer = setTimeout(() => {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadTime - elapsed);
      
      setTimeout(() => {
        setIsLoading(false);
      }, remainingTime);
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname, minLoadTime]);

  return { isLoading, loadingMessage, setLoadingMessage };
};