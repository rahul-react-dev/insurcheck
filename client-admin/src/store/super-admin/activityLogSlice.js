
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Activity logs state
  activityLogs: [],
  filteredActivityLogs: [],
  isLoading: false,
  error: null,
  
  // Pagination
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  
  // Filters
  filters: {
    tenantName: '',
    userEmail: '',
    actionPerformed: '',
    dateRange: {
      start: '',
      end: ''
    }
  },
  
  // Sorting
  sortBy: 'timestamp',
  sortOrder: 'desc', // 'asc' or 'desc'
  
  // Selected log for detailed view
  selectedLog: null,
  isDetailModalOpen: false,
  
  // Export state
  isExporting: false,
  exportError: null
};

const activityLogSlice = createSlice({
  name: 'activityLog',
  initialState,
  reducers: {
    // Fetch activity logs
    fetchActivityLogsRequest: (state, action) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchActivityLogsSuccess: (state, action) => {
      state.isLoading = false;
      state.activityLogs = action.payload.logs;
      state.filteredActivityLogs = action.payload.logs;
      state.pagination = {
        page: action.payload.page || state.pagination.page,
        limit: action.payload.limit || state.pagination.limit,
        total: action.payload.total,
        totalPages: action.payload.totalPages || Math.ceil(action.payload.total / (action.payload.limit || state.pagination.limit))
      };
    },
    fetchActivityLogsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset to first page when filters change
      state.pagination.page = 1;
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        tenantName: '',
        userEmail: '',
        actionPerformed: '',
        dateRange: {
          start: '',
          end: ''
        }
      };
      state.filteredActivityLogs = state.activityLogs;
      state.pagination.page = 1;
    },
    
    // Set sorting
    setSorting: (state, action) => {
      const { sortBy, sortOrder } = action.payload;
      state.sortBy = sortBy;
      state.sortOrder = sortOrder;
    },
    
    // Set pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    // Page change
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    
    // Page size change
    setPageSize: (state, action) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1; // Reset to first page
      state.pagination.totalPages = Math.ceil(state.pagination.total / action.payload);
    },
    
    // Selected log for detail view
    setSelectedLog: (state, action) => {
      state.selectedLog = action.payload;
      state.isDetailModalOpen = true;
    },
    
    // Close detail modal
    closeDetailModal: (state) => {
      state.selectedLog = null;
      state.isDetailModalOpen = false;
    },
    
    // Export logs
    exportActivityLogsRequest: (state) => {
      state.isExporting = true;
      state.exportError = null;
    },
    exportActivityLogsSuccess: (state) => {
      state.isExporting = false;
    },
    exportActivityLogsFailure: (state, action) => {
      state.isExporting = false;
      state.exportError = action.payload;
    },
    
    // Clear errors
    clearErrors: (state) => {
      state.error = null;
      state.exportError = null;
    }
  }
});

export const {
  fetchActivityLogsRequest,
  fetchActivityLogsSuccess,
  fetchActivityLogsFailure,
  setFilters,
  clearFilters,
  setSorting,
  setPagination,
  setPage,
  setPageSize,
  setSelectedLog,
  closeDetailModal,
  exportActivityLogsRequest,
  exportActivityLogsSuccess,
  exportActivityLogsFailure,
  clearErrors
} = activityLogSlice.actions;

export default activityLogSlice.reducer;
