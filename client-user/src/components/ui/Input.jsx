import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Input = forwardRef(({ 
  type = 'text', 
  className = '', 
  placeholder,
  disabled = false,
  error,
  icon,
  rightIcon,
  label,
  ...props 
}, ref) => {
  const baseStyles = 'w-full px-3 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white';
  
  const errorStyles = 'border-red-300 focus:ring-red-500';
  const normalStyles = 'border-gray-300';
  const disabledStyles = 'opacity-50 cursor-not-allowed bg-gray-100';
  const iconStyles = 'pl-10';
  const rightIconStyles = 'pr-10';

  const inputClassName = cn(
    baseStyles,
    error ? errorStyles : normalStyles,
    disabled ? disabledStyles : '',
    icon ? iconStyles : '',
    rightIcon ? rightIconStyles : '',
    className
  );

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={inputClassName}
          placeholder={placeholder}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600" data-testid="input-error">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;