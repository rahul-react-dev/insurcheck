import { call, put, takeEvery } from 'redux-saga/effects';
import { adminAuthApi } from '../../utils/api';
import {
  // Fetch invoices
  fetchInvoicesRequest,
  fetchInvoicesSuccess,
  fetchInvoicesFailure,
  
  // Fetch invoice details
  fetchInvoiceDetailsRequest,
  fetchInvoiceDetailsSuccess,
  fetchInvoiceDetailsFailure,
  
  // Process payment
  processPaymentRequest,
  processPaymentSuccess,
  processPaymentFailure,
  
  // Download receipt
  downloadReceiptRequest,
  downloadReceiptSuccess,
  downloadReceiptFailure,
  
  // Export invoices
  exportInvoicesRequest,
  exportInvoicesSuccess,
  exportInvoicesFailure,
  
  // Invoice statistics
  fetchInvoiceStatsRequest,
  fetchInvoiceStatsSuccess,
  fetchInvoiceStatsFailure,
} from './invoicesSlice';

// Fetch invoices saga
function* fetchInvoicesSaga(action) {
  try {
    const response = yield call(
      adminAuthApi.getInvoices,
      action.payload
    );
    // Backend returns { success: true, invoices: [...], meta: {...} }
    yield put(fetchInvoicesSuccess({
      invoices: response.invoices || [],
      meta: response.meta || {}
    }));
  } catch (error) {
    const errorData = JSON.parse(error.message || '{}');
    yield put(fetchInvoicesFailure(errorData.message || 'Failed to fetch invoices'));
  }
}

// Fetch invoice details saga
function* fetchInvoiceDetailsSaga(action) {
  try {
    const response = yield call(
      adminAuthApi.getInvoiceDetails,
      action.payload.invoiceId
    );
    yield put(fetchInvoiceDetailsSuccess(response.data));
  } catch (error) {
    const errorData = JSON.parse(error.message || '{}');
    yield put(fetchInvoiceDetailsFailure(errorData.message || 'Failed to fetch invoice details'));
  }
}

// Process payment saga
function* processPaymentSaga(action) {
  try {
    const response = yield call(
      adminAuthApi.processPayment,
      action.payload
    );
    yield put(processPaymentSuccess(response.data));
  } catch (error) {
    const errorData = JSON.parse(error.message || '{}');
    yield put(processPaymentFailure(errorData.message || 'Payment failed. Please try again.'));
  }
}

// Download receipt saga
function* downloadReceiptSaga(action) {
  try {
    const response = yield call(
      adminAuthApi.downloadReceipt,
      action.payload.invoiceId
    );
    
    // Create blob and download
    const blob = new Blob([response], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${action.payload.invoiceId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    yield put(downloadReceiptSuccess());
  } catch (error) {
    const errorData = JSON.parse(error.message || '{}');
    yield put(downloadReceiptFailure(errorData.message || 'Failed to download receipt. Please try again.'));
  }
}

// Export invoices saga
function* exportInvoicesSaga(action) {
  try {
    const response = yield call(
      adminAuthApi.exportInvoices,
      action.payload.format,
      action.payload.filters
    );
    
    // Create blob and download
    const blob = new Blob([response], { 
      type: action.payload.format === 'pdf' ? 'application/pdf' : 
            action.payload.format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
            'text/csv'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const extension = action.payload.format === 'xlsx' ? 'xlsx' : action.payload.format;
    link.download = `Invoices_${timestamp}.${extension}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    yield put(exportInvoicesSuccess());
  } catch (error) {
    const errorData = JSON.parse(error.message || '{}');
    yield put(exportInvoicesFailure(errorData.message || `Failed to export ${action.payload.format.toUpperCase()}. Please try again.`));
  }
}

// Fetch invoice statistics saga
function* fetchInvoiceStatsSaga(action) {
  try {
    const response = yield call(adminAuthApi.getInvoiceStats);
    // Backend returns { success: true, data: {...} }
    yield put(fetchInvoiceStatsSuccess(response.data));
  } catch (error) {
    const errorData = JSON.parse(error.message || '{}');
    yield put(fetchInvoiceStatsFailure(errorData.message || 'Failed to fetch invoice statistics'));
  }
}

// Watcher saga
function* invoicesSaga() {
  yield takeEvery(fetchInvoicesRequest.type, fetchInvoicesSaga);
  yield takeEvery(fetchInvoiceDetailsRequest.type, fetchInvoiceDetailsSaga);
  yield takeEvery(processPaymentRequest.type, processPaymentSaga);
  yield takeEvery(downloadReceiptRequest.type, downloadReceiptSaga);
  yield takeEvery(exportInvoicesRequest.type, exportInvoicesSaga);
  yield takeEvery(fetchInvoiceStatsRequest.type, fetchInvoiceStatsSaga);
}

export default invoicesSaga;