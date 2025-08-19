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
function* fetchSystemConfigSaga() {
  try {
    console.log('📡 fetchSystemConfigSaga triggered');

    const response = yield call(superAdminAPI.getSystemConfig);
    console.log('✅ System config API response received:', response);

    const configs = response.configs || response.data || response;
    yield put(fetchSystemConfigSuccess(configs));
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
    const { key, value, category } = action.payload;
    console.log('📡 updateSystemConfigSaga triggered with:', { key, value, category });

    const response = yield call(superAdminAPI.updateSystemConfig, key, { value, category });
    const updatedConfig = response.data || response;

    yield put(updateSystemConfigSuccess({
      key,
      value,
      category,
      updatedConfig
    }));

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
    const newConfig = response.data || response;

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