import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import MetricCard from '../../components/super-admin/MetricCard';
import ErrorLogsTable from '../../components/super-admin/ErrorLogsTable';
import Button from '../../components/ui/Button';
import {
  fetchSystemMetricsRequest,
  fetchErrorLogsRequest,
  exportErrorLogsRequest,
  clearErrors
} from '../../store/super-admin/superAdminSlice';

const SuperAdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    systemMetrics,
    errorLogs,
    pagination,
    isLoadingMetrics,
    isLoadingLogs,
    isExporting,
    metricsError,
    logsError,
    exportError,
    user
  } = useSelector(state => ({
    systemMetrics: state.superAdmin.systemMetrics,
    errorLogs: state.superAdmin.errorLogs,
    pagination: state.superAdmin.pagination,
    isLoadingMetrics: state.superAdmin.isLoadingMetrics,
    isLoadingLogs: state.superAdmin.isLoadingLogs,
    isExporting: state.superAdmin.isExporting,
    metricsError: state.superAdmin.metricsError,
    logsError: state.superAdmin.logsError,
    exportError: state.superAdmin.exportError,
    user: state.superAdmin.user
  }));

  const [filters, setFilters] = useState({
    tenantName: '',
    errorType: '',
    search: '',
    dateRange: {
      start: '',
      end: ''
    }
  });

  useEffect(() => {
    // Fetch initial data
    dispatch(fetchSystemMetricsRequest());
    dispatch(fetchErrorLogsRequest(filters));
  }, [dispatch]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Build query parameters for the API
    const queryParams = {
      page: 1,
      limit: 10,
      level: 'error'
    };

    if (newFilters.tenantName) {
      queryParams.tenantName = newFilters.tenantName;
    }
    if (newFilters.errorType) {
      queryParams.errorType = newFilters.errorType;
    }
    if (newFilters.search) {
      queryParams.search = newFilters.search;
    }
    if (newFilters.dateRange?.start) {
      queryParams.startDate = newFilters.dateRange.start;
    }
    if (newFilters.dateRange?.end) {
      queryParams.endDate = newFilters.dateRange.end;
    }

    dispatch(fetchErrorLogsRequest(queryParams));
  };

  const handleExportLogs = () => {
    dispatch(exportErrorLogsRequest(errorLogs));
  };

  const handleRefreshMetrics = () => {
    dispatch(fetchSystemMetricsRequest());
  };

  const handleRefreshLogs = () => {
    dispatch(fetchErrorLogsRequest(filters));
  };

  const handlePageChange = (newPage) => {
    const queryParams = {
      page: newPage,
      limit: 10,
      level: 'error'
    };

    if (filters.tenantName) {
      queryParams.tenantName = filters.tenantName;
    }
    if (filters.errorType) {
      queryParams.errorType = filters.errorType;
    }
    if (filters.search) {
      queryParams.search = filters.search;
    }
    if (filters.dateRange?.start) {
      queryParams.startDate = filters.dateRange.start;
    }
    if (filters.dateRange?.end) {
      queryParams.endDate = filters.dateRange.end;
    }

    dispatch(fetchErrorLogsRequest(queryParams));
  };

  return (
    <div className="space-y-6 sm:space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 sm:p-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome to System Dashboard</h1>
              <p className="text-blue-100 text-sm sm:text-lg">Monitor and manage your InsurCheck platform operations</p>
              <div className="flex flex-col sm:flex-row sm:items-center mt-4 space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>System Online</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-clock"></i>
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
                {process.env.NODE_ENV === 'development' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      if (window.SuperAdminTester) {
                        const tester = new window.SuperAdminTester();
                        tester.runAllTests();
                      } else {
                        console.warn('SuperAdminTester not available. Import the test utility first.');
                      }
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs"
                  >
                    <i className="fas fa-flask mr-1"></i>
                    Run Tests
                  </button>
                </div>
              )}
              </div>
            </div>
            <div className="hidden lg:block flex-shrink-0">
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <i className="fas fa-chart-line text-4xl text-white opacity-80"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {(metricsError || logsError || exportError) && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex items-start justify-between space-x-3">
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <i className="fas fa-exclamation-triangle text-red-400 mt-0.5 flex-shrink-0"></i>
                <div className="min-w-0">
                  <h3 className="text-red-800 font-medium">System Alert</h3>
                  <p className="text-red-700 text-sm break-words">{metricsError || logsError || exportError}</p>
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

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button
            onClick={handleRefreshMetrics}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 text-sm sm:text-base"
            disabled={isLoadingMetrics}
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Refresh Metrics
          </Button>
          <Button
            onClick={handleRefreshLogs}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-6 py-3 text-sm sm:text-base"
            disabled={isLoadingLogs}
          >
            <i className="fas fa-list mr-2"></i>
            Refresh Logs
          </Button>
          <Button
            onClick={handleExportLogs}
            className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-3 text-sm sm:text-base"
            disabled={isExporting}
          >
            <i className={`fas ${isExporting ? 'fa-spinner fa-spin' : 'fa-download'} mr-2`}></i>
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </div>

        {/* System Metrics Grid */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">System Metrics</h2>
            <div className="text-sm text-gray-500">
              Real-time system performance indicators
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {isLoadingMetrics ? (
              // Enhanced Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-200 rounded-xl flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="h-5 sm:h-6 bg-gray-200 rounded w-16 mb-2"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-20 sm:w-24"></div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))
            ) : systemMetrics && systemMetrics.length > 0 ? (
              systemMetrics.map((metric) => (
                <MetricCard
                  key={metric.id}
                  icon={metric.icon}
                  value={metric.value}
                  label={metric.label}
                  trend={metric.trend}
                  trendValue={metric.trendValue}
                  color={metric.color}
                />
              ))
            ) : (
              <div className="col-span-full">
                <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="max-w-md mx-auto px-4">
                    <i className="fas fa-chart-line text-4xl sm:text-6xl text-gray-300 mb-4 sm:mb-6"></i>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Metrics Available</h3>
                    <p className="text-gray-500 text-sm sm:text-base mb-4 sm:mb-6">
                      System metrics will appear here once data collection begins
                    </p>
                    <Button
                      onClick={handleRefreshMetrics}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 text-sm sm:text-base"
                    >
                      <i className="fas fa-refresh mr-2"></i>
                      Refresh Now
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Logs Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                  <i className="fas fa-exclamation-triangle text-red-500 mr-3 flex-shrink-0"></i>
                  <span className="truncate">System Error Logs</span>
                </h2>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Monitor and track system errors across all tenants</p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  onClick={handleRefreshLogs}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 text-sm"
                  disabled={isLoadingLogs}
                >
                  <i className="fas fa-sync-alt mr-2"></i>
                  Refresh
                </Button>
                <Button
                  onClick={handleExportLogs}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 text-sm"
                  disabled={isExporting}
                >
                  <i className={`fas ${isExporting ? 'fa-spinner fa-spin' : 'fa-download'} mr-2`}></i>
                  {isExporting ? 'Exporting...' : 'Export CSV'}
                </Button>
              </div>
            </div>
          </div>

          <ErrorLogsTable
            logs={errorLogs}
            isLoading={isLoadingLogs}
            error={logsError}
            onFilterChange={handleFilterChange}
            filters={filters}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </div>

        {/* System Health Footer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-gray-700 text-sm sm:text-base">System Status</span>
              </div>
              <p className="text-green-600 font-medium text-sm sm:text-base">Operational</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <i className="fas fa-server text-blue-500"></i>
                <span className="font-semibold text-gray-700 text-sm sm:text-base">Server Uptime</span>
              </div>
              <p className="text-blue-600 font-medium text-sm sm:text-base">99.9%</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <i className="fas fa-clock text-purple-500"></i>
                <span className="font-semibold text-gray-700 text-sm sm:text-base">Last Update</span>
              </div>
              <p className="text-purple-600 font-medium text-sm sm:text-base">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>
  );
};

export default SuperAdminDashboard;