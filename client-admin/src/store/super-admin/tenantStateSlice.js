import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tenantStates: [],
  isLoading: false,
  error: null,
  summary: {
    activeTenants: 0,
    trialTenants: 0,
    deactivatedTenants: 0,
    cancelledTenants: 0,
    expiredTrials: 0,
  },
  filters: {
    tenantName: '',
    status: '',
    subscriptionStatus: '',
    trialStatus: '',
    dateRange: {
      start: '',
      end: ''
    }
  },
  pagination: {
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  },
  selectedTenantState: null, // Added for selected tenant state
  updateError: null // Added for update errors
};

const tenantStateSlice = createSlice({
  name: 'tenantState',
  initialState,
  reducers: {
    // Fetch tenant states
    fetchTenantStatesRequest: (state, action) => {
      state.isLoading = true;
      state.error = null;

      // Update filters and pagination if provided
      if (action.payload) {
        const { page, limit, ...filters } = action.payload;

        if (filters && Object.keys(filters).length > 0) {
          state.filters = { ...state.filters, ...filters };
        }

        if (page !== undefined || limit !== undefined) {
          state.pagination = {
            ...state.pagination,
            ...(page !== undefined && { page }),
            ...(limit !== undefined && { limit })
          };
        }
      }
    },
    fetchTenantStatesSuccess: (state, action) => {
      state.isLoading = false;
      state.tenantStates = action.payload.tenantStates || [];
      state.summary = action.payload.summary || state.summary;

      if (action.payload.pagination) {
        state.pagination = { ...state.pagination, ...action.payload.pagination };
      }

      state.error = null;
    },
    fetchTenantStatesFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Fetch tenant state details
    fetchTenantStateDetailsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchTenantStateDetailsSuccess: (state, action) => {
      state.isLoading = false;
      state.selectedTenantState = action.payload;
      state.error = null;
    },
    fetchTenantStateDetailsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Update tenant state
    updateTenantStateRequest: (state, action) => {
      state.isLoading = true;
      state.updateError = null; // Clear previous update error
    },
    updateTenantStateSuccess: (state, action) => {
      state.isLoading = false;
      const updatedTenant = action.payload;
      const index = state.tenantStates.findIndex(tenant => tenant.id === updatedTenant.id);
      if (index !== -1) {
        state.tenantStates[index] = { ...state.tenantStates[index], ...updatedTenant };
      }
      // Update summary counts
      if (action.payload.summary) {
        state.summary = { ...state.summary, ...action.payload.summary };
      }
      state.updateError = null;
    },
    updateTenantStateFailure: (state, action) => {
      state.isLoading = false;
      state.updateError = action.payload; // Set update error
    },

    // Update trial status
    updateTrialStatusRequest: (state, action) => {
      state.isLoading = true;
      state.updateError = null; // Clear previous update error
    },
    updateTrialStatusSuccess: (state, action) => {
      state.isLoading = false;
      const updatedTenant = action.payload;
      const index = state.tenantStates.findIndex(tenant => tenant.id === updatedTenant.id);
      if (index !== -1) {
        state.tenantStates[index] = { ...state.tenantStates[index], ...updatedTenant };
      }
      // Update summary counts
      if (action.payload.summary) {
        state.summary = { ...state.summary, ...action.payload.summary };
      }
      state.updateError = null;
    },
    updateTrialStatusFailure: (state, action) => {
      state.isLoading = false;
      state.updateError = action.payload; // Set update error
    },

    // Cancel subscription
    cancelSubscriptionRequest: (state, action) => {
      state.isLoading = true;
      state.updateError = null; // Clear previous update error
    },
    cancelSubscriptionSuccess: (state, action) => {
      state.isLoading = false;
      const updatedTenant = action.payload;
      const index = state.tenantStates.findIndex(tenant => tenant.id === updatedTenant.id);
      if (index !== -1) {
        state.tenantStates[index] = { ...state.tenantStates[index], ...updatedTenant };
      }
      // Update summary counts
      if (action.payload.summary) {
        state.summary = { ...state.summary, ...action.payload.summary };
      }
      state.updateError = null;
    },
    cancelSubscriptionFailure: (state, action) => {
      state.isLoading = false;
      state.updateError = action.payload; // Set update error
    },

    // Update filters
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        tenantName: '',
        status: '',
        subscriptionStatus: '',
        trialStatus: '',
        dateRange: {
          start: '',
          end: ''
        }
      };
    },

    // Clear errors
    clearErrors: (state) => {
      state.error = null;
      state.updateError = null;
    }
  }
});

export const {
  fetchTenantStatesRequest,
  fetchTenantStatesSuccess,
  fetchTenantStatesFailure,
  fetchTenantStateDetailsRequest,
  fetchTenantStateDetailsSuccess,
  fetchTenantStateDetailsFailure,
  updateTenantStateRequest,
  updateTenantStateSuccess,
  updateTenantStateFailure,
  updateTrialStatusRequest,
  updateTrialStatusSuccess,
  updateTrialStatusFailure,
  cancelSubscriptionRequest,
  cancelSubscriptionSuccess,
  cancelSubscriptionFailure,
  updateFilters,
  clearFilters,
  clearErrors
} = tenantStateSlice.actions;

export default tenantStateSlice.reducer;