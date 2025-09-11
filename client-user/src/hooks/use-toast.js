import * as React from 'react';

export function useToast() {
  const [toasts, setToasts] = React.useState([]);

  const toast = React.useCallback((props) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toastWithId = { ...props, id };
    
    setToasts((prev) => [...prev, toastWithId]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);

    return {
      id,
      dismiss: () => setToasts((prev) => prev.filter((t) => t.id !== id)),
    };
  }, []);

  const dismiss = React.useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    toast,
    dismiss,
    toasts,
  };
}