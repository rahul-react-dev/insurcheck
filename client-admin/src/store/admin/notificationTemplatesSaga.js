import { call, put, takeEvery } from 'redux-saga/effects';
import { adminAuthApi } from '../../utils/api';
import {
  // Fetch templates
  fetchTemplatesRequest,
  fetchTemplatesSuccess,
  fetchTemplatesFailure,
  
  // Fetch statistics
  fetchStatsRequest,
  fetchStatsSuccess,
  fetchStatsFailure,
  
  // Create template
  createTemplateRequest,
  createTemplateSuccess,
  createTemplateFailure,
  
  // Update template
  updateTemplateRequest,
  updateTemplateSuccess,
  updateTemplateFailure,
  
  // Delete template
  deleteTemplateRequest,
  deleteTemplateSuccess,
  deleteTemplateFailure,
  
  // Preview template
  previewTemplateRequest,
  previewTemplateSuccess,
  previewTemplateFailure,
  
  // Fetch audit logs
  fetchAuditLogsRequest,
  fetchAuditLogsSuccess,
  fetchAuditLogsFailure,
} from './notificationTemplatesSlice';

// Fetch templates saga
function* fetchTemplatesSaga(action) {
  try {
    const response = yield call(
      adminAuthApi.getNotificationTemplates,
      action.payload
    );
    yield put(fetchTemplatesSuccess(response));
  } catch (error) {
    const errorData = JSON.parse(error.message || '{}');
    yield put(fetchTemplatesFailure(errorData.message || 'Failed to fetch templates'));
  }
}

// Fetch template statistics saga
function* fetchStatsSaga() {
  try {
    const response = yield call(adminAuthApi.getNotificationTemplateStats);
    yield put(fetchStatsSuccess(response));
  } catch (error) {
    const errorData = JSON.parse(error.message || '{}');
    yield put(fetchStatsFailure(errorData.message || 'Failed to fetch statistics'));
  }
}

// Create template saga
function* createTemplateSaga(action) {
  try {
    const response = yield call(
      adminAuthApi.createNotificationTemplate,
      action.payload
    );
    yield put(createTemplateSuccess(response));
  } catch (error) {
    const errorData = JSON.parse(error.message || '{}');
    yield put(createTemplateFailure(errorData.message || 'Failed to create template'));
  }
}

// Update template saga
function* updateTemplateSaga(action) {
  try {
    const { id, templateData } = action.payload;
    const response = yield call(
      adminAuthApi.updateNotificationTemplate,
      id,
      templateData
    );
    yield put(updateTemplateSuccess(response));
  } catch (error) {
    const errorData = JSON.parse(error.message || '{}');
    yield put(updateTemplateFailure(errorData.message || 'Invalid template format. Please check inputs.'));
  }
}

// Delete template saga
function* deleteTemplateSaga(action) {
  try {
    const templateId = action.payload;
    yield call(adminAuthApi.deleteNotificationTemplate, templateId);
    yield put(deleteTemplateSuccess(templateId));
  } catch (error) {
    const errorData = JSON.parse(error.message || '{}');
    yield put(deleteTemplateFailure(errorData.message || 'Failed to delete template'));
  }
}

// Preview template saga
function* previewTemplateSaga(action) {
  try {
    const response = yield call(
      adminAuthApi.previewNotificationTemplate,
      action.payload
    );
    yield put(previewTemplateSuccess(response));
  } catch (error) {
    const errorData = JSON.parse(error.message || '{}');
    yield put(previewTemplateFailure(errorData.message || 'Failed to preview template. Please try again.'));
  }
}

// Fetch audit logs saga
function* fetchAuditLogsSaga(action) {
  try {
    const response = yield call(
      adminAuthApi.getNotificationTemplateAuditLogs,
      action.payload
    );
    yield put(fetchAuditLogsSuccess(response));
  } catch (error) {
    const errorData = JSON.parse(error.message || '{}');
    yield put(fetchAuditLogsFailure(errorData.message || 'Failed to fetch audit logs'));
  }
}

// Watcher saga
function* notificationTemplatesSaga() {
  yield takeEvery(fetchTemplatesRequest.type, fetchTemplatesSaga);
  yield takeEvery(fetchStatsRequest.type, fetchStatsSaga);
  yield takeEvery(createTemplateRequest.type, createTemplateSaga);
  yield takeEvery(updateTemplateRequest.type, updateTemplateSaga);
  yield takeEvery(deleteTemplateRequest.type, deleteTemplateSaga);
  yield takeEvery(previewTemplateRequest.type, previewTemplateSaga);
  yield takeEvery(fetchAuditLogsRequest.type, fetchAuditLogsSaga);
}

export default notificationTemplatesSaga;