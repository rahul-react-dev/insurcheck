
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
  }
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

    // Update tenant state
    updateTenantStateRequest: (state, action) => {
      state.isLoading = true;
      state.error = null;
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
      state.error = null;
    },
    updateTenantStateFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Update trial status
    updateTrialStatusRequest: (state, action) => {
      state.isLoading = true;
      state.error = null;
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
      state.error = null;
    },
    updateTrialStatusFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Cancel subscription
    cancelSubscriptionRequest: (state, action) => {
      state.isLoading = true;
      state.error = null;
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
      state.error = null;
    },
    cancelSubscriptionFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
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

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Clear data
    clearTenantStateData: (state) => {
      return initialState;
    }
  }
});

export const {
  fetchTenantStatesRequest,
  fetchTenantStatesSuccess,
  fetchTenantStatesFailure,
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
  clearError,
  clearTenantStateData
} = tenantStateSlice.actions;

export default tenantStateSlice.reducer;
