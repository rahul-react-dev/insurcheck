
import React, { useState } from 'react';
import Card from '../ui/Card';

const ConfigurationSection = ({
  title,
  description,
  icon,
  iconColor = 'text-gray-600',
  children,
  collapsible = false,
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className="overflow-hidden">
      <div
        className={`bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 border-b border-gray-200 ${
          collapsible ? 'cursor-pointer hover:bg-gray-100' : ''
        }`}
        onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`flex-shrink-0 ${iconColor}`}>
              <i className={`${icon} text-2xl`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h3>
              <p className="text-sm sm:text-base text-gray-600 mt-1">{description}</p>
            </div>
          </div>
          {collapsible && (
            <div className="flex-shrink-0 ml-4">
              <i
                className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-gray-400 transition-transform duration-200`}
              ></i>
            </div>
          )}
        </div>
      </div>
      
      {(!collapsible || isExpanded) && (
        <div className="p-4 sm:p-6">
          {children}
        </div>
      )}
    </Card>
  );
};

export default ConfigurationSection;
