import { call, put, takeLatest, takeEvery, all } from 'redux-saga/effects';
import { superAdminAPI } from '../../utils/api';
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

// API calls (removed as they are now part of superAdminAPI)

// Saga workers
function* loginSaga(action) {
  try {
    console.log('🚀 Super Admin loginSaga started with payload:', action.payload);
    
    // Make API call
    const response = yield call(superAdminAPI.login, action.payload);
    console.log('✅ Login API response received:', response);
    console.log('📊 Response type:', typeof response);
    console.log('🔍 Response keys:', response ? Object.keys(response) : 'null');

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
    console.error('🔍 Error type:', typeof error);
    console.error('📊 Error properties:', error ? Object.keys(error) : 'null');
    console.error('🌐 Error response:', error?.response);
    console.error('📄 Error response data:', error?.response?.data);
    console.error('📈 Error response status:', error?.response?.status);

    let errorMessage = 'Login failed. Please try again.';

    // Handle network errors
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      errorMessage = 'Unable to connect to server. Please check if the server is running.';
    } else if (error.response?.data?.message) {
      // Handle API error responses with proper structure
      errorMessage = error.response.data.message;
      
      // Handle account lockout (HTTP 423)
      if (error.response.status === 423) {
        console.log('🔒 Account locked, lockout time:', error.response.data.lockoutTime);
      }
      
      console.log('🔍 Attempts remaining:', error.response.data.attemptsRemaining);
    } else if (error.message) {
      // Fallback: Handle JSON stringified error messages from old API calls
      try {
        const parsedError = JSON.parse(error.message);
        if (parsedError && parsedError.message) {
          errorMessage = parsedError.message;
        } else {
          errorMessage = error.message;
        }
      } catch (parseError) {
        // If it's not JSON, use the original error message
        errorMessage = error.message;
      }
    }

    // Handle lockout state from backend response
    if (error.response?.status === 423 && error.response?.data?.lockoutTime) {
      yield put(loginFailure({
        message: errorMessage,
        isLocked: true,
        lockoutTime: error.response.data.lockoutTime
      }));
    } else {
      yield put(loginFailure({
        message: errorMessage,
        attemptsRemaining: error.response?.data?.attemptsRemaining
      }));
    }
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