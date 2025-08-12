
import { call, put, takeLatest, select } from 'redux-saga/effects';
import api from '../../utils/api';
import {
  fetchActivityLogsRequest,
  fetchActivityLogsSuccess,
  fetchActivityLogsFailure,
  exportActivityLogsRequest,
  exportActivityLogsSuccess,
  exportActivityLogsFailure
} from './activityLogSlice';

// Mock API call for activity logs
const fetchActivityLogsApi = (params) => {
  console.log('Fetching activity logs with params:', params);
  
  // Mock data - replace with real API endpoint when backend is ready
  const mockLogs = [
    {
      id: 'LOG001',
      logId: 'LOG001',
      tenantName: 'TechCorp Inc.',
      tenantId: 'TENANT001',
      userEmail: 'admin@techcorp.com',
      userType: 'Admin',
      actionPerformed: 'Document Upload',
      actionDetails: 'Uploaded policy document: tech_policy_2024.pdf',
      timestamp: '2024-01-15T14:30:00Z',
      ipAddress: '192.168.1.100',
      status: 'Success',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_abc123',
      resourceAffected: 'tech_policy_2024.pdf',
      severity: 'Low'
    },
    {
      id: 'LOG002',
      logId: 'LOG002',
      tenantName: 'HealthPlus Ltd.',
      tenantId: 'TENANT002',
      userEmail: 'user@healthplus.com',
      userType: 'User',
      actionPerformed: 'Login Attempt',
      actionDetails: 'Failed login attempt - Invalid credentials',
      timestamp: '2024-01-15T13:45:00Z',
      ipAddress: '192.168.1.101',
      status: 'Failed',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      sessionId: 'sess_def456',
      resourceAffected: null,
      severity: 'Medium'
    },
    {
      id: 'LOG003',
      logId: 'LOG003',
      tenantName: 'InsuranceMax Corp.',
      tenantId: 'TENANT003',
      userEmail: 'manager@insurancemax.com',
      userType: 'Admin',
      actionPerformed: 'User Management',
      actionDetails: 'Created new user account for john.doe@insurancemax.com',
      timestamp: '2024-01-15T12:20:00Z',
      ipAddress: '192.168.1.102',
      status: 'Success',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_ghi789',
      resourceAffected: 'john.doe@insurancemax.com',
      severity: 'Low'
    },
    {
      id: 'LOG004',
      logId: 'LOG004',
      tenantName: 'SecureLife Insurance',
      tenantId: 'TENANT004',
      userEmail: 'admin@securelife.com',
      userType: 'Admin',
      actionPerformed: 'Document Processing',
      actionDetails: 'Processed claim document: claim_form_2024.pdf',
      timestamp: '2024-01-15T11:15:00Z',
      ipAddress: '192.168.1.103',
      status: 'Success',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      sessionId: 'sess_jkl012',
      resourceAffected: 'claim_form_2024.pdf',
      severity: 'Low'
    },
    {
      id: 'LOG005',
      logId: 'LOG005',
      tenantName: 'GlobalInsure Ltd.',
      tenantId: 'TENANT005',
      userEmail: 'user@globalinsure.com',
      userType: 'User',
      actionPerformed: 'Data Export',
      actionDetails: 'Exported customer data to CSV format',
      timestamp: '2024-01-15T10:30:00Z',
      ipAddress: '192.168.1.104',
      status: 'Success',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_mno345',
      resourceAffected: 'customer_data.csv',
      severity: 'Medium'
    },
    {
      id: 'LOG006',
      logId: 'LOG006',
      tenantName: 'TechCorp Inc.',
      tenantId: 'TENANT001',
      userEmail: 'user@techcorp.com',
      userType: 'User',
      actionPerformed: 'Document Access',
      actionDetails: 'Accessed confidential document: financial_report_2024.pdf',
      timestamp: '2024-01-15T09:45:00Z',
      ipAddress: '192.168.1.105',
      status: 'Success',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      sessionId: 'sess_pqr678',
      resourceAffected: 'financial_report_2024.pdf',
      severity: 'High'
    }
  ];

  // Apply filters
  let filteredLogs = mockLogs;

  if (params.tenantName) {
    filteredLogs = filteredLogs.filter(log => 
      log.tenantName.toLowerCase().includes(params.tenantName.toLowerCase())
    );
  }

  if (params.userEmail) {
    filteredLogs = filteredLogs.filter(log => 
      log.userEmail.toLowerCase().includes(params.userEmail.toLowerCase())
    );
  }

  if (params.actionPerformed) {
    filteredLogs = filteredLogs.filter(log => 
      log.actionPerformed.toLowerCase().includes(params.actionPerformed.toLowerCase())
    );
  }

  if (params.dateRange?.start && params.dateRange?.end) {
    const startDate = new Date(params.dateRange.start);
    const endDate = new Date(params.dateRange.end);
    filteredLogs = filteredLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
  }

  // Apply sorting
  if (params.sortBy) {
    filteredLogs.sort((a, b) => {
      let aValue = a[params.sortBy];
      let bValue = b[params.sortBy];

      if (params.sortBy === 'timestamp') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (params.sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });
  }

  // Apply pagination
  const total = filteredLogs.length;
  const startIndex = (params.page - 1) * params.limit;
  const endIndex = startIndex + params.limit;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  const result = {
    data: {
      logs: paginatedLogs,
      total: total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit)
    }
  };
  
  console.log('Mock API response:', result);
  return Promise.resolve(result);
};

const exportActivityLogsApi = (params) => {
  // Mock export - replace with real API endpoint when backend is ready
  return Promise.resolve({
    data: {
      downloadUrl: '/api/activity-logs/export/activity_logs_export.csv',
      filename: 'activity_logs_export.csv'
    }
  });
};

// Saga workers
function* fetchActivityLogsSaga(action) {
  try {
    const state = yield select();
    const { filters, pagination, sortBy, sortOrder } = state.activityLog;
    
    // Merge current state with any new params from action payload
    const params = {
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
      sortBy,
      sortOrder,
      ...(action.payload || {})
    };

    const response = yield call(fetchActivityLogsApi, params);
    yield put(fetchActivityLogsSuccess(response.data));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch activity logs';
    yield put(fetchActivityLogsFailure(errorMessage));
  }
}

function* exportActivityLogsSaga(action) {
  try {
    const state = yield select();
    const { filters, sortBy, sortOrder } = state.activityLog;
    
    const params = {
      ...filters,
      sortBy,
      sortOrder,
      exportAll: true,
      ...action.payload
    };

    const response = yield call(exportActivityLogsApi, params);
    
    // Create and trigger download
    const link = document.createElement('a');
    link.href = response.data.downloadUrl;
    link.download = response.data.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    yield put(exportActivityLogsSuccess());
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to export activity logs';
    yield put(exportActivityLogsFailure(errorMessage));
  }
}

// Root saga
export default function* activityLogSaga() {
  yield takeLatest(fetchActivityLogsRequest.type, fetchActivityLogsSaga);
  yield takeLatest(exportActivityLogsRequest.type, exportActivityLogsSaga);
}
