import React, { useState, useEffect } from 'react';

const Toast = ({ message, type = 'success', duration = 4000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 300); // Animation duration
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const getToastStyles = () => {
    const baseStyles = 'fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 flex items-center space-x-3 transition-all duration-300';
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-600 text-white ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`;
      case 'error':
        return `${baseStyles} bg-red-600 text-white ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`;
      case 'warning':
        return `${baseStyles} bg-yellow-600 text-white ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`;
      case 'info':
        return `${baseStyles} bg-blue-600 text-white ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`;
      default:
        return `${baseStyles} bg-gray-600 text-white ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-exclamation-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'info':
        return 'fas fa-info-circle';
      default:
        return 'fas fa-bell';
    }
  };

  return (
    <div className={getToastStyles()}>
      <i className={`${getIcon()} text-lg`}></i>
      <span className="font-medium">{message}</span>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => {
            setIsVisible(false);
            onClose?.();
          }, 300);
        }}
        className="ml-2 text-white hover:text-gray-200 transition-colors"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default Toast;