
import React from 'react';
import Card from '../ui/Card';

const MetricCard = ({ icon, value, label, trend, trendValue, color = 'blue' }) => {
  // Parse trend value from backend format like "+0.1%" or "+2"
  const parseTrend = (trendStr) => {
    if (!trendStr) return { direction: null, value: null };
    
    const isPositive = trendStr.startsWith('+');
    const isNegative = trendStr.startsWith('-');
    const value = trendStr.replace(/[+-]/, '');
    
    return {
      direction: isPositive ? 'up' : isNegative ? 'down' : null,
      value: value
    };
  };
  
  const parsedTrend = parseTrend(trend);
  const trendDirection = parsedTrend.direction;
  const trendVal = parsedTrend.value || trendValue;
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    red: 'text-red-600 bg-red-50 border-red-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    cyan: 'text-cyan-600 bg-cyan-50 border-cyan-200'
  };

  // Icon mapping for consistent display matching screenshot
  const getIconElement = (iconString) => {
    if (!iconString) return null;
    
    // Map different icon formats to match screenshot exactly
    const iconMap = {
      'fas fa-clock': 'fa-clock',
      'fas fa-building': 'fa-th-large', // Grid icon like screenshot
      'fas fa-users': 'fa-user',
      'fas fa-file-upload': 'fa-file-alt'
    };
    
    const iconClass = iconMap[iconString] || iconString.replace('fas fa-', 'fa-');
    return <i className={`fas ${iconClass} text-xl`}></i>;
  };

  // Parse color from backend format like "text-green-600"
  const parseColor = (colorStr) => {
    if (!colorStr) return 'blue';
    if (colorStr.includes('green')) return 'green';
    if (colorStr.includes('blue')) return 'blue';
    if (colorStr.includes('purple')) return 'purple';
    if (colorStr.includes('red')) return 'red';
    if (colorStr.includes('yellow')) return 'yellow';
    return 'blue';
  };
  
  const parsedColor = parseColor(color);
  const currentColorClass = colorClasses[parsedColor] || colorClasses.blue;
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
        
        {(trendDirection || trendVal) && (
          <div className="flex-shrink-0 ml-2">
            <div className={`flex items-center space-x-1 ${
              trendDirection === 'up' ? 'text-green-600' : 
              trendDirection === 'down' ? 'text-red-600' : 
              'text-gray-500'
            }`}>
              <i className={`fas ${
                trendDirection === 'up' ? 'fa-arrow-up' : 
                trendDirection === 'down' ? 'fa-arrow-down' : 
                'fa-minus'
              } text-xs sm:text-sm`}></i>
              <span className="text-xs sm:text-sm font-medium">{trendVal}</span>
            </div>
          </div>
        )}
      </div>
      
      {trendDirection && (
        <div className="mt-3 sm:mt-4">
          <div className={`text-xs sm:text-sm ${
            trendDirection === 'up' ? 'text-green-600' : 
            trendDirection === 'down' ? 'text-red-600' : 
            'text-gray-500'
          }`}>
            {trendDirection === 'up' ? 'Trending up' : 
             trendDirection === 'down' ? 'Trending down' : 
             'No change'} from last period
          </div>
        </div>
      )}
    </Card>
  );
};

export default MetricCard;
