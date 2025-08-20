import React, { useState, useRef, useEffect } from 'react';

const Select = ({ value, onValueChange, children, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newValue) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={selectRef} {...props}>
      {React.Children.map(children, (child) => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            onClick: () => setIsOpen(!isOpen),
            isOpen,
            selectedValue,
          });
        }
        if (child.type === SelectContent) {
          return React.cloneElement(child, {
            isOpen,
            onSelect: handleSelect,
            selectedValue,
          });
        }
        return child;
      })}
    </div>
  );
};

const SelectTrigger = ({ onClick, isOpen, selectedValue, children, className = '', ...props }) => {
  const classes = `
    flex h-10 w-full items-center justify-between rounded-md border border-gray-300 
    bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
      <svg
        className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6,9 12,15 18,9"></polyline>
      </svg>
    </div>
  );
};

const SelectValue = ({ placeholder, children }) => {
  return <span className="text-gray-900">{children || placeholder}</span>;
};

const SelectContent = ({ isOpen, onSelect, selectedValue, children, className = '' }) => {
  if (!isOpen) return null;

  const classes = `
    absolute z-50 top-full mt-1 w-full rounded-md border border-gray-300 bg-white 
    shadow-lg animate-in fade-in-0 zoom-in-95
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={classes}>
      <div className="p-1">
        {React.Children.map(children, (child) => {
          if (child.type === SelectItem) {
            return React.cloneElement(child, {
              onSelect,
              isSelected: child.props.value === selectedValue,
            });
          }
          return child;
        })}
      </div>
    </div>
  );
};

const SelectItem = ({ value, onSelect, isSelected, children, className = '' }) => {
  const classes = `
    relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 
    text-sm outline-none hover:bg-gray-100 focus:bg-gray-100
    ${isSelected ? 'bg-blue-50 text-blue-900' : 'text-gray-900'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={classes} onClick={() => onSelect?.(value)}>
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>
        </span>
      )}
      {children}
    </div>
  );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };