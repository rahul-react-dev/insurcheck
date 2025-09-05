import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  usageAnalytics: {
    data: null,
    isLoading: false,
    error: null
  },
  usageLimits: {
    data: null,
    isLoading: false,
    error: null
  },
  billingSummary: {
    data: null,
    isLoading: false,
    error: null
  },
  usageExport: {
    isLoading: false,
    error: null
  },
  usageCalculation: {
    data: null,
    isLoading: false,
    error: null
  }
};

const usageSlice = createSlice({
  name: 'usage',
  initialState,
  reducers: {
    // Usage Analytics Actions
    fetchUsageAnalyticsRequest: (state) => {
      state.usageAnalytics.isLoading = true;
      state.usageAnalytics.error = null;
    },
    fetchUsageAnalyticsSuccess: (state, action) => {
      state.usageAnalytics.isLoading = false;
      state.usageAnalytics.data = action.payload;
      state.usageAnalytics.error = null;
    },
    fetchUsageAnalyticsFailure: (state, action) => {
      state.usageAnalytics.isLoading = false;
      state.usageAnalytics.error = action.payload;
    },

    // Usage Limits Actions
    fetchUsageLimitsRequest: (state) => {
      state.usageLimits.isLoading = true;
      state.usageLimits.error = null;
    },
    fetchUsageLimitsSuccess: (state, action) => {
      state.usageLimits.isLoading = false;
      state.usageLimits.data = action.payload;
      state.usageLimits.error = null;
    },
    fetchUsageLimitsFailure: (state, action) => {
      state.usageLimits.isLoading = false;
      state.usageLimits.error = action.payload;
    },

    // Billing Summary Actions
    fetchBillingSummaryRequest: (state) => {
      state.billingSummary.isLoading = true;
      state.billingSummary.error = null;
    },
    fetchBillingSummarySuccess: (state, action) => {
      state.billingSummary.isLoading = false;
      state.billingSummary.data = action.payload;
      state.billingSummary.error = null;
    },
    fetchBillingSummaryFailure: (state, action) => {
      state.billingSummary.isLoading = false;
      state.billingSummary.error = action.payload;
    },

    // Usage Export Actions
    exportUsageDataRequest: (state) => {
      state.usageExport.isLoading = true;
      state.usageExport.error = null;
    },
    exportUsageDataSuccess: (state) => {
      state.usageExport.isLoading = false;
      state.usageExport.error = null;
    },
    exportUsageDataFailure: (state, action) => {
      state.usageExport.isLoading = false;
      state.usageExport.error = action.payload;
    },

    // Track Usage Event Actions
    trackUsageEventRequest: (state) => {
      // Silent tracking, no loading state needed
    },
    trackUsageEventSuccess: (state) => {
      // Silent tracking success
    },
    trackUsageEventFailure: (state, action) => {
      // Log error but don't update UI state for tracking
      console.warn('Usage tracking failed:', action.payload);
    },

    // Calculate Usage Billing Actions
    calculateUsageBillingRequest: (state) => {
      state.usageCalculation.isLoading = true;
      state.usageCalculation.error = null;
    },
    calculateUsageBillingSuccess: (state, action) => {
      state.usageCalculation.isLoading = false;
      state.usageCalculation.data = action.payload;
      state.usageCalculation.error = null;
    },
    calculateUsageBillingFailure: (state, action) => {
      state.usageCalculation.isLoading = false;
      state.usageCalculation.error = action.payload;
    },

    // Clear Actions
    clearUsageAnalytics: (state) => {
      state.usageAnalytics = { ...initialState.usageAnalytics };
    },
    clearUsageLimits: (state) => {
      state.usageLimits = { ...initialState.usageLimits };
    },
    clearBillingSummary: (state) => {
      state.billingSummary = { ...initialState.billingSummary };
    },
    clearUsageCalculation: (state) => {
      state.usageCalculation = { ...initialState.usageCalculation };
    },
    clearUsageErrors: (state) => {
      state.usageAnalytics.error = null;
      state.usageLimits.error = null;
      state.billingSummary.error = null;
      state.usageExport.error = null;
      state.usageCalculation.error = null;
    }
  }
});

export const {
  // Usage Analytics
  fetchUsageAnalyticsRequest,
  fetchUsageAnalyticsSuccess,
  fetchUsageAnalyticsFailure,
  
  // Usage Limits
  fetchUsageLimitsRequest,
  fetchUsageLimitsSuccess,
  fetchUsageLimitsFailure,
  
  // Billing Summary
  fetchBillingSummaryRequest,
  fetchBillingSummarySuccess,
  fetchBillingSummaryFailure,
  
  // Usage Export
  exportUsageDataRequest,
  exportUsageDataSuccess,
  exportUsageDataFailure,
  
  // Track Usage
  trackUsageEventRequest,
  trackUsageEventSuccess,
  trackUsageEventFailure,
  
  // Calculate Billing
  calculateUsageBillingRequest,
  calculateUsageBillingSuccess,
  calculateUsageBillingFailure,
  
  // Clear Actions
  clearUsageAnalytics,
  clearUsageLimits,
  clearBillingSummary,
  clearUsageCalculation,
  clearUsageErrors
} = usageSlice.actions;

export default usageSlice.reducer;