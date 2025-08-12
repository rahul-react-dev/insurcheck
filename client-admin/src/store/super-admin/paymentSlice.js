import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  invoices: [],
  tenants: [
    { id: '1', name: 'Acme Insurance Co.', email: 'admin@acme-insurance.com' },
    { id: '2', name: 'SafeGuard Insurance', email: 'billing@safeguard.com' },
    { id: '3', name: 'Quick Insurance', email: 'finance@quickinsurance.com' },
    { id: '4', name: 'Premium Insurance', email: 'accounts@premium.com' },
    { id: '5', name: 'Reliable Insurance', email: 'billing@reliable.com' },
    { id: '6', name: 'SecureLife Insurance', email: 'finance@securelife.com' },
    { id: '7', name: 'TrustGuard Insurance', email: 'billing@trustguard.com' },
    { id: '8', name: 'Shield Insurance Co.', email: 'accounts@shield.com' },
    { id: '9', name: 'Fortress Insurance', email: 'finance@fortress.com' },
    { id: '10', name: 'Guardian Insurance', email: 'billing@guardian.com' },
    { id: '11', name: 'Pinnacle Insurance', email: 'accounts@pinnacle.com' },
    { id: '12', name: 'Valor Insurance', email: 'finance@valor.com' }
  ],
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
    limit: 10,
    total: 0
  },
  isLoadingTenants: false
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
        const { page, limit, total, ...filters } = action.payload;
        if (filters) {
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
    fetchInvoicesSuccess: (state, action) => {
      state.isLoading = false;
      state.invoices = action.payload.invoices;
      state.totalInvoices = action.payload.summary.totalInvoices;
      state.totalPaid = action.payload.summary.totalPaid;
      state.totalPending = action.payload.summary.totalPending;
      state.totalOverdue = action.payload.summary.totalOverdue;
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