import React from 'react';
import { useSelector } from 'react-redux';
import Card from '../ui/Card';

const ComplianceTrendsChart = () => {
  const { usageAnalytics, isLoadingAnalytics } = useSelector(state => state.tenant);

  if (isLoadingAnalytics) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  const { complianceTrends = [] } = usageAnalytics || {};

  // Calculate max value for scaling
  const maxPassRate = Math.max(...complianceTrends.map(item => item.passRate || 0));
  const maxTotal = Math.max(...complianceTrends.map(item => item.total || 0));

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900" data-testid="trends-title">
          Compliance Trends
        </h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span className="text-gray-600">Pass Rate</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-400 rounded mr-2"></div>
            <span className="text-gray-600">Total Documents</span>
          </div>
        </div>
      </div>

      {complianceTrends.length > 0 ? (
        <div className="space-y-4">
          {complianceTrends.map((trend, index) => (
            <div key={trend.period} className="space-y-2" data-testid={`trend-item-${index}`}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700" data-testid={`trend-period-${index}`}>
                  {trend.period}
                </span>
                <div className="flex items-center space-x-4">
                  <span className="text-blue-600 font-medium" data-testid={`trend-pass-rate-${index}`}>
                    {trend.passRate}% pass rate
                  </span>
                  <span className="text-gray-500" data-testid={`trend-total-${index}`}>
                    {trend.total} docs
                  </span>
                </div>
              </div>
              
              {/* Visual representation */}
              <div className="space-y-1">
                {/* Pass Rate Bar */}
                <div className="flex items-center space-x-2">
                  <div className="w-16 text-xs text-gray-500">Pass Rate:</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(trend.passRate / 100) * 100}%` }}
                      data-testid={`pass-rate-bar-${index}`}
                    ></div>
                  </div>
                  <div className="w-12 text-xs text-right text-gray-600">
                    {trend.passRate}%
                  </div>
                </div>
                
                {/* Total Documents Bar */}
                <div className="flex items-center space-x-2">
                  <div className="w-16 text-xs text-gray-500">Volume:</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${maxTotal > 0 ? (trend.total / maxTotal) * 100 : 0}%` }}
                      data-testid={`volume-bar-${index}`}
                    ></div>
                  </div>
                  <div className="w-12 text-xs text-right text-gray-600">
                    {trend.total}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500" data-testid="no-trends-data">
          <i className="fas fa-chart-line text-3xl mb-2"></i>
          <p>No compliance trends data available</p>
        </div>
      )}
    </Card>
  );
};

export default ComplianceTrendsChart;