import { call, put, takeEvery, takeLatest, all, fork } from 'redux-saga/effects';
import { superAdminAPI } from '../../utils/api';
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

// Root saga
export default function* analyticsSaga() {
  yield all([
    fork(watchFetchAnalytics),
    fork(watchFetchDashboardStats),
    fork(watchFetchTenantAnalytics),
    fork(watchExportAnalytics)
  ]);
}