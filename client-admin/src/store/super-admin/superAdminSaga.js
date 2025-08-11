import { call, put, takeLatest } from 'redux-saga/effects';
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
  fetchErrorLogsFailure
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

    // Check if user has super-admin role
    if (response.data.user.role !== 'super-admin') {
      yield put(loginFailure('Invalid email format or insufficient privileges.'));
      return;
    }

    // Store token in localStorage
    localStorage.setItem('superAdminToken', response.data.token);

    yield put(loginSuccess({
      user: response.data.user,
      token: response.data.token
    }));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
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

function* fetchErrorLogsSaga() {
  try {
    const response = yield call(fetchErrorLogsApi);
    yield put(fetchErrorLogsSuccess(response.data));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch error logs';
    yield put(fetchErrorLogsFailure(errorMessage));
  }
}

// Root saga
export default function* superAdminSaga() {
  yield takeLatest(loginRequest.type, loginSaga);
  yield takeLatest(fetchSystemMetricsRequest.type, fetchSystemMetricsSaga);
  yield takeLatest(fetchErrorLogsRequest.type, fetchErrorLogsSaga);
}