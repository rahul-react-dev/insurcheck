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
  fetchInvoices: async (params = {}) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { page = 1, limit = 5, ...filters } = params;

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
      },
      {
        id: '13',
        invoiceId: 'INV-2024-013',
        tenantName: 'Summit Insurance',
        tenantEmail: 'accounts@summit.com',
        tenantCompany: 'Summit Insurance LLC',
        tenantPhone: '+1 (555) 234-5678',
        tenantAddress: '234 Ridge Road, Atlanta, GA 30301',
        amount: 129.99,
        planName: 'Professional Plan',
        billingPeriod: 'Monthly',
        issueDate: '2024-02-15',
        dueDate: '2024-03-15',
        status: 'pending',
        breakdown: [
          { description: 'Professional Plan - Monthly', amount: 129.99 }
        ],
        notes: 'New professional subscription.'
      },
      {
        id: '14',
        invoiceId: 'INV-2024-014',
        tenantName: 'Apex Insurance Group',
        tenantEmail: 'billing@apex.com',
        tenantCompany: 'Apex Insurance Group Inc.',
        tenantPhone: '+1 (555) 345-6789',
        tenantAddress: '345 Valley Street, Dallas, TX 75201',
        amount: 89.99,
        planName: 'Basic Plan',
        billingPeriod: 'Monthly',
        issueDate: '2024-02-20',
        dueDate: '2024-03-20',
        status: 'paid',
        paidDate: '2024-02-22',
        breakdown: [
          { description: 'Basic Plan - Monthly', amount: 89.99 }
        ],
        paymentHistory: [
          { type: 'Credit Card Payment', date: '2024-02-22', amount: 89.99 }
        ],
        notes: 'Quick payment via credit card.'
      },
      {
        id: '15',
        invoiceId: 'INV-2024-015',
        tenantName: 'Elite Insurance Co.',
        tenantEmail: 'finance@elite.com',
        tenantCompany: 'Elite Insurance Co.',
        tenantPhone: '+1 (555) 456-7890',
        tenantAddress: '456 Crown Avenue, Las Vegas, NV 89101',
        amount: 449.99,
        planName: 'Enterprise Plan',
        billingPeriod: 'Monthly',
        issueDate: '2024-02-25',
        dueDate: '2024-03-25',
        status: 'overdue',
        breakdown: [
          { description: 'Enterprise Plan - Monthly', amount: 449.99 }
        ],
        notes: 'Payment overdue - follow up required.'
      },
      {
        id: '16',
        invoiceId: 'INV-2024-016',
        tenantName: 'Prime Insurance Ltd.',
        tenantEmail: 'accounts@prime.com',
        tenantCompany: 'Prime Insurance Ltd.',
        tenantPhone: '+1 (555) 567-8901',
        tenantAddress: '567 Park Lane, San Francisco, CA 94101',
        amount: 199.99,
        planName: 'Professional Plus Plan',
        billingPeriod: 'Monthly',
        issueDate: '2024-03-01',
        dueDate: '2024-03-31',
        status: 'pending',
        breakdown: [
          { description: 'Professional Plus Plan - Monthly', amount: 199.99 }
        ],
        notes: 'Professional plus tier subscription.'
      },
      {
        id: '17',
        invoiceId: 'INV-2024-017',
        tenantName: 'Nova Insurance',
        tenantEmail: 'billing@nova.com',
        tenantCompany: 'Nova Insurance Corp.',
        tenantPhone: '+1 (555) 678-9012',
        tenantAddress: '678 Star Drive, Orlando, FL 32801',
        amount: 69.99,
        planName: 'Basic Plan',
        billingPeriod: 'Monthly',
        issueDate: '2024-03-05',
        dueDate: '2024-04-05',
        status: 'paid',
        paidDate: '2024-03-08',
        breakdown: [
          { description: 'Basic Plan - Monthly', amount: 69.99 }
        ],
        paymentHistory: [
          { type: 'Bank Transfer', date: '2024-03-08', amount: 69.99 }
        ],
        notes: 'Payment via bank transfer.'
      },
      {
        id: '18',
        invoiceId: 'INV-2024-018',
        tenantName: 'Zenith Insurance',
        tenantEmail: 'finance@zenith.com',
        tenantCompany: 'Zenith Insurance Group',
        tenantPhone: '+1 (555) 789-0123',
        tenantAddress: '789 Summit Court, Philadelphia, PA 19101',
        amount: 349.99,
        planName: 'Enterprise Plan',
        billingPeriod: 'Monthly',
        issueDate: '2024-03-10',
        dueDate: '2024-04-10',
        status: 'pending',
        breakdown: [
          { description: 'Enterprise Plan - Monthly', amount: 349.99 }
        ],
        notes: 'Enterprise tier subscription.'
      },
      {
        id: '19',
        invoiceId: 'INV-2024-019',
        tenantName: 'Stellar Insurance',
        tenantEmail: 'accounts@stellar.com',
        tenantCompany: 'Stellar Insurance Inc.',
        tenantPhone: '+1 (555) 890-1234',
        tenantAddress: '890 Galaxy Boulevard, Houston, TX 77001',
        amount: 159.99,
        planName: 'Professional Plan',
        billingPeriod: 'Monthly',
        issueDate: '2024-03-15',
        dueDate: '2024-04-15',
        status: 'paid',
        paidDate: '2024-03-18',
        breakdown: [
          { description: 'Professional Plan - Monthly', amount: 159.99 }
        ],
        paymentHistory: [
          { type: 'Credit Card Payment', date: '2024-03-18', amount: 159.99 }
        ],
        notes: 'Timely payment processing.'
      },
      {
        id: '20',
        invoiceId: 'INV-2024-020',
        tenantName: 'Quantum Insurance',
        tenantEmail: 'billing@quantum.com',
        tenantCompany: 'Quantum Insurance LLC',
        tenantPhone: '+1 (555) 901-2345',
        tenantAddress: '901 Future Street, San Jose, CA 95101',
        amount: 279.99,
        planName: 'Professional Plus Plan',
        billingPeriod: 'Monthly',
        issueDate: '2024-03-20',
        dueDate: '2024-04-20',
        status: 'pending',
        breakdown: [
          { description: 'Professional Plus Plan - Monthly', amount: 279.99 }
        ],
        notes: 'Professional plus subscription.'
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

    // Calculate summary for all filtered invoices (before pagination)
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

    // Apply pagination (simulate backend pagination)
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

    // Pagination info
    const pagination = {
      page,
      limit,
      total: filteredInvoices.length,
      totalPages: Math.ceil(filteredInvoices.length / limit)
    };

    return {
      invoices: paginatedInvoices,
      summary,
      pagination
    };
  },

  fetchTenants: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));

    return [
      { id: '1', name: 'Acme Insurance Co.', email: 'admin@acme-insurance.com' },
      { id: '2', name: 'SafeGuard Insurance', email: 'billing@safeguard.com' },
      { id: '3', name: 'Quick Insurance', email: 'finance@quickinsurance.com' },
      { id: '4', name: 'Premium Insurance Group', email: 'accounts@premium.com' },
      { id: '5', name: 'Reliable Insurance', email: 'billing@reliable.com' },
      { id: '6', name: 'SecureLife Insurance', email: 'finance@securelife.com' },
      { id: '7', name: 'TrustGuard Insurance', email: 'billing@trustguard.com' },
      { id: '8', name: 'Shield Insurance Co.', email: 'accounts@shield.com' },
      { id: '9', name: 'Fortress Insurance', email: 'finance@fortress.com' },
      { id: '10', name: 'Guardian Insurance', email: 'billing@guardian.com' },
      { id: '11', name: 'Pinnacle Insurance', email: 'accounts@pinnacle.com' },
      { id: '12', name: 'Valor Insurance', email: 'finance@valor.com' }
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
    const params = action.payload || {};
    console.log('📡 Fetching invoices with params:', params);
    
    const response = yield call(api.fetchInvoices, params);
    console.log('✅ Invoices fetched successfully:', response);
    
    // Ensure response has required structure
    const validatedResponse = {
      invoices: response.invoices || [],
      summary: {
        totalInvoices: response.summary?.totalInvoices || 0,
        totalPaid: response.summary?.totalPaid || 0,
        totalPending: response.summary?.totalPending || 0,
        totalOverdue: response.summary?.totalOverdue || 0,
      },
      pagination: response.pagination || { page: 1, limit: 5, total: 0, totalPages: 0 }
    };
    
    yield put(fetchInvoicesSuccess(validatedResponse));
  } catch (error) {
    console.error('❌ Error fetching invoices:', error);
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