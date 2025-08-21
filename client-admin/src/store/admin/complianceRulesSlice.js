import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Rules data
  rules: [],
  loading: false,
  error: null,
  
  // Stats data
  stats: {
    total: 0,
    active: 0,
    inactive: 0,
    byType: {}
  },
  statsLoading: false,
  
  // Pagination and filters
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  filters: {
    search: '',
    ruleType: '',
    isActive: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  
  // UI states
  showCreateModal: false,
  showEditModal: false,
  showPreviewModal: false,
  showAuditModal: false,
  selectedRule: null,
  
  // Create rule
  createLoading: false,
  createError: null,
  
  // Edit rule
  editLoading: false,
  editError: null,
  
  // Delete rule
  deleteLoading: false,
  deleteError: null,
  
  // Preview rule
  previewLoading: false,
  previewError: null,
  previewData: null,
  
  // Audit logs
  auditLogs: [],
  auditLoading: false,
  auditError: null
};

const complianceRulesSlice = createSlice({
  name: 'complianceRules',
  initialState,
  reducers: {
    // Fetch rules
    fetchRulesRequest: (state, action) => {
      state.loading = true;
      state.error = null;
      if (action.payload) {
        state.pagination = { ...state.pagination, ...action.payload };
      }
    },
    fetchRulesSuccess: (state, action) => {
      state.loading = false;
      state.rules = action.payload.data;
      state.pagination = { ...state.pagination, ...action.payload.meta };
    },
    fetchRulesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Fetch stats
    fetchStatsRequest: (state) => {
      state.statsLoading = true;
    },
    fetchStatsSuccess: (state, action) => {
      state.statsLoading = false;
      state.stats = action.payload;
    },
    fetchStatsFailure: (state, action) => {
      state.statsLoading = false;
      state.error = action.payload;
    },
    
    // Create rule
    createRuleRequest: (state, action) => {
      state.createLoading = true;
      state.createError = null;
    },
    createRuleSuccess: (state) => {
      state.createLoading = false;
      state.showCreateModal = false;
    },
    createRuleFailure: (state, action) => {
      state.createLoading = false;
      state.createError = action.payload;
    },
    
    // Edit rule
    editRuleRequest: (state, action) => {
      state.editLoading = true;
      state.editError = null;
    },
    editRuleSuccess: (state) => {
      state.editLoading = false;
      state.showEditModal = false;
      state.selectedRule = null;
    },
    editRuleFailure: (state, action) => {
      state.editLoading = false;
      state.editError = action.payload;
    },
    
    // Delete rule
    deleteRuleRequest: (state, action) => {
      state.deleteLoading = true;
      state.deleteError = null;
    },
    deleteRuleSuccess: (state) => {
      state.deleteLoading = false;
    },
    deleteRuleFailure: (state, action) => {
      state.deleteLoading = false;
      state.deleteError = action.payload;
    },
    
    // Preview rule
    previewRuleRequest: (state, action) => {
      state.previewLoading = true;
      state.previewError = null;
    },
    previewRuleSuccess: (state, action) => {
      state.previewLoading = false;
      state.previewData = action.payload;
      state.showPreviewModal = true;
    },
    previewRuleFailure: (state, action) => {
      state.previewLoading = false;
      state.previewError = action.payload;
    },
    
    // Audit logs
    fetchAuditLogsRequest: (state, action) => {
      state.auditLoading = true;
      state.auditError = null;
    },
    fetchAuditLogsSuccess: (state, action) => {
      state.auditLoading = false;
      state.auditLogs = action.payload;
      state.showAuditModal = true;
    },
    fetchAuditLogsFailure: (state, action) => {
      state.auditLoading = false;
      state.auditError = action.payload;
    },
    
    // Update filters
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page
    },
    
    // Update pagination
    updatePagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    // Modal controls
    setShowCreateModal: (state, action) => {
      state.showCreateModal = action.payload;
      if (!action.payload) {
        state.createError = null;
      }
    },
    setShowEditModal: (state, action) => {
      state.showEditModal = action.payload;
      if (!action.payload) {
        state.selectedRule = null;
        state.editError = null;
      }
    },
    setShowPreviewModal: (state, action) => {
      state.showPreviewModal = action.payload;
      if (!action.payload) {
        state.previewData = null;
        state.previewError = null;
      }
    },
    setShowAuditModal: (state, action) => {
      state.showAuditModal = action.payload;
      if (!action.payload) {
        state.auditLogs = [];
        state.auditError = null;
      }
    },
    setSelectedRule: (state, action) => {
      state.selectedRule = action.payload;
    },
    
    // Clear errors
    clearErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.editError = null;
      state.deleteError = null;
      state.previewError = null;
      state.auditError = null;
    }
  }
});

export const {
  fetchRulesRequest,
  fetchRulesSuccess,
  fetchRulesFailure,
  fetchStatsRequest,
  fetchStatsSuccess,
  fetchStatsFailure,
  createRuleRequest,
  createRuleSuccess,
  createRuleFailure,
  editRuleRequest,
  editRuleSuccess,
  editRuleFailure,
  deleteRuleRequest,
  deleteRuleSuccess,
  deleteRuleFailure,
  previewRuleRequest,
  previewRuleSuccess,
  previewRuleFailure,
  fetchAuditLogsRequest,
  fetchAuditLogsSuccess,
  fetchAuditLogsFailure,
  updateFilters,
  updatePagination,
  setShowCreateModal,
  setShowEditModal,
  setShowPreviewModal,
  setShowAuditModal,
  setSelectedRule,
  clearErrors
} = complianceRulesSlice.actions;

export default complianceRulesSlice.reducer;