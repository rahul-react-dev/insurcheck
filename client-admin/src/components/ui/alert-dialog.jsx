import React, { useState } from 'react';

const AlertDialog = ({ open, onOpenChange, children }) => {
  return (
    <>
      {React.Children.map(children, (child) => {
        if (child.type === AlertDialogContent) {
          return React.cloneElement(child, { open, onOpenChange });
        }
        return child;
      })}
    </>
  );
};

const AlertDialogTrigger = ({ children, asChild, ...props }) => {
  return React.cloneElement(children, props);
};

const AlertDialogContent = ({ open, onOpenChange, children, className = '', ...props }) => {
  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onOpenChange?.(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className={`
          bg-white rounded-lg shadow-lg max-w-md w-full animate-in fade-in-0 zoom-in-95
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};

const AlertDialogHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-6 pb-2 ${className}`} {...props}>
      {children}
    </div>
  );
};

const AlertDialogFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-2 ${className}`} {...props}>
      {children}
    </div>
  );
};

const AlertDialogTitle = ({ children, className = '', ...props }) => {
  return (
    <h2 className={`text-lg font-semibold text-gray-900 ${className}`} {...props}>
      {children}
    </h2>
  );
};

const AlertDialogDescription = ({ children, className = '', ...props }) => {
  return (
    <p className={`text-sm text-gray-500 mt-2 ${className}`} {...props}>
      {children}
    </p>
  );
};

const AlertDialogAction = ({ children, onClick, disabled = false, className = '', ...props }) => {
  const classes = `
    inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm 
    font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 
    focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button 
      className={classes} 
      onClick={onClick} 
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const AlertDialogCancel = ({ children, onClick, disabled = false, className = '', ...props }) => {
  const classes = `
    inline-flex h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 
    text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 
    focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2 sm:mt-0
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button 
      className={classes} 
      onClick={onClick} 
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};