import { call, put, takeLatest, takeEvery, all } from 'redux-saga/effects';
import api from '../../utils/api';
import {
  loginRequest,
  loginSuccess,
  loginFailure,
  fetchSystemMetricsRequest,
  fetchSystemMetricsSuccess,
  fetchSystemMetricsFailure,
  fetchErrorLogsRequest,
  fetchErrorLogsSuccess,
  fetchErrorLogsFailure,
  exportErrorLogsRequest,
  exportErrorLogsSuccess,
  exportErrorLogsFailure
} from './superAdminSlice';

// API calls
const loginApi = (credentials) => {
  return api.post('/auth/login', {
    ...credentials,
    role: 'super-admin'
  });
};

const fetchSystemMetricsApi = () => {
  // Mock API call - replace with real endpoint when backend is ready
  return Promise.resolve({
    data: [
      {
        id: 1,
        icon: '⏱️',
        value: '99.9%',
        label: 'System Uptime',
        trend: 'up',
        trendValue: '+0.1%',
        color: 'green'
      },
      {
        id: 2,
        icon: '🏢',
        value: '15',
        label: 'Active Tenants',
        trend: 'up',
        trendValue: '+2',
        color: 'blue'
      },
      {
        id: 3,
        icon: '👥',
        value: '247',
        label: 'Active Users',
        trend: 'up',
        trendValue: '+12',
        color: 'purple'
      },
      {
        id: 4,
        icon: '📄',
        value: '1,854',
        label: 'Document Uploads',
        trend: 'up',
        trendValue: '+156',
        color: 'orange'
      }
    ]
  });
};

const fetchErrorLogsApi = (filters) => {
  // Mock API call with dummy error logs
  return Promise.resolve({
    data: [
      {
        id: 'ERR001',
        timestamp: '2024-01-15T10:30:00Z',
        errorType: 'Authentication Error',
        description: 'Failed login attempt with invalid credentials',
        affectedTenant: 'TechCorp Inc.',
        affectedUser: 'john.doe@techcorp.com',
        affectedDocument: null,
        severity: 'Medium'
      },
      {
        id: 'ERR002',
        timestamp: '2024-01-15T09:15:00Z',
        errorType: 'Document Processing Error',
        description: 'Failed to extract text from uploaded PDF document',
        affectedTenant: 'HealthPlus Ltd.',
        affectedUser: 'sarah.smith@healthplus.com',
        affectedDocument: 'policy_document_2024.pdf',
        severity: 'High'
      },
      {
        id: 'ERR003',
        timestamp: '2024-01-15T08:45:00Z',
        errorType: 'Database Connection Error',
        description: 'Temporary database connection timeout during peak hours',
        affectedTenant: 'InsuranceMax Corp.',
        affectedUser: 'admin@insurancemax.com',
        affectedDocument: null,
        severity: 'Critical'
      },
      {
        id: 'ERR004',
        timestamp: '2024-01-15T07:20:00Z',
        errorType: 'Validation Error',
        description: 'Document format validation failed - unsupported file type',
        affectedTenant: 'SecureLife Insurance',
        affectedUser: 'manager@securelife.com',
        affectedDocument: 'claim_form.docx',
        severity: 'Low'
      },
      {
        id: 'ERR005',
        timestamp: '2024-01-15T06:55:00Z',
        errorType: 'API Rate Limit',
        description: 'Third-party compliance API rate limit exceeded',
        affectedTenant: 'GlobalInsure Ltd.',
        affectedUser: 'api.user@globalinsure.com',
        affectedDocument: 'compliance_report_Q4.pdf',
        severity: 'Medium'
      }
    ]
  });
};

// Saga workers
function* loginSaga(action) {
  try {
    const response = yield call(loginApi, action.payload);

    if (response?.data) {
      yield put(loginSuccess(response.data));

      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      // Navigation will be handled by the component's useEffect
    } else {
      yield put(loginFailure('Invalid response from server'));
    }
  } catch (error) {
    console.error('Super admin login error:', error);

    let errorMessage = 'Login failed';

    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (error?.response?.status === 401) {
      errorMessage = 'Invalid credentials';
    } else if (error?.response?.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    }

    yield put(loginFailure(errorMessage));
  }
}

function* fetchSystemMetricsSaga() {
  try {
    const response = yield call(fetchSystemMetricsApi);
    yield put(fetchSystemMetricsSuccess(response.data));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch system metrics';
    yield put(fetchSystemMetricsFailure(errorMessage));
  }
}

function* fetchErrorLogsSaga(action) {
  try {
    const filters = action.payload || {};
    const response = yield call(fetchErrorLogsApi, filters);

    // Apply filters to the response data
    let filteredLogs = response.data;

    if (filters.tenantName) {
      filteredLogs = filteredLogs.filter(log => 
        log.affectedTenant && log.affectedTenant.toLowerCase().includes(filters.tenantName.toLowerCase())
      );
    }

    if (filters.errorType) {
      filteredLogs = filteredLogs.filter(log => 
        log.errorType && log.errorType.toLowerCase().includes(filters.errorType.toLowerCase())
      );
    }

    if (filters.dateRange && filters.dateRange.start) {
      filteredLogs = filteredLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        const startDate = new Date(filters.dateRange.start);
        return logDate >= startDate;
      });
    }

    if (filters.dateRange && filters.dateRange.end) {
      filteredLogs = filteredLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        const endDate = new Date(filters.dateRange.end);
        endDate.setHours(23, 59, 59, 999); // Include the entire end date
        return logDate <= endDate;
      });
    }

    yield put(fetchErrorLogsSuccess(filteredLogs));
  } catch (error) {
    yield put(fetchErrorLogsFailure(error.message || 'Failed to fetch error logs'));
  }
}

function* exportErrorLogsSaga(action) {
  try {
    const logs = action.payload || [];

    // Create CSV content
    const headers = ['Error ID', 'Timestamp', 'Type', 'Description', 'Tenant', 'User'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        `"${log.id || ''}"`,
        `"${new Date(log.timestamp).toLocaleString()}"`,
        `"${log.errorType || ''}"`,
        `"${(log.description || '').replace(/"/g, '""')}"`,
        `"${log.affectedTenant || 'N/A'}"`,
        `"${log.affectedUser || 'N/A'}"`
      ].join(','))
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `error_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    yield put(exportErrorLogsSuccess());
  } catch (error) {
    yield put(exportErrorLogsFailure(error.message || 'Failed to export error logs'));
  }
}


// Saga watchers
function* watchFetchSystemMetrics() {
  yield takeLatest(fetchSystemMetricsRequest.type, fetchSystemMetricsSaga);
}

function* watchFetchErrorLogs() {
  yield takeEvery('superAdmin/fetchErrorLogsRequest', fetchErrorLogsSaga);
}

function* watchExportErrorLogs() {
  yield takeEvery('superAdmin/exportErrorLogsRequest', exportErrorLogsSaga);
}

// Root saga
export default function* superAdminSaga() {
  yield all([
    watchFetchSystemMetrics(),
    watchFetchErrorLogs(),
    watchExportErrorLogs()
  ]);
}