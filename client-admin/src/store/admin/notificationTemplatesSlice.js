import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Templates list
  templates: [],
  templatesLoading: false,
  templatesError: null,
  templatesMeta: {
    total: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10
  },

  // Templates statistics
  stats: {
    total: 0,
    active: 0,
    inactive: 0,
    byType: {}
  },
  statsLoading: false,
  statsError: null,

  // Template CRUD operations
  createLoading: false,
  createError: null,
  createSuccess: false,

  updateLoading: false,
  updateError: null,
  updateSuccess: false,

  deleteLoading: false,
  deleteError: null,
  deleteSuccess: false,

  // Template preview
  previewData: null,
  previewLoading: false,
  previewError: null,

  // Audit logs
  auditLogs: [],
  auditLogsLoading: false,
  auditLogsError: null,
  auditLogsMeta: {
    total: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10
  },

  // UI state
  selectedTemplate: null,
  filters: {
    search: '',
    templateType: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }
};

const notificationTemplatesSlice = createSlice({
  name: 'notificationTemplates',
  initialState,
  reducers: {
    // Templates list actions
    fetchTemplatesRequest: (state, action) => {
      state.templatesLoading = true;
      state.templatesError = null;
      if (action.payload) {
        state.filters = { ...state.filters, ...action.payload };
      }
    },
    fetchTemplatesSuccess: (state, action) => {
      state.templatesLoading = false;
      state.templates = action.payload.data || [];
      state.templatesMeta = action.payload.meta || initialState.templatesMeta;
      state.templatesError = null;
    },
    fetchTemplatesFailure: (state, action) => {
      state.templatesLoading = false;
      state.templatesError = action.payload;
      state.templates = [];
    },

    // Statistics actions
    fetchStatsRequest: (state) => {
      state.statsLoading = true;
      state.statsError = null;
    },
    fetchStatsSuccess: (state, action) => {
      state.statsLoading = false;
      state.stats = action.payload || initialState.stats;
      state.statsError = null;
    },
    fetchStatsFailure: (state, action) => {
      state.statsLoading = false;
      state.statsError = action.payload;
    },

    // Create template actions
    createTemplateRequest: (state, action) => {
      state.createLoading = true;
      state.createError = null;
      state.createSuccess = false;
    },
    createTemplateSuccess: (state, action) => {
      state.createLoading = false;
      state.createSuccess = true;
      state.createError = null;
      // Add the new template to the list
      if (action.payload) {
        state.templates.unshift(action.payload);
        state.templatesMeta.total += 1;
      }
    },
    createTemplateFailure: (state, action) => {
      state.createLoading = false;
      state.createError = action.payload;
      state.createSuccess = false;
    },

    // Update template actions
    updateTemplateRequest: (state, action) => {
      state.updateLoading = true;
      state.updateError = null;
      state.updateSuccess = false;
    },
    updateTemplateSuccess: (state, action) => {
      state.updateLoading = false;
      state.updateSuccess = true;
      state.updateError = null;
      // Update the template in the list
      if (action.payload) {
        const index = state.templates.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.templates[index] = action.payload;
        }
      }
    },
    updateTemplateFailure: (state, action) => {
      state.updateLoading = false;
      state.updateError = action.payload;
      state.updateSuccess = false;
    },

    // Delete template actions
    deleteTemplateRequest: (state, action) => {
      state.deleteLoading = true;
      state.deleteError = null;
      state.deleteSuccess = false;
    },
    deleteTemplateSuccess: (state, action) => {
      state.deleteLoading = false;
      state.deleteSuccess = true;
      state.deleteError = null;
      // Remove the template from the list
      if (action.payload?.id) {
        state.templates = state.templates.filter(t => t.id !== action.payload.id);
        state.templatesMeta.total -= 1;
      }
    },
    deleteTemplateFailure: (state, action) => {
      state.deleteLoading = false;
      state.deleteError = action.payload;
      state.deleteSuccess = false;
    },

    // Preview template actions
    previewTemplateRequest: (state, action) => {
      state.previewLoading = true;
      state.previewError = null;
    },
    previewTemplateSuccess: (state, action) => {
      state.previewLoading = false;
      state.previewData = action.payload;
      state.previewError = null;
    },
    previewTemplateFailure: (state, action) => {
      state.previewLoading = false;
      state.previewError = action.payload;
      state.previewData = null;
    },

    // Audit logs actions
    fetchAuditLogsRequest: (state, action) => {
      state.auditLogsLoading = true;
      state.auditLogsError = null;
    },
    fetchAuditLogsSuccess: (state, action) => {
      state.auditLogsLoading = false;
      state.auditLogs = action.payload.data || [];
      state.auditLogsMeta = action.payload.meta || initialState.auditLogsMeta;
      state.auditLogsError = null;
    },
    fetchAuditLogsFailure: (state, action) => {
      state.auditLogsLoading = false;
      state.auditLogsError = action.payload;
      state.auditLogs = [];
    },

    // UI state actions
    setSelectedTemplate: (state, action) => {
      state.selectedTemplate = action.payload;
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Clear success/error states
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
    clearAllErrors: (state) => {
      state.templatesError = null;
      state.statsError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.previewError = null;
      state.auditLogsError = null;
    }
  },
});

export const {
  // Templates list
  fetchTemplatesRequest,
  fetchTemplatesSuccess,
  fetchTemplatesFailure,

  // Statistics
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

  // Audit logs
  fetchAuditLogsRequest,
  fetchAuditLogsSuccess,
  fetchAuditLogsFailure,

  // UI state
  setSelectedTemplate,
  updateFilters,
  clearFilters,

  // Clear states
  clearCreateState,
  clearUpdateState,
  clearDeleteState,
  clearPreviewState,
  clearAllErrors,
} = notificationTemplatesSlice.actions;

export default notificationTemplatesSlice.reducer;