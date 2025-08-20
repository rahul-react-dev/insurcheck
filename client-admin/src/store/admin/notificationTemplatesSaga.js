import { call, put, takeEvery } from 'redux-saga/effects';
import { adminAuthApi } from '../../utils/api';
import {
  // Fetch templates
  fetchTemplatesRequest,
  fetchTemplatesSuccess,
  fetchTemplatesFailure,
  
  // Update template
  updateTemplateRequest,
  updateTemplateSuccess,
  updateTemplateFailure,
  
  // Preview template
  previewTemplateRequest,
  previewTemplateSuccess,
  previewTemplateFailure,
} from './notificationTemplatesSlice';

// Fetch templates saga
function* fetchTemplatesSaga(action) {
  try {
    const response = yield call(
      adminAuthApi.getNotificationTemplates,
      action.payload
    );
    yield put(fetchTemplatesSuccess(response.data));
  } catch (error) {
    const errorData = JSON.parse(error.message || '{}');
    yield put(fetchTemplatesFailure(errorData.message || 'Failed to fetch templates'));
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
    yield put(updateTemplateSuccess(response.data));
  } catch (error) {
    const errorData = JSON.parse(error.message || '{}');
    yield put(updateTemplateFailure(errorData.message || 'Failed to update template'));
  }
}

// Preview template saga
function* previewTemplateSaga(action) {
  try {
    const response = yield call(
      adminAuthApi.previewNotificationTemplate,
      action.payload
    );
    yield put(previewTemplateSuccess(response.data));
  } catch (error) {
    const errorData = JSON.parse(error.message || '{}');
    yield put(previewTemplateFailure(errorData.message || 'Failed to generate preview'));
  }
}

// Watcher saga
function* notificationTemplatesSaga() {
  yield takeEvery(fetchTemplatesRequest.type, fetchTemplatesSaga);
  yield takeEvery(updateTemplateRequest.type, updateTemplateSaga);
  yield takeEvery(previewTemplateRequest.type, previewTemplateSaga);
}

export default notificationTemplatesSaga;