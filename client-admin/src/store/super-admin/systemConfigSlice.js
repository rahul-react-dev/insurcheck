import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  configuration: null,
  tenantConfigurations: {},
  availableTenants: [],
  auditLogs: [],
  isLoading: false,
  isUpdating: false,
  error: null,
  updateSuccess: false,
  lastFetch: null,
  selectedConfig: null, // Added for new details fetching
  updateError: null,    // Added for update errors
  backupError: null     // Added for backup errors
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

    // Fetch Tenant Configuration
    fetchTenantConfigRequest: (state, action) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchTenantConfigSuccess: (state, action) => {
      state.isLoading = false;
      const { tenantId, configuration } = action.payload;
      state.tenantConfigurations[tenantId] = configuration;
      state.error = null;
    },
    fetchTenantConfigFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload.message || 'Failed to fetch tenant configuration';
    },

    // Update Tenant Configuration
    updateTenantConfigRequest: (state, action) => {
      state.isUpdating = true;
      state.error = null;
      state.updateSuccess = false;
    },
    updateTenantConfigSuccess: (state, action) => {
      state.isUpdating = false;
      const { tenantId, configuration, auditLog } = action.payload;
      state.tenantConfigurations[tenantId] = configuration;
      state.updateSuccess = true;
      state.error = null;

      if (auditLog) {
        state.auditLogs.unshift(auditLog);
      }
    },
    updateTenantConfigFailure: (state, action) => {
      state.isUpdating = false;
      state.error = action.payload.message || 'Failed to update tenant configuration';
      state.updateSuccess = false;
    },

    // Set Available Tenants
    setAvailableTenants: (state, action) => {
      state.availableTenants = action.payload;
    },

    // Fetch system config details
    fetchSystemConfigDetailsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchSystemConfigDetailsSuccess: (state, action) => {
      state.isLoading = false;
      state.selectedConfig = action.payload;
      state.error = null;
    },
    fetchSystemConfigDetailsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Clear errors
    clearErrors: (state) => {
      state.error = null;
      state.updateError = null;
      state.backupError = null;
    },

    // Clear configuration errors
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
  fetchSystemConfigDetailsRequest,
  fetchSystemConfigDetailsSuccess,
  fetchSystemConfigDetailsFailure,
  updateSystemConfigRequest,
  updateSystemConfigSuccess,
  updateSystemConfigFailure,
  createBackupRequest,
  createBackupSuccess,
  createBackupFailure,
  setSelectedConfig,
  updateLocalConfig,
  resetLocalConfig,
  clearErrors,
  setAvailableTenants,
  fetchAuditLogsRequest,
  fetchAuditLogsSuccess,
  fetchAuditLogsFailure,
  fetchTenantConfigRequest,
  fetchTenantConfigSuccess,
  fetchTenantConfigFailure,
  updateTenantConfigRequest,
  updateTenantConfigSuccess,
  updateTenantConfigFailure,
  clearConfigurationErrors,
  resetConfigurationState
} = systemConfigSlice.actions;

export default systemConfigSlice.reducer;