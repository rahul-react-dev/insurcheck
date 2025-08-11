
import React from 'react';
import Card from '../ui/Card';

const MetricCard = ({ icon, value, label, trend, trendValue, color = 'blue' }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    red: 'text-red-600 bg-red-50 border-red-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    cyan: 'text-cyan-600 bg-cyan-50 border-cyan-200'
  };

  return (
    <Card className={`p-6 hover:shadow-lg transition-shadow duration-200 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${colorClasses[color].replace('border-', 'bg-').replace('bg-', 'bg-opacity-20 ')}`}>
            <div className={`w-6 h-6 ${colorClasses[color].split(' ')[0]}`}>
              {icon}
            </div>
          </div>
          <div>
            <p className={`text-2xl font-bold ${colorClasses[color].split(' ')[0]}`}>
              {value || '---'}
            </p>
            <p className="text-sm text-gray-600">{label}</p>
          </div>
        </div>
        {trend && (
          <div className={`text-right ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            <div className="flex items-center space-x-1">
              {trend === 'up' ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              <span className="text-sm font-medium">{trendValue}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MetricCard;
