import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  plans: [],
  subscriptions: [],
  tenants: [],
  isLoading: false,
  isLoadingPlans: false,
  isLoadingTenants: false,
  deletingPlanId: null,
  isAssigning: false,
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
      state.plans.unshift(action.payload); // Add to beginning
      state.showPlanModal = false;
      state.editingPlan = null;
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
      state.showPlanModal = false;
      state.editingPlan = null;
      state.error = null;
    },
    updatePlanFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Delete Plan
    deletePlanRequest: (state, action) => {
      state.deletingPlanId = action.payload;
      state.error = null;
    },
    deletePlanSuccess: (state, action) => {
      state.deletingPlanId = null;
      state.plans = state.plans.filter(plan => plan.id !== action.payload);
      state.error = null;
    },
    deletePlanFailure: (state, action) => {
      state.deletingPlanId = null;
      state.error = action.payload;
    },

    // Tenants
    fetchTenantsRequest: (state) => {
      state.isLoadingTenants = true;
      state.tenantError = null;
    },
    fetchTenantsSuccess: (state, action) => {
      state.isLoadingTenants = false;
      // Handle different API response structures
      if (action.payload.tenants) {
        state.tenants = action.payload.tenants;
      } else if (Array.isArray(action.payload)) {
        state.tenants = action.payload;
      } else {
        state.tenants = action.payload.data || [];
      }
      state.tenantError = null;
    },
    fetchTenantsFailure: (state, action) => {
      state.isLoadingTenants = false;
      state.tenantError = action.payload;
    },

    // Assign Plan to Tenant
    assignPlanToTenantRequest: (state) => {
      state.isAssigning = true;
      state.error = null;
    },
    assignPlanToTenantSuccess: (state, action) => {
      state.isAssigning = false;
      const { tenantId, planId } = action.payload;
      const tenantIndex = state.tenants.findIndex(tenant => tenant.id === tenantId);
      if (tenantIndex !== -1) {
        const plan = state.plans.find(p => p.id === planId);
        state.tenants[tenantIndex] = {
          ...state.tenants[tenantIndex],
          subscriptionPlan: plan?.name || 'Unknown Plan',
          planId: planId
        };
      }
      state.error = null;
    },
    assignPlanToTenantFailure: (state, action) => {
      state.isAssigning = false;
      state.error = action.payload;
    },

    // Modal Management
    showCreatePlanModal: (state) => {
      state.showPlanModal = true;
      state.editingPlan = null;
      state.error = null;
    },
    showEditPlanModal: (state, action) => {
      state.showPlanModal = true;
      state.editingPlan = action.payload;
      state.error = null;
    },
    hidePlanModal: (state) => {
      state.showPlanModal = false;
      state.editingPlan = null;
      state.error = null;
    },

    // Fetch subscriptions
    fetchSubscriptionsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchSubscriptionsSuccess: (state, action) => {
      state.isLoading = false;
      state.subscriptions = action.payload.subscriptions || [];
      if (action.payload.pagination) {
        state.pagination = { ...state.pagination, ...action.payload.pagination };
      }
      state.error = null;
    },
    fetchSubscriptionsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Create subscription
    createSubscriptionRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    createSubscriptionSuccess: (state, action) => {
      state.isLoading = false;
      state.subscriptions = state.subscriptions || [];
      state.subscriptions.push(action.payload);
      state.error = null;
    },
    createSubscriptionFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Update subscription
    updateSubscriptionRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updateSubscriptionSuccess: (state, action) => {
      state.isLoading = false;
      const index = state.subscriptions?.findIndex(sub => sub.id === action.payload.id);
      if (index !== -1) {
        state.subscriptions[index] = action.payload;
      }
      state.error = null;
    },
    updateSubscriptionFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Cancel subscription
    cancelSubscriptionRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    cancelSubscriptionSuccess: (state, action) => {
      state.isLoading = false;
      const index = state.subscriptions?.findIndex(sub => sub.id === action.payload.id);
      if (index !== -1) {
        state.subscriptions[index] = { ...state.subscriptions[index], status: 'cancelled' };
      }
      state.error = null;
    },
    cancelSubscriptionFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Fetch subscription plans
    fetchSubscriptionPlansRequest: (state) => {
      state.isLoadingPlans = true;
      state.planError = null;
    },
    fetchSubscriptionPlansSuccess: (state, action) => {
      state.isLoadingPlans = false;
      state.plans = action.payload;
      state.planError = null;
    },
    fetchSubscriptionPlansFailure: (state, action) => {
      state.isLoadingPlans = false;
      state.planError = action.payload;
    },

    // Create subscription plan
    createSubscriptionPlanRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    createSubscriptionPlanSuccess: (state, action) => {
      state.isLoading = false;
      state.plans.push(action.payload);
      state.error = null;
    },
    createSubscriptionPlanFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Update subscription plan
    updateSubscriptionPlanRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updateSubscriptionPlanSuccess: (state, action) => {
      state.isLoading = false;
      const index = state.plans.findIndex(plan => plan.id === action.payload.id);
      if (index !== -1) {
        state.plans[index] = action.payload;
      }
      state.error = null;
    },
    updateSubscriptionPlanFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Delete subscription plan
    deleteSubscriptionPlanRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    deleteSubscriptionPlanSuccess: (state, action) => {
      state.isLoading = false;
      state.plans = state.plans.filter(plan => plan.id !== action.payload);
      state.error = null;
    },
    deleteSubscriptionPlanFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
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
  fetchTenantsRequest,
  fetchTenantsSuccess,
  fetchTenantsFailure,
  createPlanRequest,
  createPlanSuccess,
  createPlanFailure,
  updatePlanRequest,
  updatePlanSuccess,
  updatePlanFailure,
  deletePlanRequest,
  deletePlanSuccess,
  deletePlanFailure,
  assignPlanToTenantRequest,
  assignPlanToTenantSuccess,
  assignPlanToTenantFailure,
  fetchSubscriptionsRequest,
  fetchSubscriptionsSuccess,
  fetchSubscriptionsFailure,
  createSubscriptionRequest,
  createSubscriptionSuccess,
  createSubscriptionFailure,
  updateSubscriptionRequest,
  updateSubscriptionSuccess,
  updateSubscriptionFailure,
  cancelSubscriptionRequest,
  cancelSubscriptionSuccess,
  cancelSubscriptionFailure,
  fetchSubscriptionPlansRequest,
  fetchSubscriptionPlansSuccess,
  fetchSubscriptionPlansFailure,
  createSubscriptionPlanRequest,
  createSubscriptionPlanSuccess,
  createSubscriptionPlanFailure,
  updateSubscriptionPlanRequest,
  updateSubscriptionPlanSuccess,
  updateSubscriptionPlanFailure,
  deleteSubscriptionPlanRequest,
  deleteSubscriptionPlanSuccess,
  deleteSubscriptionPlanFailure,
  showCreatePlanModal,
  showEditPlanModal,
  hidePlanModal,
  clearError,
  resetSubscriptionState
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;