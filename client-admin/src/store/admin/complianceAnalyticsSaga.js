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
    } else {
      yield put(fetchComplianceAnalyticsFailure(response.message || 'Failed to fetch analytics'));
    }
  } catch (error) {
    yield put(fetchComplianceAnalyticsFailure(error.message || 'Failed to fetch analytics'));
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
    } else {
      yield put(fetchComplianceTrendsFailure(response.message || 'Failed to fetch trends'));
    }
  } catch (error) {
    yield put(fetchComplianceTrendsFailure(error.message || 'Failed to fetch trends'));
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
    } else {
      yield put(fetchComplianceChartsFailure(response.message || 'Failed to fetch charts'));
    }
  } catch (error) {
    yield put(fetchComplianceChartsFailure(error.message || 'Failed to fetch charts'));
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
  } catch (error) {
    yield put(exportComplianceAnalyticsFailure(error.message || 'Failed to export analytics'));
  }
}

// Root saga
export default function* complianceAnalyticsSaga() {
  yield takeLatest(fetchComplianceAnalyticsRequest.type, fetchComplianceAnalyticsSaga);
  yield takeLatest(fetchComplianceTrendsRequest.type, fetchComplianceTrendsSaga);
  yield takeLatest(fetchComplianceChartsRequest.type, fetchComplianceChartsSaga);
  yield takeEvery(exportComplianceAnalyticsRequest.type, exportComplianceAnalyticsSaga);
}