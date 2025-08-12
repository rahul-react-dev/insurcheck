
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

  // Fallback to blue if color is not found
  const currentColorClass = colorClasses[color] || colorClasses.blue;
  const textColorClass = currentColorClass.split(' ')[0];
  const iconBgClass = currentColorClass.replace('border-', 'bg-').replace('bg-', 'bg-opacity-20 ');

  return (
    <Card className={`p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200 ${currentColorClass}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
          <div className={`p-2 sm:p-3 rounded-lg ${iconBgClass} flex-shrink-0`}>
            <div className={`w-5 h-5 sm:w-6 sm:h-6 ${textColorClass} flex items-center justify-center`}>
              {icon}
            </div>
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
