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
import { SUPER_ADMIN_MESSAGES } from '../../constants/superAdmin';

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/super-admin/login');
  };

  const handleExportLogs = () => {
    // TODO: Implement CSV export functionality
    console.log('Exporting logs...', errorLogs);
  };

  if (!user || user.role !== 'super-admin') {
    return null;
  }

  return (
    <AdminLayout>
      {/* Error Alert */}
      {(metricsError || logsError) && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span>{metricsError || logsError}</span>
            <button
              onClick={() => dispatch(clearErrors())}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {systemMetrics && systemMetrics.length > 0 ? systemMetrics.map((metric) => (
          <MetricCard
            key={metric.id}
            icon={metric.icon}
            value={metric.value}
            label={metric.label}
            trend={metric.trend}
            trendValue={metric.trendValue}
            color={metric.color}
          />
        )) : (
          <div className="col-span-4 text-center py-8">
            <p className="text-gray-500">Loading metrics...</p>
          </div>
        )}
      </div>

      {/* Error Logs Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Error Logs</h2>
            <p className="text-gray-600 mt-1">Monitor and track system errors</p>
          </div>
          <Button
            onClick={handleExportLogs}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <i className="fas fa-download mr-2"></i>
            Export CSV
          </Button>
        </div>

        <ErrorLogsTable
          logs={errorLogs}
          isLoading={isLoadingLogs}
          error={logsError}
          onFilterChange={handleFilterChange}
          filters={filters}
        />
      </div>
    </AdminLayout>
  );
};

export default SuperAdminDashboard;