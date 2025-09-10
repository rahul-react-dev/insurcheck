import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useToast } from './use-toast';

// Hook for handling automatic logout on inactivity
export const useInactivityLogout = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const warningShownRef = useRef(false);
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);

  const resetInactivityTimer = () => {
    // Update last activity timestamp
    localStorage.setItem('lastActivity', new Date().toISOString());
    
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    
    warningShownRef.current = false;

    // Check if user has an active session
    const sessionType = localStorage.getItem('sessionType');
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    const token = localStorage.getItem('token');
    
    if (!token || !sessionExpiry) {
      return;
    }

    const expiryTime = new Date(sessionExpiry);
    const now = new Date();
    
    // If session has already expired
    if (now >= expiryTime) {
      handleSessionExpiry();
      return;
    }

    let inactivityTimeout;
    let warningTimeout;

    // Set timeout based on session type
    if (sessionType === 'remember') {
      // For Remember Me sessions, check for 7 days of inactivity
      inactivityTimeout = 7 * 24 * 60 * 60 * 1000; // 7 days
      warningTimeout = inactivityTimeout - (60 * 60 * 1000); // Warn 1 hour before
    } else {
      // For regular sessions, 30 minutes of inactivity
      inactivityTimeout = 30 * 60 * 1000; // 30 minutes
      warningTimeout = 25 * 60 * 1000; // Warn after 25 minutes
    }

    // Set warning timer
    warningTimeoutRef.current = setTimeout(() => {
      if (!warningShownRef.current) {
        warningShownRef.current = true;
        toast({
          type: 'warning',
          title: 'Session Expiring Soon',
          description: sessionType === 'remember' 
            ? 'Your session will expire in 1 hour due to inactivity.'
            : 'Your session will expire in 5 minutes due to inactivity.'
        });
      }
    }, warningTimeout);

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      handleInactivityLogout();
    }, inactivityTimeout);
  };

  const handleSessionExpiry = () => {
    dispatch(logout());
    toast({
      type: 'info',
      title: 'Session Expired',
      description: 'Your session has expired. Please log in again.'
    });
    window.location.href = '/login';
  };

  const handleInactivityLogout = () => {
    dispatch(logout());
    toast({
      type: 'info',
      title: 'Logged Out Due to Inactivity',
      description: 'You have been logged out due to inactivity.'
    });
    window.location.href = '/login';
  };

  const checkSessionValidity = () => {
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    const token = localStorage.getItem('token');
    
    if (!token || !sessionExpiry) {
      return false;
    }

    const expiryTime = new Date(sessionExpiry);
    const now = new Date();
    
    if (now >= expiryTime) {
      handleSessionExpiry();
      return false;
    }

    return true;
  };

  useEffect(() => {
    // Check session validity on mount
    if (!checkSessionValidity()) {
      return;
    }

    // Initialize inactivity timer
    resetInactivityTimer();

    // Events that indicate user activity
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Reset timer on any user activity
    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Attach event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Check session validity every minute
    const sessionCheckInterval = setInterval(() => {
      checkSessionValidity();
    }, 60000); // 1 minute

    // Cleanup function
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      clearInterval(sessionCheckInterval);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [dispatch, toast]);

  return {
    resetInactivityTimer,
    checkSessionValidity
  };
};