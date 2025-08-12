
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tenants: [],
  subscriptionPlans: [],
  isLoading: false,
  isLoadingPlans: false,
  error: null,
  totalTenants: 0,
  statusCounts: {
    active: 0,
    suspended: 0,
    unverified: 0,
    locked: 0,
    deactivated: 0
  },
  filters: {
    tenantName: '',
    status: '',
    subscriptionPlan: '',
    dateRange: {
      start: '',
      end: ''
    }
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  hasInitialLoad: false
};

const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {
    // Fetch tenants
    fetchTenantsRequest: (state, action) => {
      console.log('📦 REDUCER: fetchTenantsRequest called');
      console.log('📦 Action payload:', action.payload);
      state.isLoading = true;
      state.error = null;
      
      // Update pagination and filters from action payload
      if (action.payload) {
        const { page, limit, total, ...filters } = action.payload;
        
        // Update filters if provided
        if (filters && Object.keys(filters).length > 0) {
          state.filters = { ...state.filters, ...filters };
        }
        
        // Update pagination if provided
        if (page !== undefined || limit !== undefined || total !== undefined) {
          state.pagination = {
            ...state.pagination,
            ...(page !== undefined && { page }),
            ...(limit !== undefined && { limit }),
            ...(total !== undefined && { total })
          };
        }
      }
    },
    fetchTenantsSuccess: (state, action) => {
      console.log('✅ REDUCER: fetchTenantsSuccess called');
      console.log('✅ Success payload:', action.payload);
      state.isLoading = false;
      state.hasInitialLoad = true;
      state.tenants = action.payload.tenants || [];
      state.totalTenants = action.payload.summary?.totalTenants || 0;
      state.statusCounts = action.payload.summary?.statusCounts || state.statusCounts;
      
      // Update pagination with response data
      if (action.payload.pagination) {
        state.pagination = { ...state.pagination, ...action.payload.pagination };
      }
      
      state.error = null;
    },
    fetchTenantsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Fetch subscription plans
    fetchSubscriptionPlansRequest: (state) => {
      state.isLoadingPlans = true;
      state.error = null;
    },
    fetchSubscriptionPlansSuccess: (state, action) => {
      state.isLoadingPlans = false;
      state.subscriptionPlans = action.payload;
      state.error = null;
    },
    fetchSubscriptionPlansFailure: (state, action) => {
      state.isLoadingPlans = false;
      state.error = action.payload;
    },

    // Create tenant
    createTenantRequest: (state, action) => {
      state.isLoading = true;
      state.error = null;
    },
    createTenantSuccess: (state, action) => {
      state.isLoading = false;
      state.tenants.unshift(action.payload); // Add to beginning of array
      state.totalTenants += 1;
      state.statusCounts[action.payload.status] = (state.statusCounts[action.payload.status] || 0) + 1;
      state.error = null;
    },
    createTenantFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Update tenant
    updateTenantRequest: (state, action) => {
      state.isLoading = true;
      state.error = null;
    },
    updateTenantSuccess: (state, action) => {
      state.isLoading = false;
      const updatedTenant = action.payload;
      const index = state.tenants.findIndex(tenant => tenant.id === updatedTenant.id);
      if (index !== -1) {
        // Update status counts if status changed
        const oldStatus = state.tenants[index].status;
        if (oldStatus !== updatedTenant.status) {
          state.statusCounts[oldStatus] = Math.max(0, (state.statusCounts[oldStatus] || 0) - 1);
          state.statusCounts[updatedTenant.status] = (state.statusCounts[updatedTenant.status] || 0) + 1;
        }
        state.tenants[index] = updatedTenant;
      }
      state.error = null;
    },
    updateTenantFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Suspend/reactivate tenant
    suspendTenantRequest: (state, action) => {
      state.isLoading = true;
      state.error = null;
    },
    suspendTenantSuccess: (state, action) => {
      state.isLoading = false;
      const { tenantId, newStatus } = action.payload;
      const index = state.tenants.findIndex(tenant => tenant.id === tenantId);
      if (index !== -1) {
        const oldStatus = state.tenants[index].status;
        state.tenants[index].status = newStatus;
        
        // Update status counts
        state.statusCounts[oldStatus] = Math.max(0, (state.statusCounts[oldStatus] || 0) - 1);
        state.statusCounts[newStatus] = (state.statusCounts[newStatus] || 0) + 1;
      }
      state.error = null;
    },
    suspendTenantFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Delete tenant
    deleteTenantRequest: (state, action) => {
      state.isLoading = true;
      state.error = null;
    },
    deleteTenantSuccess: (state, action) => {
      state.isLoading = false;
      const tenantId = action.payload;
      const index = state.tenants.findIndex(tenant => tenant.id === tenantId);
      if (index !== -1) {
        const deletedTenant = state.tenants[index];
        state.tenants.splice(index, 1);
        state.totalTenants -= 1;
        state.statusCounts[deletedTenant.status] = Math.max(0, (state.statusCounts[deletedTenant.status] || 0) - 1);
      }
      state.error = null;
    },
    deleteTenantFailure: (state, action) => {
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
        subscriptionPlan: '',
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

    // Clear all data
    clearTenantData: (state) => {
      return initialState;
    }
  }
});

export const {
  fetchTenantsRequest,
  fetchTenantsSuccess,
  fetchTenantsFailure,
  fetchSubscriptionPlansRequest,
  fetchSubscriptionPlansSuccess,
  fetchSubscriptionPlansFailure,
  createTenantRequest,
  createTenantSuccess,
  createTenantFailure,
  updateTenantRequest,
  updateTenantSuccess,
  updateTenantFailure,
  suspendTenantRequest,
  suspendTenantSuccess,
  suspendTenantFailure,
  deleteTenantRequest,
  deleteTenantSuccess,
  deleteTenantFailure,
  updateFilters,
  clearFilters,
  clearError,
  clearTenantData
} = tenantSlice.actions;

export default tenantSlice.reducer;
