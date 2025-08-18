
import React, { useState } from 'react';

const ConfigurationSelect = ({
  label,
  value,
  onChange,
  options,
  error,
  helperText,
  placeholder = 'Select an option',
  required = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            relative w-full bg-white border rounded-lg px-3 py-2 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
            ${error 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled 
              ? 'bg-gray-50 text-gray-500 cursor-not-allowed' 
              : 'hover:bg-gray-50'
            }
          `}
        >
          <span className="block truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-gray-400 text-sm`}></i>
          </span>
        </button>

        {isOpen && !disabled && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`
                    relative w-full cursor-pointer select-none py-2 px-3 text-left hover:bg-purple-50 hover:text-purple-900
                    ${value === option.value 
                      ? 'bg-purple-100 text-purple-900' 
                      : 'text-gray-900'
                    }
                  `}
                >
                  <span className="block truncate font-normal">
                    {option.label}
                  </span>
                  {value === option.value && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-purple-600">
                      <i className="fas fa-check text-sm"></i>
                    </span>
                  )}
                </button>
              ))}
              
              {options.length === 0 && (
                <div className="py-2 px-3 text-gray-500 text-sm">
                  No options available
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {error && (
        <p className="text-red-600 text-sm flex items-center mt-1">
          <i className="fas fa-exclamation-circle text-xs mr-1"></i>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-gray-500 text-sm mt-1">{helperText}</p>
      )}
    </div>
  );
};

export default ConfigurationSelect;
