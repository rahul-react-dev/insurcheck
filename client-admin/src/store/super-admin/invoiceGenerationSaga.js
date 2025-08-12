
import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import {
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
  retryInvoiceGenerationFailure
} from './invoiceGenerationSlice';

// Mock API functions - replace with actual API calls
const api = {
  fetchInvoiceConfig: async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock configurations
    const mockConfigurations = [
      {
        tenantId: '1',
        frequency: 'monthly',
        startDate: '2024-01-01',
        billingContactEmail: 'billing@acme-insurance.com',
        timezone: 'America/New_York',
        generateOnWeekend: false,
        autoSend: true,
        reminderDays: 3,
        isActive: true,
        nextGenerationDate: '2024-04-01'
      },
      {
        tenantId: '2',
        frequency: 'monthly',
        startDate: '2024-01-15',
        billingContactEmail: 'finance@safeguard.com',
        timezone: 'America/Chicago',
        generateOnWeekend: true,
        autoSend: true,
        reminderDays: 5,
        isActive: true,
        nextGenerationDate: '2024-04-15'
      }
    ];

    // Mock tenants
    const mockTenants = [
      { id: '1', name: 'Acme Insurance Co.', email: 'admin@acme-insurance.com', plan: 'Enterprise' },
      { id: '2', name: 'SafeGuard Insurance', email: 'billing@safeguard.com', plan: 'Professional' },
      { id: '3', name: 'Quick Insurance', email: 'finance@quickinsurance.com', plan: 'Basic' },
      { id: '4', name: 'Premium Insurance Group', email: 'accounts@premium.com', plan: 'Enterprise Pro' },
      { id: '5', name: 'Reliable Insurance', email: 'billing@reliable.com', plan: 'Professional Plus' }
    ];

    return { configurations: mockConfigurations, tenants: mockTenants };
  },

  updateInvoiceConfig: async (tenantId, config) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulate potential errors
    if (!config.billingContactEmail || !config.startDate) {
      throw new Error('Missing required configuration fields');
    }

    return {
      tenantId,
      config: {
        ...config,
        isActive: true,
        updatedAt: new Date().toISOString(),
        // Calculate next generation date based on frequency
        nextGenerationDate: calculateNextGenerationDate(config.startDate, config.frequency)
      }
    };
  },

  generateInvoice: async (tenantId) => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const isSuccess = Math.random() > 0.2; // 80% success rate

    if (tenantId === 'all') {
      // Generate for all tenants
      const results = [];
      for (let i = 1; i <= 5; i++) {
        const success = Math.random() > 0.15;
        results.push({
          tenantId: i.toString(),
          success,
          invoiceId: success ? `INV-${Date.now()}-${i}` : null,
          error: success ? null : 'Failed to generate invoice due to billing configuration error'
        });
      }
      
      return {
        results,
        summary: {
          totalGenerated: results.filter(r => r.success).length,
          totalFailed: results.filter(r => !r.success).length
        }
      };
    } else {
      // Generate for single tenant
      if (!isSuccess) {
        throw new Error('Failed to generate invoice. Please check tenant configuration.');
      }

      const invoiceId = `INV-${Date.now()}-${tenantId}`;
      const log = {
        id: Date.now().toString(),
        invoiceId,
        tenantId,
        tenantName: `Tenant ${tenantId}`,
        amount: Math.floor(Math.random() * 500) + 50,
        status: 'success',
        generationType: 'manual',
        generationDate: new Date().toISOString(),
        sentDate: new Date().toISOString(),
        sentToEmail: `billing@tenant${tenantId}.com`,
        notes: 'Invoice generated and sent successfully'
      };

      return { log };
    }
  },

  fetchInvoiceLogs: async (params = {}) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { page = 1, limit = 10, ...filters } = params;

    // Mock logs data
    const mockLogs = [
      {
        id: '1',
        invoiceId: 'INV-2024-001',
        tenantId: '1',
        tenantName: 'Acme Insurance Co.',
        amount: 299.99,
        status: 'sent',
        generationType: 'automatic',
        generationDate: '2024-03-15T10:30:00Z',
        sentDate: '2024-03-15T10:32:00Z',
        sentToEmail: 'billing@acme-insurance.com',
        notes: 'Monthly invoice generated and sent successfully'
      },
      {
        id: '2',
        invoiceId: 'INV-2024-002',
        tenantId: '2',
        tenantName: 'SafeGuard Insurance',
        amount: 99.99,
        status: 'failed',
        generationType: 'automatic',
        generationDate: '2024-03-14T15:20:00Z',
        errorMessage: 'SMTP server connection failed. Email could not be sent.',
        notes: 'Invoice generated but email delivery failed'
      },
      {
        id: '3',
        invoiceId: 'INV-2024-003',
        tenantId: '3',
        tenantName: 'Quick Insurance',
        amount: 29.99,
        status: 'success',
        generationType: 'manual',
        generationDate: '2024-03-13T09:15:00Z',
        sentDate: '2024-03-13T09:16:00Z',
        sentToEmail: 'finance@quickinsurance.com',
        notes: 'Manual invoice generation requested by admin'
      },
      {
        id: '4',
        invoiceId: 'INV-2024-004',
        tenantId: '4',
        tenantName: 'Premium Insurance Group',
        amount: 499.99,
        status: 'pending',
        generationType: 'automatic',
        generationDate: '2024-03-12T14:45:00Z',
        notes: 'Invoice generated, awaiting email delivery'
      },
      {
        id: '5',
        invoiceId: 'INV-2024-005',
        tenantId: '5',
        tenantName: 'Reliable Insurance',
        amount: 149.99,
        status: 'sent',
        generationType: 'automatic',
        generationDate: '2024-03-11T11:20:00Z',
        sentDate: '2024-03-11T11:22:00Z',
        sentToEmail: 'billing@reliable.com',
        notes: 'Weekly invoice generated and sent successfully'
      }
    ];

    // Apply filters
    let filteredLogs = mockLogs;

    if (filters.tenantName) {
      filteredLogs = filteredLogs.filter(log =>
        log.tenantName.toLowerCase().includes(filters.tenantName.toLowerCase())
      );
    }

    if (filters.status) {
      filteredLogs = filteredLogs.filter(log => log.status === filters.status);
    }

    if (filters.dateRange?.start) {
      filteredLogs = filteredLogs.filter(log =>
        new Date(log.generationDate) >= new Date(filters.dateRange.start)
      );
    }

    if (filters.dateRange?.end) {
      filteredLogs = filteredLogs.filter(log =>
        new Date(log.generationDate) <= new Date(filters.dateRange.end)
      );
    }

    // Calculate summary
    const summary = {
      totalGenerated: filteredLogs.length,
      totalSent: filteredLogs.filter(log => log.status === 'sent').length,
      totalFailed: filteredLogs.filter(log => log.status === 'failed').length,
      totalAmount: filteredLogs.reduce((sum, log) => sum + log.amount, 0)
    };

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    const pagination = {
      page,
      limit,
      total: filteredLogs.length,
      totalPages: Math.ceil(filteredLogs.length / limit)
    };

    return {
      logs: paginatedLogs,
      summary,
      pagination
    };
  },

  retryInvoiceGeneration: async (logId) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const isSuccess = Math.random() > 0.3; // 70% success rate on retry

    if (!isSuccess) {
      throw new Error('Retry failed. Please check configuration and try again.');
    }

    return {
      logId,
      updatedLog: {
        status: 'success',
        sentDate: new Date().toISOString(),
        sentToEmail: 'updated@email.com',
        errorMessage: null,
        notes: 'Successfully retried and sent via email'
      }
    };
  }
};

// Helper function to calculate next generation date
function calculateNextGenerationDate(startDate, frequency) {
  const start = new Date(startDate);
  const now = new Date();
  
  switch (frequency) {
    case 'weekly':
      const nextWeek = new Date(start);
      while (nextWeek <= now) {
        nextWeek.setDate(nextWeek.getDate() + 7);
      }
      return nextWeek.toISOString();
    
    case 'monthly':
      const nextMonth = new Date(start);
      while (nextMonth <= now) {
        nextMonth.setMonth(nextMonth.getMonth() + 1);
      }
      return nextMonth.toISOString();
    
    case 'quarterly':
      const nextQuarter = new Date(start);
      while (nextQuarter <= now) {
        nextQuarter.setMonth(nextQuarter.getMonth() + 3);
      }
      return nextQuarter.toISOString();
    
    case 'yearly':
      const nextYear = new Date(start);
      while (nextYear <= now) {
        nextYear.setFullYear(nextYear.getFullYear() + 1);
      }
      return nextYear.toISOString();
    
    default:
      return start.toISOString();
  }
}

// Saga functions
function* fetchInvoiceConfigSaga() {
  try {
    console.log('📡 Fetching invoice configurations...');
    const response = yield call(api.fetchInvoiceConfig);
    console.log('✅ Invoice configurations fetched successfully:', response);
    yield put(fetchInvoiceConfigSuccess(response));
  } catch (error) {
    console.error('❌ Error fetching invoice configurations:', error);
    yield put(fetchInvoiceConfigFailure(error.message || 'Failed to fetch invoice configurations'));
  }
}

function* updateInvoiceConfigSaga(action) {
  try {
    console.log('📡 Updating invoice configuration:', action.payload);
    const { tenantId, config } = action.payload;
    const response = yield call(api.updateInvoiceConfig, tenantId, config);
    console.log('✅ Invoice configuration updated successfully:', response);
    yield put(updateInvoiceConfigSuccess(response));

    // Show success message
    if (window.showNotification) {
      window.showNotification('Invoice generation settings updated successfully.', 'success');
    }
  } catch (error) {
    console.error('❌ Error updating invoice configuration:', error);
    yield put(updateInvoiceConfigFailure(error.message || 'Failed to update invoice configuration'));

    // Show error message
    if (window.showNotification) {
      window.showNotification('Invalid settings. Please check inputs.', 'error');
    }
  }
}

function* generateInvoiceSaga(action) {
  try {
    console.log('📡 Generating invoice for tenant:', action.payload);
    const response = yield call(api.generateInvoice, action.payload);
    console.log('✅ Invoice generated successfully:', response);
    yield put(generateInvoiceSuccess(response));

    // Show success message
    if (window.showNotification) {
      window.showNotification('Invoice generated and sent successfully.', 'success');
    }
  } catch (error) {
    console.error('❌ Error generating invoice:', error);
    yield put(generateInvoiceFailure(error.message || 'Failed to generate invoice'));

    // Show error message
    if (window.showNotification) {
      window.showNotification('Failed to generate invoice. Please try again.', 'error');
    }
  }
}

function* fetchInvoiceLogsSaga(action) {
  try {
    const params = action.payload || {};
    console.log('📡 Fetching invoice logs with params:', params);
    const response = yield call(api.fetchInvoiceLogs, params);
    console.log('✅ Invoice logs fetched successfully:', response);
    yield put(fetchInvoiceLogsSuccess(response));
  } catch (error) {
    console.error('❌ Error fetching invoice logs:', error);
    yield put(fetchInvoiceLogsFailure(error.message || 'Failed to fetch invoice logs'));
  }
}

function* retryInvoiceGenerationSaga(action) {
  try {
    console.log('📡 Retrying invoice generation for log:', action.payload);
    const response = yield call(api.retryInvoiceGeneration, action.payload);
    console.log('✅ Invoice generation retried successfully:', response);
    yield put(retryInvoiceGenerationSuccess(response));

    // Show success message
    if (window.showNotification) {
      window.showNotification('Invoice generation retried successfully.', 'success');
    }
  } catch (error) {
    console.error('❌ Error retrying invoice generation:', error);
    yield put(retryInvoiceGenerationFailure(error.message || 'Failed to retry invoice generation'));

    // Show error message
    if (window.showNotification) {
      window.showNotification('Retry failed. Please check configuration and try again.', 'error');
    }
  }
}

// Watcher sagas
export function* watchFetchInvoiceConfig() {
  yield takeLatest(fetchInvoiceConfigRequest.type, fetchInvoiceConfigSaga);
}

export function* watchUpdateInvoiceConfig() {
  yield takeEvery(updateInvoiceConfigRequest.type, updateInvoiceConfigSaga);
}

export function* watchGenerateInvoice() {
  yield takeEvery(generateInvoiceRequest.type, generateInvoiceSaga);
}

export function* watchFetchInvoiceLogs() {
  yield takeLatest(fetchInvoiceLogsRequest.type, fetchInvoiceLogsSaga);
}

export function* watchRetryInvoiceGeneration() {
  yield takeEvery(retryInvoiceGenerationRequest.type, retryInvoiceGenerationSaga);
}

// Root invoice generation saga
export default function* invoiceGenerationSaga() {
  yield [
    watchFetchInvoiceConfig(),
    watchUpdateInvoiceConfig(),
    watchGenerateInvoice(),
    watchFetchInvoiceLogs(),
    watchRetryInvoiceGeneration()
  ];
}
