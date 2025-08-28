import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Invoice data
  invoices: [],
  invoicesLoading: false,
  invoicesError: null,
  invoicesMeta: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  
  // Invoice details
  selectedInvoice: null,
  invoiceDetailsLoading: false,
  invoiceDetailsError: null,
  
  // Payment processing
  paymentLoading: false,
  paymentSuccess: false,
  paymentError: null,
  
  // Receipt download
  receiptDownloading: false,
  receiptError: null,
  
  // Export functionality
  exportLoading: false,
  exportError: null,
  
  // Filters and search
  filters: {
    search: '',
    status: '',
    sortBy: 'invoiceDate',
    sortOrder: 'desc'
  },
  
  // Add statistics state
  invoiceStats: {
    total: 0,
    totalAmount: 0,
    paid: 0,
    paidAmount: 0,
    unpaid: 0,
    unpaidAmount: 0,
    overdue: 0,
    overdueAmount: 0
  },
  statsLoading: false,
  statsError: null
};

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    // Fetch invoices
    fetchInvoicesRequest: (state, action) => {
      state.invoicesLoading = true;
      state.invoicesError = null;
    },
    fetchInvoicesSuccess: (state, action) => {
      state.invoicesLoading = false;
      state.invoices = action.payload.invoices || [];
      state.invoicesMeta = action.payload.meta || state.invoicesMeta;
      state.invoicesError = null;
    },
    fetchInvoicesFailure: (state, action) => {
      state.invoicesLoading = false;
      state.invoicesError = action.payload;
    },

    // Fetch invoice details
    fetchInvoiceDetailsRequest: (state, action) => {
      state.invoiceDetailsLoading = true;
      state.invoiceDetailsError = null;
    },
    fetchInvoiceDetailsSuccess: (state, action) => {
      state.invoiceDetailsLoading = false;
      state.selectedInvoice = action.payload;
      state.invoiceDetailsError = null;
    },
    fetchInvoiceDetailsFailure: (state, action) => {
      state.invoiceDetailsLoading = false;
      state.invoiceDetailsError = action.payload;
    },

    // Process payment
    processPaymentRequest: (state, action) => {
      state.paymentLoading = true;
      state.paymentSuccess = false;
      state.paymentError = null;
    },
    processPaymentSuccess: (state, action) => {
      state.paymentLoading = false;
      state.paymentSuccess = true;
      state.paymentError = null;
      // Update invoice status in the list
      const invoiceIndex = state.invoices.findIndex(inv => inv.id === action.payload.invoiceId);
      if (invoiceIndex !== -1) {
        state.invoices[invoiceIndex].status = 'paid';
        state.invoices[invoiceIndex].paidDate = action.payload.paidDate;
      }
      // Update selected invoice if it matches
      if (state.selectedInvoice && state.selectedInvoice.id === action.payload.invoiceId) {
        state.selectedInvoice.status = 'paid';
        state.selectedInvoice.paidDate = action.payload.paidDate;
      }
    },
    processPaymentFailure: (state, action) => {
      state.paymentLoading = false;
      state.paymentSuccess = false;
      state.paymentError = action.payload;
    },

    // Download receipt
    downloadReceiptRequest: (state, action) => {
      state.receiptDownloading = true;
      state.receiptError = null;
    },
    downloadReceiptSuccess: (state, action) => {
      state.receiptDownloading = false;
      state.receiptError = null;
    },
    downloadReceiptFailure: (state, action) => {
      state.receiptDownloading = false;
      state.receiptError = action.payload;
    },

    // Export invoices
    exportInvoicesRequest: (state, action) => {
      state.exportLoading = true;
      state.exportError = null;
    },
    exportInvoicesSuccess: (state, action) => {
      state.exportLoading = false;
      state.exportError = null;
    },
    exportInvoicesFailure: (state, action) => {
      state.exportLoading = false;
      state.exportError = action.payload;
    },

    // Update filters
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Clear states
    clearPaymentState: (state) => {
      state.paymentSuccess = false;
      state.paymentError = null;
    },
    clearReceiptError: (state) => {
      state.receiptError = null;
    },
    clearSelectedInvoice: (state) => {
      state.selectedInvoice = null;
      state.invoiceDetailsError = null;
    },

    // Fetch invoice statistics
    fetchInvoiceStatsRequest: (state) => {
      state.statsLoading = true;
      state.statsError = null;
    },
    fetchInvoiceStatsSuccess: (state, action) => {
      state.statsLoading = false;
      // Saga sends response.data as payload directly
      state.invoiceStats = action.payload || state.invoiceStats;
      state.statsError = null;
      console.log('🔄 Redux: Updated invoiceStats with:', action.payload);
    },
    fetchInvoiceStatsFailure: (state, action) => {
      state.statsLoading = false;
      state.statsError = action.payload;
    },
  },
});

export const {
  // Fetch invoices
  fetchInvoicesRequest,
  fetchInvoicesSuccess,
  fetchInvoicesFailure,
  
  // Fetch invoice details
  fetchInvoiceDetailsRequest,
  fetchInvoiceDetailsSuccess,
  fetchInvoiceDetailsFailure,
  
  // Process payment
  processPaymentRequest,
  processPaymentSuccess,
  processPaymentFailure,
  
  // Download receipt
  downloadReceiptRequest,
  downloadReceiptSuccess,
  downloadReceiptFailure,
  
  // Export invoices
  exportInvoicesRequest,
  exportInvoicesSuccess,
  exportInvoicesFailure,
  
  // Invoice statistics
  fetchInvoiceStatsRequest,
  fetchInvoiceStatsSuccess,
  fetchInvoiceStatsFailure,
  
  // Filters and utility
  updateFilters,
  clearPaymentState,
  clearReceiptError,
  clearSelectedInvoice,
} = invoicesSlice.actions;

export default invoicesSlice.reducer;