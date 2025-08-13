
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../components/ui/Button';
import AnalyticsMetricCard from '../../components/super-admin/AnalyticsMetricCard';
import AnalyticsFilters from '../../components/super-admin/AnalyticsFilters';
import AnalyticsChart from '../../components/super-admin/AnalyticsChart';
import AnalyticsTable from '../../components/super-admin/AnalyticsTable';
import {
  fetchDashboardMetricsRequest,
  fetchChartsDataRequest,
  fetchTrendDataRequest,
  fetchDetailedAnalyticsRequest,
  exportAnalyticsRequest,
  setFilters,
  clearFilters,
  setPage,
  clearErrors,
  clearExportStatus
} from '../../store/super-admin/analyticsSlice';

const AnalyticsDashboard = () => {
  const dispatch = useDispatch();
  const {
    dashboardMetrics,
    isLoadingMetrics,
    metricsError,
    chartsData,
    isLoadingCharts,
    chartsError,
    trendData,
    isLoadingTrends,
    trendsError,
    detailedAnalytics,
    isLoadingDetailed,
    detailedError,
    pagination,
    filters,
    isExporting,
    exportError,
    exportSuccess
  } = useSelector(state => state.analytics);

  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Fetch initial data
    dispatch(fetchDashboardMetricsRequest());
    dispatch(fetchChartsDataRequest());
    dispatch(fetchTrendDataRequest());
    dispatch(fetchDetailedAnalyticsRequest());
  }, [dispatch, refreshKey]);

  useEffect(() => {
    // Show export success/error messages
    if (exportSuccess) {
      setTimeout(() => {
        dispatch(clearExportStatus());
      }, 3000);
    }
  }, [exportSuccess, dispatch]);

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
    // Refetch data with new filters
    dispatch(fetchDashboardMetricsRequest(newFilters));
    dispatch(fetchChartsDataRequest(newFilters));
    dispatch(fetchTrendDataRequest(newFilters));
    dispatch(fetchDetailedAnalyticsRequest({ filters: newFilters }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    // Refetch data without filters
    dispatch(fetchDashboardMetricsRequest());
    dispatch(fetchChartsDataRequest());
    dispatch(fetchTrendDataRequest());
    dispatch(fetchDetailedAnalyticsRequest());
  };

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
    dispatch(fetchDetailedAnalyticsRequest({ page: newPage }));
  };

  const handleExport = (format) => {
    dispatch(exportAnalyticsRequest({ format }));
    setExportDropdownOpen(false);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    dispatch(clearErrors());
  };

  // Prepare metrics data for display
  const metricsCards = dashboardMetrics ? [
    {
      icon: 'fas fa-building',
      title: 'Total Tenants',
      value: dashboardMetrics.totalTenants?.value,
      trend: dashboardMetrics.totalTenants?.trend,
      trendValue: dashboardMetrics.totalTenants?.trendValue,
      percentage: dashboardMetrics.totalTenants?.percentage,
      color: 'blue'
    },
    {
      icon: 'fas fa-users',
      title: 'Total Users',
      value: dashboardMetrics.totalUsers?.value,
      trend: dashboardMetrics.totalUsers?.trend,
      trendValue: dashboardMetrics.totalUsers?.trendValue,
      percentage: dashboardMetrics.totalUsers?.percentage,
      color: 'green'
    },
    {
      icon: 'fas fa-file-alt',
      title: 'Total Documents',
      value: dashboardMetrics.totalDocuments?.value,
      trend: dashboardMetrics.totalDocuments?.trend,
      trendValue: dashboardMetrics.totalDocuments?.trendValue,
      percentage: dashboardMetrics.totalDocuments?.percentage,
      color: 'purple'
    },
    {
      icon: 'fas fa-shield-check',
      title: 'Compliance Success Rate',
      value: dashboardMetrics.complianceSuccessRate?.value,
      trend: dashboardMetrics.complianceSuccessRate?.trend,
      trendValue: dashboardMetrics.complianceSuccessRate?.trendValue,
      percentage: dashboardMetrics.complianceSuccessRate?.percentage,
      suffix: '%',
      color: 'cyan'
    },
    {
      icon: 'fas fa-dollar-sign',
      title: 'Total Revenue',
      value: dashboardMetrics.totalRevenue?.value,
      trend: dashboardMetrics.totalRevenue?.trend,
      trendValue: dashboardMetrics.totalRevenue?.trendValue,
      percentage: dashboardMetrics.totalRevenue?.percentage,
      prefix: '$',
      color: 'orange'
    },
    {
      icon: 'fas fa-chart-line-down',
      title: 'Churn Rate',
      value: dashboardMetrics.churnRate?.value,
      trend: dashboardMetrics.churnRate?.trend,
      trendValue: dashboardMetrics.churnRate?.trendValue,
      percentage: dashboardMetrics.churnRate?.percentage,
      suffix: '%',
      color: 'red'
    }
  ] : [];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4 sm:p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center">
              <i className="fas fa-chart-line mr-3 flex-shrink-0"></i>
              Analytics Dashboard
            </h1>
            <p className="text-purple-100 text-sm sm:text-lg">
              Monitor usage trends and performance across all tenants
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center mt-4 space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Real-time Analytics</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-clock"></i>
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block flex-shrink-0">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <i className="fas fa-analytics text-4xl text-white opacity-80"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alerts */}
      {(metricsError || chartsError || trendsError || detailedError || exportError) && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-start justify-between space-x-3">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <i className="fas fa-exclamation-triangle text-red-400 mt-0.5 flex-shrink-0"></i>
              <div className="min-w-0">
                <h3 className="text-red-800 font-medium">Analytics Error</h3>
                <p className="text-red-700 text-sm break-words">
                  {metricsError || chartsError || trendsError || detailedError || exportError}
                </p>
              </div>
            </div>
            <button
              onClick={() => dispatch(clearErrors())}
              className="text-red-400 hover:text-red-600 text-xl font-bold flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {exportSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
          <div className="flex items-start justify-between space-x-3">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <i className="fas fa-check-circle text-green-400 mt-0.5 flex-shrink-0"></i>
              <div className="min-w-0">
                <h3 className="text-green-800 font-medium">Export Successful</h3>
                <p className="text-green-700 text-sm">File downloads with analytics data.</p>
              </div>
            </div>
            <button
              onClick={() => dispatch(clearExportStatus())}
              className="text-green-400 hover:text-green-600 text-xl font-bold flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button
          onClick={handleRefresh}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 text-sm sm:text-base"
          disabled={isLoadingMetrics || isLoadingCharts || isLoadingTrends}
        >
          <i className="fas fa-sync-alt mr-2"></i>
          Refresh Data
        </Button>
        
        {/* Export Dropdown */}
        <div className="relative">
          <Button
            onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
            disabled={isExporting}
            className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-3 text-sm sm:text-base"
          >
            {isExporting ? (
              <i className="fas fa-spinner fa-spin mr-2"></i>
            ) : (
              <i className="fas fa-download mr-2"></i>
            )}
            Export Analytics
            <i className="fas fa-chevron-down ml-2"></i>
          </Button>
          
          {exportDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => handleExport('csv')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <i className="fas fa-file-csv mr-2 text-green-500"></i>
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <i className="fas fa-file-pdf mr-2 text-red-500"></i>
                  Export as PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <AnalyticsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        isLoading={isLoadingMetrics || isLoadingCharts || isLoadingTrends}
      />

      {/* Metrics Grid */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Key Metrics</h2>
          <div className="text-sm text-gray-500">
            System-wide performance indicators
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {metricsCards.map((metric, index) => (
            <AnalyticsMetricCard
              key={index}
              icon={metric.icon}
              title={metric.title}
              value={metric.value}
              trend={metric.trend}
              trendValue={metric.trendValue}
              percentage={metric.percentage}
              prefix={metric.prefix}
              suffix={metric.suffix}
              color={metric.color}
              isLoading={isLoadingMetrics}
            />
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          title="Revenue by Plan"
          data={chartsData?.revenueByPlan}
          type="pie"
          isLoading={isLoadingCharts}
          error={chartsError}
        />
        
        <AnalyticsChart
          title="Monthly Growth Trends"
          data={chartsData?.monthlyGrowth}
          type="line"
          isLoading={isLoadingCharts}
          error={chartsError}
        />
        
        <AnalyticsChart
          title="Compliance Metrics"
          data={chartsData?.complianceMetrics}
          type="bar"
          isLoading={isLoadingCharts}
          error={chartsError}
        />
        
        <AnalyticsChart
          title="User Growth Trends"
          data={trendData?.userGrowth}
          type="line"
          isLoading={isLoadingTrends}
          error={trendsError}
        />
      </div>

      {/* Detailed Analytics Table */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Detailed Analytics</h2>
          <div className="text-sm text-gray-500">
            Tenant-wise performance breakdown
          </div>
        </div>
        
        <AnalyticsTable
          data={detailedAnalytics}
          isLoading={isLoadingDetailed}
          error={detailedError}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
