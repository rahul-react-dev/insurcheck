
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../../components/super-admin/MetricCard';
import ErrorLogsTable from '../../components/super-admin/ErrorLogsTable';
import Button from '../../components/ui/Button';
import {
  fetchSystemMetricsRequest,
  fetchErrorLogsRequest,
  setFilters,
  logout
} from '../../store/super-admin/superAdminSlice';
import { SUPER_ADMIN_MESSAGES } from '../../constants/superAdmin';

const SuperAdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    systemMetrics,
    filteredErrorLogs,
    filters,
    isLoadingMetrics,
    isLoadingLogs,
    metricsError,
    logsError
  } = useSelector(state => state.superAdmin);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/super-admin/login');
      return;
    }

    // Fetch initial data
    dispatch(fetchSystemMetricsRequest());
    dispatch(fetchErrorLogsRequest());
  }, [isAuthenticated, navigate, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('superAdminToken');
    navigate('/super-admin/login');
  };

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  const metricsData = [
    {
      id: 'uptime',
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
        </svg>
      ),
      value: systemMetrics.uptime,
      label: SUPER_ADMIN_MESSAGES.DASHBOARD.METRICS.UPTIME,
      color: 'green',
      trend: 'up',
      trendValue: '0.1%'
    },
    {
      id: 'tenants',
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
        </svg>
      ),
      value: systemMetrics.activeTenants,
      label: SUPER_ADMIN_MESSAGES.DASHBOARD.METRICS.ACTIVE_TENANTS,
      color: 'blue'
    },
    {
      id: 'users',
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
      value: systemMetrics.activeUsers,
      label: SUPER_ADMIN_MESSAGES.DASHBOARD.METRICS.ACTIVE_USERS,
      color: 'indigo'
    },
    {
      id: 'uploads',
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      ),
      value: systemMetrics.documentUploads,
      label: SUPER_ADMIN_MESSAGES.DASHBOARD.METRICS.DOCUMENT_UPLOADS,
      color: 'purple'
    },
    {
      id: 'compliance',
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      value: systemMetrics.complianceChecks,
      label: SUPER_ADMIN_MESSAGES.DASHBOARD.METRICS.COMPLIANCE_CHECKS,
      color: 'cyan'
    },
    {
      id: 'errorRate',
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      value: systemMetrics.errorRate,
      label: SUPER_ADMIN_MESSAGES.DASHBOARD.METRICS.ERROR_RATE,
      color: 'red'
    },
    {
      id: 'avgTime',
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ),
      value: systemMetrics.avgProcessingTime,
      label: SUPER_ADMIN_MESSAGES.DASHBOARD.METRICS.AVG_PROCESSING_TIME,
      color: 'yellow'
    }
  ];

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">InsurCheck</h1>
              <span className="ml-3 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                Super Admin
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Welcome, <span className="font-medium">{user?.username}</span>
              </div>
              <Button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {SUPER_ADMIN_MESSAGES.DASHBOARD.TITLE}
          </h2>
          <p className="text-gray-600">
            Monitor system performance and track issues across all tenants
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 mb-8">
          {metricsData.map((metric) => (
            <MetricCard
              key={metric.id}
              icon={metric.icon}
              value={isLoadingMetrics ? '...' : metric.value}
              label={metric.label}
              color={metric.color}
              trend={metric.trend}
              trendValue={metric.trendValue}
            />
          ))}
        </div>

        {/* Error Logs Table */}
        <ErrorLogsTable
          logs={filteredErrorLogs}
          isLoading={isLoadingLogs}
          error={logsError}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
