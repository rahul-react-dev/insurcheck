
import React from 'react';
import Card from '../ui/Card';

const MetricCard = ({ icon, value, label, trend, trendValue, color = 'blue' }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    red: 'text-red-600 bg-red-50 border-red-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    cyan: 'text-cyan-600 bg-cyan-50 border-cyan-200'
  };

  // Icon mapping for consistent display
  const getIconElement = (iconString) => {
    if (!iconString) return null;
    
    // Map different icon formats to consistent display
    const iconMap = {
      'fas fa-clock': 'fa-clock',
      'fas fa-building': 'fa-th-large', // Grid icon like screenshot
      'fas fa-users': 'fa-user',
      'fas fa-file-upload': 'fa-file-alt'
    };
    
    const iconClass = iconMap[iconString] || iconString.replace('fas fa-', 'fa-');
    return <i className={`fas ${iconClass} text-2xl`}></i>;
  };

  // Fallback to blue if color is not found
  const currentColorClass = colorClasses[color] || colorClasses.blue;
  const textColorClass = currentColorClass.split(' ')[0];

  return (
    <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200 bg-white border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
          {/* Icon on the left */}
          <div className={`flex-shrink-0 p-2 rounded-lg ${textColorClass.replace('text-', 'text-')} bg-gray-50`}>
            {getIconElement(icon)}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-lg sm:text-2xl font-bold ${textColorClass} truncate`}>
              {value || '---'}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 truncate">{label}</p>
          </div>
        </div>
        
        {trend && trendValue && (
          <div className="flex-shrink-0 ml-2">
            <div className={`flex items-center space-x-1 ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 
              'text-gray-500'
            }`}>
              <i className={`fas ${
                trend === 'up' ? 'fa-arrow-up' : 
                trend === 'down' ? 'fa-arrow-down' : 
                'fa-minus'
              } text-xs sm:text-sm`}></i>
              <span className="text-xs sm:text-sm font-medium">{trendValue}</span>
            </div>
          </div>
        )}
      </div>
      
      {trend && (
        <div className="mt-3 sm:mt-4">
          <div className={`text-xs sm:text-sm ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 
            'text-gray-500'
          }`}>
            {trend === 'up' ? 'Trending up' : 
             trend === 'down' ? 'Trending down' : 
             'No change'} from last period
          </div>
        </div>
      )}
    </Card>
  );
};

export default MetricCard;
