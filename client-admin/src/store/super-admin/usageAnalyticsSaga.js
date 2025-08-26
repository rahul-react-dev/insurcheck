import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { apiRequest } from '../../utils/api';
import {
  fetchUsageAnalyticsRequest,
  fetchUsageAnalyticsSuccess,
  fetchUsageAnalyticsFailure,
  fetchComplianceAnalyticsRequest,
  fetchComplianceAnalyticsSuccess,
  fetchComplianceAnalyticsFailure,
  exportUsageReportRequest,
  exportUsageReportSuccess,
  exportUsageReportFailure
} from './usageAnalyticsSlice';

// Usage Analytics Saga
function* fetchUsageAnalyticsSaga(action) {
  try {
    const { filters } = action.payload || {};
    
    const queryParams = new URLSearchParams();
    if (filters?.dateRange?.start) queryParams.append('startDate', filters.dateRange.start);
    if (filters?.dateRange?.end) queryParams.append('endDate', filters.dateRange.end);
    if (filters?.tenantName) queryParams.append('tenantName', filters.tenantName);
    if (filters?.viewType) queryParams.append('viewType', filters.viewType);

    const response = yield call(apiRequest, {
      method: 'GET',
      endpoint: `/api/super-admin/usage-analytics?${queryParams.toString()}`
    });

    if (response.success) {
      yield put(fetchUsageAnalyticsSuccess({
        metrics: response.data.metrics,
        monthlyDocs: response.data.monthlyDocs
      }));
    } else {
      yield put(fetchUsageAnalyticsFailure(response.message || 'Failed to fetch usage analytics'));
    }
  } catch (error) {
    console.error('Error in fetchUsageAnalyticsSaga:', error);
    yield put(fetchUsageAnalyticsFailure(error.message || 'An unexpected error occurred'));
  }
}

// Compliance Analytics Saga
function* fetchComplianceAnalyticsSaga(action) {
  try {
    const { filters } = action.payload || {};
    
    const queryParams = new URLSearchParams();
    if (filters?.dateRange?.start) queryParams.append('startDate', filters.dateRange.start);
    if (filters?.dateRange?.end) queryParams.append('endDate', filters.dateRange.end);
    if (filters?.tenantName) queryParams.append('tenantName', filters.tenantName);
    if (filters?.viewType) queryParams.append('viewType', filters.viewType);

    const response = yield call(apiRequest, {
      method: 'GET',
      endpoint: `/api/super-admin/compliance-analytics?${queryParams.toString()}`
    });

    if (response.success) {
      yield put(fetchComplianceAnalyticsSuccess({
        metrics: response.data.metrics,
        complianceTrends: response.data.complianceTrends
      }));
    } else {
      yield put(fetchComplianceAnalyticsFailure(response.message || 'Failed to fetch compliance analytics'));
    }
  } catch (error) {
    console.error('Error in fetchComplianceAnalyticsSaga:', error);
    yield put(fetchComplianceAnalyticsFailure(error.message || 'An unexpected error occurred'));
  }
}

// Export Report Saga
function* exportUsageReportSaga(action) {
  try {
    const { filters, includeCharts, format } = action.payload || {};
    
    const response = yield call(apiRequest, {
      method: 'POST',
      endpoint: '/api/super-admin/usage-analytics/export',
      data: {
        filters,
        includeCharts: includeCharts || true,
        format: format || 'pdf'
      }
    });

    if (response.success) {
      // Trigger download
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `usage-analytics-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      yield put(exportUsageReportSuccess());
    } else {
      yield put(exportUsageReportFailure(response.message || 'Failed to export usage report'));
    }
  } catch (error) {
    console.error('Error in exportUsageReportSaga:', error);
    yield put(exportUsageReportFailure(error.message || 'An unexpected error occurred'));
  }
}

// Root Saga
export function* usageAnalyticsSaga() {
  yield takeLatest(fetchUsageAnalyticsRequest.type, fetchUsageAnalyticsSaga);
  yield takeLatest(fetchComplianceAnalyticsRequest.type, fetchComplianceAnalyticsSaga);
  yield takeEvery(exportUsageReportRequest.type, exportUsageReportSaga);
}

export default usageAnalyticsSaga;