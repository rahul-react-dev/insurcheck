import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  invoices: [
    {
      id: '1',
      invoiceId: 'INV-2024-001',
      tenantName: 'Acme Insurance Co.',
      tenantEmail: 'admin@acme-insurance.com',
      tenantCompany: 'Acme Insurance Co.',
      tenantPhone: '+1 (555) 123-4567',
      tenantAddress: '123 Main St, New York, NY 10001',
      amount: 299.99,
      planName: 'Enterprise Plan',
      billingPeriod: 'Monthly',
      issueDate: '2024-01-01',
      dueDate: '2024-01-31',
      status: 'paid',
      paidDate: '2024-01-15',
      breakdown: [
        { description: 'Enterprise Plan - Monthly', amount: 299.99 },
        { description: 'Tax', amount: 0 }
      ],
      paymentHistory: [
        { type: 'Credit Card Payment', date: '2024-01-15', amount: 299.99 }
      ],
      notes: 'Payment processed successfully via credit card.'
    },
    {
      id: '2',
      invoiceId: 'INV-2024-002',
      tenantName: 'SafeGuard Insurance',
      tenantEmail: 'billing@safeguard.com',
      tenantCompany: 'SafeGuard Insurance Ltd.',
      tenantPhone: '+1 (555) 987-6543',
      tenantAddress: '456 Oak Avenue, Chicago, IL 60601',
      amount: 99.99,
      planName: 'Professional Plan',
      billingPeriod: 'Monthly',
      issueDate: '2024-01-01',
      dueDate: '2024-01-31',
      status: 'pending',
      breakdown: [
        { description: 'Professional Plan - Monthly', amount: 99.99 },
        { description: 'Tax', amount: 0 }
      ],
      notes: 'Awaiting payment processing.'
    },
    {
      id: '3',
      invoiceId: 'INV-2024-003',
      tenantName: 'Quick Insurance',
      tenantEmail: 'finance@quickinsurance.com',
      tenantCompany: 'Quick Insurance Inc.',
      tenantPhone: '+1 (555) 456-7890',
      tenantAddress: '789 Pine Street, Los Angeles, CA 90210',
      amount: 29.99,
      planName: 'Basic Plan',
      billingPeriod: 'Monthly',
      issueDate: '2023-12-01',
      dueDate: '2023-12-31',
      status: 'overdue',
      breakdown: [
        { description: 'Basic Plan - Monthly', amount: 29.99 }
      ],
      notes: 'Payment overdue. Follow-up required.'
    },
    {
      id: '4',
      invoiceId: 'INV-2024-004',
      tenantName: 'Premium Insurance Group',
      tenantEmail: 'accounts@premium.com',
      tenantCompany: 'Premium Insurance Group LLC',
      tenantPhone: '+1 (555) 321-0987',
      tenantAddress: '321 Elm Drive, Miami, FL 33101',
      amount: 499.99,
      planName: 'Enterprise Pro Plan',
      billingPeriod: 'Monthly',
      issueDate: '2024-01-15',
      dueDate: '2024-02-15',
      status: 'pending',
      breakdown: [
        { description: 'Enterprise Pro Plan - Monthly', amount: 499.99 },
        { description: 'Tax', amount: 0 }
      ],
      notes: 'New premium plan subscription.'
    },
    {
      id: '5',
      invoiceId: 'INV-2024-005',
      tenantName: 'Reliable Insurance',
      tenantEmail: 'billing@reliable.com',
      tenantCompany: 'Reliable Insurance Corp.',
      tenantPhone: '+1 (555) 654-3210',
      tenantAddress: '654 Maple Lane, Seattle, WA 98101',
      amount: 149.99,
      planName: 'Professional Plus Plan',
      billingPeriod: 'Monthly',
      issueDate: '2024-01-10',
      dueDate: '2024-02-10',
      status: 'paid',
      paidDate: '2024-01-20',
      breakdown: [
        { description: 'Professional Plus Plan - Monthly', amount: 149.99 },
        { description: 'Tax', amount: 0 }
      ],
      paymentHistory: [
        { type: 'Bank Transfer', date: '2024-01-20', amount: 149.99 }
      ],
      notes: 'Payment received via bank transfer.'
    },
    {
      id: '6',
      invoiceId: 'INV-2024-006',
      tenantName: 'SecureLife Insurance',
      tenantEmail: 'finance@securelife.com',
      tenantCompany: 'SecureLife Insurance Inc.',
      tenantPhone: '+1 (555) 789-0123',
      tenantAddress: '987 Cedar Court, Boston, MA 02101',
      amount: 199.99,
      planName: 'Professional Plan',
      billingPeriod: 'Monthly',
      issueDate: '2023-11-15',
      dueDate: '2023-12-15',
      status: 'overdue',
      breakdown: [
        { description: 'Professional Plan - Monthly', amount: 199.99 }
      ],
      notes: 'Multiple payment reminders sent. Urgent follow-up required.'
    },
    {
      id: '7',
      invoiceId: 'INV-2024-007',
      tenantName: 'TrustGuard Insurance',
      tenantEmail: 'billing@trustguard.com',
      tenantCompany: 'TrustGuard Insurance LLC',
      tenantPhone: '+1 (555) 111-2222',
      tenantAddress: '111 Oak Street, Denver, CO 80201',
      amount: 399.99,
      planName: 'Enterprise Plan',
      billingPeriod: 'Monthly',
      issueDate: '2024-01-20',
      dueDate: '2024-02-20',
      status: 'pending',
      breakdown: [
        { description: 'Enterprise Plan - Monthly', amount: 399.99 }
      ],
      notes: 'New enterprise customer.'
    },
    {
      id: '8',
      invoiceId: 'INV-2024-008',
      tenantName: 'Shield Insurance Co.',
      tenantEmail: 'accounts@shield.com',
      tenantCompany: 'Shield Insurance Co.',
      tenantPhone: '+1 (555) 333-4444',
      tenantAddress: '333 Pine Avenue, Portland, OR 97201',
      amount: 79.99,
      planName: 'Basic Plan',
      billingPeriod: 'Monthly',
      issueDate: '2024-01-25',
      dueDate: '2024-02-25',
      status: 'paid',
      paidDate: '2024-01-28',
      breakdown: [
        { description: 'Basic Plan - Monthly', amount: 79.99 }
      ],
      paymentHistory: [
        { type: 'Credit Card Payment', date: '2024-01-28', amount: 79.99 }
      ],
      notes: 'Quick payment processing.'
    },
    {
      id: '9',
      invoiceId: 'INV-2024-009',
      tenantName: 'Fortress Insurance',
      tenantEmail: 'finance@fortress.com',
      tenantCompany: 'Fortress Insurance Group',
      tenantPhone: '+1 (555) 555-6666',
      tenantAddress: '555 Maple Drive, Austin, TX 73301',
      amount: 249.99,
      planName: 'Professional Plus Plan',
      billingPeriod: 'Monthly',
      issueDate: '2024-01-30',
      dueDate: '2024-02-28',
      status: 'pending',
      breakdown: [
        { description: 'Professional Plus Plan - Monthly', amount: 249.99 }
      ],
      notes: 'Mid-tier plan subscription.'
    },
    {
      id: '10',
      invoiceId: 'INV-2024-010',
      tenantName: 'Guardian Insurance',
      tenantEmail: 'billing@guardian.com',
      tenantCompany: 'Guardian Insurance Ltd.',
      tenantPhone: '+1 (555) 777-8888',
      tenantAddress: '777 Birch Lane, Phoenix, AZ 85001',
      amount: 59.99,
      planName: 'Basic Plan',
      billingPeriod: 'Monthly',
      issueDate: '2024-02-01',
      dueDate: '2024-03-01',
      status: 'pending',
      breakdown: [
        { description: 'Basic Plan - Monthly', amount: 59.99 }
      ],
      notes: 'New basic plan customer.'
    },
    {
      id: '11',
      invoiceId: 'INV-2024-011',
      tenantName: 'Pinnacle Insurance',
      tenantEmail: 'accounts@pinnacle.com',
      tenantCompany: 'Pinnacle Insurance Corp.',
      tenantPhone: '+1 (555) 999-0000',
      tenantAddress: '999 Willow Street, San Diego, CA 92101',
      amount: 599.99,
      planName: 'Enterprise Pro Plan',
      billingPeriod: 'Monthly',
      issueDate: '2024-02-05',
      dueDate: '2024-03-05',
      status: 'paid',
      paidDate: '2024-02-10',
      breakdown: [
        { description: 'Enterprise Pro Plan - Monthly', amount: 599.99 }
      ],
      paymentHistory: [
        { type: 'Bank Transfer', date: '2024-02-10', amount: 599.99 }
      ],
      notes: 'Premium plan with early payment.'
    },
    {
      id: '12',
      invoiceId: 'INV-2024-012',
      tenantName: 'Valor Insurance',
      tenantEmail: 'finance@valor.com',
      tenantCompany: 'Valor Insurance Inc.',
      tenantPhone: '+1 (555) 123-9876',
      tenantAddress: '123 Spruce Court, Nashville, TN 37201',
      amount: 179.99,
      planName: 'Professional Plan',
      billingPeriod: 'Monthly',
      issueDate: '2024-02-10',
      dueDate: '2024-03-10',
      status: 'pending',
      breakdown: [
        { description: 'Professional Plan - Monthly', amount: 179.99 }
      ],
      notes: 'Professional tier subscription.'
    }
  ],
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
  totalInvoices: 12,
  totalPaid: 1129.95,
  totalPending: 1579.94,
  totalOverdue: 229.98,
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