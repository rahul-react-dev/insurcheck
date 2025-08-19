import { call, put, takeEvery, takeLatest, all, fork } from 'redux-saga/effects';
import { superAdminAPI } from '../../utils/api';
import {
  fetchSystemConfigRequest,
  fetchSystemConfigSuccess,
  fetchSystemConfigFailure,
  updateSystemConfigRequest,
  updateSystemConfigSuccess,
  updateSystemConfigFailure,
  createSystemConfigRequest,
  createSystemConfigSuccess,
  createSystemConfigFailure
} from './systemConfigSlice';

// Saga functions
function* fetchSystemConfigSaga(action) {
  try {
    console.log('📡 fetchSystemConfigSaga triggered with params:', action.payload);

    const params = action.payload || {};
    const response = yield call(superAdminAPI.getSystemConfig, params);
    console.log('✅ System config API response received:', response);

    // Handle the structured response from backend
    const responseData = response.data?.data || response.data || response;
    const payload = {
      configuration: responseData.configuration || {},
      auditLogs: responseData.auditLogs || [],
      configs: responseData.configs || [],
      totalConfigs: responseData.totalConfigs || 0,
      pagination: responseData.pagination || {},
      filters: responseData.filters || {}
    };
    
    yield put(fetchSystemConfigSuccess(payload));
  } catch (error) {
    console.error('❌ Error in fetchSystemConfigSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch system configuration';
    yield put(fetchSystemConfigFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to load system configuration. Please try again.', 'error');
    }
  }
}

function* updateSystemConfigSaga(action) {
  try {
    const { key, value, category, description } = action.payload;
    console.log('📡 updateSystemConfigSaga triggered with:', { key, value, category, description });

    const response = yield call(superAdminAPI.updateSystemConfig, key, { value, category, description });
    const updatedConfig = response.data?.data || response.data || response;

    yield put(updateSystemConfigSuccess({
      key,
      value,
      category,
      description,
      updatedConfig
    }));

    // Refresh the configuration data
    yield put(fetchSystemConfigRequest());

    if (window.showNotification) {
      window.showNotification('Configuration updated successfully', 'success');
    }
  } catch (error) {
    console.error('❌ Error in updateSystemConfigSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to update system configuration';
    yield put(updateSystemConfigFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to update configuration', 'error');
    }
  }
}

function* createSystemConfigSaga(action) {
  try {
    const configData = action.payload;
    console.log('📡 createSystemConfigSaga triggered with:', configData);

    const response = yield call(superAdminAPI.createSystemConfig, configData);
    const newConfig = response.data?.data || response.data || response;

    yield put(createSystemConfigSuccess(newConfig));

    if (window.showNotification) {
      window.showNotification('Configuration created successfully', 'success');
    }

    // Refresh the config list
    yield put(fetchSystemConfigRequest());
  } catch (error) {
    console.error('❌ Error in createSystemConfigSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to create system configuration';
    yield put(createSystemConfigFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to create configuration', 'error');
    }
  }
}

// Watcher sagas
function* watchFetchSystemConfig() {
  yield takeLatest(fetchSystemConfigRequest.type, fetchSystemConfigSaga);
}

function* watchUpdateSystemConfig() {
  yield takeEvery(updateSystemConfigRequest.type, updateSystemConfigSaga);
}

function* watchCreateSystemConfig() {
  yield takeEvery(createSystemConfigRequest.type, createSystemConfigSaga);
}

// Root saga
export default function* systemConfigSaga() {
  yield all([
    fork(watchFetchSystemConfig),
    fork(watchUpdateSystemConfig),
    fork(watchCreateSystemConfig)
  ]);
}