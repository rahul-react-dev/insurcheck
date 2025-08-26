import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../ui/Card';
import Button from '../ui/Button';
import AnalyticsMetricCard from './AnalyticsMetricCard';
import AnalyticsChart from './AnalyticsChart';
import AnalyticsFilters from './AnalyticsFilters';
import { 
  fetchUsageAnalyticsRequest, 
  fetchComplianceAnalyticsRequest,
  exportUsageReportRequest 
} from '../../store/super-admin/usageAnalyticsSlice';

const UsageAnalyticsDashboard = () => {
  const dispatch = useDispatch();
  
  const {
    usageMetrics,
    complianceMetrics,
    monthlyDocs,
    complianceTrends,
    isLoading,
    isExporting,
    error
  } = useSelector(state => state.usageAnalytics || {});

  const [filters, setFilters] = useState({
    dateRange: {
      start: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    tenantName: '',
    viewType: 'monthly'
  });

  useEffect(() => {
    dispatch(fetchUsageAnalyticsRequest(filters));
    dispatch(fetchComplianceAnalyticsRequest(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
  };

  const handleClearFilters = () => {
    const defaultFilters = {
      dateRange: {
        start: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      tenantName: '',
      viewType: 'monthly'
    };
    setFilters(defaultFilters);
  };

  const handleExportReport = () => {
    dispatch(exportUsageReportRequest({
      filters,
      includeCharts: true,
      format: 'pdf'
    }));
  };

  const handleRefresh = () => {
    dispatch(fetchUsageAnalyticsRequest(filters));
    dispatch(fetchComplianceAnalyticsRequest(filters));
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8 text-center">
          <div className="text-red-500 mb-4">
            <i className="fas fa-exclamation-triangle text-4xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Usage Analytics
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700 text-white">
            <i className="fas fa-redo mr-2"></i>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              <i className="fas fa-chart-line text-blue-600 mr-3"></i>
              Usage Analytics Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Track team productivity and performance across all tenants
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2"
            >
              <i className={`fas fa-sync-alt mr-2 ${isLoading ? 'animate-spin' : ''}`}></i>
              Refresh
            </Button>
            <Button
              onClick={handleExportReport}
              disabled={isExporting}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
            >
              <i className={`fas fa-download mr-2 ${isExporting ? 'animate-spin' : ''}`}></i>
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AnalyticsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        isLoading={isLoading}
        className="mb-8"
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnalyticsMetricCard
          icon="fas fa-file-upload"
          title="Total Documents Uploaded"
          value={usageMetrics?.totalDocuments || 0}
          trend={usageMetrics?.documentsTrend || 'up'}
          trendValue={usageMetrics?.documentsChange || 0}
          percentage={`${usageMetrics?.documentsChangePercent || 0}%`}
          color="blue"
          isLoading={isLoading}
        />
        <AnalyticsMetricCard
          icon="fas fa-chart-pie"
          title="Compliance Rate"
          value={complianceMetrics?.overallRate || 0}
          trend={complianceMetrics?.complianceTrend || 'up'}
          trendValue={complianceMetrics?.complianceChange || 0}
          percentage={`${complianceMetrics?.complianceChangePercent || 0}%`}
          suffix="%"
          color="green"
          isLoading={isLoading}
        />
        <AnalyticsMetricCard
          icon="fas fa-users"
          title="Active Users"
          value={usageMetrics?.activeUsers || 0}
          trend={usageMetrics?.usersTrend || 'up'}
          trendValue={usageMetrics?.usersChange || 0}
          percentage={`${usageMetrics?.usersChangePercent || 0}%`}
          color="purple"
          isLoading={isLoading}
        />
        <AnalyticsMetricCard
          icon="fas fa-exclamation-triangle"
          title="Issues Detected"
          value={complianceMetrics?.totalIssues || 0}
          trend={complianceMetrics?.issuesTrend || 'down'}
          trendValue={complianceMetrics?.issuesChange || 0}
          percentage={`${complianceMetrics?.issuesChangePercent || 0}%`}
          color="red"
          isLoading={isLoading}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Documents Uploaded */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <i className="fas fa-file-upload text-blue-600 mr-2"></i>
                Monthly Documents Uploaded
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Track document upload trends over time
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-500">
                Last 6 months
              </div>
            </div>
          </div>
          <AnalyticsChart
            title="Monthly Documents"
            data={monthlyDocs}
            type="line"
            isLoading={isLoading}
            height="350px"
          />
        </Card>

        {/* Compliance Trends */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <i className="fas fa-chart-line text-green-600 mr-2"></i>
                Compliance Trends
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Monitor compliance rates and improvement trends
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-500">
                Overall performance
              </div>
            </div>
          </div>
          <AnalyticsChart
            title="Compliance Rate"
            data={complianceTrends}
            type="line"
            isLoading={isLoading}
            height="350px"
          />
        </Card>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Performing Tenants */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <i className="fas fa-trophy text-yellow-600 mr-2"></i>
            Top Performing Tenants
          </h3>
          <AnalyticsChart
            title="Top Tenants by Documents"
            data={usageMetrics?.topTenants || []}
            type="bar"
            isLoading={isLoading}
            height="300px"
          />
        </Card>

        {/* Document Types Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <i className="fas fa-file-alt text-cyan-600 mr-2"></i>
            Document Types
          </h3>
          <AnalyticsChart
            title="Document Types Distribution"
            data={usageMetrics?.documentTypes || []}
            type="pie"
            isLoading={isLoading}
            height="300px"
          />
        </Card>

        {/* Compliance Issues Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <i className="fas fa-exclamation-circle text-red-600 mr-2"></i>
            Compliance Issues
          </h3>
          <AnalyticsChart
            title="Common Issues"
            data={complianceMetrics?.issueTypes || []}
            type="bar"
            isLoading={isLoading}
            height="300px"
          />
        </Card>
      </div>

      {/* Activity Summary */}
      <Card className="p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
          <i className="fas fa-activity text-orange-600 mr-2"></i>
          Recent Activity Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {usageMetrics?.todayUploads || 0}
            </div>
            <div className="text-sm text-gray-600">Documents Today</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {usageMetrics?.weeklyAverage || 0}
            </div>
            <div className="text-sm text-gray-600">Weekly Average</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {complianceMetrics?.resolvedIssues || 0}
            </div>
            <div className="text-sm text-gray-600">Issues Resolved</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UsageAnalyticsDashboard;