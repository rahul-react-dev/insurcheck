import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import {
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
  downloadInvoiceFailure
} from './paymentSlice';

// Mock API functions - replace with actual API calls
const api = {
  fetchInvoices: async (filters) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock data - replace with actual API call
    const mockInvoices = [
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
      }
    ];

    // Apply filters
    let filteredInvoices = mockInvoices;

    if (filters.tenantName) {
      filteredInvoices = filteredInvoices.filter(inv => 
        inv.tenantName.toLowerCase().includes(filters.tenantName.toLowerCase())
      );
    }

    if (filters.status) {
      filteredInvoices = filteredInvoices.filter(inv => inv.status === filters.status);
    }

    // Calculate summary
    const summary = {
      totalInvoices: filteredInvoices.length,
      totalPaid: filteredInvoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.amount, 0),
      totalPending: filteredInvoices
        .filter(inv => inv.status === 'pending')
        .reduce((sum, inv) => sum + inv.amount, 0),
      totalOverdue: filteredInvoices
        .filter(inv => inv.status === 'overdue')
        .reduce((sum, inv) => sum + inv.amount, 0)
    };

    return { invoices: filteredInvoices, summary };
  },

  fetchTenants: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));

    return [
      { id: '1', name: 'Acme Insurance Co.', email: 'admin@acme-insurance.com' },
      { id: '2', name: 'SafeGuard Insurance', email: 'billing@safeguard.com' },
      { id: '3', name: 'Quick Insurance', email: 'finance@quickinsurance.com' },
      { id: '4', name: 'Premium Insurance', email: 'accounts@premium.com' },
      { id: '5', name: 'Reliable Insurance', email: 'billing@reliable.com' }
    ];
  },

  markInvoicePaid: async (invoiceId) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      invoiceId,
      paidDate: new Date().toISOString(),
      success: true
    };
  },

  downloadInvoice: async (invoiceId) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock PDF download
    if (invoiceId === 'all') {
      // Download all invoices
      const blob = new Blob(['Mock PDF content for all invoices'], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'all-invoices.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      // Download single invoice
      const blob = new Blob([`Mock PDF content for invoice ${invoiceId}`], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }

    return { success: true };
  }
};

// Saga functions
function* fetchInvoicesSaga(action) {
  try {
    const response = yield call(api.fetchInvoices, action.payload || {});
    yield put(fetchInvoicesSuccess(response));
  } catch (error) {
    yield put(fetchInvoicesFailure(error.message || 'Failed to fetch invoices'));
  }
}

function* fetchTenantsSaga() {
  try {
    const tenants = yield call(api.fetchTenants);
    yield put(fetchTenantsSuccess(tenants));
  } catch (error) {
    yield put(fetchTenantsFailure(error.message || 'Failed to fetch tenants'));
  }
}

function* markInvoicePaidSaga(action) {
  try {
    const response = yield call(api.markInvoicePaid, action.payload);
    yield put(markInvoicePaidSuccess(response));

    // Show success message
    if (window.showNotification) {
      window.showNotification('Invoice marked as paid successfully', 'success');
    }
  } catch (error) {
    yield put(markInvoicePaidFailure(error.message || 'Failed to mark invoice as paid'));

    // Show error message
    if (window.showNotification) {
      window.showNotification('Failed to update invoice status. Please try again.', 'error');
    }
  }
}

function* downloadInvoiceSaga(action) {
  try {
    yield call(api.downloadInvoice, action.payload);
    yield put(downloadInvoiceSuccess());

    // Show success message
    if (window.showNotification) {
      window.showNotification('Invoice downloaded successfully', 'success');
    }
  } catch (error) {
    yield put(downloadInvoiceFailure(error.message || 'Failed to download invoice'));

    // Show error message
    if (window.showNotification) {
      window.showNotification('Failed to download invoice. Please try again.', 'error');
    }
  }
}

// Watcher sagas
export function* watchFetchInvoices() {
  yield takeLatest(fetchInvoicesRequest.type, fetchInvoicesSaga);
}

export function* watchFetchTenants() {
  yield takeLatest(fetchTenantsRequest.type, fetchTenantsSaga);
}

export function* watchMarkInvoicePaid() {
  yield takeEvery(markInvoicePaidRequest.type, markInvoicePaidSaga);
}

export function* watchDownloadInvoice() {
  yield takeEvery(downloadInvoiceRequest.type, downloadInvoiceSaga);
}

// Root payment saga
export default function* paymentSaga() {
  yield [
    watchFetchInvoices(),
    watchFetchTenants(),
    watchMarkInvoicePaid(),
    watchDownloadInvoice()
  ];
}