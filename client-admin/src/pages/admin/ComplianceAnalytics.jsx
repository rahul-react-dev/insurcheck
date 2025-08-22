import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchComplianceAnalyticsRequest,
  fetchComplianceTrendsRequest,
  fetchComplianceChartsRequest,
  exportComplianceAnalyticsRequest,
  setAnalyticsFilters,
  clearAnalyticsFilters
} from '../../store/admin/complianceAnalyticsSlice';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import { useToast, ToastContainer } from '../../components/ui/Toast';
import {
  CompliancePassFailChart,
  CommonIssuesChart,
  ComplianceTrendsChart
} from '../../components/admin/ComplianceCharts';
import { 
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Download,
  Filter,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Clock,
  Search,
  RefreshCw,
  Eye
} from 'lucide-react';

const ComplianceAnalytics = () => {
  const { toasts, removeToast, showSuccess, showError, showInfo } = useToast();
  const dispatch = useDispatch();

  // Set up global toast function for saga
  useEffect(() => {
    window.showToast = (type, title, message) => {
      switch (type) {
        case 'success':
          showSuccess(title, message);
          break;
        case 'error':
          showError(title, message);
          break;
        case 'info':
          showInfo(title, message);
          break;
        default:
          showInfo(title, message);
      }
    };

    return () => {
      delete window.showToast;
    };
  }, [showSuccess, showError, showInfo]);
  
  // Redux selectors
  const {
    analytics,
    analyticsLoading,
    analyticsError,
    trends,
    trendsLoading,
    charts,
    chartsLoading,
    exportLoading,
    filters
  } = useSelector(state => state.complianceAnalytics);

  // Local state
  const [timeRange, setTimeRange] = useState('month'); // week, month, year
  const [documentTypeFilter, setDocumentTypeFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Fetch data on component mount and filter changes
  useEffect(() => {
    const filterParams = {
      timeRange,
      documentType: documentTypeFilter,
      user: userFilter,
      dateRange: dateRange.start && dateRange.end ? dateRange : null,
      page: currentPage,
      limit: itemsPerPage
    };
    
    dispatch(fetchComplianceAnalyticsRequest(filterParams));
    dispatch(fetchComplianceTrendsRequest(filterParams));
    dispatch(fetchComplianceChartsRequest(filterParams));
  }, [dispatch, timeRange, documentTypeFilter, userFilter, dateRange, currentPage, itemsPerPage]);

  // Handle filter changes
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const handleDocumentTypeChange = (e) => {
    setDocumentTypeFilter(e.target.value);
  };

  const handleUserFilterChange = (e) => {
    setUserFilter(e.target.value);
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setTimeRange('month');
    setDocumentTypeFilter('');
    setUserFilter('');
    setDateRange({ start: '', end: '' });
    dispatch(clearAnalyticsFilters());
  };

  const handleRefresh = () => {
    const filterParams = {
      timeRange,
      documentType: documentTypeFilter,
      user: userFilter,
      dateRange: dateRange.start && dateRange.end ? dateRange : null,
      page: currentPage,
      limit: itemsPerPage
    };
    
    dispatch(fetchComplianceAnalyticsRequest(filterParams));
    dispatch(fetchComplianceTrendsRequest(filterParams));
    dispatch(fetchComplianceChartsRequest(filterParams));
  };

  // Handle pagination changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Handle export
  const handleExport = (format) => {
    const exportParams = {
      format, // png, pdf
      timeRange,
      documentType: documentTypeFilter,
      user: userFilter,
      dateRange: dateRange.start && dateRange.end ? dateRange : null
    };
    dispatch(exportComplianceAnalyticsRequest(exportParams));
  };

  // Format percentage
  const formatPercentage = (value) => {
    return `${Math.round(value || 0)}%`;
  };

  // Format number
  const formatNumber = (value) => {
    return (value || 0).toLocaleString();
  };

  // Get trend icon and color
  const getTrendDisplay = (current, previous) => {
    if (!previous) return { icon: null, color: 'text-gray-500', text: 'No data' };
    
    const change = ((current - previous) / previous) * 100;
    const isPositive = change > 0;
    
    return {
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'text-green-600' : 'text-red-600',
      text: `${isPositive ? '+' : ''}${change.toFixed(1)}%`
    };
  };

  // Get pass/fail chart data for Chart.js component
  const getPassFailChartData = () => {
    return charts?.passFailData || null;
  };

  // Get common issues chart data for Chart.js component
  const getCommonIssuesChartData = () => {
    return charts?.commonIssues || [];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900" data-testid="page-title">
              Compliance Analytics
            </h1>
            <p className="text-gray-600 mt-1" data-testid="page-description">
              Monitor compliance performance and identify trends
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={analyticsLoading}
              className="flex items-center gap-2"
              aria-label="Refresh compliance analytics data"
              data-testid="button-refresh"
            >
              <RefreshCw className={`h-4 w-4 ${analyticsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
              aria-label={showFilters ? "Hide filters" : "Show filters"}
              aria-expanded={showFilters}
              data-testid="button-filters"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            
            <div className="relative">
              <select 
                onChange={(e) => e.target.value && handleExport(e.target.value)}
                value=""
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={exportLoading}
                aria-label="Export compliance analytics data"
                data-testid="select-export"
              >
                <option value="">Export</option>
                <option value="png">Export PNG</option>
                <option value="pdf">Export PDF</option>
              </select>
              <Download className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={handleClearFilters}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Range
                  </label>
                  <select
                    value={timeRange}
                    onChange={(e) => handleTimeRangeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type
                  </label>
                  <Input
                    placeholder="Filter by document type..."
                    value={documentTypeFilter}
                    onChange={handleDocumentTypeChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User
                  </label>
                  <Input
                    placeholder="Filter by user..."
                    value={userFilter}
                    onChange={handleUserFilterChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Date Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => handleDateRangeChange('start', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => handleDateRangeChange('end', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Pass Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {analyticsLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    formatPercentage(analytics?.overallPassRate)
                  )}
                </p>
                {analytics?.overallPassRate && trends?.passRateTrend && (
                  <div className="flex items-center gap-1 mt-1">
                    {(() => {
                      const trend = getTrendDisplay(analytics.overallPassRate, trends.passRateTrend.previous);
                      const TrendIcon = trend.icon;
                      return (
                        <>
                          {TrendIcon && <TrendIcon className={`h-3 w-3 ${trend.color}`} />}
                          <span className={`text-xs ${trend.color}`}>{trend.text}</span>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Documents Processed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analyticsLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    formatNumber(analytics?.totalDocuments)
                  )}
                </p>
                {analytics?.totalDocuments && trends?.documentsTrend && (
                  <div className="flex items-center gap-1 mt-1">
                    {(() => {
                      const trend = getTrendDisplay(analytics.totalDocuments, trends.documentsTrend.previous);
                      const TrendIcon = trend.icon;
                      return (
                        <>
                          {TrendIcon && <TrendIcon className={`h-3 w-3 ${trend.color}`} />}
                          <span className={`text-xs ${trend.color}`}>{trend.text}</span>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Documents</p>
                <p className="text-2xl font-bold text-red-600">
                  {analyticsLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    formatNumber(analytics?.failedDocuments)
                  )}
                </p>
                {analytics?.failedDocuments && trends?.failuresTrend && (
                  <div className="flex items-center gap-1 mt-1">
                    {(() => {
                      const trend = getTrendDisplay(analytics.failedDocuments, trends.failuresTrend.previous);
                      const TrendIcon = trend.icon;
                      return (
                        <>
                          {TrendIcon && <TrendIcon className={`h-3 w-3 ${trend.color}`} />}
                          <span className={`text-xs ${trend.color}`}>{trend.text}</span>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Processing Time</p>
                <p className="text-2xl font-bold text-purple-600">
                  {analyticsLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    `${analytics?.avgProcessingTime || 0}s`
                  )}
                </p>
                {analytics?.avgProcessingTime && trends?.processingTimeTrend && (
                  <div className="flex items-center gap-1 mt-1">
                    {(() => {
                      const trend = getTrendDisplay(analytics.avgProcessingTime, trends.processingTimeTrend.previous);
                      const TrendIcon = trend.icon;
                      return (
                        <>
                          {TrendIcon && <TrendIcon className={`h-3 w-3 ${trend.color}`} />}
                          <span className={`text-xs ${trend.color}`}>{trend.text}</span>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Pass/Fail Rate Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Pass/Fail Distribution</h3>
              </div>
              <Button
                variant="ghost"
                size="small"
                className="text-blue-600 hover:text-blue-800"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
            
            {chartsLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : analyticsError ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-gray-900 font-medium">No data available for selected range.</p>
                  <p className="text-gray-600 mt-1">Try adjusting your filters</p>
                </div>
              </div>
            ) : (
              <CompliancePassFailChart 
                data={getPassFailChartData()} 
                loading={chartsLoading}
              />
            )}
          </Card>

          {/* Common Issues Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Common Issues</h3>
              </div>
              <Button
                variant="ghost"
                size="small"
                className="text-blue-600 hover:text-blue-800"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
            
            {chartsLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : !charts?.commonIssues || charts.commonIssues.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-900 font-medium">No compliance issues found</p>
                  <p className="text-gray-600 mt-1">Great job maintaining compliance!</p>
                </div>
              </div>
            ) : (
              <CommonIssuesChart 
                data={getCommonIssuesChartData()} 
                loading={chartsLoading}
              />
            )}
          </Card>
        </div>

        {/* Trends Over Time */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Compliance Trends</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={timeRange === 'week' ? 'primary' : 'outline'}
                size="small"
                onClick={() => handleTimeRangeChange('week')}
              >
                Week
              </Button>
              <Button
                variant={timeRange === 'month' ? 'primary' : 'outline'}
                size="small"
                onClick={() => handleTimeRangeChange('month')}
              >
                Month
              </Button>
              <Button
                variant={timeRange === 'year' ? 'primary' : 'outline'}
                size="small"
                onClick={() => handleTimeRangeChange('year')}
              >
                Year
              </Button>
            </div>
          </div>
          
          {trendsLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : !trends?.timeSeriesData || trends.timeSeriesData.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-900 font-medium">No trend data available</p>
                <p className="text-gray-600 mt-1">Data will appear as compliance checks are performed</p>
              </div>
            </div>
          ) : (
            <ComplianceTrendsChart 
              data={trends} 
              loading={trendsLoading}
            />
          )}
        </Card>

        {/* Pagination */}
        {analytics && (
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="itemsPerPage" className="text-sm text-gray-700">
                  Items per page:
                </label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="select-items-per-page"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil((analytics?.totalDocuments || 0) / itemsPerPage)}
                totalItems={analytics?.totalDocuments || 0}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                disabled={analyticsLoading}
                className="flex-1 justify-end"
              />
            </div>
          </Card>
        )}

      </div>
    </div>
  );
};

export default ComplianceAnalytics;