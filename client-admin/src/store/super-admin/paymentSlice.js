
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
  }
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    // Fetch invoices
    fetchInvoicesRequest: (state, action) => {
      state.isLoading = true;
      state.error = null;
      if (action.payload) {
        state.filters = action.payload;
      }
    },
    fetchInvoicesSuccess: (state, action) => {
      state.isLoading = false;
      state.invoices = action.payload.invoices;
      state.totalInvoices = action.payload.summary.totalInvoices;
      state.totalPaid = action.payload.summary.totalPaid;
      state.totalPending = action.payload.summary.totalPending;
      state.totalOverdue = action.payload.summary.totalOverdue;
      state.error = null;
    },
    fetchInvoicesFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Fetch tenants
    fetchTenantsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchTenantsSuccess: (state, action) => {
      state.tenants = action.payload;
      state.error = null;
    },
    fetchTenantsFailure: (state, action) => {
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
