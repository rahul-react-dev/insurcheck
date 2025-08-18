
import React from 'react';

const ConfigurationToggle = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  size = 'normal' // 'small', 'normal', 'large'
}) => {
  const sizeClasses = {
    small: {
      switch: 'h-5 w-9',
      circle: 'h-4 w-4',
      translate: checked ? 'translate-x-4' : 'translate-x-0',
      text: 'text-sm'
    },
    normal: {
      switch: 'h-6 w-11',
      circle: 'h-5 w-5',
      translate: checked ? 'translate-x-5' : 'translate-x-0',
      text: 'text-base'
    },
    large: {
      switch: 'h-7 w-12',
      circle: 'h-6 w-6',
      translate: checked ? 'translate-x-5' : 'translate-x-0',
      text: 'text-lg'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className="flex items-start justify-between space-x-4">
      <div className="flex-1 min-w-0">
        <label className={`font-medium text-gray-900 ${classes.text} block cursor-pointer`}>
          {label}
        </label>
        {description && (
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p>
        )}
      </div>
      
      <div className="flex-shrink-0">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          disabled={disabled}
          className={`
            ${classes.switch} 
            relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
            ${checked 
              ? 'bg-purple-600 hover:bg-purple-700' 
              : 'bg-gray-200 hover:bg-gray-300'
            }
            ${disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : 'cursor-pointer'
            }
          `}
        >
          <span
            className={`
              ${classes.circle} ${classes.translate}
              inline-block rounded-full bg-white shadow-lg transform transition-transform duration-200 ease-in-out
            `}
          />
        </button>
      </div>
    </div>
  );
};

export default ConfigurationToggle;
