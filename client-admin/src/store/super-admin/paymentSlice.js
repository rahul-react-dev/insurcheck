import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  invoices: [],
  tenants: [],
  isLoading: false,
  error: null,
  totalInvoices: 0,
  totalPaid: 0,
  totalSent: 0,
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
  initialState: {
    ...initialState,
    // Add payment-specific state
    payments: [],
    isLoadingPayments: false,
    isExporting: false,
    paymentsSummary: {
      totalPayments: 0,
      totalAmount: 0,
      successfulPayments: 0,
      failedPayments: 0,
      pendingRefunds: 0
    }
  },
  reducers: {
    // Fetch payments
    fetchPaymentsRequest: (state, action) => {
      state.isLoadingPayments = true;
      state.error = null;
    },
    fetchPaymentsSuccess: (state, action) => {
      state.isLoadingPayments = false;
      state.payments = action.payload.payments || [];
      state.paymentsSummary = action.payload.summary || state.paymentsSummary;
      if (action.payload.pagination) {
        state.pagination = { ...state.pagination, ...action.payload.pagination };
      }
      state.error = null;
    },
    fetchPaymentsFailure: (state, action) => {
      state.isLoadingPayments = false;
      state.error = action.payload;
    },

    // Export payments
    exportPaymentsRequest: (state) => {
      state.isExporting = true;
      state.error = null;
    },
    exportPaymentsSuccess: (state) => {
      state.isExporting = false;
      state.error = null;
    },
    exportPaymentsFailure: (state, action) => {
      state.isExporting = false;
      state.error = action.payload;
    },

    // Process refund
    processRefundRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    processRefundSuccess: (state, action) => {
      state.isLoading = false;
      const { paymentId, refundResult } = action.payload;
      const paymentIndex = state.payments.findIndex(p => p.id === paymentId);
      if (paymentIndex !== -1) {
        state.payments[paymentIndex] = {
          ...state.payments[paymentIndex],
          status: 'refunded',
          refundAmount: refundResult.amount,
          refundDate: refundResult.refundDate
        };
      }
      state.error = null;
    },
    processRefundFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Fetch invoices
    fetchInvoicesRequest: (state, action) => {
      console.log('📦 REDUCER: fetchInvoicesRequest called');
      console.log('📦 Action payload:', action.payload);
      console.log('📦 Action type:', action.type);
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
      console.log('✅ REDUCER: fetchInvoicesSuccess called');
      console.log('✅ Success payload:', action.payload);
      state.isLoading = false;
      state.hasInitialLoad = true;
      state.invoices = action.payload.invoices || [];
      state.totalInvoices = action.payload.summary?.totalInvoices || 0;
      state.totalPaid = action.payload.summary?.totalPaid || 0;
      state.totalSent = action.payload.summary?.totalSent || 0;
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
      const { invoiceId, paidDate } = action.payload;
      const invoiceIndex = state.invoices.findIndex(inv => inv.id === invoiceId);
      if (invoiceIndex !== -1) {
        state.invoices[invoiceIndex] = {
          ...state.invoices[invoiceIndex],
          status: 'paid',
          paidDate: paidDate || new Date().toISOString()
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
  fetchPaymentsRequest,
  fetchPaymentsSuccess,
  fetchPaymentsFailure,
  exportPaymentsRequest,
  exportPaymentsSuccess,
  exportPaymentsFailure,
  processRefundRequest,
  processRefundSuccess,
  processRefundFailure,
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