
import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = '',
  ...props 
}, ref) => {
  const baseInputClasses = `
    block px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg
    placeholder-gray-400 text-gray-900 text-sm sm:text-base
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    transition-colors duration-200
  `.trim().replace(/\s+/g, ' ');

  const errorClasses = error 
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
    : '';

  const widthClasses = fullWidth ? 'w-full' : '';

  const inputClasses = `
    ${baseInputClasses}
    ${errorClasses}
    ${widthClasses}
    ${leftIcon ? 'pl-10 sm:pl-12' : ''}
    ${rightIcon ? 'pr-10 sm:pr-12' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center justify-center w-10 sm:w-12 pointer-events-none z-10">
            <div className="text-gray-400 text-sm sm:text-base flex items-center justify-center">
              {leftIcon}
            </div>
          </div>
        )}
        
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center justify-center w-10 sm:w-12 z-10">
            <div className="text-gray-400 text-sm sm:text-base flex items-center justify-center cursor-pointer">
              {rightIcon}
            </div>
          </div>
        )}</div>
      </div>
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <i className="fas fa-exclamation-circle mr-1 flex-shrink-0"></i>
          <span>{error}</span>
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
