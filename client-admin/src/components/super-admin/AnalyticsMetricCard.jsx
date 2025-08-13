
import React from 'react';
import Card from '../ui/Card';

const AnalyticsMetricCard = ({ 
  icon, 
  title, 
  value, 
  trend, 
  trendValue, 
  percentage, 
  color = 'blue',
  prefix = '',
  suffix = '',
  isLoading = false
}) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    red: 'text-red-600 bg-red-50 border-red-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    cyan: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    orange: 'text-orange-600 bg-orange-50 border-orange-200'
  };

  const currentColorClass = colorClasses[color] || colorClasses.blue;
  const textColorClass = currentColorClass.split(' ')[0];
  const iconBgClass = currentColorClass.replace('border-', 'bg-').replace('bg-', 'bg-opacity-20 ');

  if (isLoading) {
    return (
      <Card className="p-4 sm:p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
            <div className="h-12 w-12 bg-gray-200 rounded-xl flex-shrink-0"></div>
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 sm:p-6 hover:shadow-lg transition-all duration-200 ${currentColorClass}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
          <div className={`p-3 rounded-xl ${iconBgClass} flex-shrink-0`}>
            <div className={`w-6 h-6 ${textColorClass} flex items-center justify-center`}>
              <i className={icon}></i>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-600 truncate mb-1">{title}</p>
            <p className={`text-2xl sm:text-3xl font-bold ${textColorClass} truncate`}>
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </p>
          </div>
        </div>
        
        {trend && trendValue && (
          <div className="flex-shrink-0 ml-2">
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend === 'up' ? 'text-green-700 bg-green-100' : 
              trend === 'down' ? 'text-red-700 bg-red-100' : 
              'text-gray-700 bg-gray-100'
            }`}>
              <i className={`fas ${
                trend === 'up' ? 'fa-arrow-up' : 
                trend === 'down' ? 'fa-arrow-down' : 
                'fa-minus'
              }`}></i>
              <span>{trendValue}</span>
            </div>
          </div>
        )}
      </div>
      
      {percentage && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className={`text-sm flex items-center space-x-1 ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 
            'text-gray-500'
          }`}>
            <span>{percentage} from last period</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AnalyticsMetricCard;
