import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  plans: [],
  tenants: [],
  isLoading: false,
  isLoadingPlans: false,
  isLoadingTenants: false,
  error: null,
  planError: null,
  tenantError: null,
  showPlanModal: false,
  editingPlan: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  }
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    // Plans
    fetchPlansRequest: (state) => {
      state.isLoadingPlans = true;
      state.planError = null;
    },
    fetchPlansSuccess: (state, action) => {
      state.isLoadingPlans = false;
      state.plans = action.payload;
      state.planError = null;
    },
    fetchPlansFailure: (state, action) => {
      state.isLoadingPlans = false;
      state.planError = action.payload;
    },

    // Create Plan
    createPlanRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    createPlanSuccess: (state, action) => {
      state.isLoading = false;
      state.plans.push(action.payload);
      state.error = null;
    },
    createPlanFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Update Plan
    updatePlanRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updatePlanSuccess: (state, action) => {
      state.isLoading = false;
      const index = state.plans.findIndex(plan => plan.id === action.payload.id);
      if (index !== -1) {
        state.plans[index] = action.payload;
      }
      state.error = null;
    },
    updatePlanFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Delete Plan
    deletePlanRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    deletePlanSuccess: (state, action) => {
      state.isLoading = false;
      state.plans = state.plans.filter(plan => plan.id !== action.payload);
      state.error = null;
    },
    deletePlanFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Tenants
    fetchTenantsRequest: (state) => {
      state.isLoadingTenants = true;
      state.tenantError = null;
    },
    fetchTenantsSuccess: (state, action) => {
      state.isLoadingTenants = false;
      state.tenants = action.payload;
      state.tenantError = null;
    },
    fetchTenantsFailure: (state, action) => {
      state.isLoadingTenants = false;
      state.tenantError = action.payload;
    },

    // Assign Plan to Tenant
    assignPlanToTenantRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    assignPlanToTenantSuccess: (state, action) => {
      state.isLoading = false;
      const { tenantId, planId } = action.payload;
      const tenantIndex = state.tenants.findIndex(tenant => tenant.id === tenantId);
      if (tenantIndex !== -1) {
        const plan = state.plans.find(p => p.id === planId);
        state.tenants[tenantIndex] = {
          ...state.tenants[tenantIndex],
          subscriptionPlan: plan?.name || planId,
          planId: planId
        };
      }
      state.error = null;
    },
    assignPlanToTenantFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Modal Management
    showCreatePlanModal: (state) => {
      state.showPlanModal = true;
      state.editingPlan = null;
    },
    showEditPlanModal: (state, action) => {
      state.showPlanModal = true;
      state.editingPlan = action.payload;
    },
    hidePlanModal: (state) => {
      state.showPlanModal = false;
      state.editingPlan = null;
    },

    // Clear errors
    clearError: (state) => {
      state.error = null;
      state.planError = null;
      state.tenantError = null;
    },

    // Reset state
    resetSubscriptionState: (state) => {
      return initialState;
    }
  }
});

export const {
  fetchPlansRequest,
  fetchPlansSuccess,
  fetchPlansFailure,
  createPlanRequest,
  createPlanSuccess,
  createPlanFailure,
  updatePlanRequest,
  updatePlanSuccess,
  updatePlanFailure,
  deletePlanRequest,
  deletePlanSuccess,
  deletePlanFailure,
  fetchTenantsRequest,
  fetchTenantsSuccess,
  fetchTenantsFailure,
  assignPlanToTenantRequest,
  assignPlanToTenantSuccess,
  assignPlanToTenantFailure,
  showCreatePlanModal,
  showEditPlanModal,
  hidePlanModal,
  clearError,
  resetSubscriptionState
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;