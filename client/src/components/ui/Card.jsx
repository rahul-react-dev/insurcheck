
import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  padding = 'default',
  shadow = 'default',
  border = true,
  hover = false,
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-lg transition-all duration-200';
  
  const paddingClasses = {
    none: '',
    small: 'p-3 sm:p-4',
    default: 'p-4 sm:p-6',
    large: 'p-6 sm:p-8'
  };
  
  const shadowClasses = {
    none: '',
    small: 'shadow-sm',
    default: 'shadow-sm',
    large: 'shadow-lg'
  };
  
  const borderClasses = border ? 'border border-gray-200' : '';
  const hoverClasses = hover ? 'hover:shadow-md hover:scale-[1.01]' : '';
  
  const classes = `
    ${baseClasses}
    ${paddingClasses[padding] || paddingClasses.default}
    ${shadowClasses[shadow] || shadowClasses.default}
    ${borderClasses}
    ${hoverClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;
