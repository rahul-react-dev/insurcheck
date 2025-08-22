import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import {
  fetchComplianceAnalyticsRequest,
  fetchComplianceAnalyticsSuccess,
  fetchComplianceAnalyticsFailure,
  fetchComplianceTrendsRequest,
  fetchComplianceTrendsSuccess,
  fetchComplianceTrendsFailure,
  fetchComplianceChartsRequest,
  fetchComplianceChartsSuccess,
  fetchComplianceChartsFailure,
  exportComplianceAnalyticsRequest,
  exportComplianceAnalyticsSuccess,
  exportComplianceAnalyticsFailure
} from './complianceAnalyticsSlice';

// Toast notification helper
function* showToastNotification(type, title, message) {
  // We'll dispatch this to a global toast state or use window notification function
  if (window.showToast) {
    window.showToast(type, title, message);
  }
}

// API calls
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('adminToken');
  const response = await fetch(`/api/admin${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP ${response.status}`);
  }

  return response.json();
};

// Fetch compliance analytics
function* fetchComplianceAnalyticsSaga(action) {
  try {
    const params = new URLSearchParams();
    
    if (action.payload) {
      Object.entries(action.payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (key === 'dateRange' && value) {
            params.append('startDate', value.start);
            params.append('endDate', value.end);
          } else {
            params.append(key, value);
          }
        }
      });
    }

    const response = yield call(apiCall, `/compliance-analytics?${params.toString()}`);
    
    if (response.success) {
      yield put(fetchComplianceAnalyticsSuccess(response.data));
      yield call(showToastNotification, 'success', 'Success', 'Analytics data loaded successfully');
    } else {
      const errorMessage = response.message || 'Failed to fetch analytics';
      yield put(fetchComplianceAnalyticsFailure(errorMessage));
      yield call(showToastNotification, 'error', 'Error', errorMessage);
    }
  } catch (error) {
    const errorMessage = error.message || 'Failed to fetch analytics';
    yield put(fetchComplianceAnalyticsFailure(errorMessage));
    yield call(showToastNotification, 'error', 'Error', errorMessage);
  }
}

// Fetch compliance trends
function* fetchComplianceTrendsSaga(action) {
  try {
    const params = new URLSearchParams();
    
    if (action.payload) {
      Object.entries(action.payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (key === 'dateRange' && value) {
            params.append('startDate', value.start);
            params.append('endDate', value.end);
          } else {
            params.append(key, value);
          }
        }
      });
    }

    const response = yield call(apiCall, `/compliance-analytics/trends?${params.toString()}`);
    
    if (response.success) {
      yield put(fetchComplianceTrendsSuccess(response.data));
      yield call(showToastNotification, 'success', 'Success', 'Trends data loaded successfully');
    } else {
      const errorMessage = response.message || 'Failed to fetch trends';
      yield put(fetchComplianceTrendsFailure(errorMessage));
      yield call(showToastNotification, 'error', 'Error', errorMessage);
    }
  } catch (error) {
    const errorMessage = error.message || 'Failed to fetch trends';
    yield put(fetchComplianceTrendsFailure(errorMessage));
    yield call(showToastNotification, 'error', 'Error', errorMessage);
  }
}

// Fetch compliance charts
function* fetchComplianceChartsSaga(action) {
  try {
    const params = new URLSearchParams();
    
    if (action.payload) {
      Object.entries(action.payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (key === 'dateRange' && value) {
            params.append('startDate', value.start);
            params.append('endDate', value.end);
          } else {
            params.append(key, value);
          }
        }
      });
    }

    const response = yield call(apiCall, `/compliance-analytics/charts?${params.toString()}`);
    
    if (response.success) {
      yield put(fetchComplianceChartsSuccess(response.data));
      yield call(showToastNotification, 'success', 'Success', 'Chart data loaded successfully');
    } else {
      const errorMessage = response.message || 'Failed to fetch charts';
      yield put(fetchComplianceChartsFailure(errorMessage));
      yield call(showToastNotification, 'error', 'Error', errorMessage);
    }
  } catch (error) {
    const errorMessage = error.message || 'Failed to fetch charts';
    yield put(fetchComplianceChartsFailure(errorMessage));
    yield call(showToastNotification, 'error', 'Error', errorMessage);
  }
}

// Export compliance analytics
function* exportComplianceAnalyticsSaga(action) {
  try {
    const { format, ...filters } = action.payload || {};
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (key === 'dateRange' && value) {
            params.append('startDate', value.start);
            params.append('endDate', value.end);
          } else {
            params.append(key, value);
          }
        }
      });
    }
    
    params.append('format', format || 'png');

    const token = localStorage.getItem('adminToken');
    const response = yield call(fetch, `/api/admin/compliance-analytics/export?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to export analytics');
    }

    // Handle file download
    const blob = yield call([response, 'blob']);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    link.download = `compliance-analytics-${timestamp}.${format}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    yield put(exportComplianceAnalyticsSuccess());
    yield call(showToastNotification, 'success', 'Export Complete', `Analytics exported as ${format.toUpperCase()} successfully`);
  } catch (error) {
    const errorMessage = error.message || 'Failed to export analytics';
    yield put(exportComplianceAnalyticsFailure(errorMessage));
    yield call(showToastNotification, 'error', 'Export Failed', errorMessage);
  }
}

// Root saga
export default function* complianceAnalyticsSaga() {
  yield takeLatest(fetchComplianceAnalyticsRequest.type, fetchComplianceAnalyticsSaga);
  yield takeLatest(fetchComplianceTrendsRequest.type, fetchComplianceTrendsSaga);
  yield takeLatest(fetchComplianceChartsRequest.type, fetchComplianceChartsSaga);
  yield takeEvery(exportComplianceAnalyticsRequest.type, exportComplianceAnalyticsSaga);
}