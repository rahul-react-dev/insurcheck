
import React from 'react';

const Input = ({ 
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  className = '',
  disabled = false,
  required = false,
  ...props 
}) => {
  const baseStyles = `
    w-full px-3 py-2 border border-gray-300 rounded-lg 
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
    disabled:bg-gray-100 disabled:cursor-not-allowed
    text-gray-900 placeholder-gray-500
    transition-colors duration-200
  `;
  
  const combinedClassName = [
    baseStyles,
    className
  ].filter(Boolean).join(' ');

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={combinedClassName}
      disabled={disabled}
      required={required}
      {...props}
    />
  );
};

export default Input;
