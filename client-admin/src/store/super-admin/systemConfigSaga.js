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
  createSystemConfigFailure,
  fetchTenantsListRequest,
  fetchTenantsListSuccess,
  fetchTenantsListFailure,
  fetchTenantConfigRequest,
  fetchTenantConfigSuccess,
  fetchTenantConfigFailure,
  updateTenantConfigRequest,
  updateTenantConfigSuccess,
  updateTenantConfigFailure,
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
    const { updates } = action.payload;
    console.log('📡 updateSystemConfigSaga triggered with batch updates:', updates);

    if (updates && Array.isArray(updates)) {
      // Handle batch updates with single API call
      const response = yield call(superAdminAPI.batchUpdateSystemConfig, updates);
      console.log('✅ Batch update response:', response);
      
      // Refresh configuration after batch update
      yield put(fetchSystemConfigRequest());
      
      // Mark update as successful
      yield put(updateSystemConfigSuccess({}));
      
      if (window.showNotification) {
        window.showNotification(`Configuration updated successfully (${updates.length} settings)`, 'success');
      }
    } else {
      // Handle single update (backward compatibility)
      const { key, value, category } = action.payload;
      console.log('📡 updateSystemConfigSaga triggered with single update:', { key, value, category });

      const response = yield call(superAdminAPI.updateSystemConfig, key, { value, category });
      const updatedConfig = response.configuration || response.data || response;

      yield put(updateSystemConfigSuccess({
        key,
        value,
        category,
        updatedConfig
      }));

      if (window.showNotification) {
        window.showNotification('Configuration updated successfully', 'success');
      }
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
    const newConfig = response.configuration || response.data || response;

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

// Tenant-specific sagas
function* fetchTenantsListSaga() {
  try {
    console.log('📡 fetchTenantsListSaga triggered');

    const response = yield call(superAdminAPI.getTenantsList);
    console.log('✅ Tenants list API response received:', response);

    yield put(fetchTenantsListSuccess(response));
  } catch (error) {
    console.error('❌ Error in fetchTenantsListSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch tenants list';
    yield put(fetchTenantsListFailure({ message: errorMessage }));

    if (window.showNotification) {
      window.showNotification('Failed to load tenants list. Please try again.', 'error');
    }
  }
}

function* fetchTenantConfigSaga(action) {
  try {
    const tenantId = action.payload;
    console.log('📡 fetchTenantConfigSaga triggered for tenant:', tenantId);

    const response = yield call(superAdminAPI.getTenantConfig, tenantId);
    console.log('✅ Tenant config API response received:', response);

    yield put(fetchTenantConfigSuccess({
      tenantId,
      configuration: response.configuration || response.data || response
    }));
  } catch (error) {
    console.error('❌ Error in fetchTenantConfigSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch tenant configuration';
    yield put(fetchTenantConfigFailure({ message: errorMessage }));

    if (window.showNotification) {
      window.showNotification('Failed to load tenant configuration. Please try again.', 'error');
    }
  }
}

function* updateTenantConfigSaga(action) {
  try {
    const { tenantId, updates } = action.payload;
    console.log('📡 updateTenantConfigSaga triggered for tenant:', tenantId, 'with updates:', updates);

    const response = yield call(superAdminAPI.batchUpdateTenantConfig, tenantId, updates);
    console.log('✅ Tenant config update response:', response);

    // Refresh tenant configuration after update
    yield put(fetchTenantConfigRequest(tenantId));
    
    // Mark update as successful
    yield put(updateTenantConfigSuccess({}));

    if (window.showNotification) {
      window.showNotification(`Tenant configuration updated successfully (${updates.length} settings)`, 'success');
    }
  } catch (error) {
    console.error('❌ Error in updateTenantConfigSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to update tenant configuration';
    yield put(updateTenantConfigFailure({ message: errorMessage }));

    if (window.showNotification) {
      window.showNotification('Failed to update tenant configuration', 'error');
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

function* watchFetchTenantsList() {
  yield takeLatest(fetchTenantsListRequest.type, fetchTenantsListSaga);
}

function* watchFetchTenantConfig() {
  yield takeEvery(fetchTenantConfigRequest.type, fetchTenantConfigSaga);
}

function* watchUpdateTenantConfig() {
  yield takeEvery(updateTenantConfigRequest.type, updateTenantConfigSaga);
}

// Root saga
export default function* systemConfigSaga() {
  yield all([
    fork(watchFetchSystemConfig),
    fork(watchUpdateSystemConfig),
    fork(watchCreateSystemConfig),
    fork(watchFetchTenantsList),
    fork(watchFetchTenantConfig),
    fork(watchUpdateTenantConfig)
  ]);
}