import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Usage metrics
  usageMetrics: {
    totalDocuments: 0,
    activeUsers: 0,
    documentsTrend: 'up',
    documentsChange: 0,
    documentsChangePercent: 0,
    usersTrend: 'up',
    usersChange: 0,
    usersChangePercent: 0,
    topTenants: [],
    documentTypes: [],
    todayUploads: 0,
    weeklyAverage: 0
  },
  
  // Compliance metrics
  complianceMetrics: {
    overallRate: 0,
    totalIssues: 0,
    complianceTrend: 'up',
    complianceChange: 0,
    complianceChangePercent: 0,
    issuesTrend: 'down',
    issuesChange: 0,
    issuesChangePercent: 0,
    issueTypes: [],
    resolvedIssues: 0
  },
  
  // Chart data
  monthlyDocs: [],
  complianceTrends: [],
  
  // UI states
  isLoading: false,
  isExporting: false,
  error: null,
  
  // Filters
  filters: {
    dateRange: {
      start: '',
      end: ''
    },
    tenantName: '',
    viewType: 'monthly'
  }
};

const usageAnalyticsSlice = createSlice({
  name: 'usageAnalytics',
  initialState,
  reducers: {
    // Usage Analytics Actions
    fetchUsageAnalyticsRequest: (state, action) => {
      state.isLoading = true;
      state.error = null;
      state.filters = { ...state.filters, ...action.payload };
    },
    fetchUsageAnalyticsSuccess: (state, action) => {
      state.isLoading = false;
      state.usageMetrics = action.payload.metrics;
      state.monthlyDocs = action.payload.monthlyDocs;
      state.error = null;
    },
    fetchUsageAnalyticsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Compliance Analytics Actions
    fetchComplianceAnalyticsRequest: (state, action) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchComplianceAnalyticsSuccess: (state, action) => {
      state.isLoading = false;
      state.complianceMetrics = action.payload.metrics;
      state.complianceTrends = action.payload.complianceTrends;
      state.error = null;
    },
    fetchComplianceAnalyticsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Export Actions
    exportUsageReportRequest: (state, action) => {
      state.isExporting = true;
      state.error = null;
    },
    exportUsageReportSuccess: (state) => {
      state.isExporting = false;
      state.error = null;
    },
    exportUsageReportFailure: (state, action) => {
      state.isExporting = false;
      state.error = action.payload;
    },

    // UI Actions
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    }
  }
});

export const {
  fetchUsageAnalyticsRequest,
  fetchUsageAnalyticsSuccess,
  fetchUsageAnalyticsFailure,
  fetchComplianceAnalyticsRequest,
  fetchComplianceAnalyticsSuccess,
  fetchComplianceAnalyticsFailure,
  exportUsageReportRequest,
  exportUsageReportSuccess,
  exportUsageReportFailure,
  clearError,
  setFilters
} = usageAnalyticsSlice.actions;

export default usageAnalyticsSlice.reducer;