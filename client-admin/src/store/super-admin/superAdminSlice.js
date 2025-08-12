import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Login state
  isLoading: false,
  user: null,
  token: null,
  isAuthenticated: false,
  error: null,
  loginAttempts: 0,
  isLocked: false,
  lockoutTime: null,

  // Dashboard state
  systemMetrics: [],
  errorLogs: [],
  filteredErrorLogs: [],
  filters: {
    tenantName: '',
    errorType: '',
    dateRange: null
  },
  isLoadingMetrics: false,
  isLoadingLogs: false,
  metricsError: null,
  logsError: null
};

const superAdminSlice = createSlice({
  name: 'superAdmin',
  initialState,
  reducers: {
    // Login actions
    loginRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      state.loginAttempts = 0;
      state.isLocked = false;
      state.lockoutTime = null;
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.loginAttempts += 1;

      if (state.loginAttempts >= 5) {
        state.isLocked = true;
        state.lockoutTime = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      }
    },
    clearLoginError: (state) => {
      state.error = null;
    },
    checkLockout: (state) => {
      if (state.isLocked && state.lockoutTime) {
        const now = new Date();
        const lockoutEnd = new Date(state.lockoutTime);
        if (now >= lockoutEnd) {
          state.isLocked = false;
          state.lockoutTime = null;
          state.loginAttempts = 0;
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },

    // Dashboard actions
    fetchSystemMetricsRequest: (state) => {
      state.isLoadingMetrics = true;
      state.metricsError = null;
    },
    fetchSystemMetricsSuccess: (state, action) => {
      state.isLoadingMetrics = false;
      state.systemMetrics = action.payload;
    },
    fetchSystemMetricsFailure: (state, action) => {
      state.isLoadingMetrics = false;
      state.metricsError = action.payload;
    },

    fetchErrorLogsRequest: (state) => {
      state.isLoadingLogs = true;
      state.logsError = null;
    },
    fetchErrorLogsSuccess: (state, action) => {
      state.isLoadingLogs = false;
      state.errorLogs = action.payload;
      state.filteredErrorLogs = action.payload;
    },
    fetchErrorLogsFailure: (state, action) => {
      state.isLoadingLogs = false;
      state.logsError = action.payload;
    },

    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Apply filters
      let filtered = state.errorLogs;

      if (state.filters.tenantName) {
        filtered = filtered.filter(log => 
          log.affectedTenant?.toLowerCase().includes(state.filters.tenantName.toLowerCase())
        );
      }

      if (state.filters.errorType) {
        filtered = filtered.filter(log => 
          log.errorType === state.filters.errorType
        );
      }

      state.filteredErrorLogs = filtered;
    },

    clearFilters: (state) => {
      state.filters = {
        tenantName: '',
        errorType: '',
        dateRange: null
      };
      state.filteredErrorLogs = state.errorLogs;
    },

    clearErrors: (state) => {
      state.metricsError = null;
      state.logsError = null;
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
      // Clear token from localStorage on logout
      localStorage.removeItem('token');
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  logout,
  fetchSystemMetricsRequest,
  fetchSystemMetricsSuccess,
  fetchSystemMetricsFailure,
  fetchErrorLogsRequest,
  fetchErrorLogsSuccess,
  fetchErrorLogsFailure,
  setFilters,
  clearFilters,
  clearErrors
} = superAdminSlice.actions;

export default superAdminSlice.reducer;