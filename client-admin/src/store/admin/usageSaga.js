import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import {
  fetchUsageAnalyticsRequest,
  fetchUsageAnalyticsSuccess,
  fetchUsageAnalyticsFailure,
  
  fetchUsageLimitsRequest,
  fetchUsageLimitsSuccess,
  fetchUsageLimitsFailure,
  
  fetchBillingSummaryRequest,
  fetchBillingSummarySuccess,
  fetchBillingSummaryFailure,
  
  exportUsageDataRequest,
  exportUsageDataSuccess,
  exportUsageDataFailure,
  
  trackUsageEventRequest,
  trackUsageEventSuccess,
  trackUsageEventFailure,
  
  calculateUsageBillingRequest,
  calculateUsageBillingSuccess,
  calculateUsageBillingFailure
} from './usageSlice';

// API base URL
const API_BASE_URL = '/api';

// Helper function to make authenticated API requests
function* makeAuthenticatedRequest(url, options = {}) {
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  const requestOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  const response = yield call(fetch, `${API_BASE_URL}${url}`, requestOptions);
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
      throw new Error('Authentication failed');
    }
    
    const errorData = yield call([response, 'json']);
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return yield call([response, 'json']);
}

// Fetch Usage Analytics Saga
function* fetchUsageAnalyticsSaga(action) {
  try {
    const { filters = {} } = action.payload || {};
    
    // Build query parameters
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.eventType) params.append('eventType', filters.eventType);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const url = `/usage/analytics${params.toString() ? `?${params}` : ''}`;
    const response = yield call(makeAuthenticatedRequest, url);
    
    yield put(fetchUsageAnalyticsSuccess(response.data));
  } catch (error) {
    console.error('❌ Fetch usage analytics failed:', error);
    yield put(fetchUsageAnalyticsFailure(error.message));
  }
}

// Fetch Usage Limits Saga
function* fetchUsageLimitsSaga(action) {
  try {
    const response = yield call(makeAuthenticatedRequest, '/usage/limits');
    yield put(fetchUsageLimitsSuccess(response.data));
  } catch (error) {
    console.error('❌ Fetch usage limits failed:', error);
    yield put(fetchUsageLimitsFailure(error.message));
  }
}

// Fetch Billing Summary Saga
function* fetchBillingSummarySaga(action) {
  try {
    const { billingPeriod = {} } = action.payload || {};
    
    // Build query parameters
    const params = new URLSearchParams();
    
    if (billingPeriod.start) {
      params.append('billingPeriodStart', billingPeriod.start);
    }
    if (billingPeriod.end) {
      params.append('billingPeriodEnd', billingPeriod.end);
    }

    const url = `/billing/summary${params.toString() ? `?${params}` : ''}`;
    const response = yield call(makeAuthenticatedRequest, url);
    
    yield put(fetchBillingSummarySuccess(response.data));
  } catch (error) {
    console.error('❌ Fetch billing summary failed:', error);
    yield put(fetchBillingSummaryFailure(error.message));
  }
}

// Export Usage Data Saga
function* exportUsageDataSaga(action) {
  try {
    const { format = 'csv', filters = {} } = action.payload || {};
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('format', format);
    
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.eventType) params.append('eventType', filters.eventType);
    if (filters.includeDetails !== undefined) {
      params.append('includeDetails', filters.includeDetails.toString());
    }

    const token = localStorage.getItem('adminToken');
    const url = `/usage/export?${params}`;
    
    // Use fetch directly for file downloads
    const response = yield call(fetch, `${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = yield call([response, 'json']);
      throw new Error(errorData.message || 'Export failed');
    }

    // Download the file
    const blob = yield call([response, 'blob']);
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    
    // Get filename from response headers or create default
    const contentDisposition = response.headers.get('content-disposition');
    let filename = `usage-data-${new Date().toISOString().split('T')[0]}.${format}`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch) filename = filenameMatch[1];
    }
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
    
    yield put(exportUsageDataSuccess());
  } catch (error) {
    console.error('❌ Export usage data failed:', error);
    yield put(exportUsageDataFailure(error.message));
  }
}

// Track Usage Event Saga (for manual tracking)
function* trackUsageEventSaga(action) {
  try {
    const { eventType, resourceId, quantity = 1, metadata = {} } = action.payload;
    
    const response = yield call(makeAuthenticatedRequest, '/usage/track', {
      method: 'POST',
      body: JSON.stringify({
        eventType,
        resourceId,
        quantity,
        metadata
      })
    });
    
    yield put(trackUsageEventSuccess());
    console.log('📊 Usage event tracked:', response.data);
  } catch (error) {
    console.error('❌ Track usage event failed:', error);
    yield put(trackUsageEventFailure(error.message));
  }
}

// Calculate Usage Billing Saga
function* calculateUsageBillingSaga(action) {
  try {
    const { 
      billingPeriodStart, 
      billingPeriodEnd, 
      generateInvoice = false 
    } = action.payload;
    
    const response = yield call(makeAuthenticatedRequest, '/billing/calculate-usage', {
      method: 'POST',
      body: JSON.stringify({
        billingPeriodStart,
        billingPeriodEnd,
        generateInvoice
      })
    });
    
    yield put(calculateUsageBillingSuccess(response.data));
  } catch (error) {
    console.error('❌ Calculate usage billing failed:', error);
    yield put(calculateUsageBillingFailure(error.message));
  }
}

// Watcher Sagas
function* usageSaga() {
  yield takeLatest(fetchUsageAnalyticsRequest.type, fetchUsageAnalyticsSaga);
  yield takeLatest(fetchUsageLimitsRequest.type, fetchUsageLimitsSaga);
  yield takeLatest(fetchBillingSummaryRequest.type, fetchBillingSummarySaga);
  yield takeEvery(exportUsageDataRequest.type, exportUsageDataSaga);
  yield takeEvery(trackUsageEventRequest.type, trackUsageEventSaga);
  yield takeLatest(calculateUsageBillingRequest.type, calculateUsageBillingSaga);
}

export default usageSaga;