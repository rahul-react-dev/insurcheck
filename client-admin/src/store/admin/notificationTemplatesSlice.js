import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Templates data
  templates: [],
  templatesLoading: false,
  templatesError: null,
  templatesMeta: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  },
  
  // Template statistics
  templateStats: {
    total: 0,
    active: 0,
    inactive: 0,
    compliance_result: 0,
    audit_log: 0,
    user_notification: 0,
    system_alert: 0
  },
  statsLoading: false,
  statsError: null,
  
  // Create template
  createLoading: false,
  createSuccess: false,
  createError: null,
  
  // Update template
  updateLoading: false,
  updateSuccess: false,
  updateError: null,
  
  // Delete template
  deleteLoading: false,
  deleteSuccess: false,
  deleteError: null,
  
  // Preview template
  previewData: null,
  previewLoading: false,
  previewError: null,
  
  // Audit logs
  auditLogs: [],
  auditLogsLoading: false,
  auditLogsError: null,
  auditLogsMeta: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  },
};

const notificationTemplatesSlice = createSlice({
  name: 'notificationTemplates',
  initialState,
  reducers: {
    // Fetch templates
    fetchTemplatesRequest: (state, action) => {
      state.templatesLoading = true;
      state.templatesError = null;
    },
    fetchTemplatesSuccess: (state, action) => {
      state.templatesLoading = false;
      state.templates = action.payload.data || [];
      state.templatesMeta = action.payload.meta || state.templatesMeta;
      state.templatesError = null;
    },
    fetchTemplatesFailure: (state, action) => {
      state.templatesLoading = false;
      state.templatesError = action.payload;
    },

    // Fetch template statistics
    fetchStatsRequest: (state) => {
      state.statsLoading = true;
      state.statsError = null;
    },
    fetchStatsSuccess: (state, action) => {
      state.statsLoading = false;
      state.templateStats = action.payload.data || state.templateStats;
      state.statsError = null;
    },
    fetchStatsFailure: (state, action) => {
      state.statsLoading = false;
      state.statsError = action.payload;
    },

    // Create template
    createTemplateRequest: (state, action) => {
      state.createLoading = true;
      state.createSuccess = false;
      state.createError = null;
    },
    createTemplateSuccess: (state, action) => {
      state.createLoading = false;
      state.createSuccess = true;
      state.createError = null;
      // Add the new template to the list
      state.templates.unshift(action.payload.data);
    },
    createTemplateFailure: (state, action) => {
      state.createLoading = false;
      state.createSuccess = false;
      state.createError = action.payload;
    },

    // Update template
    updateTemplateRequest: (state, action) => {
      state.updateLoading = true;
      state.updateSuccess = false;
      state.updateError = null;
    },
    updateTemplateSuccess: (state, action) => {
      state.updateLoading = false;
      state.updateSuccess = true;
      state.updateError = null;
      // Update the template in the list
      const templateIndex = state.templates.findIndex(t => t.id === action.payload.data.id);
      if (templateIndex !== -1) {
        state.templates[templateIndex] = { ...state.templates[templateIndex], ...action.payload.data };
      }
    },
    updateTemplateFailure: (state, action) => {
      state.updateLoading = false;
      state.updateSuccess = false;
      state.updateError = action.payload;
    },

    // Delete template
    deleteTemplateRequest: (state, action) => {
      state.deleteLoading = true;
      state.deleteSuccess = false;
      state.deleteError = null;
    },
    deleteTemplateSuccess: (state, action) => {
      state.deleteLoading = false;
      state.deleteSuccess = true;
      state.deleteError = null;
      // Remove the template from the list
      state.templates = state.templates.filter(t => t.id !== action.payload);
    },
    deleteTemplateFailure: (state, action) => {
      state.deleteLoading = false;
      state.deleteSuccess = false;
      state.deleteError = action.payload;
    },

    // Preview template
    previewTemplateRequest: (state, action) => {
      state.previewLoading = true;
      state.previewError = null;
    },
    previewTemplateSuccess: (state, action) => {
      state.previewLoading = false;
      state.previewData = action.payload.data;
      state.previewError = null;
    },
    previewTemplateFailure: (state, action) => {
      state.previewLoading = false;
      state.previewError = action.payload;
    },

    // Fetch audit logs
    fetchAuditLogsRequest: (state, action) => {
      state.auditLogsLoading = true;
      state.auditLogsError = null;
    },
    fetchAuditLogsSuccess: (state, action) => {
      state.auditLogsLoading = false;
      state.auditLogs = action.payload.data || [];
      state.auditLogsMeta = action.payload.meta || state.auditLogsMeta;
      state.auditLogsError = null;
    },
    fetchAuditLogsFailure: (state, action) => {
      state.auditLogsLoading = false;
      state.auditLogsError = action.payload;
    },

    // Clear states
    clearCreateState: (state) => {
      state.createSuccess = false;
      state.createError = null;
    },
    clearUpdateState: (state) => {
      state.updateSuccess = false;
      state.updateError = null;
    },
    clearDeleteState: (state) => {
      state.deleteSuccess = false;
      state.deleteError = null;
    },
    clearPreviewState: (state) => {
      state.previewData = null;
      state.previewError = null;
    },
  },
});

export const {
  // Fetch templates
  fetchTemplatesRequest,
  fetchTemplatesSuccess,
  fetchTemplatesFailure,
  
  // Fetch statistics
  fetchStatsRequest,
  fetchStatsSuccess,
  fetchStatsFailure,
  
  // Create template
  createTemplateRequest,
  createTemplateSuccess,
  createTemplateFailure,
  
  // Update template
  updateTemplateRequest,
  updateTemplateSuccess,
  updateTemplateFailure,
  
  // Delete template
  deleteTemplateRequest,
  deleteTemplateSuccess,
  deleteTemplateFailure,
  
  // Preview template
  previewTemplateRequest,
  previewTemplateSuccess,
  previewTemplateFailure,
  
  // Fetch audit logs
  fetchAuditLogsRequest,
  fetchAuditLogsSuccess,
  fetchAuditLogsFailure,
  
  // Clear states
  clearCreateState,
  clearUpdateState,
  clearDeleteState,
  clearPreviewState,
} = notificationTemplatesSlice.actions;

export default notificationTemplatesSlice.reducer;