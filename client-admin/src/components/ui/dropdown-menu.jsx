import React, { useState, useRef, useEffect } from 'react';

const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {React.Children.map(children, (child) => {
        if (child.type === DropdownMenuTrigger) {
          return React.cloneElement(child, {
            onClick: () => setIsOpen(!isOpen),
          });
        }
        if (child.type === DropdownMenuContent) {
          return React.cloneElement(child, {
            isOpen,
            onClose: () => setIsOpen(false),
          });
        }
        return child;
      })}
    </div>
  );
};

const DropdownMenuTrigger = ({ children, onClick, asChild, ...props }) => {
  if (asChild) {
    return React.cloneElement(children, { onClick, ...props });
  }
  
  return (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  );
};

const DropdownMenuContent = ({ isOpen, onClose, children, align = 'left', className = '', ...props }) => {
  if (!isOpen) return null;

  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 transform -translate-x-1/2',
  };

  const classes = `
    absolute z-50 mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg 
    animate-in fade-in-0 zoom-in-95 ${alignClasses[align]} ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={classes} {...props}>
      <div className="p-1">
        {React.Children.map(children, (child) => {
          if (child.type === DropdownMenuItem) {
            return React.cloneElement(child, { onClose });
          }
          return child;
        })}
      </div>
    </div>
  );
};

const DropdownMenuItem = ({ children, onClick, onClose, disabled = false, className = '', ...props }) => {
  const handleClick = (e) => {
    if (!disabled) {
      onClick?.(e);
      onClose?.();
    }
  };

  const classes = `
    relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm 
    outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100
    ${disabled ? 'pointer-events-none opacity-50' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={classes} onClick={handleClick} {...props}>
      {children}
    </div>
  );
};

const DropdownMenuSeparator = ({ className = '', ...props }) => {
  const classes = `-mx-1 my-1 h-px bg-gray-200 ${className}`;
  
  return <div className={classes} {...props} />;
};

const DropdownMenuLabel = ({ children, className = '', ...props }) => {
  const classes = `px-2 py-1.5 text-sm font-semibold text-gray-900 ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
};