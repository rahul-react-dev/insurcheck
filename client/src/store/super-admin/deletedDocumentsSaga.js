import { call, put, takeEvery, takeLatest, all, fork, delay } from 'redux-saga/effects';
import { superAdminAPI } from '../../utils/api';
import {
  fetchDeletedDocumentsRequest,
  fetchDeletedDocumentsSuccess,
  fetchDeletedDocumentsFailure,
  restoreDocumentRequest,
  restoreDocumentSuccess,
  restoreDocumentFailure,
  permanentlyDeleteDocumentRequest,
  permanentlyDeleteDocumentSuccess,
  permanentlyDeleteDocumentFailure,
  bulkRestoreDocumentsRequest,
  bulkRestoreDocumentsSuccess,
  bulkRestoreDocumentsFailure,
  bulkDeleteDocumentsRequest,
  bulkDeleteDocumentsSuccess,
  bulkDeleteDocumentsFailure
} from './deletedDocumentsSlice';

// Saga functions
function* fetchDeletedDocumentsSaga(action) {
  try {
    const params = action.payload || { page: 1, limit: 10 };
    console.log('📡 fetchDeletedDocumentsSaga triggered with params:', params);

    const response = yield call(superAdminAPI.getDeletedDocuments, params);
    console.log('✅ Deleted documents API response received:', response);

    // Ensure response structure is consistent, prioritizing common patterns
    const validatedResponse = {
      documents: response.documents || response.data || [],
      pagination: response.pagination || {
        page: params.page || 1,
        limit: params.limit || 10,
        total: response.total || 0,
        // Calculate totalPages based on total and limit, ensuring it's a number
        totalPages: Math.ceil((response.total || 0) / (params.limit || 10)) || 1
      }
    };

    console.log('📤 Dispatching deleted documents success with:', validatedResponse);
    yield put(fetchDeletedDocumentsSuccess(validatedResponse));
  } catch (error) {
    console.error('❌ Error in fetchDeletedDocumentsSaga:', error);
    // Construct a user-friendly error message
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch deleted documents. Please try again.';
    yield put(fetchDeletedDocumentsFailure(errorMessage));

    // Display notification if available
    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification('Failed to load deleted documents. Please try again.', 'error');
    }
  }
}

function* restoreDocumentSaga(action) {
  try {
    const documentId = action.payload;
    console.log(`📡 Restoring document with ID: ${documentId}`);
    const response = yield call(superAdminAPI.restoreDocument, documentId);
    // Ensure we handle response data consistently
    const restoredDocument = response.data || response;

    yield put(restoreDocumentSuccess({
      documentId,
      restoredDocument
    }));

    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification('Document restored successfully', 'success');
    }

    // Refresh the documents list after a successful restore
    yield put(fetchDeletedDocumentsRequest({ page: 1, limit: 10 }));
  } catch (error) {
    console.error(`❌ Error in restoreDocumentSaga for document ID ${action.payload}:`, error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to restore document';
    yield put(restoreDocumentFailure(errorMessage));

    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification('Failed to restore document', 'error');
    }
  }
}

function* permanentlyDeleteDocumentSaga(action) {
  try {
    const documentId = action.payload;
    console.log(`📡 Permanently deleting document with ID: ${documentId}`);
    yield call(superAdminAPI.permanentlyDeleteDocument, documentId);

    yield put(permanentlyDeleteDocumentSuccess(documentId));

    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification('Document permanently deleted', 'success');
    }

    // Refresh the documents list after a successful permanent delete
    yield put(fetchDeletedDocumentsRequest({ page: 1, limit: 10 }));
  } catch (error) {
    console.error(`❌ Error in permanentlyDeleteDocumentSaga for document ID ${action.payload}:`, error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to permanently delete document';
    yield put(permanentlyDeleteDocumentFailure(errorMessage));

    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification('Failed to permanently delete document', 'error');
    }
  }
}

function* bulkRestoreDocumentsSaga(action) {
  try {
    const documentIds = action.payload;
    console.log(`📡 Bulk restoring documents with IDs: ${documentIds.join(', ')}`);

    // Check if the API supports bulk operations
    if (superAdminAPI.bulkRestoreDocuments) {
      const response = yield call(superAdminAPI.bulkRestoreDocuments, documentIds);
      yield put(bulkRestoreDocumentsSuccess(response.data || response));
    } else {
      // Fallback to individual restores if bulk API is not available
      console.warn('⚠️ bulkRestoreDocuments API not found, falling back to individual restores.');
      // Use all to run restores concurrently
      const restoreSagas = documentIds.map(id => call(superAdminAPI.restoreDocument, id));
      yield all(restoreSagas);
      yield put(bulkRestoreDocumentsSuccess(documentIds)); // Indicate success for all IDs
    }

    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification(`${documentIds.length} documents restored successfully`, 'success');
    }

    // Refresh the documents list after bulk restore
    yield put(fetchDeletedDocumentsRequest({ page: 1, limit: 10 }));
  } catch (error) {
    console.error('❌ Error in bulkRestoreDocumentsSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to restore documents';
    yield put(bulkRestoreDocumentsFailure(errorMessage));

    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification('Failed to restore documents', 'error');
    }
  }
}

function* bulkDeleteDocumentsSaga(action) {
  try {
    const documentIds = action.payload;
    console.log(`📡 Bulk permanently deleting documents with IDs: ${documentIds.join(', ')}`);

    // Check if the API supports bulk operations
    if (superAdminAPI.bulkDeleteDocuments) {
      const response = yield call(superAdminAPI.bulkDeleteDocuments, documentIds);
      yield put(bulkDeleteDocumentsSuccess(response.data || response));
    } else {
      // Fallback to individual deletes if bulk API is not available
      console.warn('⚠️ bulkDeleteDocuments API not found, falling back to individual deletes.');
      // Use all to run deletes concurrently
      const deleteSagas = documentIds.map(id => call(superAdminAPI.permanentlyDeleteDocument, id));
      yield all(deleteSagas);
      yield put(bulkDeleteDocumentsSuccess(documentIds)); // Indicate success for all IDs
    }

    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification(`${documentIds.length} documents permanently deleted`, 'success');
    }

    // Refresh the documents list after bulk delete
    yield put(fetchDeletedDocumentsRequest({ page: 1, limit: 10 }));
  } catch (error) {
    console.error('❌ Error in bulkDeleteDocumentsSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to delete documents';
    yield put(bulkDeleteDocumentsFailure(errorMessage));

    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification('Failed to delete documents', 'error');
    }
  }
}

// Watcher sagas to manage action streams
function* watchFetchDeletedDocuments() {
  // Use takeLatest for fetch requests to cancel previous pending requests if a new one comes in
  yield takeLatest(fetchDeletedDocumentsRequest.type, fetchDeletedDocumentsSaga);
}

function* watchRestoreDocument() {
  // Use takeEvery for operations that should be processed for every dispatched action
  yield takeEvery(restoreDocumentRequest.type, restoreDocumentSaga);
}

function* watchPermanentlyDeleteDocument() {
  yield takeEvery(permanentlyDeleteDocumentRequest.type, permanentlyDeleteDocumentSaga);
}

function* watchBulkRestoreDocuments() {
  yield takeEvery(bulkRestoreDocumentsRequest.type, bulkRestoreDocumentsSaga);
}

function* watchBulkDeleteDocuments() {
  yield takeEvery(bulkDeleteDocumentsRequest.type, bulkDeleteDocumentsSaga);
}

// Root saga combining all watchers
export default function* deletedDocumentsSaga() {
  yield all([
    fork(watchFetchDeletedDocuments),
    fork(watchRestoreDocument),
    fork(watchPermanentlyDeleteDocument),
    fork(watchBulkRestoreDocuments),
    fork(watchBulkDeleteDocuments)
  ]);
}