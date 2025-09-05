import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchUsageAnalyticsRequest,
  fetchBillingSummaryRequest,
  exportUsageDataRequest,
  calculateUsageBillingRequest,
} from "../../store/admin/usageSlice";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  BarChart3,
  Activity,
  FileText,
  Smartphone,
  Search,
  Filter,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// Event type options
const eventTypes = [
  { value: 'all', label: 'All Events', icon: BarChart3 },
  { value: 'api_call', label: 'API Calls', icon: Activity },
  { value: 'document_processing', label: 'Document Processing', icon: FileText },
  { value: 'mobile_request', label: 'Mobile Requests', icon: Smartphone },
];

// Time period options
const timePeriods = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'custom', label: 'Custom Range' },
];

const UsageAnalytics = () => {
  const dispatch = useDispatch();

  // Local state for filters and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Modal and UI states
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Custom date range state
  const [activeFilters, setActiveFilters] = useState({
    startDate: '',
    endDate: '',
  });

  // Redux selectors with safe defaults
  const {
    usageAnalytics = { data: [], isLoading: false, error: null },
    billingSummary = { 
      data: {
        currentPeriod: {
          totalApiCalls: 0,
          totalDocuments: 0,
          totalCost: 0,
          periodStart: null,
          periodEnd: null,
        },
        breakdown: [],
        limits: {
          apiCallsLimit: 1000,
          documentsLimit: 100,
          currentApiCalls: 0,
          currentDocuments: 0,
        },
      }, 
      isLoading: false, 
      error: null 
    },
    usageExport = { isLoading: false, error: null },
  } = useSelector((state) => state.usage || {});

  // Extract data for easier use
  const usageData = usageAnalytics.data?.events || [];
  const usageMeta = usageAnalytics.data?.meta || { total: 0, totalPages: 1, page: 1, limit: 20 };
  const usageDataLoading = usageAnalytics.isLoading;
  const usageDataError = usageAnalytics.error;
  
  const billingData = billingSummary.data;
  const billingLoading = billingSummary.isLoading;
  const billingError = billingSummary.error;
  
  const exportLoading = usageExport.isLoading;
  const exportError = usageExport.error;

  // Fetch data when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: pageSize,
      sortBy,
      sortOrder,
      search: searchTerm,
      eventType: selectedEventType !== 'all' ? selectedEventType : undefined,
      period: selectedPeriod !== 'custom' ? selectedPeriod : undefined,
      startDate: activeFilters.startDate,
      endDate: activeFilters.endDate,
    };
    
    dispatch(fetchUsageAnalyticsRequest(params));
    dispatch(fetchBillingSummaryRequest({
      period: selectedPeriod,
      startDate: activeFilters.startDate,
      endDate: activeFilters.endDate,
    }));
  }, [
    dispatch,
    currentPage,
    pageSize,
    sortBy,
    sortOrder,
    searchTerm,
    selectedEventType,
    selectedPeriod,
    activeFilters.startDate,
    activeFilters.endDate,
  ]);

  // Reset to first page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedEventType,
    selectedPeriod,
    activeFilters.startDate,
    activeFilters.endDate,
  ]);

  // Handle refresh
  const handleRefresh = () => {
    const params = {
      page: currentPage,
      limit: pageSize,
      sortBy,
      sortOrder,
      search: searchTerm,
      eventType: selectedEventType !== 'all' ? selectedEventType : undefined,
      period: selectedPeriod !== 'custom' ? selectedPeriod : undefined,
      startDate: activeFilters.startDate,
      endDate: activeFilters.endDate,
    };
    
    dispatch(fetchUsageAnalyticsRequest(params));
    dispatch(fetchBillingSummaryRequest({
      period: selectedPeriod,
      startDate: activeFilters.startDate,
      endDate: activeFilters.endDate,
    }));
  };

  // Handle export
  const handleExport = (format) => {
    const params = {
      format,
      eventType: selectedEventType !== 'all' ? selectedEventType : undefined,
      period: selectedPeriod !== 'custom' ? selectedPeriod : undefined,
      startDate: activeFilters.startDate,
      endDate: activeFilters.endDate,
    };
    
    dispatch(exportUsageDataRequest(params));
    setShowExportDropdown(false);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Calculate usage progress
  const getUsageProgress = (current, limit) => {
    if (!limit) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  // Get status color based on usage percentage
  const getStatusColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usage Analytics</h1>
          <p className="text-gray-600 mt-1">
            Monitor and analyze your API usage, document processing, and billing information
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={usageDataLoading || billingLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${(usageDataLoading || billingLoading) ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
            
            {showExportDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleExport('csv')}
                    disabled={exportLoading}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    disabled={exportLoading}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as JSON
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {(usageDataError || billingError || exportError) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">
            {usageDataError || billingError || exportError}
          </div>
        </div>
      )}

      {/* Billing Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">API Calls</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-gray-900">
                  {billingData?.limits?.currentApiCalls || 0}
                </p>
                <span className="text-sm text-gray-500">
                  / {billingData?.limits?.apiCallsLimit || 1000}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${getStatusColor(getUsageProgress(billingData?.limits?.currentApiCalls || 0, billingData?.limits?.apiCallsLimit || 1000)) === 'text-red-600' ? 'bg-red-600' : getStatusColor(getUsageProgress(billingData?.limits?.currentApiCalls || 0, billingData?.limits?.apiCallsLimit || 1000)) === 'text-yellow-600' ? 'bg-yellow-600' : 'bg-green-600'}`}
                  style={{ width: `${getUsageProgress(billingData?.limits?.currentApiCalls || 0, billingData?.limits?.apiCallsLimit || 1000)}%` }}
                ></div>
              </div>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Documents</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-gray-900">
                  {billingData?.limits?.currentDocuments || 0}
                </p>
                <span className="text-sm text-gray-500">
                  / {billingData?.limits?.documentsLimit || 100}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${getStatusColor(getUsageProgress(billingData?.limits?.currentDocuments || 0, billingData?.limits?.documentsLimit || 100)) === 'text-red-600' ? 'bg-red-600' : getStatusColor(getUsageProgress(billingData?.limits?.currentDocuments || 0, billingData?.limits?.documentsLimit || 100)) === 'text-yellow-600' ? 'bg-yellow-600' : 'bg-green-600'}`}
                  style={{ width: `${getUsageProgress(billingData?.limits?.currentDocuments || 0, billingData?.limits?.documentsLimit || 100)}%` }}
                ></div>
              </div>
            </div>
            <FileText className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900">
                ${billingData?.currentPeriod?.totalCost?.toFixed(2) || '0.00'}
              </p>
              <p className="text-sm text-gray-500">This period</p>
            </div>
            <DollarSign className="h-8 w-8 text-indigo-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Period</p>
              <p className="text-lg font-semibold text-gray-900">
                {billingData?.currentPeriod?.periodStart ? new Date(billingData.currentPeriod.periodStart).toLocaleDateString() : 'N/A'}
              </p>
              <p className="text-sm text-gray-500">
                to {billingData?.currentPeriod?.periodEnd ? new Date(billingData.currentPeriod.periodEnd).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search usage events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Event Type Filter */}
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {eventTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            {/* Time Period Filter */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {timePeriods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Date Range (show when custom period is selected) */}
          {selectedPeriod === 'custom' && (
            <div className="flex gap-3">
              <input
                type="date"
                value={activeFilters.startDate}
                onChange={(e) => setActiveFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="date"
                value={activeFilters.endDate}
                onChange={(e) => setActiveFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Usage Data Table */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Usage Events</h3>
          <p className="text-sm text-gray-600 mt-1">
            Detailed log of all usage events and activities
          </p>
        </div>

        {usageDataLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : usageData.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No usage data found</h3>
            <p className="text-gray-600">No usage events match your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Event</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Type</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Details</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Cost</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {usageData.map((event) => {
                  const EventIcon = eventTypes.find(type => type.value === event.eventType)?.icon || Activity;
                  return (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <EventIcon className="h-5 w-5 text-gray-600" />
                          <span className="font-medium text-gray-900">{event.eventName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {event.eventType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {event.details && typeof event.details === 'object' 
                          ? Object.entries(event.details).map(([key, value]) => `${key}: ${value}`).join(', ')
                          : event.details || 'N/A'
                        }
                      </td>
                      <td className="py-4 px-6 text-gray-900 font-medium">
                        ${event.cost?.toFixed(4) || '0.0000'}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {new Date(event.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {usageData.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, usageMeta.total)} of {usageMeta.total} events
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= usageMeta.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UsageAnalytics;