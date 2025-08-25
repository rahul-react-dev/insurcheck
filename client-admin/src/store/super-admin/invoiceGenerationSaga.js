
import { call, put, takeEvery, takeLatest, all, fork } from 'redux-saga/effects';
import { superAdminAPI } from '../../utils/api';
import {
  generateInvoiceRequest,
  generateInvoiceSuccess,
  generateInvoiceFailure,
  generateAllInvoicesRequest,
  generateAllInvoicesSuccess,
  generateAllInvoicesFailure,
  fetchInvoiceLogsRequest,
  fetchInvoiceLogsSuccess,
  fetchInvoiceLogsFailure,
  updateInvoiceConfigRequest,
  updateInvoiceConfigSuccess,
  updateInvoiceConfigFailure,
  fetchInvoiceConfigRequest,
  fetchInvoiceConfigSuccess,
  fetchInvoiceConfigFailure,
  retryInvoiceGenerationRequest,
  retryInvoiceGenerationSuccess,
  retryInvoiceGenerationFailure,
  downloadInvoiceRequest,
  downloadInvoiceSuccess,
  downloadInvoiceFailure
} from './invoiceGenerationSlice';

// Saga functions
function* generateInvoiceSaga(action) {
  try {
    const tenantId = action.payload;
    console.log('📡 generateInvoiceSaga triggered for tenant:', tenantId);

    const response = yield call(superAdminAPI.generateInvoice, tenantId);
    console.log('✅ Generate invoice API response received:', response);

    yield put(generateInvoiceSuccess(response));

    if (window.showNotification) {
      window.showNotification(response.message || 'Invoice generation started successfully', 'success');
    }

    // Refresh invoice logs after generation
    yield put(fetchInvoiceLogsRequest({ page: 1, limit: 5 }));
  } catch (error) {
    console.error('❌ Error in generateInvoiceSaga:', error);
    const errorMessage = error?.message || 'Failed to generate invoice';
    yield put(generateInvoiceFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification(errorMessage, 'error');
    }
  }
}

function* generateAllInvoicesSaga(action) {
  try {
    console.log('📡 generateAllInvoicesSaga triggered');

    const response = yield call(superAdminAPI.generateAllInvoices);
    console.log('✅ Generate all invoices API response received:', response);

    yield put(generateAllInvoicesSuccess(response));

    if (window.showNotification) {
      window.showNotification(response.message || 'Invoice generation started for all active tenants', 'success');
    }

    // Refresh invoice logs after generation
    yield put(fetchInvoiceLogsRequest({ page: 1, limit: 5 }));
  } catch (error) {
    console.error('❌ Error in generateAllInvoicesSaga:', error);
    const errorMessage = error?.message || 'Failed to generate invoices for all tenants';
    yield put(generateAllInvoicesFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification(errorMessage, 'error');
    }
  }
}

function* fetchInvoiceLogsSaga(action) {
  try {
    const params = action.payload || { page: 1, limit: 10 };
    console.log('📡 fetchInvoiceLogsSaga triggered with params:', params);

    const response = yield call(superAdminAPI.getInvoiceLogs, params);
    console.log('✅ Invoice logs API response received:', response);

    yield put(fetchInvoiceLogsSuccess(response));
  } catch (error) {
    console.error('❌ Error in fetchInvoiceLogsSaga:', error);
    const errorMessage = error?.message || 'Failed to fetch invoice logs';
    yield put(fetchInvoiceLogsFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification(errorMessage, 'error');
    }
  }
}

function* fetchInvoiceConfigSaga() {
  try {
    console.log('📡 fetchInvoiceConfigSaga triggered');

    const response = yield call(superAdminAPI.getInvoiceConfig);
    console.log('✅ Invoice config API response received:', response);

    yield put(fetchInvoiceConfigSuccess(response));
  } catch (error) {
    console.error('❌ Error in fetchInvoiceConfigSaga:', error);
    const errorMessage = error?.message || 'Failed to fetch invoice configuration';
    yield put(fetchInvoiceConfigFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification(errorMessage, 'error');
    }
  }
}

function* updateInvoiceConfigSaga(action) {
  try {
    const { tenantId, config } = action.payload;
    console.log('📡 updateInvoiceConfigSaga triggered with:', { tenantId, config });

    const response = yield call(superAdminAPI.updateInvoiceConfig, { tenantId, ...config });
    console.log('✅ Update invoice config API response received:', response);
    
    yield put(updateInvoiceConfigSuccess(response));

    if (window.showNotification) {
      window.showNotification('Invoice configuration updated successfully', 'success');
    }

    // Refresh configurations to get latest data
    yield put(fetchInvoiceConfigRequest());
  } catch (error) {
    console.error('❌ Error in updateInvoiceConfigSaga:', error);
    const errorMessage = error?.message || 'Failed to update invoice configuration';
    yield put(updateInvoiceConfigFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification(errorMessage, 'error');
    }
  }
}

function* retryInvoiceGenerationSaga(action) {
  try {
    const logId = action.payload;
    console.log('📡 retryInvoiceGenerationSaga triggered for log:', logId);

    const response = yield call(superAdminAPI.retryInvoiceGeneration, logId);
    console.log('✅ Retry invoice generation API response received:', response);

    yield put(retryInvoiceGenerationSuccess(response));

    if (window.showNotification) {
      window.showNotification('Invoice generation retry started successfully', 'success');
    }

    // Refresh logs after retry
    yield put(fetchInvoiceLogsRequest({ page: 1, limit: 5 }));
  } catch (error) {
    console.error('❌ Error in retryInvoiceGenerationSaga:', error);
    const errorMessage = error?.message || 'Failed to retry invoice generation';
    yield put(retryInvoiceGenerationFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification(errorMessage, 'error');
    }
  }
}

function* downloadInvoiceSaga(action) {
  try {
    const invoiceId = action.payload;
    console.log('📡 downloadInvoiceSaga triggered for invoice:', invoiceId);

    const response = yield call(superAdminAPI.downloadInvoice, invoiceId);

    // Handle blob response for PDF download
    if (response instanceof Blob) {
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }

    yield put(downloadInvoiceSuccess(invoiceId));

    if (window.showNotification) {
      window.showNotification('Invoice downloaded successfully', 'success');
    }
  } catch (error) {
    console.error('❌ Error in downloadInvoiceSaga:', error);
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to download invoice';
    yield put(downloadInvoiceFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification(errorMessage, 'error');
    }
  }
}

// Watcher sagas
function* watchGenerateInvoice() {
  yield takeEvery(generateInvoiceRequest.type, generateInvoiceSaga);
}

function* watchGenerateAllInvoices() {
  yield takeEvery(generateAllInvoicesRequest.type, generateAllInvoicesSaga);
}

function* watchFetchInvoiceLogs() {
  yield takeLatest(fetchInvoiceLogsRequest.type, fetchInvoiceLogsSaga);
}

function* watchFetchInvoiceConfig() {
  yield takeLatest(fetchInvoiceConfigRequest.type, fetchInvoiceConfigSaga);
}

function* watchUpdateInvoiceConfig() {
  yield takeEvery(updateInvoiceConfigRequest.type, updateInvoiceConfigSaga);
}

function* watchRetryInvoiceGeneration() {
  yield takeEvery(retryInvoiceGenerationRequest.type, retryInvoiceGenerationSaga);
}

function* watchDownloadInvoice() {
  yield takeEvery(downloadInvoiceRequest.type, downloadInvoiceSaga);
}

// Root saga
export default function* invoiceGenerationSaga() {
  yield all([
    fork(watchGenerateInvoice),
    fork(watchGenerateAllInvoices),
    fork(watchFetchInvoiceLogs),
    fork(watchFetchInvoiceConfig),
    fork(watchUpdateInvoiceConfig),
    fork(watchRetryInvoiceGeneration),
    fork(watchDownloadInvoice)
  ]);
}
