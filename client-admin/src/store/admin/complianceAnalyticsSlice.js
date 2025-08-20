import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Analytics data
  analytics: null,
  analyticsLoading: false,
  analyticsError: null,
  
  // Trends data
  trends: null,
  trendsLoading: false,
  trendsError: null,
  
  // Charts data
  charts: null,
  chartsLoading: false,
  chartsError: null,
  
  // Export state
  exportLoading: false,
  exportError: null,
  exportSuccess: false,
  
  // Filters
  filters: {
    timeRange: 'month',
    documentType: '',
    user: '',
    dateRange: null
  }
};

const complianceAnalyticsSlice = createSlice({
  name: 'complianceAnalytics',
  initialState,
  reducers: {
    // Fetch compliance analytics
    fetchComplianceAnalyticsRequest: (state, action) => {
      state.analyticsLoading = true;
      state.analyticsError = null;
    },
    fetchComplianceAnalyticsSuccess: (state, action) => {
      state.analyticsLoading = false;
      state.analytics = action.payload;
      state.analyticsError = null;
    },
    fetchComplianceAnalyticsFailure: (state, action) => {
      state.analyticsLoading = false;
      state.analyticsError = action.payload;
    },

    // Fetch compliance trends
    fetchComplianceTrendsRequest: (state, action) => {
      state.trendsLoading = true;
      state.trendsError = null;
    },
    fetchComplianceTrendsSuccess: (state, action) => {
      state.trendsLoading = false;
      state.trends = action.payload;
      state.trendsError = null;
    },
    fetchComplianceTrendsFailure: (state, action) => {
      state.trendsLoading = false;
      state.trendsError = action.payload;
    },

    // Fetch compliance charts
    fetchComplianceChartsRequest: (state, action) => {
      state.chartsLoading = true;
      state.chartsError = null;
    },
    fetchComplianceChartsSuccess: (state, action) => {
      state.chartsLoading = false;
      state.charts = action.payload;
      state.chartsError = null;
    },
    fetchComplianceChartsFailure: (state, action) => {
      state.chartsLoading = false;
      state.chartsError = action.payload;
    },

    // Export analytics
    exportComplianceAnalyticsRequest: (state, action) => {
      state.exportLoading = true;
      state.exportError = null;
      state.exportSuccess = false;
    },
    exportComplianceAnalyticsSuccess: (state, action) => {
      state.exportLoading = false;
      state.exportSuccess = true;
      state.exportError = null;
    },
    exportComplianceAnalyticsFailure: (state, action) => {
      state.exportLoading = false;
      state.exportError = action.payload;
      state.exportSuccess = false;
    },

    // Filters
    setAnalyticsFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearAnalyticsFilters: (state) => {
      state.filters = {
        timeRange: 'month',
        documentType: '',
        user: '',
        dateRange: null
      };
    },

    // Clear states
    clearAnalyticsErrors: (state) => {
      state.analyticsError = null;
      state.trendsError = null;
      state.chartsError = null;
      state.exportError = null;
    },
    clearExportStatus: (state) => {
      state.exportSuccess = false;
      state.exportError = null;
    }
  }
});

export const {
  fetchComplianceAnalyticsRequest,
  fetchComplianceAnalyticsSuccess,
  fetchComplianceAnalyticsFailure,
  fetchComplianceTrendsRequest,
  fetchComplianceTrendsSuccess,
  fetchComplianceTrendsFailure,
  fetchComplianceChartsRequest,
  fetchComplianceChartsSuccess,
  fetchComplianceChartsFailure,
  exportComplianceAnalyticsRequest,
  exportComplianceAnalyticsSuccess,
  exportComplianceAnalyticsFailure,
  setAnalyticsFilters,
  clearAnalyticsFilters,
  clearAnalyticsErrors,
  clearExportStatus
} = complianceAnalyticsSlice.actions;

export default complianceAnalyticsSlice.reducer;