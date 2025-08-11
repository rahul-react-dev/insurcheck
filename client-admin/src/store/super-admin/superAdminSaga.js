
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

const fetchErrorLogsApi = () => {
  // Mock API call - replace with real endpoint when backend is ready
  return Promise.resolve({
    data: [
      {
        id: 'ERR-001',
        timestamp: '2024-01-15T10:30:00Z',
        errorType: 'Validation Error',
        description: 'Invalid document format uploaded',
        affectedTenant: 'Acme Corp',
        affectedUser: 'john.doe@acme.com',
        affectedDocument: 'policy-doc-123.pdf'
      },
      {
        id: 'ERR-002',
        timestamp: '2024-01-15T11:45:00Z',
        errorType: 'Database Error',
        description: 'Connection timeout during compliance check',
        affectedTenant: 'Beta Insurance',
        affectedUser: 'sarah.smith@beta.com',
        affectedDocument: 'claim-form-456.pdf'
      },
      {
        id: 'ERR-003',
        timestamp: '2024-01-15T14:20:00Z',
        errorType: 'API Error',
        description: 'Third-party service unavailable',
        affectedTenant: 'Gamma Solutions',
        affectedUser: 'mike.johnson@gamma.com',
        affectedDocument: 'certificate-789.pdf'
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
