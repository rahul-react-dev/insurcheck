import { call, put, takeEvery, takeLatest, all, fork } from 'redux-saga/effects';
import { superAdminAPI } from '../../utils/api';
import {
  fetchActivityLogsRequest,
  fetchActivityLogsSuccess,
  fetchActivityLogsFailure,
  exportActivityLogsRequest,
  exportActivityLogsSuccess,
  exportActivityLogsFailure,
  fetchActivityLogDetailsRequest,
  fetchActivityLogDetailsSuccess,
  fetchActivityLogDetailsFailure
} from './activityLogSlice';

// Saga functions
function* fetchActivityLogsSaga(action) {
  try {
    // Get current filters from the state and merge with action payload
    const params = action.payload || { page: 1, limit: 10 };
    
    // If this is called from filter change, get the full filter set
    const filters = action.payload?.filters || {};
    
    // Build proper query parameters
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      level: params.level || filters.level,
      tenantName: params.tenantName || filters.tenantName,
      userEmail: params.userEmail || filters.userEmail,
      actionPerformed: params.actionPerformed || filters.actionPerformed
    };

    // Handle date range properly
    if (params.dateRange || filters.dateRange) {
      const dateRange = params.dateRange || filters.dateRange;
      if (dateRange.start) {
        queryParams['dateRange[start]'] = dateRange.start;
      }
      if (dateRange.end) {
        queryParams['dateRange[end]'] = dateRange.end;
      }
    }

    console.log('📡 fetchActivityLogsSaga triggered with params:', queryParams);

    const response = yield call(superAdminAPI.getActivityLogs, queryParams);
    console.log('✅ Activity logs API response received:', response);

    // Handle the response data
    const responseData = response.data || response;
    
    const validatedResponse = {
      logs: responseData.data || responseData.logs || [],
      pagination: responseData.pagination || {
        page: queryParams.page,
        limit: queryParams.limit,
        total: responseData.pagination?.total || 0,
        totalPages: responseData.pagination?.totalPages || Math.ceil((responseData.pagination?.total || 0) / queryParams.limit)
      }
    };

    console.log('📤 Dispatching activity logs success with:', validatedResponse);
    yield put(fetchActivityLogsSuccess(validatedResponse));
  } catch (error) {
    console.error('❌ Error in fetchActivityLogsSaga:', error);
    
    // Don't show error for 401 (token expired) as the API interceptor handles it
    if (error?.status === 401) {
      console.log('🔐 Token expired, letting API interceptor handle redirect');
      return;
    }
    
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch activity logs';
    yield put(fetchActivityLogsFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to load activity logs. Please try again.', 'error');
    }
  }
}

function* fetchActivityLogDetailsSaga(action) {
  try {
    const logId = action.payload;
    const response = yield call(superAdminAPI.getActivityLogs, { id: logId });
    const logDetails = response.data || response;
    yield put(fetchActivityLogDetailsSuccess(logDetails));
  } catch (error) {
    console.error('❌ Error in fetchActivityLogDetailsSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch activity log details';
    yield put(fetchActivityLogDetailsFailure(errorMessage));
  }
}

function* exportActivityLogsSaga(action) {
  try {
    const params = action.payload || {};
    const response = yield call(superAdminAPI.exportActivityLogs, params);

    // Handle blob response for CSV download
    if (response instanceof Blob) {
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `activity_logs_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } else {
      // Handle CSV string response
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `activity_logs_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }

    yield put(exportActivityLogsSuccess());

    if (window.showNotification) {
      window.showNotification('Activity logs exported successfully', 'success');
    }
  } catch (error) {
    console.error('❌ Error in exportActivityLogsSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to export activity logs';
    yield put(exportActivityLogsFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to export activity logs', 'error');
    }
  }
}

// Watcher sagas
function* watchFetchActivityLogs() {
  yield takeLatest(fetchActivityLogsRequest.type, fetchActivityLogsSaga);
}

function* watchFetchActivityLogDetails() {
  yield takeEvery(fetchActivityLogDetailsRequest.type, fetchActivityLogDetailsSaga);
}

function* watchExportActivityLogs() {
  yield takeEvery(exportActivityLogsRequest.type, exportActivityLogsSaga);
}

// Root saga
export default function* activityLogSaga() {
  yield all([
    fork(watchFetchActivityLogs),
    fork(watchFetchActivityLogDetails),
    fork(watchExportActivityLogs)
  ]);
}