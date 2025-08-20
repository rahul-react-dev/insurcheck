import React from 'react';

const Skeleton = ({ className = '', ...props }) => {
  const classes = `animate-pulse rounded-md bg-gray-200 ${className}`;
  
  return <div className={classes} {...props} />;
};

export { Skeleton };