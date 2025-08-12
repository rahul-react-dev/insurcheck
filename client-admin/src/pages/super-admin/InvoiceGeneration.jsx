
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import InvoiceGenerationConfig from "../../components/super-admin/InvoiceGenerationConfig";
import InvoiceGenerationLogs from "../../components/super-admin/InvoiceGenerationLogs";
import {
  fetchInvoiceConfigRequest,
  fetchInvoiceLogsRequest,
  updateInvoiceConfigRequest,
  generateInvoiceRequest,
  clearError,
} from "../../store/super-admin/invoiceGenerationSlice";

import AdminLayout from "../../layouts/AdminLayout";

const InvoiceGeneration = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('configuration');
  const [selectedTenant, setSelectedTenant] = useState(null);
  
  const {
    configurations,
    logs,
    tenants,
    isLoading,
    isLoadingLogs,
    error,
    totalGenerated,
    totalSent,
    totalFailed,
    summary
  } = useSelector((state) => state.invoiceGeneration);

  const [filters, setFilters] = useState({
    tenantName: '',
    status: '',
    dateRange: {
      start: '',
      end: ''
    }
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // Fetch initial data when component mounts
  useEffect(() => {
    dispatch(fetchInvoiceConfigRequest());
    dispatch(fetchInvoiceLogsRequest({ ...filters, ...pagination }));
  }, [dispatch]);

  const handleConfigUpdate = (tenantId, config) => {
    dispatch(updateInvoiceConfigRequest({ tenantId, config }));
  };

  const handleManualGenerate = (tenantId) => {
    if (window.confirm("Are you sure you want to generate invoice manually for this tenant?")) {
      dispatch(generateInvoiceRequest(tenantId));
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    dispatch(fetchInvoiceLogsRequest({ ...newFilters, page: 1, limit: pagination.limit }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    dispatch(fetchInvoiceLogsRequest({ ...filters, page: newPage, limit: pagination.limit }));
  };

  const handlePageSizeChange = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
    dispatch(fetchInvoiceLogsRequest({ ...filters, page: 1, limit: newLimit }));
  };

  const handleRefresh = () => {
    if (activeTab === 'configuration') {
      dispatch(fetchInvoiceConfigRequest());
    } else {
      dispatch(fetchInvoiceLogsRequest({ ...filters, ...pagination }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const tabs = [
    { id: 'configuration', name: 'Invoice Configuration', icon: 'fas fa-cog' },
    { id: 'logs', name: 'Generation Logs', icon: 'fas fa-list-ul' }
  ];

  return (
    <AdminLayout>
      <div className="min-h-full">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl p-4 sm:p-6 lg:p-8 text-white mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
              Auto-Generate Invoices
            </h1>
            <p className="text-purple-100 text-sm sm:text-base lg:text-lg">
              Configure automatic invoice generation and monitor billing processes
            </p>
            <div className="flex items-center mt-3 sm:mt-4 text-xs sm:text-sm">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Invoice System Active</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block flex-shrink-0">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <i className="fas fa-magic text-3xl lg:text-4xl text-white opacity-80"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-6">
          <div className="flex items-start justify-between space-x-3">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <i className="fas fa-exclamation-triangle text-red-400 mt-0.5 flex-shrink-0"></i>
              <div className="min-w-0">
                <h3 className="text-red-800 font-medium text-sm sm:text-base">Error</h3>
                <p className="text-red-700 text-sm break-words">{error}</p>
              </div>
            </div>
            <button
              onClick={() => dispatch(clearError())}
              className="text-red-400 hover:text-red-600 text-xl font-bold flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-file-invoice text-blue-600 text-xl"></i>
              </div>
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 truncate">Total Generated</p>
              <p className="text-2xl font-bold text-gray-900">{summary?.totalGenerated || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-paper-plane text-green-600 text-xl"></i>
              </div>
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 truncate">Successfully Sent</p>
              <p className="text-2xl font-bold text-green-600">{summary?.totalSent || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
              </div>
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 truncate">Failed</p>
              <p className="text-2xl font-bold text-red-600">{summary?.totalFailed || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-dollar-sign text-purple-600 text-xl"></i>
              </div>
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 truncate">Total Amount</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(summary?.totalAmount || 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-4 sm:px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:text-base flex items-center space-x-2`}
              >
                <i className={tab.icon}></i>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Actions */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="text-sm text-gray-600">
              {activeTab === 'configuration' 
                ? 'Configure automatic invoice generation settings for each tenant'
                : 'Monitor invoice generation logs and track delivery status'
              }
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button
                onClick={handleRefresh}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 text-sm"
                disabled={isLoading || isLoadingLogs}
              >
                <i className="fas fa-sync-alt mr-2"></i>
                Refresh
              </Button>
              {activeTab === 'configuration' && (
                <Button
                  onClick={() => dispatch(generateInvoiceRequest('all'))}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm"
                  disabled={isLoading}
                >
                  <i className="fas fa-magic mr-2"></i>
                  Generate All
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'configuration' ? (
            <InvoiceGenerationConfig
              configurations={configurations}
              tenants={tenants}
              isLoading={isLoading}
              onConfigUpdate={handleConfigUpdate}
              onManualGenerate={handleManualGenerate}
            />
          ) : (
            <InvoiceGenerationLogs
              logs={logs}
              isLoading={isLoadingLogs}
              filters={filters}
              pagination={pagination}
              onFilterChange={handleFilterChange}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </div>
      </div>
    </div>
    </AdminLayout>
  );
};

export default InvoiceGeneration;
