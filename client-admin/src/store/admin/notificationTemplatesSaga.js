import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import {
  // Templates list
  fetchTemplatesRequest,
  fetchTemplatesSuccess,
  fetchTemplatesFailure,

  // Statistics
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

  // Audit logs
  fetchAuditLogsRequest,
  fetchAuditLogsSuccess,
  fetchAuditLogsFailure,
} from './notificationTemplatesSlice';
import { adminAuthApi } from '../../utils/api';

// Saga workers
function* fetchTemplatesSaga(action) {
  try {
    console.log('🔄 [NotificationTemplates] Fetching templates with params:', action.payload);
    
    const response = yield call(adminAuthApi.getNotificationTemplates, action.payload);
    
    if (response?.success) {
      console.log('✅ [NotificationTemplates] Templates fetched successfully:', response.data?.length);
      yield put(fetchTemplatesSuccess({
        data: response.data,
        meta: response.meta
      }));
    } else {
      console.error('❌ [NotificationTemplates] Invalid response format:', response);
      yield put(fetchTemplatesFailure(response?.message || 'Failed to fetch templates'));
    }
  } catch (error) {
    console.error('❌ [NotificationTemplates] Error fetching templates:', error);
    
    let errorMessage = 'Failed to fetch templates';
    
    // Handle error responses
    if (error?.message) {
      try {
        const parsedError = JSON.parse(error.message);
        errorMessage = parsedError?.message || errorMessage;
      } catch {
        errorMessage = error.message;
      }
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.response?.status === 401) {
      errorMessage = 'Authentication required';
    } else if (error?.response?.status === 403) {
      errorMessage = 'Access denied';
    } else if (error?.response?.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    }
    
    yield put(fetchTemplatesFailure(errorMessage));
  }
}

function* fetchStatsSaga(action) {
  try {
    console.log('🔄 [NotificationTemplates] Fetching statistics');
    
    const response = yield call(adminAuthApi.getNotificationTemplateStats);
    
    if (response?.success) {
      console.log('✅ [NotificationTemplates] Statistics fetched successfully:', response.data);
      yield put(fetchStatsSuccess(response.data));
    } else {
      console.error('❌ [NotificationTemplates] Invalid stats response:', response);
      yield put(fetchStatsFailure(response?.message || 'Failed to fetch statistics'));
    }
  } catch (error) {
    console.error('❌ [NotificationTemplates] Error fetching statistics:', error);
    
    let errorMessage = 'Failed to fetch statistics';
    
    if (error?.message) {
      try {
        const parsedError = JSON.parse(error.message);
        errorMessage = parsedError?.message || errorMessage;
      } catch {
        errorMessage = error.message;
      }
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    yield put(fetchStatsFailure(errorMessage));
  }
}

function* createTemplateSaga(action) {
  try {
    console.log('🔄 [NotificationTemplates] Creating template:', action.payload);
    
    const response = yield call(adminAuthApi.createNotificationTemplate, action.payload);
    
    if (response?.success) {
      console.log('✅ [NotificationTemplates] Template created successfully:', response.data);
      yield put(createTemplateSuccess(response.data));
    } else {
      console.error('❌ [NotificationTemplates] Invalid create response:', response);
      yield put(createTemplateFailure(response?.message || 'Failed to create template'));
    }
  } catch (error) {
    console.error('❌ [NotificationTemplates] Error creating template:', error);
    
    let errorMessage = 'Failed to create template';
    let errorDetails = {};
    
    if (error?.message) {
      try {
        const parsedError = JSON.parse(error.message);
        errorMessage = parsedError?.message || errorMessage;
        errorDetails = parsedError?.errors || {};
      } catch {
        errorMessage = error.message;
      }
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
      errorDetails = error.response.data.errors || {};
    } else if (error?.response?.status === 400) {
      errorMessage = 'Invalid template data';
    }
    
    yield put(createTemplateFailure({ message: errorMessage, errors: errorDetails }));
  }
}

function* updateTemplateSaga(action) {
  try {
    const { id, ...templateData } = action.payload;
    console.log('🔄 [NotificationTemplates] Updating template:', id);
    
    const response = yield call(adminAuthApi.updateNotificationTemplate, id, templateData);
    
    if (response?.success) {
      console.log('✅ [NotificationTemplates] Template updated successfully:', response.data);
      yield put(updateTemplateSuccess(response.data));
    } else {
      console.error('❌ [NotificationTemplates] Invalid update response:', response);
      yield put(updateTemplateFailure(response?.message || 'Failed to update template'));
    }
  } catch (error) {
    console.error('❌ [NotificationTemplates] Error updating template:', error);
    
    let errorMessage = 'Failed to update template';
    let errorDetails = {};
    
    if (error?.message) {
      try {
        const parsedError = JSON.parse(error.message);
        errorMessage = parsedError?.message || errorMessage;
        errorDetails = parsedError?.errors || {};
      } catch {
        errorMessage = error.message;
      }
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
      errorDetails = error.response.data.errors || {};
    } else if (error?.response?.status === 404) {
      errorMessage = 'Template not found';
    } else if (error?.response?.status === 400) {
      errorMessage = 'Invalid template data';
    }
    
    yield put(updateTemplateFailure({ message: errorMessage, errors: errorDetails }));
  }
}

function* deleteTemplateSaga(action) {
  try {
    const templateId = action.payload;
    console.log('🔄 [NotificationTemplates] Deleting template:', templateId);
    
    const response = yield call(adminAuthApi.deleteNotificationTemplate, templateId);
    
    if (response?.success) {
      console.log('✅ [NotificationTemplates] Template deleted successfully');
      yield put(deleteTemplateSuccess({ id: templateId }));
    } else {
      console.error('❌ [NotificationTemplates] Invalid delete response:', response);
      yield put(deleteTemplateFailure(response?.message || 'Failed to delete template'));
    }
  } catch (error) {
    console.error('❌ [NotificationTemplates] Error deleting template:', error);
    
    let errorMessage = 'Failed to delete template';
    
    if (error?.message) {
      try {
        const parsedError = JSON.parse(error.message);
        errorMessage = parsedError?.message || errorMessage;
      } catch {
        errorMessage = error.message;
      }
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.response?.status === 404) {
      errorMessage = 'Template not found';
    } else if (error?.response?.status === 403) {
      errorMessage = 'Not authorized to delete this template';
    }
    
    yield put(deleteTemplateFailure(errorMessage));
  }
}

function* previewTemplateSaga(action) {
  try {
    console.log('🔄 [NotificationTemplates] Previewing template:', action.payload);
    
    const response = yield call(adminAuthApi.previewNotificationTemplate, action.payload);
    
    if (response?.success) {
      console.log('✅ [NotificationTemplates] Template preview generated successfully');
      yield put(previewTemplateSuccess(response.data));
    } else {
      console.error('❌ [NotificationTemplates] Invalid preview response:', response);
      yield put(previewTemplateFailure(response?.message || 'Failed to generate preview'));
    }
  } catch (error) {
    console.error('❌ [NotificationTemplates] Error previewing template:', error);
    
    let errorMessage = 'Failed to generate preview';
    
    if (error?.message) {
      try {
        const parsedError = JSON.parse(error.message);
        errorMessage = parsedError?.message || errorMessage;
      } catch {
        errorMessage = error.message;
      }
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.response?.status === 400) {
      errorMessage = 'Invalid template or variables data';
    }
    
    yield put(previewTemplateFailure(errorMessage));
  }
}

function* fetchAuditLogsSaga(action) {
  try {
    console.log('🔄 [NotificationTemplates] Fetching audit logs with params:', action.payload);
    
    const response = yield call(adminAuthApi.getNotificationTemplateAuditLogs, action.payload);
    
    if (response?.success) {
      console.log('✅ [NotificationTemplates] Audit logs fetched successfully:', response.data?.length);
      yield put(fetchAuditLogsSuccess({
        data: response.data,
        meta: response.meta
      }));
    } else {
      console.error('❌ [NotificationTemplates] Invalid audit logs response:', response);
      yield put(fetchAuditLogsFailure(response?.message || 'Failed to fetch audit logs'));
    }
  } catch (error) {
    console.error('❌ [NotificationTemplates] Error fetching audit logs:', error);
    
    let errorMessage = 'Failed to fetch audit logs';
    
    if (error?.message) {
      try {
        const parsedError = JSON.parse(error.message);
        errorMessage = parsedError?.message || errorMessage;
      } catch {
        errorMessage = error.message;
      }
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    yield put(fetchAuditLogsFailure(errorMessage));
  }
}

// Root saga
function* notificationTemplatesSaga() {
  console.log('🔄 [NotificationTemplates] Saga initialized');
  
  yield takeLatest(fetchTemplatesRequest.type, fetchTemplatesSaga);
  yield takeLatest(fetchStatsRequest.type, fetchStatsSaga);
  yield takeEvery(createTemplateRequest.type, createTemplateSaga);
  yield takeEvery(updateTemplateRequest.type, updateTemplateSaga);
  yield takeEvery(deleteTemplateRequest.type, deleteTemplateSaga);
  yield takeEvery(previewTemplateRequest.type, previewTemplateSaga);
  yield takeLatest(fetchAuditLogsRequest.type, fetchAuditLogsSaga);
  
  console.log('✅ [NotificationTemplates] All saga watchers configured');
}

export default notificationTemplatesSaga;