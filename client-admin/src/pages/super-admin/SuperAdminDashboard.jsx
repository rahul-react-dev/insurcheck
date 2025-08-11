
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import MetricCard from '../../components/super-admin/MetricCard';
import ErrorLogsTable from '../../components/super-admin/ErrorLogsTable';
import Button from '../../components/ui/Button';
import {
  fetchSystemMetricsRequest,
  fetchErrorLogsRequest,
  clearErrors
} from '../../store/super-admin/superAdminSlice';

const SuperAdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    systemMetrics,
    errorLogs,
    isLoadingMetrics,
    isLoadingLogs,
    metricsError,
    logsError,
    user
  } = useSelector(state => ({
    systemMetrics: state.superAdmin.systemMetrics,
    errorLogs: state.superAdmin.errorLogs,
    isLoadingMetrics: state.superAdmin.isLoadingMetrics,
    isLoadingLogs: state.superAdmin.isLoadingLogs,
    metricsError: state.superAdmin.metricsError,
    logsError: state.superAdmin.logsError,
    user: state.auth.user
  }));

  const [filters, setFilters] = useState({
    tenantName: '',
    errorType: '',
    dateRange: {
      start: '',
      end: ''
    }
  });

  useEffect(() => {
    // Check if user is authenticated and has super-admin role
    if (!user || user.role !== 'super-admin') {
      navigate('/super-admin/login');
      return;
    }

    // Fetch initial data
    dispatch(fetchSystemMetricsRequest());
    dispatch(fetchErrorLogsRequest(filters));
  }, [dispatch, navigate, user]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    dispatch(fetchErrorLogsRequest(newFilters));
  };

  const handleExportLogs = () => {
    // TODO: Implement CSV export functionality
    console.log('Exporting logs...', errorLogs);
  };

  const handleRefreshMetrics = () => {
    dispatch(fetchSystemMetricsRequest());
  };

  const handleRefreshLogs = () => {
    dispatch(fetchErrorLogsRequest(filters));
  };

  if (!user || user.role !== 'super-admin') {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor system performance and manage platform operations</p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={handleRefreshMetrics}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoadingMetrics}
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Refresh Metrics
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {(metricsError || logsError) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                <span>{metricsError || logsError}</span>
              </div>
              <button
                onClick={() => dispatch(clearErrors())}
                className="text-red-500 hover:text-red-700 text-lg"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoadingMetrics ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                  <div>
                    <div className="h-6 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
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
            <div className="col-span-4 text-center py-12 bg-white rounded-lg shadow-md border border-gray-200">
              <i className="fas fa-chart-line text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-500 text-lg">No metrics data available</p>
              <p className="text-gray-400 text-sm mt-1">Metrics will appear here once data is loaded</p>
            </div>
          )}
        </div>

        {/* Error Logs Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <i className="fas fa-exclamation-triangle text-red-500 mr-3"></i>
                  Error Logs
                </h2>
                <p className="text-gray-600 mt-1">Monitor and track system errors across all tenants</p>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={handleRefreshLogs}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                  disabled={isLoadingLogs}
                >
                  <i className="fas fa-sync-alt mr-2"></i>
                  Refresh
                </Button>
                <Button
                  onClick={handleExportLogs}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <i className="fas fa-download mr-2"></i>
                  Export CSV
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
          />
        </div>

        {/* System Status Footer */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">System Status: Online</span>
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <i className="fas fa-server mr-1"></i>
              Server uptime: 99.9%
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SuperAdminDashboard;
