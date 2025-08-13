
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  configuration: null,
  auditLogs: [],
  isLoading: false,
  isUpdating: false,
  error: null,
  updateSuccess: false,
  lastFetch: null
};

const systemConfigSlice = createSlice({
  name: 'systemConfig',
  initialState,
  reducers: {
    // Fetch Configuration
    fetchSystemConfigRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchSystemConfigSuccess: (state, action) => {
      state.isLoading = false;
      state.configuration = action.payload.configuration;
      state.auditLogs = action.payload.auditLogs || [];
      state.lastFetch = new Date().toISOString();
      state.error = null;
    },
    fetchSystemConfigFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload.message || 'Failed to fetch system configuration';
    },

    // Update Configuration
    updateSystemConfigRequest: (state, action) => {
      state.isUpdating = true;
      state.error = null;
      state.updateSuccess = false;
    },
    updateSystemConfigSuccess: (state, action) => {
      state.isUpdating = false;
      state.configuration = action.payload.configuration;
      state.updateSuccess = true;
      state.error = null;
      
      // Add new audit log entry
      if (action.payload.auditLog) {
        state.auditLogs.unshift(action.payload.auditLog);
      }
    },
    updateSystemConfigFailure: (state, action) => {
      state.isUpdating = false;
      state.error = action.payload.message || 'Failed to update system configuration';
      state.updateSuccess = false;
    },

    // Fetch Audit Logs
    fetchAuditLogsRequest: (state, action) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchAuditLogsSuccess: (state, action) => {
      state.isLoading = false;
      state.auditLogs = action.payload.logs;
      state.error = null;
    },
    fetchAuditLogsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload.message || 'Failed to fetch audit logs';
    },

    // Clear errors and success states
    clearConfigurationErrors: (state) => {
      state.error = null;
      state.updateSuccess = false;
    },

    // Reset state
    resetConfigurationState: (state) => {
      return { ...initialState };
    }
  }
});

export const {
  fetchSystemConfigRequest,
  fetchSystemConfigSuccess,
  fetchSystemConfigFailure,
  updateSystemConfigRequest,
  updateSystemConfigSuccess,
  updateSystemConfigFailure,
  fetchAuditLogsRequest,
  fetchAuditLogsSuccess,
  fetchAuditLogsFailure,
  clearConfigurationErrors,
  resetConfigurationState
} = systemConfigSlice.actions;

export default systemConfigSlice.reducer;
