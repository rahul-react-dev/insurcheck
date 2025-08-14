import { call, put, takeLatest, takeEvery, all } from 'redux-saga/effects';
import { superAdminAPI } from '../../utils/api';
import {
  loginRequest,
  loginSuccess,
  loginFailure,
  incrementLoginAttempts,
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

// API calls (removed as they are now part of superAdminAPI)

// Saga workers
function* loginSaga(action) {
  try {
    const response = yield call(superAdminAPI.login, action.payload);

    if (response && response.token && response.user) {
      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('isAuthenticated', 'true');

      yield put(loginSuccess({ 
        token: response.token, 
        user: response.user 
      }));

      console.log('✅ Super Admin login successful');
    } else {
      throw new Error('Invalid response structure from server');
    }
  } catch (error) {
    console.error('❌ Super Admin login error:', error);

    let errorMessage = 'Login failed. Please try again.';

    // Handle network errors
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      errorMessage = 'Unable to connect to server. Please check if the server is running.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    yield put(loginFailure(errorMessage));
    yield put(incrementLoginAttempts());
  }
}

function* fetchSystemMetricsSaga() {
  try {
    const response = yield call(superAdminAPI.getSystemMetrics);
    const metrics = response.data || response; // Assuming API returns data in .data or directly
    yield put(fetchSystemMetricsSuccess(metrics));
  } catch (error) {
    console.error('❌ Error in fetchSystemMetricsSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch system metrics';
    yield put(fetchSystemMetricsFailure(errorMessage));
  }
}

function* fetchErrorLogsSaga(action) {
  try {
    const filters = action.payload || {};
    const response = yield call(superAdminAPI.getErrorLogs, filters);
    const logs = response.data || response; // Assuming API returns data in .data or directly
    yield put(fetchErrorLogsSuccess(logs));
  } catch (error) {
    console.error('❌ Error in fetchErrorLogsSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch error logs';
    yield put(fetchErrorLogsFailure(errorMessage));
  }
}

function* exportErrorLogsSaga(action) {
  try {
    const logs = action.payload;

    if (!logs || logs.length === 0) {
      yield put(exportErrorLogsFailure('No logs available to export'));
      return;
    }

    // Create CSV content
    const headers = ['Timestamp', 'Error Type', 'Affected Tenant', 'Message', 'Severity'];
    const csvRows = [
      headers.join(','),
      ...logs.map(log => [
        log.timestamp || '',
        log.errorType || '',
        log.affectedTenant || '',
        `"${(log.message || '').replace(/"/g, '""')}"`, // Ensure message is properly quoted and escaped
        log.severity || ''
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');

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

    if (window.showNotification) {
      window.showNotification('Error logs exported successfully', 'success');
    }
  } catch (error) {
    console.error('❌ Error in exportErrorLogsSaga:', error);
    const errorMessage = error?.message || 'Failed to export error logs';
    yield put(exportErrorLogsFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to export logs. Please try again.', 'error');
    }
  }
}

// Saga watchers
function* watchLogin() {
  yield takeLatest(loginRequest.type, loginSaga);
}

function* watchFetchSystemMetrics() {
  yield takeLatest(fetchSystemMetricsRequest.type, fetchSystemMetricsSaga);
}

function* watchFetchErrorLogs() {
  yield takeEvery(fetchErrorLogsRequest.type, fetchErrorLogsSaga);
}

function* watchExportErrorLogs() {
  yield takeEvery(exportErrorLogsRequest.type, exportErrorLogsSaga);
}

// Root saga
export default function* superAdminSaga() {
  yield all([
    watchLogin(),
    watchFetchSystemMetrics(),
    watchFetchErrorLogs(),
    watchExportErrorLogs()
  ]);
}