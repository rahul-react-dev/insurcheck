import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
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

// Mock data
const mockConfigurations = [
  {
    tenantId: 1,
    tenantName: 'TechCorp Solutions',
    frequency: 'monthly',
    startDate: '2024-01-01',
    billingContactEmail: 'billing@techcorp.com',
    timezone: 'America/New_York',
    generateOnWeekend: false,
    autoSend: true,
    reminderDays: 3,
    isActive: true,
    nextGenerationDate: '2024-02-01'
  },
  {
    tenantId: 2,
    tenantName: 'HealthPlus Insurance',
    frequency: 'weekly',
    startDate: '2024-01-01',
    billingContactEmail: 'finance@healthplus.com',
    timezone: 'America/Chicago',
    generateOnWeekend: true,
    autoSend: true,
    reminderDays: 2,
    isActive: true,
    nextGenerationDate: '2024-01-28'
  },
  {
    tenantId: 3,
    tenantName: 'SecureLife Ltd',
    frequency: 'monthly',
    startDate: '2024-01-15',
    billingContactEmail: 'admin@securelife.com',
    timezone: 'America/Los_Angeles',
    generateOnWeekend: false,
    autoSend: false,
    reminderDays: 5,
    isActive: false,
    nextGenerationDate: null
  }
];

const mockTenants = [
  {
    id: 1,
    name: 'TechCorp Solutions',
    email: 'contact@techcorp.com',
    plan: 'premium'
  },
  {
    id: 2,
    name: 'HealthPlus Insurance',
    email: 'info@healthplus.com',
    plan: 'enterprise'
  },
  {
    id: 3,
    name: 'SecureLife Ltd',
    email: 'hello@securelife.com',
    plan: 'basic'
  },
  {
    id: 4,
    name: 'AutoInsure Pro',
    email: 'support@autoinsure.com',
    plan: 'premium'
  },
  {
    id: 5,
    name: 'FamilyCare Insurance',
    email: 'care@familycare.com',
    plan: 'basic'
  }
];

// Generate more mock logs
const generateMockLogs = (count = 25) => {
  const statuses = ['sent', 'failed', 'success', 'pending'];
  const generationTypes = ['automatic', 'manual'];
  const tenantNames = ['TechCorp Solutions', 'HealthPlus Insurance', 'SecureLife Ltd', 'AutoInsure Pro', 'FamilyCare Insurance'];

  return Array.from({ length: count }, (_, index) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const generationType = generationTypes[Math.floor(Math.random() * generationTypes.length)];
    const tenantName = tenantNames[Math.floor(Math.random() * tenantNames.length)];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - Math.floor(Math.random() * 30));

    return {
      id: index + 1,
      invoiceId: `INV-2024-${String(index + 1).padStart(3, '0')}`,
      tenantName,
      amount: Math.floor(Math.random() * 500) + 100,
      status,
      generationDate: baseDate.toISOString(),
      sentDate: status === 'sent' ? new Date(baseDate.getTime() + 300000).toISOString() : null,
      sentToEmail: status === 'sent' ? `billing@${tenantName.toLowerCase().replace(/\s+/g, '')}.com` : null,
      generationType,
      errorMessage: status === 'failed' ? 'SMTP server connection failed' : null,
      notes: status === 'sent' ? 'Invoice generated and sent successfully' : 
             status === 'failed' ? 'Email delivery failed, manual intervention required' :
             status === 'pending' ? 'Invoice queued for email delivery' :
             'Invoice generated successfully'
    };
  });
};

const mockLogs = generateMockLogs(25);

// API simulation delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Saga to fetch invoice configurations
function* fetchInvoiceConfigSaga() {
  try {
    yield call(delay, 1200); // Simulate API call

    console.log('🚀 Fetching invoice configurations...');
    
    const response = {
      configurations: mockConfigurations,
      tenants: mockTenants
    };

    console.log('✅ Invoice configurations loaded:', response);

    yield put(fetchInvoiceConfigSuccess(response));
  } catch (error) {
    console.error('❌ Error fetching invoice configurations:', error);
    yield put(fetchInvoiceConfigFailure(error.message || 'Failed to fetch invoice configurations'));
  }
}

// Saga to update invoice configuration
function* updateInvoiceConfigSaga(action) {
  try {
    yield call(delay, 800); // Simulate API call

    const { tenantId, config } = action.payload;

    // Simulate updating configuration
    const updatedConfig = {
      ...config,
      updatedAt: new Date().toISOString(),
      nextGenerationDate: calculateNextGenerationDate(config.startDate, config.frequency)
    };

    // Find and update the configuration
    const configIndex = mockConfigurations.findIndex(c => c.tenantId === tenantId);
    if (configIndex !== -1) {
      mockConfigurations[configIndex] = { ...mockConfigurations[configIndex], ...updatedConfig };
    }

    yield put(updateInvoiceConfigSuccess({ tenantId, config: updatedConfig }));

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

// Saga to generate invoice
function* generateInvoiceSaga(action) {
  try {
    const tenantId = action.payload;
    yield call(delay, 1500); // Simulate API call

    // Simulate invoice generation
    const isSuccess = Math.random() > 0.2; // 80% success rate

    if (tenantId === 'all') {
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
      yield put(generateInvoiceSuccess({ results, summary: { totalGenerated: results.filter(r => r.success).length, totalFailed: results.filter(r => !r.success).length } }));
    } else {
      if (!isSuccess) {
        throw new Error('Failed to generate invoice. Please check tenant configuration.');
      }

      const invoiceId = `INV-${Date.now()}-${tenantId}`;
      const newLog = {
        id: Date.now(),
        invoiceId,
        tenantId: tenantId,
        tenantName: mockTenants.find(t => t.id === parseInt(tenantId))?.name || `Tenant ${tenantId}`,
        amount: Math.floor(Math.random() * 500) + 50,
        status: 'success',
        generationType: 'manual',
        generationDate: new Date().toISOString(),
        sentDate: new Date().toISOString(),
        sentToEmail: `billing@tenant${tenantId}.com`,
        notes: 'Invoice generated and sent successfully'
      };
      mockLogs.unshift(newLog); // Add to the beginning of mockLogs

      yield put(generateInvoiceSuccess({ log: newLog }));
    }

    // Show success message
    if (window.showNotification) {
      window.showNotification('Invoice generation process initiated.', 'success');
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

// Saga to fetch invoice logs
function* fetchInvoiceLogsSaga(action) {
  try {
    yield call(delay, 1000); // Simulate API call

    console.log('🚀 Fetching invoice logs...');

    const { page = 1, limit = 10, tenantName = '', status = '', dateRange } = action.payload || {};

    let filteredLogs = [...mockLogs];

    // Apply filters
    if (tenantName) {
      filteredLogs = filteredLogs.filter(log => 
        log.tenantName.toLowerCase().includes(tenantName.toLowerCase())
      );
    }

    if (status) {
      filteredLogs = filteredLogs.filter(log => log.status === status);
    }

    if (dateRange && dateRange.start) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.generationDate) >= new Date(dateRange.start)
      );
    }

    if (dateRange && dateRange.end) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.generationDate) <= new Date(dateRange.end)
      );
    }

    // Sort by generation date (newest first)
    filteredLogs.sort((a, b) => new Date(b.generationDate) - new Date(a.generationDate));

    // Apply pagination
    const total = filteredLogs.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    // Calculate summary
    const summary = {
      totalGenerated: mockLogs.length,
      totalSent: mockLogs.filter(log => log.status === 'sent').length,
      totalFailed: mockLogs.filter(log => log.status === 'failed').length,
      totalAmount: mockLogs.reduce((sum, log) => sum + log.amount, 0)
    };

    const response = {
      logs: paginatedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      summary
    };

    console.log('✅ Invoice logs loaded:', response);

    yield put(fetchInvoiceLogsSuccess(response));
  } catch (error) {
    yield put(fetchInvoiceLogsFailure(error.message || 'Failed to fetch invoice logs'));
  }
}

// Saga to retry invoice generation
function* retryInvoiceGenerationSaga(action) {
  try {
    const logId = action.payload;
    yield call(delay, 1000); // Simulate API call

    // Simulate retry
    const isSuccess = Math.random() > 0.3; // 70% success rate on retry

    if (!isSuccess) {
      throw new Error('Retry failed. Please check configuration and try again.');
    }

    // Find log and update it
    const logIndex = mockLogs.findIndex(log => log.id === logId);
    if (logIndex !== -1) {
      mockLogs[logIndex] = {
        ...mockLogs[logIndex],
        status: 'success',
        sentDate: new Date().toISOString(),
        sentToEmail: 'retry@example.com',
        errorMessage: null,
        notes: 'Successfully retried and sent via email'
      };
    }

    yield put(retryInvoiceGenerationSuccess({ logId, updatedLog: mockLogs.find(log => log.id === logId) }));

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