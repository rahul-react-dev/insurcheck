import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tenants: [],
  subscriptionPlans: [],
  tenantUsers: {},
  isLoading: false,
  isLoadingPlans: false,
  isLoadingUsers: false,
  isLoadingAnalytics: false,
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
  hasInitialLoad: false,
  // Analytics data
  usageAnalytics: {
    totalDocuments: 0,
    activeUsers: 0,
    complianceRate: 0,
    monthlyUploads: [],
    complianceTrends: [],
    tenantPerformance: []
  },
  analyticsError: null,
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

    // Update tenant status
    updateTenantStatusRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updateTenantStatusSuccess: (state, action) => {
      state.isLoading = false;
      const { tenantId, status } = action.payload;
      const tenantIndex = state.tenants.findIndex(t => t.id === tenantId);
      if (tenantIndex !== -1) {
        state.tenants[tenantIndex].status = status;
      }
      state.error = null;
    },
    updateTenantStatusFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Resend welcome email
    resendWelcomeEmailRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    resendWelcomeEmailSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
    },
    resendWelcomeEmailFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Update tenant state
    updateTenantStateRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updateTenantStateSuccess: (state, action) => {
      state.isLoading = false;
      const updatedTenant = action.payload;
      const index = state.tenants.findIndex(t => t.id === updatedTenant.id);
      if (index !== -1) {
        state.tenants[index] = updatedTenant;
      }
      state.error = null;
    },
    updateTenantStateFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Tenant details
    fetchTenantDetailsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchTenantDetailsSuccess: (state, action) => {
      state.isLoading = false;
      state.selectedTenant = action.payload;
      state.error = null;
    },
    fetchTenantDetailsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Export tenants
    exportTenantsRequest: (state) => {
      state.isExporting = true;
      state.error = null;
    },
    exportTenantsSuccess: (state) => {
      state.isExporting = false;
      state.error = null;
    },
    exportTenantsFailure: (state, action) => {
      state.isExporting = false;
      state.error = action.payload;
    },

    // Update tenant user count when fetching tenant users
    updateTenantUserCount: (state, action) => {
      const { tenantId, actualUserCount } = action.payload;
      const index = state.tenants.findIndex(tenant => tenant.id === tenantId);
      if (index !== -1) {
        state.tenants[index].actualUserCount = actualUserCount;
      }
    },

    // Clear errors
    clearError: (state) => {
      state.error = null;
    },

    // Fetch tenant users
    fetchTenantUsersRequest: (state, action) => {
      state.isLoadingUsers = true;
      state.error = null;
    },
    fetchTenantUsersSuccess: (state, action) => {
      state.isLoadingUsers = false;
      
      // Handle the actual API response format
      if (action.payload.users && action.payload.tenantId) {
        // Direct format with tenantId and users
        const { tenantId, users } = action.payload;
        state.tenantUsers[tenantId] = users;
      } else if (action.payload.users) {
        // API response format from /api/tenants/:id/users
        // Need to extract tenantId from somewhere - use 'current' as fallback
        const tenantId = action.payload.tenantId || 'current';
        state.tenantUsers[tenantId] = action.payload.users;
      } else {
        // Fallback to direct users array
        state.tenantUsers.current = action.payload || [];
      }
      
      state.error = null;
    },
    fetchTenantUsersFailure: (state, action) => {
      state.isLoadingUsers = false;
      state.error = action.payload;
    },

    // Clear all data
    clearTenantData: (state) => {
      return initialState;
    },

    // Analytics actions
    fetchTenantAnalyticsRequest: (state, action) => {
      state.isLoadingAnalytics = true;
      state.analyticsError = null;
    },
    fetchTenantAnalyticsSuccess: (state, action) => {
      state.isLoadingAnalytics = false;
      state.usageAnalytics = action.payload;
    },
    fetchTenantAnalyticsFailure: (state, action) => {
      state.isLoadingAnalytics = false;
      state.analyticsError = action.payload;
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
  updateTenantStatusRequest,
  updateTenantStatusSuccess,
  updateTenantStatusFailure,
  resendWelcomeEmailRequest,
  resendWelcomeEmailSuccess,
  resendWelcomeEmailFailure,
  fetchTenantDetailsRequest,
  fetchTenantDetailsSuccess,
  fetchTenantDetailsFailure,
  exportTenantsRequest,
  exportTenantsSuccess,
  exportTenantsFailure,
  updateTenantStateRequest,
  updateTenantStateSuccess,
  updateTenantStateFailure,
  clearError,
  updateFilters,
  clearFilters,
  fetchTenantUsersRequest,
  fetchTenantUsersSuccess,
  fetchTenantUsersFailure,
  updateTenantUserCount,
  clearTenantData,
  fetchTenantAnalyticsRequest,
  fetchTenantAnalyticsSuccess,
  fetchTenantAnalyticsFailure
} = tenantSlice.actions;

export default tenantSlice.reducer;