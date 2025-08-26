import React from 'react';
import { useSelector } from 'react-redux';
import Card from '../ui/Card';

const TenantPerformanceChart = () => {
  const { usageAnalytics, isLoadingAnalytics } = useSelector(state => state.tenant);

  if (isLoadingAnalytics) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const { tenantPerformance = [] } = usageAnalytics;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900" data-testid="chart-title">
          Tenant Performance Overview
        </h3>
        <div className="text-sm text-gray-500">
          Top performing tenants by document volume and compliance
        </div>
      </div>

      <div className="space-y-4">
        {tenantPerformance.map((tenant, index) => (
          <div 
            key={tenant.tenantName} 
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            data-testid={`tenant-performance-${index}`}
          >
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900" data-testid={`tenant-name-${index}`}>
                  {tenant.tenantName}
                </h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span data-testid={`tenant-users-${index}`}>
                    <i className="fas fa-users mr-1"></i>
                    {tenant.users} users
                  </span>
                  <span data-testid={`tenant-documents-${index}`}>
                    <i className="fas fa-file-alt mr-1"></i>
                    {tenant.documents} docs
                  </span>
                </div>
              </div>
              
              {/* Compliance Progress Bar */}
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500 w-20">Compliance:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      tenant.compliance >= 95 ? 'bg-green-500' :
                      tenant.compliance >= 90 ? 'bg-blue-500' :
                      tenant.compliance >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${tenant.compliance}%` }}
                    data-testid={`compliance-bar-${index}`}
                  ></div>
                </div>
                <span 
                  className={`text-sm font-medium ${
                    tenant.compliance >= 95 ? 'text-green-600' :
                    tenant.compliance >= 90 ? 'text-blue-600' :
                    tenant.compliance >= 85 ? 'text-yellow-600' : 'text-red-600'
                  }`}
                  data-testid={`compliance-percentage-${index}`}
                >
                  {tenant.compliance}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tenantPerformance.length === 0 && (
        <div className="text-center py-8 text-gray-500" data-testid="no-performance-data">
          <i className="fas fa-chart-bar text-3xl mb-2"></i>
          <p>No performance data available</p>
        </div>
      )}
    </Card>
  );
};

export default TenantPerformanceChart;