import { call, put, takeEvery, takeLatest, all, fork } from 'redux-saga/effects';
import { paymentAPI, invoiceAPI, tenantAPI } from '../../utils/api';
import {
  fetchPaymentsRequest,
  fetchPaymentsSuccess,
  fetchPaymentsFailure,
  fetchInvoicesRequest,
  fetchInvoicesSuccess,
  fetchInvoicesFailure,
  fetchTenantsRequest,
  fetchTenantsSuccess,
  fetchTenantsFailure,
  markInvoicePaidRequest,
  markInvoicePaidSuccess,
  markInvoicePaidFailure,
  processRefundRequest,
  processRefundSuccess,
  processRefundFailure,
  exportPaymentsRequest,
  exportPaymentsSuccess,
  exportPaymentsFailure
} from './paymentSlice';

// Saga functions
function* fetchPaymentsSaga(action) {
  try {
    const params = action.payload || { page: 1, limit: 10 };
    console.log('📡 fetchPaymentsSaga triggered with params:', params);

    const response = yield call(paymentAPI.getAll, params);
    console.log('✅ Payments API response received:', response);

    const validatedResponse = {
      payments: response.payments || response.data || [],
      summary: {
        totalPayments: response.summary?.totalPayments || response.total || 0,
        totalAmount: response.summary?.totalAmount || 0,
        successfulPayments: response.summary?.successfulPayments || 0,
        failedPayments: response.summary?.failedPayments || 0,
        pendingRefunds: response.summary?.pendingRefunds || 0
      },
      pagination: response.pagination || {
        page: params.page || 1,
        limit: params.limit || 10,
        total: response.total || 0,
        totalPages: Math.ceil((response.total || 0) / (params.limit || 10))
      }
    };

    console.log('📤 Dispatching payments success with:', validatedResponse);
    yield put(fetchPaymentsSuccess(validatedResponse));
  } catch (error) {
    console.error('❌ Error in fetchPaymentsSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch payments';
    yield put(fetchPaymentsFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to load payments. Please try again.', 'error');
    }
  }
}

function* fetchInvoicesSaga(action) {
  try {
    const params = action.payload || { page: 1, limit: 10 };
    console.log('📡 fetchInvoicesSaga triggered with params:', params);

    const response = yield call(invoiceAPI.getAll, params);
    console.log('✅ Invoices API response received:', response);

    const responseData = response.data || response;
    const validatedResponse = {
      invoices: responseData.invoices || responseData.data || [],
      summary: {
        totalInvoices: responseData.summary?.totalInvoices || responseData.total || 0,
        totalPaid: responseData.summary?.totalPaid || 0,
        totalSent: responseData.summary?.totalSent || 0,
        totalOverdue: responseData.summary?.totalOverdue || 0
      },
      pagination: responseData.pagination || {
        page: params.page || 1,
        limit: params.limit || 10,
        total: responseData.total || 0,
        totalPages: Math.ceil((responseData.total || 0) / (params.limit || 10))
      }
    };

    console.log('📤 Dispatching invoices success with:', validatedResponse);
    yield put(fetchInvoicesSuccess(validatedResponse));
  } catch (error) {
    console.error('❌ Error in fetchInvoicesSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch invoices';
    yield put(fetchInvoicesFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to load invoices. Please try again.', 'error');
    }
  }
}

function* fetchTenantsSaga() {
  try {
    const response = yield call(tenantAPI.getAll, { limit: 100 });
    const responseData = response.data || response;
    const tenants = responseData.tenants || responseData.data || [];
    yield put(fetchTenantsSuccess(tenants));
  } catch (error) {
    console.error('❌ Error in fetchTenantsSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch tenants';
    yield put(fetchTenantsFailure(errorMessage));
  }
}

function* markInvoicePaidSaga(action) {
  try {
    console.log('🔧 markInvoicePaidSaga called with payload:', action.payload);
    const invoiceId = typeof action.payload === 'string' ? action.payload : action.payload?.invoiceId;
    console.log('📋 Invoice ID to mark as paid:', invoiceId);
    
    if (!invoiceId) {
      throw new Error('Invoice ID is required');
    }
    
    const response = yield call(invoiceAPI.markPaid, invoiceId);
    const responseData = response.data || response;
    const updatedInvoice = responseData.invoice || responseData;

    yield put(markInvoicePaidSuccess({
      invoiceId,
      updatedInvoice,
      paidDate: new Date().toISOString()
    }));

    // Refresh the invoices list to show updated status
    yield put(fetchInvoicesRequest({ 
      page: 1, 
      limit: 5, 
      tenantName: '', 
      status: '', 
      dateRange: { start: '', end: '' } 
    }));

    if (window.showNotification) {
      window.showNotification('Invoice marked as paid successfully', 'success');
    }
  } catch (error) {
    console.error('❌ Error in markInvoicePaidSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to mark invoice as paid';
    yield put(markInvoicePaidFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to mark invoice as paid', 'error');
    }
  }
}

function* processRefundSaga(action) {
  try {
    const { paymentId, refundData } = action.payload;
    const response = yield call(paymentAPI.processRefund, paymentId, refundData);
    const refundResult = response.data || response;

    yield put(processRefundSuccess({
      paymentId,
      refundResult
    }));

    if (window.showNotification) {
      window.showNotification('Refund processed successfully', 'success');
    }
  } catch (error) {
    console.error('❌ Error in processRefundSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to process refund';
    yield put(processRefundFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to process refund', 'error');
    }
  }
}

function* exportPaymentsSaga(action) {
  try {
    const params = action.payload || {};
    const response = yield call(paymentAPI.exportPayments, params);

    // Handle blob response for CSV download
    const blob = new Blob([response], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payments_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    yield put(exportPaymentsSuccess());

    if (window.showNotification) {
      window.showNotification('Payments exported successfully', 'success');
    }
  } catch (error) {
    console.error('❌ Error in exportPaymentsSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to export payments';
    yield put(exportPaymentsFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to export payments', 'error');
    }
  }
}

// Watcher sagas
function* watchFetchPayments() {
  yield takeLatest(fetchPaymentsRequest.type, fetchPaymentsSaga);
}

function* watchFetchInvoices() {
  yield takeLatest(fetchInvoicesRequest.type, fetchInvoicesSaga);
}

function* watchFetchTenants() {
  yield takeLatest(fetchTenantsRequest.type, fetchTenantsSaga);
}

function* watchMarkInvoicePaid() {
  yield takeEvery(markInvoicePaidRequest.type, markInvoicePaidSaga);
}

function* watchProcessRefund() {
  yield takeEvery(processRefundRequest.type, processRefundSaga);
}

function* watchExportPayments() {
  yield takeEvery(exportPaymentsRequest.type, exportPaymentsSaga);
}

// Root saga
export default function* paymentSaga() {
  yield all([
    fork(watchFetchPayments),
    fork(watchFetchInvoices),
    fork(watchFetchTenants),
    fork(watchMarkInvoicePaid),
    fork(watchProcessRefund),
    fork(watchExportPayments)
  ]);
}