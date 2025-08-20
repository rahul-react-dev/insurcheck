import React from 'react';

const Label = ({ children, htmlFor, className = '', ...props }) => {
  const classes = `
    text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <label htmlFor={htmlFor} className={classes} {...props}>
      {children}
    </label>
  );
};

export default Label;
export { Label };