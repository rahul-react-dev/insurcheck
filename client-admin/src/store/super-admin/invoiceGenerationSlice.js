
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  configurations: [],
  logs: [],
  tenants: [],
  isLoading: false,
  isLoadingLogs: false,
  isLoadingTenants: false,
  error: null,
  summary: {
    totalGenerated: 0,
    totalSent: 0,
    totalFailed: 0,
    totalAmount: 0
  },
  filters: {
    tenantName: '',
    status: '',
    dateRange: {
      start: '',
      end: ''
    }
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  hasInitialLoad: false
};

const invoiceGenerationSlice = createSlice({
  name: 'invoiceGeneration',
  initialState,
  reducers: {
    // Fetch invoice configurations
    fetchInvoiceConfigRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchInvoiceConfigSuccess: (state, action) => {
      state.isLoading = false;
      state.configurations = action.payload.configurations || [];
      state.tenants = action.payload.tenants || [];
      state.error = null;
    },
    fetchInvoiceConfigFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Update invoice configuration
    updateInvoiceConfigRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updateInvoiceConfigSuccess: (state, action) => {
      state.isLoading = false;
      const { tenantId, config } = action.payload;
      const existingIndex = state.configurations.findIndex(c => c.tenantId === tenantId);
      
      if (existingIndex !== -1) {
        state.configurations[existingIndex] = { ...state.configurations[existingIndex], ...config };
      } else {
        state.configurations.push({ tenantId, ...config });
      }
      state.error = null;
    },
    updateInvoiceConfigFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Generate invoice
    generateInvoiceRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    generateInvoiceSuccess: (state, action) => {
      state.isLoading = false;
      // Add new log entry
      if (action.payload.log) {
        state.logs.unshift(action.payload.log);
      }
      // Update summary
      if (action.payload.summary) {
        state.summary = { ...state.summary, ...action.payload.summary };
      }
      state.error = null;
    },
    generateInvoiceFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Fetch invoice logs
    fetchInvoiceLogsRequest: (state, action) => {
      state.isLoadingLogs = true;
      state.error = null;
      
      if (action.payload) {
        const { page, limit, total, ...filters } = action.payload;
        if (filters && Object.keys(filters).length > 0) {
          state.filters = { ...state.filters, ...filters };
        }
        if (page !== undefined || limit !== undefined || total !== undefined) {
          state.pagination = {
            ...state.pagination,
            ...(page !== undefined && { page }),
            ...(limit !== undefined && { limit }),
            ...(total !== undefined && { total })
          };
        }
      }
    },
    fetchInvoiceLogsSuccess: (state, action) => {
      state.isLoadingLogs = false;
      state.hasInitialLoad = true;
      state.logs = action.payload.logs || [];
      state.summary = { ...state.summary, ...(action.payload.summary || {}) };
      if (action.payload.pagination) {
        state.pagination = { ...state.pagination, ...action.payload.pagination };
      }
      state.error = null;
    },
    fetchInvoiceLogsFailure: (state, action) => {
      state.isLoadingLogs = false;
      state.error = action.payload;
    },

    // Retry invoice generation
    retryInvoiceGenerationRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    retryInvoiceGenerationSuccess: (state, action) => {
      state.isLoading = false;
      // Update the log entry
      const logId = action.payload.logId;
      const logIndex = state.logs.findIndex(log => log.id === logId);
      if (logIndex !== -1) {
        state.logs[logIndex] = { ...state.logs[logIndex], ...action.payload.updatedLog };
      }
      state.error = null;
    },
    retryInvoiceGenerationFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Update filters
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        tenantName: '',
        status: '',
        dateRange: {
          start: '',
          end: ''
        }
      };
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Clear all data
    clearInvoiceGenerationData: (state) => {
      return initialState;
    }
  }
});

export const {
  fetchInvoiceConfigRequest,
  fetchInvoiceConfigSuccess,
  fetchInvoiceConfigFailure,
  updateInvoiceConfigRequest,
  updateInvoiceConfigSuccess,
  updateInvoiceConfigFailure,
  generateInvoiceRequest,
  generateInvoiceSuccess,
  generateInvoiceFailure,
  fetchInvoiceLogsRequest,
  fetchInvoiceLogsSuccess,
  fetchInvoiceLogsFailure,
  retryInvoiceGenerationRequest,
  retryInvoiceGenerationSuccess,
  retryInvoiceGenerationFailure,
  updateFilters,
  clearFilters,
  clearError,
  clearInvoiceGenerationData
} = invoiceGenerationSlice.actions;

export default invoiceGenerationSlice.reducer;
