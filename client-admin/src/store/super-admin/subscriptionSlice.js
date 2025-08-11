
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Plans state
  plans: [],
  currentPlan: null,
  isLoadingPlans: false,
  plansError: null,
  
  // Tenants state
  tenants: [],
  isLoadingTenants: false,
  tenantsError: null,
  
  // Assignment state
  isAssigning: false,
  assignmentError: null,
  
  // UI state
  showPlanModal: false,
  editingPlan: null,
  filters: {
    searchTerm: '',
    status: 'all'
  }
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    // Plan actions
    fetchPlansRequest: (state) => {
      state.isLoadingPlans = true;
      state.plansError = null;
    },
    fetchPlansSuccess: (state, action) => {
      state.isLoadingPlans = false;
      state.plans = action.payload;
      state.plansError = null;
    },
    fetchPlansFailure: (state, action) => {
      state.isLoadingPlans = false;
      state.plansError = action.payload;
    },

    createPlanRequest: (state) => {
      state.isLoadingPlans = true;
      state.plansError = null;
    },
    createPlanSuccess: (state, action) => {
      state.isLoadingPlans = false;
      state.plans.push(action.payload);
      state.showPlanModal = false;
      state.editingPlan = null;
      state.plansError = null;
    },
    createPlanFailure: (state, action) => {
      state.isLoadingPlans = false;
      state.plansError = action.payload;
    },

    updatePlanRequest: (state) => {
      state.isLoadingPlans = true;
      state.plansError = null;
    },
    updatePlanSuccess: (state, action) => {
      state.isLoadingPlans = false;
      const index = state.plans.findIndex(plan => plan.id === action.payload.id);
      if (index !== -1) {
        state.plans[index] = action.payload;
      }
      state.showPlanModal = false;
      state.editingPlan = null;
      state.plansError = null;
    },
    updatePlanFailure: (state, action) => {
      state.isLoadingPlans = false;
      state.plansError = action.payload;
    },

    deletePlanRequest: (state) => {
      state.isLoadingPlans = true;
      state.plansError = null;
    },
    deletePlanSuccess: (state, action) => {
      state.isLoadingPlans = false;
      state.plans = state.plans.filter(plan => plan.id !== action.payload);
      state.plansError = null;
    },
    deletePlanFailure: (state, action) => {
      state.isLoadingPlans = false;
      state.plansError = action.payload;
    },

    // Tenant actions
    fetchTenantsRequest: (state) => {
      state.isLoadingTenants = true;
      state.tenantsError = null;
    },
    fetchTenantsSuccess: (state, action) => {
      state.isLoadingTenants = false;
      state.tenants = action.payload;
      state.tenantsError = null;
    },
    fetchTenantsFailure: (state, action) => {
      state.isLoadingTenants = false;
      state.tenantsError = action.payload;
    },

    // Assignment actions
    assignPlanToTenantRequest: (state) => {
      state.isAssigning = true;
      state.assignmentError = null;
    },
    assignPlanToTenantSuccess: (state, action) => {
      state.isAssigning = false;
      const { tenantId, planId } = action.payload;
      const tenant = state.tenants.find(t => t.id === tenantId);
      if (tenant) {
        tenant.planId = planId;
        tenant.plan = state.plans.find(p => p.id === planId);
      }
      state.assignmentError = null;
    },
    assignPlanToTenantFailure: (state, action) => {
      state.isAssigning = false;
      state.assignmentError = action.payload;
    },

    // UI actions
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
      state.plansError = null;
    },

    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    clearErrors: (state) => {
      state.plansError = null;
      state.tenantsError = null;
      state.assignmentError = null;
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
  setFilters,
  clearErrors
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
