import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Dashboard metrics
  dashboardMetrics: null,
  isLoadingMetrics: false,
  metricsError: null,

  // Charts data
  chartsData: null,
  isLoadingCharts: false,
  chartsError: null,

  // Filters
  filters: {
    dateRange: {
      start: '',
      end: ''
    },
    tenantName: '',
    viewType: 'monthly' // weekly, monthly, quarterly
  },

  // Export state
  isExporting: false,
  exportError: null,
  exportSuccess: false,

  // Trend data
  trendData: null,
  isLoadingTrends: false,
  trendsError: null,

  // Detailed analytics
  detailedAnalytics: [],
  isLoadingDetailed: false,
  detailedError: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  }
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    // Basic analytics actions
    fetchAnalyticsRequest: (state) => {
      state.isLoadingMetrics = true;
      state.metricsError = null;
    },
    fetchAnalyticsSuccess: (state, action) => {
      state.isLoadingMetrics = false;
      state.dashboardMetrics = action.payload;
      state.metricsError = null;
    },
    fetchAnalyticsFailure: (state, action) => {
      state.isLoadingMetrics = false;
      state.metricsError = action.payload;
    },

    // Dashboard stats actions
    fetchDashboardStatsRequest: (state) => {
      state.isLoadingMetrics = true;
      state.metricsError = null;
    },
    fetchDashboardStatsSuccess: (state, action) => {
      state.isLoadingMetrics = false;
      state.dashboardMetrics = action.payload;
      state.metricsError = null;
    },
    fetchDashboardStatsFailure: (state, action) => {
      state.isLoadingMetrics = false;
      state.metricsError = action.payload;
    },

    // Tenant analytics actions
    fetchTenantAnalyticsRequest: (state) => {
      state.isLoadingDetailed = true;
      state.detailedError = null;
    },
    fetchTenantAnalyticsSuccess: (state, action) => {
      state.isLoadingDetailed = false;
      state.detailedAnalytics = action.payload;
      state.detailedError = null;
    },
    fetchTenantAnalyticsFailure: (state, action) => {
      state.isLoadingDetailed = false;
      state.detailedError = action.payload;
    },

    // Dashboard metrics actions
    fetchDashboardMetricsRequest: (state) => {
      state.isLoadingMetrics = true;
      state.metricsError = null;
    },
    fetchDashboardMetricsSuccess: (state, action) => {
      state.isLoadingMetrics = false;
      state.dashboardMetrics = action.payload;
      state.metricsError = null;
    },
    fetchDashboardMetricsFailure: (state, action) => {
      state.isLoadingMetrics = false;
      state.metricsError = action.payload;
    },

    // Charts data actions
    fetchChartsDataRequest: (state) => {
      state.isLoadingCharts = true;
      state.chartsError = null;
    },
    fetchChartsDataSuccess: (state, action) => {
      state.isLoadingCharts = false;
      state.chartsData = action.payload;
      state.chartsError = null;
    },
    fetchChartsDataFailure: (state, action) => {
      state.isLoadingCharts = false;
      state.chartsError = action.payload;
    },

    // Trend data actions
    fetchTrendDataRequest: (state) => {
      state.isLoadingTrends = true;
      state.trendsError = null;
    },
    fetchTrendDataSuccess: (state, action) => {
      state.isLoadingTrends = false;
      state.trendData = action.payload;
      state.trendsError = null;
    },
    fetchTrendDataFailure: (state, action) => {
      state.isLoadingTrends = false;
      state.trendsError = action.payload;
    },

    // Detailed analytics actions
    fetchDetailedAnalyticsRequest: (state) => {
      state.isLoadingDetailed = true;
      state.detailedError = null;
    },
    fetchDetailedAnalyticsSuccess: (state, action) => {
      state.isLoadingDetailed = false;
      state.detailedAnalytics = action.payload.data;
      state.pagination = action.payload.pagination;
      state.detailedError = null;
    },
    fetchDetailedAnalyticsFailure: (state, action) => {
      state.isLoadingDetailed = false;
      state.detailedError = action.payload;
    },

    // Fetch analytics details
    fetchAnalyticsDetailsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchAnalyticsDetailsSuccess: (state, action) => {
      state.isLoading = false;
      state.selectedAnalytic = action.payload;
      state.error = null;
    },
    fetchAnalyticsDetailsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Filter actions
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        dateRange: { start: '', end: '' },
        tenantName: '',
        viewType: 'monthly'
      };
    },

    // Pagination actions
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },

    // Export actions
    exportAnalyticsRequest: (state, action) => {
      state.isExporting = true;
      state.exportError = null;
      state.exportSuccess = false;
    },
    exportAnalyticsSuccess: (state) => {
      state.isExporting = false;
      state.exportSuccess = true;
      state.exportError = null;
    },
    exportAnalyticsFailure: (state, action) => {
      state.isExporting = false;
      state.exportError = action.payload;
      state.exportSuccess = false;
    },

    // Clear errors
    clearErrors: (state) => {
      state.metricsError = null;
      state.chartsError = null;
      state.trendsError = null;
      state.detailedError = null;
      state.exportError = null;
    },
    clearExportStatus: (state) => {
      state.exportSuccess = false;
      state.exportError = null;
    }
  }
});

export const {
  fetchAnalyticsRequest,
  fetchAnalyticsSuccess,
  fetchAnalyticsFailure,
  fetchDashboardStatsRequest,
  fetchDashboardStatsSuccess,
  fetchDashboardStatsFailure,
  fetchTenantAnalyticsRequest,
  fetchTenantAnalyticsSuccess,
  fetchTenantAnalyticsFailure,
  fetchDashboardMetricsRequest,
  fetchDashboardMetricsSuccess,
  fetchDashboardMetricsFailure,
  fetchChartsDataRequest,
  fetchChartsDataSuccess,
  fetchChartsDataFailure,
  fetchTrendDataRequest,
  fetchTrendDataSuccess,
  fetchTrendDataFailure,
  fetchDetailedAnalyticsRequest,
  fetchDetailedAnalyticsSuccess,
  fetchDetailedAnalyticsFailure,
  fetchAnalyticsDetailsRequest,
  fetchAnalyticsDetailsSuccess,
  fetchAnalyticsDetailsFailure,
  setFilters,
  clearFilters,
  setPage,
  exportAnalyticsRequest,
  exportAnalyticsSuccess,
  exportAnalyticsFailure,
  clearErrors,
  clearExportStatus
} = analyticsSlice.actions;

export default analyticsSlice.reducer;