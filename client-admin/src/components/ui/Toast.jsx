import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Individual Toast Component
const Toast = ({ id, type, title, message, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Show animation
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-hide timer
    const hideTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsRemoving(true);
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 150);
    }, 150);
  };

  const getToastStyles = () => {
    const baseStyles = `
      transform transition-all duration-300 ease-in-out
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      ${isRemoving ? 'scale-95' : 'scale-100'}
    `;

    const typeStyles = {
      [TOAST_TYPES.SUCCESS]: 'bg-green-50 border-green-200 text-green-800',
      [TOAST_TYPES.ERROR]: 'bg-red-50 border-red-200 text-red-800',
      [TOAST_TYPES.WARNING]: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      [TOAST_TYPES.INFO]: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    return `${baseStyles} ${typeStyles[type]}`;
  };

  const getIcon = () => {
    const iconProps = { className: "h-5 w-5 flex-shrink-0" };
    
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return <CheckCircle {...iconProps} className="h-5 w-5 flex-shrink-0 text-green-500" />;
      case TOAST_TYPES.ERROR:
        return <XCircle {...iconProps} className="h-5 w-5 flex-shrink-0 text-red-500" />;
      case TOAST_TYPES.WARNING:
        return <AlertTriangle {...iconProps} className="h-5 w-5 flex-shrink-0 text-yellow-500" />;
      case TOAST_TYPES.INFO:
        return <Info {...iconProps} className="h-5 w-5 flex-shrink-0 text-blue-500" />;
      default:
        return <Info {...iconProps} className="h-5 w-5 flex-shrink-0 text-blue-500" />;
    }
  };

  return (
    <div
      className={`
        max-w-md w-full bg-white border rounded-lg shadow-lg p-4 pointer-events-auto
        ${getToastStyles()}
      `}
      role="alert"
      aria-live="polite"
      data-testid={`toast-${type}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 w-0 flex-1">
          {title && (
            <p className="text-sm font-medium" data-testid="toast-title">
              {title}
            </p>
          )}
          {message && (
            <p className={`text-sm ${title ? 'mt-1' : ''}`} data-testid="toast-message">
              {message}
            </p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
            onClick={handleClose}
            data-testid="toast-close"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Toast Container Component
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div 
      className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none"
      aria-label="Notifications"
      data-testid="toast-container"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

// Toast Hook
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = ({ type = TOAST_TYPES.INFO, title, message, duration = 5000 }) => {
    const id = Date.now() + Math.random();
    const newToast = { id, type, title, message, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  // Convenience methods
  const showSuccess = (title, message, duration) => 
    addToast({ type: TOAST_TYPES.SUCCESS, title, message, duration });
  
  const showError = (title, message, duration) => 
    addToast({ type: TOAST_TYPES.ERROR, title, message, duration });
  
  const showWarning = (title, message, duration) => 
    addToast({ type: TOAST_TYPES.WARNING, title, message, duration });
  
  const showInfo = (title, message, duration) => 
    addToast({ type: TOAST_TYPES.INFO, title, message, duration });

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default Toast;