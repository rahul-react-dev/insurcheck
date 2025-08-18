
import React from 'react';
import Card from '../ui/Card';

const AnalyticsChart = ({ 
  title, 
  data, 
  type = 'bar',
  isLoading = false,
  error = null,
  height = '300px',
  className = ''
}) => {
  // Simple chart component - in production, you'd use a library like Chart.js or Recharts
  const renderBarChart = (data) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(item => item.value || item.revenue || item.users || 0));

    return (
      <div className="space-y-3">
        {data.map((item, index) => {
          const value = item.value || item.revenue || item.users || 0;
          const percentage = (value / maxValue) * 100;
          const label = item.label || item.plan || item.month || item.category || `Item ${index + 1}`;

          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700">{label}</span>
                <span className="text-gray-900 font-semibold">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                  {item.percentage && (
                    <span className="text-gray-500 ml-1">({item.percentage}%)</span>
                  )}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderLineChart = (data) => {
    if (!data || data.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.map((item, index) => (
            <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">
                {item.period || item.month || `Period ${index + 1}`}
              </div>
              <div className="text-lg font-bold text-gray-900">
                {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPieChart = (data) => {
    if (!data || data.length === 0) return null;

    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-cyan-500'
    ];

    return (
      <div className="space-y-4">
        {data.map((item, index) => {
          const value = item.value || item.revenue || item.percentage || 0;
          const label = item.label || item.plan || item.category || `Item ${index + 1}`;
          const colorClass = colors[index % colors.length];

          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${colorClass}`}></div>
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {typeof value === 'number' ? value.toLocaleString() : value}
                {item.percentage && typeof item.percentage === 'number' && (
                  <span className="text-gray-500 ml-1">({item.percentage}%)</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return renderLineChart(data);
      case 'pie':
        return renderPieChart(data);
      case 'bar':
      default:
        return renderBarChart(data);
    }
  };

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="text-center py-8">
          <i className="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <i className="fas fa-chart-bar text-blue-500 mr-2"></i>
        {title}
      </h3>
      
      <div style={{ height }}>
        {data && data.length > 0 ? (
          renderChart()
        ) : (
          <div className="text-center py-8">
            <i className="fas fa-chart-bar text-gray-300 text-3xl mb-3"></i>
            <p className="text-gray-500 text-sm">No data available</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AnalyticsChart;
