import React from 'react';

const Dialog = ({ open, onOpenChange, children }) => {
  return (
    <>
      {React.Children.map(children, (child) => {
        if (child.type === DialogContent) {
          return React.cloneElement(child, { open, onOpenChange });
        }
        return child;
      })}
    </>
  );
};

const DialogTrigger = ({ children, asChild, ...props }) => {
  return React.cloneElement(children, props);
};

const DialogContent = ({ open, onOpenChange, children, className = '', ...props }) => {
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
          bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto
          animate-in fade-in-0 zoom-in-95
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};

const DialogHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-6 pb-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

const DialogFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-4 border-t ${className}`} {...props}>
      {children}
    </div>
  );
};

const DialogTitle = ({ children, className = '', ...props }) => {
  return (
    <h2 className={`text-lg font-semibold text-gray-900 ${className}`} {...props}>
      {children}
    </h2>
  );
};

const DialogDescription = ({ children, className = '', ...props }) => {
  return (
    <p className={`text-sm text-gray-500 mt-2 ${className}`} {...props}>
      {children}
    </p>
  );
};

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};