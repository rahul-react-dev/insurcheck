import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  invoices: [],
  tenants: [],
  isLoading: false,
  error: null,
  totalInvoices: 0,
  totalPaid: 0,
  totalPending: 0,
  totalOverdue: 0,
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
    limit: 5,
    total: 0,
    totalPages: 0
  },
  isLoadingTenants: false,
  hasInitialLoad: false
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    // Fetch invoices
    fetchInvoicesRequest: (state, action) => {
      console.log('📦 fetchInvoicesRequest reducer called with:', action.payload);
      state.isLoading = true;
      state.error = null;
      
      // Update pagination and filters from action payload
      if (action.payload) {
        const { page, limit, total, ...filters } = action.payload;
        
        // Update filters if provided
        if (filters && Object.keys(filters).length > 0) {
          state.filters = { ...state.filters, ...filters };
        }
        
        // Update pagination if provided
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
    fetchInvoicesSuccess: (state, action) => {
      console.log('✅ fetchInvoicesSuccess reducer called with:', action.payload);
      state.isLoading = false;
      state.hasInitialLoad = true;
      state.invoices = action.payload.invoices || [];
      state.totalInvoices = action.payload.summary?.totalInvoices || 0;
      state.totalPaid = action.payload.summary?.totalPaid || 0;
      state.totalPending = action.payload.summary?.totalPending || 0;
      state.totalOverdue = action.payload.summary?.totalOverdue || 0;
      
      // Update pagination with response data
      if (action.payload.pagination) {
        state.pagination = { ...state.pagination, ...action.payload.pagination };
      }
      
      state.error = null;
    },
    fetchInvoicesFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Fetch tenants
    fetchTenantsRequest: (state) => {
      state.isLoadingTenants = true;
      state.error = null;
    },
    fetchTenantsSuccess: (state, action) => {
      state.isLoadingTenants = false;
      state.tenants = action.payload;
      state.error = null;
    },
    fetchTenantsFailure: (state, action) => {
      state.isLoadingTenants = false;
      state.error = action.payload;
    },

    // Mark invoice as paid
    markInvoicePaidRequest: (state, action) => {
      state.isLoading = true;
      state.error = null;
    },
    markInvoicePaidSuccess: (state, action) => {
      state.isLoading = false;
      const invoiceId = action.payload.invoiceId;
      const invoiceIndex = state.invoices.findIndex(inv => inv.id === invoiceId);
      if (invoiceIndex !== -1) {
        state.invoices[invoiceIndex] = {
          ...state.invoices[invoiceIndex],
          status: 'paid',
          paidDate: action.payload.paidDate
        };
      }
      state.error = null;
    },
    markInvoicePaidFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Download invoice
    downloadInvoiceRequest: (state, action) => {
      state.error = null;
    },
    downloadInvoiceSuccess: (state, action) => {
      state.error = null;
    },
    downloadInvoiceFailure: (state, action) => {
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
    clearPaymentData: (state) => {
      return initialState;
    }
  }
});

export const {
  fetchInvoicesRequest,
  fetchInvoicesSuccess,
  fetchInvoicesFailure,
  fetchTenantsRequest,
  fetchTenantsSuccess,
  fetchTenantsFailure,
  markInvoicePaidRequest,
  markInvoicePaidSuccess,
  markInvoicePaidFailure,
  downloadInvoiceRequest,
  downloadInvoiceSuccess,
  downloadInvoiceFailure,
  updateFilters,
  clearFilters,
  clearError,
  clearPaymentData
} = paymentSlice.actions;

export default paymentSlice.reducer;