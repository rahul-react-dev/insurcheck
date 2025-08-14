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
  isLoadingMetrics: false,
  isLoadingLogs: false,
  isExporting: false, // Added for export functionality
  metricsError: null,
  logsError: null,
  exportError: null, // Added for export errors
  filters: {
    tenantName: '',
    errorType: '',
    dateRange: null
  }
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
      console.log('✅ Super Admin login successful:', action.payload);
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      state.loginAttempts = 0; // Reset login attempts on successful login

      // Store in localStorage for persistence
      try {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('isAuthenticated', 'true');
        console.log('💾 Auth data saved to localStorage');
      } catch (error) {
        console.error('❌ Error saving auth data to localStorage:', error);
      }
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
    // Logout action
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.systemMetrics = [];
      state.errorLogs = [];
      state.metricsError = null;
      state.logsError = null;
      state.exportError = null;
      state.error = null;
      state.isLoading = false;

      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
    },

    // Hydrate from localStorage
    hydrateAuth: (state) => {
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        const isAuthenticated = localStorage.getItem('isAuthenticated');

        if (token && user && isAuthenticated === 'true') {
          state.token = token;
          state.user = JSON.parse(user);
          state.isAuthenticated = true;
          state.error = null;
        }
      } catch (error) {
        console.error('Error hydrating auth state:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
      }
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

    // Export actions
    exportErrorLogsRequest: (state) => {
      state.isExporting = true;
      state.exportError = null;
    },
    exportErrorLogsSuccess: (state) => {
      state.isExporting = false;
    },
    exportErrorLogsFailure: (state, action) => {
      state.isExporting = false;
      state.exportError = action.payload;
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

      // Add date range filtering if dateRange is provided and has valid start/end
      if (state.filters.dateRange && state.filters.dateRange.start && state.filters.dateRange.end) {
        const startDate = new Date(state.filters.dateRange.start);
        const endDate = new Date(state.filters.dateRange.end);
        filtered = filtered.filter(log => {
          const logDate = new Date(log.timestamp); // Assuming log has a timestamp field
          return logDate >= startDate && logDate <= endDate;
        });
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
      state.error = null;
      state.metricsError = null;
      state.logsError = null;
      state.exportError = null;
    },
    resetLoadingState: (state) => {
      state.isLoading = false;
      state.isLoadingMetrics = false;
      state.isLoadingLogs = false;
      state.isExporting = false;
    },

    // Additional dashboard actions
    fetchDashboardDataRequest: (state) => {
      state.isLoadingMetrics = true;
      state.error = null;
    },
    fetchDashboardDataSuccess: (state, action) => {
      state.isLoadingMetrics = false;
      if (action.payload.metrics) {
        state.systemMetrics = action.payload.metrics;
      }
      if (action.payload.logs) {
        state.errorLogs = action.payload.logs;
      }
      state.error = null;
    },
    fetchDashboardDataFailure: (state, action) => {
      state.isLoadingMetrics = false;
      state.error = action.payload;
    }
  }
});

export const {
  // Auth actions
  loginRequest,
  loginSuccess,
  loginFailure,
  logout,
  hydrateAuth,

  // System metrics actions
  fetchSystemMetricsRequest,
  fetchSystemMetricsSuccess,
  fetchSystemMetricsFailure,

  // Error logs actions
  fetchErrorLogsRequest,
  fetchErrorLogsSuccess,
  fetchErrorLogsFailure,

  // Export actions
  exportErrorLogsRequest,
  exportErrorLogsSuccess,
  exportErrorLogsFailure,

  // Dashboard actions
  fetchDashboardDataRequest,
  fetchDashboardDataSuccess,
  fetchDashboardDataFailure,

  // Clear errors
  clearErrors,
  resetLoadingState,
} = superAdminSlice.actions;

export default superAdminSlice.reducer;