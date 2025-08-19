
import { call, put, takeEvery, takeLatest, all, fork } from 'redux-saga/effects';
import { invoiceAPI, invoiceConfigAPI } from '../../utils/api';
import {
  generateInvoiceRequest,
  generateInvoiceSuccess,
  generateInvoiceFailure,
  fetchInvoiceLogsRequest,
  fetchInvoiceLogsSuccess,
  fetchInvoiceLogsFailure,
  updateInvoiceConfigRequest,
  updateInvoiceConfigSuccess,
  updateInvoiceConfigFailure,
  fetchInvoiceConfigRequest,
  fetchInvoiceConfigSuccess,
  fetchInvoiceConfigFailure,
  downloadInvoiceRequest,
  downloadInvoiceSuccess,
  downloadInvoiceFailure
} from './invoiceGenerationSlice';

// Saga functions
function* generateInvoiceSaga(action) {
  try {
    const tenantId = action.payload;
    console.log('📡 generateInvoiceSaga triggered for tenant:', tenantId);

    const response = yield call(invoiceAPI.generate, { tenantId, type: 'manual' });
    console.log('✅ Generate invoice API response received:', response);

    const responseData = response.data || response;
    const generatedInvoice = responseData.invoice || responseData;
    yield put(generateInvoiceSuccess(generatedInvoice));

    if (window.showNotification) {
      window.showNotification('Invoice generated successfully', 'success');
    }

    // Refresh invoice logs
    yield put(fetchInvoiceLogsRequest({ page: 1, limit: 5 }));
  } catch (error) {
    console.error('❌ Error in generateInvoiceSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to generate invoice';
    yield put(generateInvoiceFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to generate invoice. Please try again.', 'error');
    }
  }
}

function* fetchInvoiceLogsSaga(action) {
  try {
    const params = action.payload || { page: 1, limit: 10 };
    console.log('📡 fetchInvoiceLogsSaga triggered with params:', params);

    const response = yield call(invoiceAPI.getAll, params);
    console.log('✅ Invoice logs API response received:', response);

    // Handle response structure from the API
    const responseData = response.data || response;
    const validatedResponse = {
      logs: responseData.invoices || responseData.data || [],
      summary: responseData.summary || {},
      pagination: responseData.pagination || {
        page: params.page || 1,
        limit: params.limit || 10,
        total: responseData.total || 0,
        totalPages: Math.ceil((responseData.total || 0) / (params.limit || 10))
      }
    };

    yield put(fetchInvoiceLogsSuccess(validatedResponse));
  } catch (error) {
    console.error('❌ Error in fetchInvoiceLogsSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch invoice logs';
    yield put(fetchInvoiceLogsFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to load invoice logs. Please try again.', 'error');
    }
  }
}

function* fetchInvoiceConfigSaga() {
  try {
    console.log('📡 fetchInvoiceConfigSaga triggered');

    const response = yield call(invoiceConfigAPI.getAll);
    console.log('✅ Invoice config API response received:', response);

    // Handle the response structure correctly
    const responseData = response.data || response;
    yield put(fetchInvoiceConfigSuccess(responseData));
  } catch (error) {
    console.error('❌ Error in fetchInvoiceConfigSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch invoice configuration';
    yield put(fetchInvoiceConfigFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to load invoice configuration. Please try again.', 'error');
    }
  }
}

function* updateInvoiceConfigSaga(action) {
  try {
    const { tenantId, config } = action.payload;
    console.log('📡 updateInvoiceConfigSaga triggered with:', { tenantId, config });

    const response = yield call(invoiceConfigAPI.update, tenantId, config);
    console.log('✅ Update config API response received:', response);

    yield put(updateInvoiceConfigSuccess({ tenantId, config }));

    if (window.showNotification) {
      window.showNotification('Invoice configuration updated successfully', 'success');
    }

    // Refresh configurations
    yield put(fetchInvoiceConfigRequest());
  } catch (error) {
    console.error('❌ Error in updateInvoiceConfigSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to update invoice configuration';
    yield put(updateInvoiceConfigFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to update configuration. Please try again.', 'error');
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
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to download invoice';
    yield put(downloadInvoiceFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to download invoice', 'error');
    }
  }
}

// Watcher sagas
function* watchGenerateInvoice() {
  yield takeEvery(generateInvoiceRequest.type, generateInvoiceSaga);
}

function* watchFetchInvoiceLogs() {
  console.log('👀 Setting up watcher for fetchInvoiceLogsRequest');
  yield takeLatest(fetchInvoiceLogsRequest.type, fetchInvoiceLogsSaga);
}

function* watchFetchInvoiceConfig() {
  console.log('👀 Setting up watcher for fetchInvoiceConfigRequest');
  yield takeLatest(fetchInvoiceConfigRequest.type, fetchInvoiceConfigSaga);
}

function* watchUpdateInvoiceConfig() {
  yield takeEvery(updateInvoiceConfigRequest.type, updateInvoiceConfigSaga);
}

function* watchDownloadInvoice() {
  yield takeEvery(downloadInvoiceRequest.type, downloadInvoiceSaga);
}

// Add retry functionality for failed invoice generation
function* retryInvoiceGenerationSaga(action) {
  try {
    const invoiceId = action.payload;
    console.log('📡 retryInvoiceGenerationSaga triggered for invoice:', invoiceId);

    const response = yield call(invoiceAPI.retry, invoiceId);
    console.log('✅ Retry invoice generation API response:', response);

    yield put(retryInvoiceGenerationSuccess(response.data || response));

    if (window.showNotification) {
      window.showNotification('Invoice generation retry initiated successfully', 'success');
    }

    // Refresh invoice logs to show updated status
    yield put(fetchInvoiceLogsRequest({ page: 1, limit: 10 }));
  } catch (error) {
    console.error('❌ Error in retryInvoiceGenerationSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to retry invoice generation';
    yield put(retryInvoiceGenerationFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to retry invoice generation. Please try again.', 'error');
    }
  }
}

function* watchRetryInvoiceGeneration() {
  yield takeEvery(retryInvoiceGenerationRequest.type, retryInvoiceGenerationSaga);
}

// Root saga
export default function* invoiceGenerationSaga() {
  console.log('🔄 Starting invoice generation saga watchers...');
  yield all([
    fork(watchGenerateInvoice),
    fork(watchFetchInvoiceLogs),
    fork(watchFetchInvoiceConfig),
    fork(watchUpdateInvoiceConfig),
    fork(watchDownloadInvoice),
    fork(watchRetryInvoiceGeneration)
  ]);
  console.log('✅ All invoice generation saga watchers initialized');
}
