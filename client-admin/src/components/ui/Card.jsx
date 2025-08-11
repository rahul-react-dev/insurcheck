import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  const baseStyles = 'bg-white rounded-2xl shadow-lg';
  
  const combinedClassName = [
    baseStyles,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  );
};

export default Card;
import React from 'react';

const Card = ({ 
  children, 
  className = '',
  ...props 
}) => {
  const baseStyles = 'bg-white rounded-lg shadow-md border border-gray-200';
  
  const combinedClassName = [
    baseStyles,
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={combinedClassName}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
