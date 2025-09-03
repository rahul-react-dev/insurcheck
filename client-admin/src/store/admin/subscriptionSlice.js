import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentSubscription: null,
  availablePlans: [],
  isLoading: false,
  error: null,
  upgradePlan: {
    isLoading: false,
    error: null,
    success: false
  }
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    // Fetch current subscription
    fetchSubscriptionRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchSubscriptionSuccess: (state, action) => {
      state.isLoading = false;
      state.currentSubscription = action.payload;
      state.error = null;
    },
    fetchSubscriptionFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Fetch available plans
    fetchAvailablePlansRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchAvailablePlansSuccess: (state, action) => {
      state.isLoading = false;
      state.availablePlans = action.payload;
      state.error = null;
    },
    fetchAvailablePlansFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Upgrade/change plan
    upgradePlanRequest: (state, action) => {
      state.upgradePlan.isLoading = true;
      state.upgradePlan.error = null;
      state.upgradePlan.success = false;
    },
    upgradePlanSuccess: (state, action) => {
      state.upgradePlan.isLoading = false;
      state.upgradePlan.success = true;
      state.upgradePlan.error = null;
      // Update current subscription with new plan
      state.currentSubscription = action.payload;
    },
    upgradePlanFailure: (state, action) => {
      state.upgradePlan.isLoading = false;
      state.upgradePlan.error = action.payload;
      state.upgradePlan.success = false;
    },

    // Clear errors
    clearError: (state) => {
      state.error = null;
      state.upgradePlan.error = null;
    },

    // Clear upgrade status
    clearUpgradeStatus: (state) => {
      state.upgradePlan.success = false;
      state.upgradePlan.error = null;
    }
  },
});

export const {
  fetchSubscriptionRequest,
  fetchSubscriptionSuccess,
  fetchSubscriptionFailure,
  fetchAvailablePlansRequest,
  fetchAvailablePlansSuccess,
  fetchAvailablePlansFailure,
  upgradePlanRequest,
  upgradePlanSuccess,
  upgradePlanFailure,
  clearError,
  clearUpgradeStatus
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;