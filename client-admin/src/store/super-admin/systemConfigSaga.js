
import { call, put, takeEvery, delay } from 'redux-saga/effects';
import {
  fetchSystemConfigRequest,
  fetchSystemConfigSuccess,
  fetchSystemConfigFailure,
  updateSystemConfigRequest,
  updateSystemConfigSuccess,
  updateSystemConfigFailure,
  fetchTenantConfigRequest,
  fetchTenantConfigSuccess,
  fetchTenantConfigFailure,
  updateTenantConfigRequest,
  updateTenantConfigSuccess,
  updateTenantConfigFailure,
  setAvailableTenants,
  fetchAuditLogsRequest,
  fetchAuditLogsSuccess,
  fetchAuditLogsFailure
} from './systemConfigSlice';

// Mock system configuration data
const mockSystemConfig = {
  twoFactorAuth: {
    emailEnabled: true,
    smsEnabled: false
  },
  maxFileSize: 10,
  maxUsersPerTenant: 50,
  maxDocumentsPerTenant: 1000,
  emailRetryLimits: 3,
  backupFrequency: 'Daily',
  autoDeleteInterval: 60,
  featureToggles: {
    trialExtensions: true,
    autoInvoicing: true,
    documentVersioning: false,
    advancedAnalytics: false,
    apiAccess: true
  },
  lastUpdated: '2024-01-15T10:30:00Z',
  updatedBy: 'admin@insurcheck.com'
};

// Mock available tenants
const mockAvailableTenants = [
  {
    id: '1',
    name: 'Acme Insurance Solutions',
    email: 'admin@acme-insurance.com',
    status: 'active'
  },
  {
    id: '2',
    name: 'SafeGuard Insurance Co.',
    email: 'billing@safeguard.com',
    status: 'active'
  },
  {
    id: '3',
    name: 'Quick Insurance Ltd.',
    email: 'contact@quickinsurance.com',
    status: 'suspended'
  },
  {
    id: '4',
    name: 'Premium Insurance Group',
    email: 'admin@premium-group.com',
    status: 'active'
  }
];

// Mock tenant-specific configurations
const mockTenantConfigurations = {
  '1': {
    // Acme has custom settings
    twoFactorAuth: {
      emailEnabled: true,
      smsEnabled: true
    },
    maxFileSize: 25, // Higher limit
    maxUsersPerTenant: 100,
    maxDocumentsPerTenant: 5000,
    emailRetryLimits: 5,
    backupFrequency: 'Daily',
    autoDeleteInterval: 90, // Longer retention
    featureToggles: {
      trialExtensions: false,
      autoInvoicing: true,
      documentVersioning: true,
      advancedAnalytics: true,
      apiAccess: true
    },
    inheritFromSystem: false,
    customizedBy: 'admin@insurcheck.com',
    customizedAt: '2024-01-10T14:20:00Z'
  },
  '3': {
    // Quick Insurance has limited settings
    twoFactorAuth: {
      emailEnabled: false,
      smsEnabled: false
    },
    maxFileSize: 5, // Lower limit
    maxUsersPerTenant: 10,
    maxDocumentsPerTenant: 200,
    emailRetryLimits: 1,
    backupFrequency: 'Weekly',
    autoDeleteInterval: 30, // Shorter retention
    featureToggles: {
      trialExtensions: false,
      autoInvoicing: false,
      documentVersioning: false,
      advancedAnalytics: false,
      apiAccess: false
    },
    inheritFromSystem: false,
    customizedBy: 'admin@insurcheck.com',
    customizedAt: '2024-01-12T09:30:00Z'
  }
};

// Mock audit logs
const mockAuditLogs = [
  {
    id: 1,
    timestamp: '2024-01-15T10:30:00Z',
    action: 'UPDATE',
    setting: 'maxFileSize',
    oldValue: '5',
    newValue: '10',
    status: 'SUCCESS',
    user: 'admin@insurcheck.com',
    type: 'CONFIGURATION',
    description: 'Updated maximum file size limit'
  },
  {
    id: 2,
    timestamp: '2024-01-15T09:15:00Z',
    action: 'UPDATE',
    setting: 'autoDeleteInterval',
    oldValue: '30',
    newValue: '60',
    status: 'SUCCESS',
    user: 'admin@insurcheck.com',
    type: 'CONFIGURATION',
    description: 'Updated auto-delete interval for documents'
  },
  {
    id: 3,
    timestamp: '2024-01-15T08:45:00Z',
    action: 'UPDATE',
    setting: 'featureToggles.trialExtensions',
    oldValue: 'false',
    newValue: 'true',
    status: 'SUCCESS',
    user: 'admin@insurcheck.com',
    type: 'FEATURE_TOGGLE',
    description: 'Enabled trial extensions feature'
  },
  {
    id: 4,
    timestamp: '2024-01-14T16:20:00Z',
    action: 'AUTO_DELETE',
    setting: 'deletedDocuments',
    oldValue: null,
    newValue: null,
    status: 'SUCCESS',
    user: 'System',
    type: 'AUTO_DELETION',
    description: 'Auto-deleted 15 documents older than 60 days'
  },
  {
    id: 5,
    timestamp: '2024-01-14T14:10:00Z',
    action: 'UPDATE',
    setting: 'twoFactorAuth.emailEnabled',
    oldValue: 'false',
    newValue: 'true',
    status: 'SUCCESS',
    user: 'admin@insurcheck.com',
    type: 'SECURITY',
    description: 'Enabled email 2FA authentication'
  },
  {
    id: 6,
    timestamp: '2024-01-14T11:30:00Z',
    action: 'UPDATE',
    setting: 'backupFrequency',
    oldValue: 'Weekly',
    newValue: 'Daily',
    status: 'SUCCESS',
    user: 'admin@insurcheck.com',
    type: 'CONFIGURATION',
    description: 'Changed backup frequency to daily'
  },
  {
    id: 7,
    timestamp: '2024-01-13T13:45:00Z',
    action: 'UPDATE',
    setting: 'maxUsersPerTenant',
    oldValue: '25',
    newValue: '50',
    status: 'FAILED',
    user: 'admin@insurcheck.com',
    type: 'CONFIGURATION',
    description: 'Failed to update max users per tenant - validation error'
  }
];

// Simulate API calls
const mockApiCall = (data, shouldFail = false) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('API call failed'));
      } else {
        resolve({ data });
      }
    }, 1000 + Math.random() * 1000); // 1-2 second delay
  });
};

// Saga workers
function* fetchSystemConfigSaga(action) {
  try {
    console.log('Fetching system configuration...');
    
    // Simulate API call
    const response = yield call(mockApiCall, {
      configuration: mockSystemConfig,
      auditLogs: mockAuditLogs
    });

    yield put(fetchSystemConfigSuccess(response.data));
    yield put(setAvailableTenants(mockAvailableTenants));
    
  } catch (error) {
    console.error('Failed to fetch system configuration:', error.message);
    yield put(fetchSystemConfigFailure({ 
      message: error.message || 'Failed to fetch system configuration' 
    }));
  }
}

function* updateSystemConfigSaga(action) {
  try {
    console.log('Updating system configuration...', action.payload);
    
    // Validate configuration before sending to API
    const config = action.payload;
    
    // Simulate API call
    yield delay(1500); // Simulate processing time
    
    const updatedConfig = {
      ...config,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'admin@insurcheck.com' // This would come from auth state
    };

    // Create audit log entry
    const auditLog = {
      id: mockAuditLogs.length + 1,
      timestamp: new Date().toISOString(),
      action: 'UPDATE',
      setting: 'systemConfiguration',
      oldValue: 'Previous Configuration',
      newValue: 'Updated Configuration',
      status: 'SUCCESS',
      user: 'admin@insurcheck.com',
      type: 'CONFIGURATION',
      description: 'Updated system configuration settings'
    };

    const response = yield call(mockApiCall, {
      configuration: updatedConfig,
      auditLog: auditLog
    });

    yield put(updateSystemConfigSuccess(response.data));
    
    console.log('System configuration updated successfully');
    
  } catch (error) {
    console.error('Failed to update system configuration:', error.message);
    yield put(updateSystemConfigFailure({ 
      message: error.message || 'Failed to update system configuration' 
    }));
  }
}

function* fetchTenantConfigSaga(action) {
  try {
    const tenantId = action.payload;
    console.log('Fetching tenant configuration for:', tenantId);
    
    // Simulate API call
    const tenantConfig = mockTenantConfigurations[tenantId];
    
    if (tenantConfig) {
      const response = yield call(mockApiCall, { 
        tenantId, 
        configuration: tenantConfig 
      });
      yield put(fetchTenantConfigSuccess(response.data));
    } else {
      // No custom config found, tenant uses system defaults
      yield put(fetchTenantConfigSuccess({ 
        tenantId, 
        configuration: null 
      }));
    }
    
  } catch (error) {
    console.error('Failed to fetch tenant configuration:', error.message);
    yield put(fetchTenantConfigFailure({ 
      message: error.message || 'Failed to fetch tenant configuration' 
    }));
  }
}

function* updateTenantConfigSaga(action) {
  try {
    const { tenantId, configuration } = action.payload;
    console.log('Updating tenant configuration for:', tenantId, configuration);
    
    // Simulate API call
    yield delay(1500);
    
    const updatedConfig = {
      ...configuration,
      inheritFromSystem: false,
      customizedBy: 'admin@insurcheck.com', // This would come from auth state
      customizedAt: new Date().toISOString()
    };

    const tenant = mockAvailableTenants.find(t => t.id === tenantId);
    
    // Create audit log entry
    const auditLog = {
      id: mockAuditLogs.length + 1,
      timestamp: new Date().toISOString(),
      action: 'UPDATE',
      setting: 'tenantConfiguration',
      oldValue: mockTenantConfigurations[tenantId] ? 'Custom Configuration' : 'System Default',
      newValue: 'Updated Custom Configuration',
      status: 'SUCCESS',
      user: 'admin@insurcheck.com',
      type: 'TENANT_CONFIGURATION',
      description: `Updated configuration for tenant: ${tenant?.name || tenantId}`
    };

    // Update mock data
    mockTenantConfigurations[tenantId] = updatedConfig;

    const response = yield call(mockApiCall, {
      tenantId,
      configuration: updatedConfig,
      auditLog: auditLog
    });

    yield put(updateTenantConfigSuccess(response.data));
    
    console.log('Tenant configuration updated successfully');
    
  } catch (error) {
    console.error('Failed to update tenant configuration:', error.message);
    yield put(updateTenantConfigFailure({ 
      message: error.message || 'Failed to update tenant configuration' 
    }));
  }
}

function* fetchAuditLogsSaga(action) {
  try {
    console.log('Fetching audit logs...');
    
    // Simulate API call with filters
    const { filters = {} } = action.payload || {};
    
    let filteredLogs = [...mockAuditLogs];
    
    // Apply filters
    if (filters.type) {
      filteredLogs = filteredLogs.filter(log => log.type === filters.type);
    }
    
    if (filters.dateRange?.start) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= new Date(filters.dateRange.start)
      );
    }
    
    if (filters.dateRange?.end) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) <= new Date(filters.dateRange.end)
      );
    }

    const response = yield call(mockApiCall, { logs: filteredLogs });

    yield put(fetchAuditLogsSuccess(response.data));
    
  } catch (error) {
    console.error('Failed to fetch audit logs:', error.message);
    yield put(fetchAuditLogsFailure({ 
      message: error.message || 'Failed to fetch audit logs' 
    }));
  }
}

// Root saga
export default function* systemConfigSaga() {
  yield takeEvery(fetchSystemConfigRequest.type, fetchSystemConfigSaga);
  yield takeEvery(updateSystemConfigRequest.type, updateSystemConfigSaga);
  yield takeEvery(fetchTenantConfigRequest.type, fetchTenantConfigSaga);
  yield takeEvery(updateTenantConfigRequest.type, updateTenantConfigSaga);
  yield takeEvery(fetchAuditLogsRequest.type, fetchAuditLogsSaga);
}
