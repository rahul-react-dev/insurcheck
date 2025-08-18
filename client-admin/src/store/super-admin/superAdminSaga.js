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
    // Make API call
    const response = yield call(superAdminAPI.login, action.payload);
    console.log('✅ Login API response received:', response);

    // Extract data from response
    const responseData = response.data || response;

    // Validate response structure
    if (!responseData.user || !responseData.token) {
      throw new Error('Invalid response format from server');
    }

    // Dispatch success action with user and token
    yield put(loginSuccess({
      user: responseData.user,
      token: responseData.token
    }));

    console.log('✅ Super Admin login successful');
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
    
    // Don't show error for 401 (token expired) as the API interceptor handles it
    if (error?.status === 401) {
      console.log('🔐 Token expired, letting API interceptor handle redirect');
      return;
    }
    
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch system metrics';
    yield put(fetchSystemMetricsFailure(errorMessage));
  }
}

function* fetchErrorLogsSaga(action) {
  try {
    const filters = action.payload || {};
    const response = yield call(superAdminAPI.getErrorLogs, filters);
    
    // Handle paginated API response structure
    const responseData = {
      data: response.data || response || [],
      pagination: response.pagination || null
    };
    
    console.log('🔍 Saga received response:', { responseData, originalResponse: response });
    yield put(fetchErrorLogsSuccess(responseData));
  } catch (error) {
    console.error('❌ Error in fetchErrorLogsSaga:', error);
    
    // Don't show error for 401 (token expired) as the API interceptor handles it
    if (error?.status === 401) {
      console.log('🔐 Token expired, letting API interceptor handle redirect');
      return;
    }
    
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