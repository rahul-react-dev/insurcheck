import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTenantAnalyticsRequest } from '../../store/super-admin/tenantSlice';
import Card from '../ui/Card';

const TenantAnalyticsWidget = () => {
  const dispatch = useDispatch();
  const { 
    usageAnalytics, 
    isLoadingAnalytics, 
    analyticsError 
  } = useSelector(state => state.tenant);

  useEffect(() => {
    // Fetch analytics data when component mounts
    dispatch(fetchTenantAnalyticsRequest());
  }, [dispatch]);

  if (isLoadingAnalytics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (analyticsError) {
    return (
      <Card className="p-4 mb-6 border-red-200 bg-red-50">
        <div className="text-red-600 text-sm">
          Failed to load analytics: {analyticsError}
        </div>
      </Card>
    );
  }

  const { totalDocuments, activeUsers, complianceRate, monthlyUploads } = usageAnalytics;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Documents */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Total Documents</p>
            <p className="text-2xl font-bold text-blue-900" data-testid="total-documents">
              {totalDocuments?.toLocaleString() || '0'}
            </p>
          </div>
          <div className="p-2 bg-blue-200 rounded-lg">
            <i className="fas fa-file-alt text-blue-600" data-testid="icon-documents"></i>
          </div>
        </div>
      </Card>

      {/* Active Users */}
      <Card className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-600">Active Users</p>
            <p className="text-2xl font-bold text-green-900" data-testid="active-users">
              {activeUsers?.toLocaleString() || '0'}
            </p>
          </div>
          <div className="p-2 bg-green-200 rounded-lg">
            <i className="fas fa-users text-green-600" data-testid="icon-users"></i>
          </div>
        </div>
      </Card>

      {/* Compliance Rate */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-600">Compliance Rate</p>
            <p className="text-2xl font-bold text-purple-900" data-testid="compliance-rate">
              {complianceRate ? `${complianceRate}%` : '0%'}
            </p>
          </div>
          <div className="p-2 bg-purple-200 rounded-lg">
            <i className="fas fa-shield-alt text-purple-600" data-testid="icon-compliance"></i>
          </div>
        </div>
      </Card>

      {/* Monthly Uploads */}
      <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-orange-600">Monthly Uploads</p>
            <p className="text-2xl font-bold text-orange-900" data-testid="monthly-uploads">
              {monthlyUploads?.reduce((sum, item) => sum + (item.uploads || 0), 0) || '0'}
            </p>
          </div>
          <div className="p-2 bg-orange-200 rounded-lg">
            <i className="fas fa-upload text-orange-600" data-testid="icon-uploads"></i>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TenantAnalyticsWidget;