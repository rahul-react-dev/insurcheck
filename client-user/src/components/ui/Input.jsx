import React from 'react';

const Input = ({ 
  type = 'text', 
  className = '', 
  placeholder,
  disabled = false,
  ...props 
}) => {
  const baseStyles = 'w-full px-3 py-2 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200';
  
  const disabledStyles = 'opacity-50 cursor-not-allowed bg-gray-100';

  const combinedClassName = [
    baseStyles,
    disabled ? disabledStyles : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <input
      type={type}
      disabled={disabled}
      className={combinedClassName}
      placeholder={placeholder}
      {...props}
    />
  );
};

export default Input;
