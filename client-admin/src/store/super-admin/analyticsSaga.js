import { call, put, takeEvery, takeLatest, all, fork } from 'redux-saga/effects';
import { superAdminAPI, api } from '../../utils/api';
import {
  fetchAnalyticsRequest,
  fetchAnalyticsSuccess,
  fetchAnalyticsFailure,
  fetchDashboardStatsRequest,
  fetchDashboardStatsSuccess,
  fetchDashboardStatsFailure,
  fetchTenantAnalyticsRequest,
  fetchTenantAnalyticsSuccess,
  fetchTenantAnalyticsFailure,
  fetchDashboardMetricsRequest,
  fetchDashboardMetricsSuccess,
  fetchDashboardMetricsFailure,
  fetchChartsDataRequest,
  fetchChartsDataSuccess,
  fetchChartsDataFailure,
  fetchTrendDataRequest,
  fetchTrendDataSuccess,
  fetchTrendDataFailure,
  fetchDetailedAnalyticsRequest,
  fetchDetailedAnalyticsSuccess,
  fetchDetailedAnalyticsFailure,
  exportAnalyticsRequest,
  exportAnalyticsSuccess,
  exportAnalyticsFailure
} from './analyticsSlice';

// Saga functions
function* fetchAnalyticsSaga(action) {
  try {
    const params = action.payload || {};
    console.log('📡 fetchAnalyticsSaga triggered with params:', params);

    const response = yield call(superAdminAPI.getAnalytics, params);
    console.log('✅ Analytics API response received:', response);

    const analytics = response.analytics || response.data || response;
    yield put(fetchAnalyticsSuccess(analytics));
  } catch (error) {
    console.error('❌ Error in fetchAnalyticsSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch analytics data';
    yield put(fetchAnalyticsFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to load analytics data. Please try again.', 'error');
    }
  }
}

function* fetchDashboardStatsSaga() {
  try {
    console.log('📡 fetchDashboardStatsSaga triggered');

    const response = yield call(superAdminAPI.getDashboardStats);
    console.log('✅ Dashboard stats API response received:', response);

    const stats = response.stats || response.data || response;
    yield put(fetchDashboardStatsSuccess(stats));
  } catch (error) {
    console.error('❌ Error in fetchDashboardStatsSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch dashboard statistics';
    yield put(fetchDashboardStatsFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to load dashboard statistics. Please try again.', 'error');
    }
  }
}

function* fetchTenantAnalyticsSaga(action) {
  try {
    const { tenantId, params } = action.payload;
    console.log('📡 fetchTenantAnalyticsSaga triggered for tenant:', tenantId, 'with params:', params);

    const response = yield call(superAdminAPI.getTenantAnalytics, tenantId, params || {});
    console.log('✅ Tenant analytics API response received:', response);

    const tenantAnalytics = response.analytics || response.data || response;
    yield put(fetchTenantAnalyticsSuccess({
      tenantId,
      analytics: tenantAnalytics
    }));
  } catch (error) {
    console.error('❌ Error in fetchTenantAnalyticsSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch tenant analytics';
    yield put(fetchTenantAnalyticsFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to load tenant analytics. Please try again.', 'error');
    }
  }
}

// Dashboard Metrics Saga
function* fetchDashboardMetricsSaga(action) {
  try {
    const params = action.payload || {};
    console.log('📡 fetchDashboardMetricsSaga triggered with params:', params);

    const response = yield call(superAdminAPI.getDashboardStats);
    console.log('✅ Dashboard metrics API response received:', response);

    const metrics = response.data || response;
    yield put(fetchDashboardMetricsSuccess(metrics));
  } catch (error) {
    console.error('❌ Error in fetchDashboardMetricsSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch dashboard metrics';
    yield put(fetchDashboardMetricsFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to load dashboard metrics. Please try again.', 'error');
    }
  }
}

// Charts Data Saga
function* fetchChartsDataSaga(action) {
  try {
    const params = action.payload || {};
    console.log('📡 fetchChartsDataSaga triggered with params:', params);

    const response = yield call(superAdminAPI.getAnalytics, params);
    console.log('✅ Charts data API response received:', response);

    const chartsData = response.data || response;
    yield put(fetchChartsDataSuccess(chartsData));
  } catch (error) {
    console.error('❌ Error in fetchChartsDataSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch charts data';
    yield put(fetchChartsDataFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to load charts data. Please try again.', 'error');
    }
  }
}

// Trend Data Saga
function* fetchTrendDataSaga(action) {
  try {
    const params = action.payload || {};
    console.log('📡 fetchTrendDataSaga triggered with params:', params);

    const response = yield call(superAdminAPI.getAnalytics, params);
    console.log('✅ Trend data API response received:', response);

    const trendData = response.data || response;
    yield put(fetchTrendDataSuccess(trendData));
  } catch (error) {
    console.error('❌ Error in fetchTrendDataSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch trend data';
    yield put(fetchTrendDataFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to load trend data. Please try again.', 'error');
    }
  }
}

// Detailed Analytics Saga
function* fetchDetailedAnalyticsSaga(action) {
  try {
    const params = action.payload || {};
    console.log('📡 fetchDetailedAnalyticsSaga triggered with params:', params);

    // Use the detailed analytics endpoint
    const response = yield call(api.get, '/super-admin/analytics/detailed', { params });
    console.log('✅ Detailed analytics API response received:', response);

    const detailedData = response.data || response;
    yield put(fetchDetailedAnalyticsSuccess(detailedData));
  } catch (error) {
    console.error('❌ Error in fetchDetailedAnalyticsSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch detailed analytics';
    yield put(fetchDetailedAnalyticsFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to load detailed analytics. Please try again.', 'error');
    }
  }
}

function* exportAnalyticsSaga(action) {
  try {
    const params = action.payload || {};
    console.log('📡 exportAnalyticsSaga triggered with params:', params);

    const response = yield call(superAdminAPI.exportAnalytics, params);

    // Handle blob response for CSV/Excel download
    if (response instanceof Blob) {
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } else {
      // Handle CSV string response
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }

    yield put(exportAnalyticsSuccess());

    if (window.showNotification) {
      window.showNotification('Analytics data exported successfully', 'success');
    }
  } catch (error) {
    console.error('❌ Error in exportAnalyticsSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to export analytics data';
    yield put(exportAnalyticsFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to export analytics data', 'error');
    }
  }
}

// Watcher sagas
function* watchFetchAnalytics() {
  yield takeLatest(fetchAnalyticsRequest.type, fetchAnalyticsSaga);
}

function* watchFetchDashboardStats() {
  yield takeLatest(fetchDashboardStatsRequest.type, fetchDashboardStatsSaga);
}

function* watchFetchTenantAnalytics() {
  yield takeEvery(fetchTenantAnalyticsRequest.type, fetchTenantAnalyticsSaga);
}

function* watchExportAnalytics() {
  yield takeEvery(exportAnalyticsRequest.type, exportAnalyticsSaga);
}

// Watcher sagas for new actions
function* watchFetchDashboardMetrics() {
  yield takeLatest(fetchDashboardMetricsRequest.type, fetchDashboardMetricsSaga);
}

function* watchFetchChartsData() {
  yield takeLatest(fetchChartsDataRequest.type, fetchChartsDataSaga);
}

function* watchFetchTrendData() {
  yield takeLatest(fetchTrendDataRequest.type, fetchTrendDataSaga);
}

function* watchFetchDetailedAnalytics() {
  yield takeLatest(fetchDetailedAnalyticsRequest.type, fetchDetailedAnalyticsSaga);
}

// Root saga
export default function* analyticsSaga() {
  yield all([
    fork(watchFetchAnalytics),
    fork(watchFetchDashboardStats),
    fork(watchFetchTenantAnalytics),
    fork(watchFetchDashboardMetrics),
    fork(watchFetchChartsData),
    fork(watchFetchTrendData),
    fork(watchFetchDetailedAnalytics),
    fork(watchExportAnalytics)
  ]);
}