import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ title, description, variant = 'default' }) => {
    const id = Date.now() + Math.random();
    const newToast = { id, title, description, variant };

    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);

    // Show global notification if available
    if (window.showNotification) {
      const type = variant === 'destructive' ? 'error' : variant === 'default' ? 'info' : variant;
      window.showNotification(title || description, type);
    }

    return { id, dismiss: () => setToasts((prev) => prev.filter((t) => t.id !== id)) };
  }, []);

  const dismiss = useCallback((toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  return { toast, toasts, dismiss };
};