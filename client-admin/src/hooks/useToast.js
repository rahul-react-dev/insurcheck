import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration + 300); // Extra time for exit animation
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
    success: useCallback((message, duration) => showToast(message, 'success', duration), [showToast]),
    error: useCallback((message, duration) => showToast(message, 'error', duration), [showToast]),
    warning: useCallback((message, duration) => showToast(message, 'warning', duration), [showToast]),
    info: useCallback((message, duration) => showToast(message, 'info', duration), [showToast])
  };
};