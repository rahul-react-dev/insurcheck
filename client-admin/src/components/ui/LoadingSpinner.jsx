import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-600',
    green: 'border-green-600',
    red: 'border-red-600',
    yellow: 'border-yellow-600'
  };

  return (
    <div 
      className={`
        animate-spin rounded-full border-2 border-transparent
        ${sizeClasses[size]} 
        ${colorClasses[color]}
        border-t-current
        ${className}
      `}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;