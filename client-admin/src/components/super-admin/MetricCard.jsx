
import React from 'react';
import Card from '../ui/Card';

const MetricCard = ({ 
  icon, 
  value, 
  label, 
  trend, 
  trendValue, 
  color = 'blue' 
}) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    red: 'text-red-600 bg-red-50 border-red-200',
    yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    cyan: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    orange: 'text-orange-600 bg-orange-50 border-orange-200'
  };

  // Fallback to blue if color is not found
  const currentColorClass = colorClasses[color] || colorClasses.blue;
  const textColorClass = currentColorClass.split(' ')[0];
  const iconBgClass = currentColorClass.replace('text-', 'bg-').replace('border-', 'bg-').replace('bg-', 'bg-opacity-20 bg-');

  const renderIcon = () => {
    if (typeof icon === 'string') {
      return <i className={`${icon} text-lg`}></i>;
    }
    return icon;
  };

  const renderTrend = () => {
    if (!trend || !trendValue) return null;

    const isPositive = trend === 'up';
    const trendColor = isPositive ? 'text-green-600' : 'text-red-600';
    const trendIcon = isPositive ? 'fas fa-arrow-up' : 'fas fa-arrow-down';

    return (
      <div className={`flex items-center text-sm ${trendColor}`}>
        <i className={`${trendIcon} mr-1 text-xs`}></i>
        <span className="font-medium">{trendValue}</span>
      </div>
    );
  };

  return (
    <Card className={`p-6 hover:shadow-lg transition-all duration-200 ${currentColorClass} border-l-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${iconBgClass}`}>
            <div className={`w-6 h-6 flex items-center justify-center ${textColorClass}`}>
              {renderIcon()}
            </div>
          </div>
          <div>
            <p className={`text-2xl font-bold ${textColorClass}`}>
              {value || '---'}
            </p>
            <p className="text-sm text-gray-600 font-medium">{label}</p>
            {renderTrend()}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MetricCard;
