
import { call, put, takeEvery, takeLatest, all, fork, select } from 'redux-saga/effects';
import { superAdminAPI } from '../../utils/api';
import {
  fetchTenantsRequest,
  fetchTenantsSuccess,
  fetchTenantsFailure,
  fetchSubscriptionPlansRequest,
  fetchSubscriptionPlansSuccess,
  fetchSubscriptionPlansFailure,
  createTenantRequest,
  createTenantSuccess,
  createTenantFailure,
  updateTenantRequest,
  updateTenantSuccess,
  updateTenantFailure,
  suspendTenantRequest,
  suspendTenantSuccess,
  suspendTenantFailure,
  deleteTenantRequest,
  deleteTenantSuccess,
  deleteTenantFailure,
  fetchTenantUsersRequest,
  fetchTenantUsersSuccess,
  fetchTenantUsersFailure,
  updateTenantUserCount,
  fetchTenantAnalyticsRequest,
  fetchTenantAnalyticsSuccess,
  fetchTenantAnalyticsFailure
} from './tenantSlice';

// Saga functions
function* fetchTenantsSaga(action) {
  try {
    const params = action.payload || { page: 1, limit: 10 };
    console.log('📡 fetchTenantsSaga triggered with params:', params);

    const response = yield call(superAdminAPI.getTenants, params);
    console.log('✅ Tenant API response received:', response);

    // Ensure response has required structure
    const validatedResponse = {
      tenants: response.tenants || response.data || [],
      summary: {
        totalTenants: response.summary?.totalTenants || response.total || 0,
        statusCounts: response.summary?.statusCounts || {}
      },
      pagination: response.pagination || { 
        page: params.page || 1, 
        limit: params.limit || 10, 
        total: response.total || 0, 
        totalPages: Math.ceil((response.total || 0) / (params.limit || 10))
      }
    };

    console.log('📤 Dispatching tenant success with:', validatedResponse);
    yield put(fetchTenantsSuccess(validatedResponse));
  } catch (error) {
    console.error('❌ Error in fetchTenantsSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch tenants';
    yield put(fetchTenantsFailure(errorMessage));

    // Show error notification
    if (window.showNotification) {
      window.showNotification('Failed to load tenants. Please try again.', 'error');
    }
  }
}

function* fetchSubscriptionPlansSaga() {
  try {
    const response = yield call(superAdminAPI.getSubscriptionPlans);
    const plans = response.data || response;
    yield put(fetchSubscriptionPlansSuccess(plans));
  } catch (error) {
    console.error('❌ Error in fetchSubscriptionPlansSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch subscription plans';
    yield put(fetchSubscriptionPlansFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to load subscription plans.', 'error');
    }
  }
}

function* createTenantSaga(action) {
  try {
    const response = yield call(superAdminAPI.createTenant, action.payload);
    const newTenant = response.data || response;
    yield put(createTenantSuccess(newTenant));

    // Show success message
    if (window.showNotification) {
      window.showNotification('Tenant created successfully', 'success');
    }

    // Refresh tenants list to maintain current state
    const currentState = yield select(state => state.tenant);
    yield put(fetchTenantsRequest({ 
      ...currentState.filters, 
      page: 1, // Reset to first page for new tenant
      limit: currentState.pagination.limit 
    }));
  } catch (error) {
    console.error('❌ Error in createTenantSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to create tenant';
    yield put(createTenantFailure(errorMessage));

    // Show error message
    if (window.showNotification) {
      window.showNotification('Failed to create tenant. Please try again.', 'error');
    }
  }
}

function* updateTenantSaga(action) {
  try {
    const { id, ...tenantData } = action.payload;
    const response = yield call(superAdminAPI.updateTenant, id, tenantData);
    const updatedTenant = response.data || response;
    yield put(updateTenantSuccess(updatedTenant));

    // Show success toast
    if (window.showNotification) {
      window.showNotification('Tenant updated successfully', 'success');
    }

    // Refresh tenants list to maintain current filters/pagination
    yield put(fetchTenantsRequest({ page: 1, limit: 10 }));
  } catch (error) {
    console.error('❌ Error in updateTenantSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to update tenant';
    yield put(updateTenantFailure(errorMessage));

    // Show error message
    if (window.showNotification) {
      window.showNotification('Failed to update tenant. Please try again.', 'error');
    }
  }
}

function* suspendTenantSaga(action) {
  try {
    const { tenantId, suspend } = action.payload;
    
    // First get the current tenant data to maintain required fields
    const currentState = yield select(state => state.tenant);
    const tenant = currentState.tenants.find(t => t.id === tenantId);
    
    if (!tenant) {
      throw new Error('Tenant not found');
    }
    
    // Call API with all required fields (name, email) plus status change
    const updateData = { 
      name: tenant.name,
      email: tenant.email,
      status: suspend ? 'suspended' : 'active'
    };
    
    const response = yield call(superAdminAPI.updateTenant, tenantId, updateData);
    
    yield put(suspendTenantSuccess({
      tenantId,
      newStatus: suspend ? 'suspended' : 'active',
      updatedDate: new Date().toISOString()
    }));

    // Show success message
    const actionText = suspend ? 'suspended' : 'reactivated';
    if (window.showNotification) {
      window.showNotification(`Tenant ${actionText} successfully`, 'success');
    }
  } catch (error) {
    console.error('❌ Error in suspendTenantSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to update tenant status';
    yield put(suspendTenantFailure(errorMessage));

    // Show error message
    if (window.showNotification) {
      window.showNotification('Failed to update tenant status. Please try again.', 'error');
    }
  }
}

function* deleteTenantSaga(action) {
  try {
    const tenantId = action.payload;
    yield call(superAdminAPI.deleteTenant, tenantId);
    yield put(deleteTenantSuccess(tenantId));

    // Show success message
    if (window.showNotification) {
      window.showNotification('Tenant deleted successfully', 'success');
    }
  } catch (error) {
    console.error('❌ Error in deleteTenantSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to delete tenant';
    yield put(deleteTenantFailure(errorMessage));

    // Show error message
    if (window.showNotification) {
      window.showNotification('Failed to delete tenant. Please try again.', 'error');
    }
  }
}

function* fetchTenantUsersSaga(action) {
  try {
    console.log('👥 fetchTenantUsersSaga called with:', action.payload);
    
    // Handle both old format (just tenantId) and new format (object with tenantId)
    const params = typeof action.payload === 'object' ? action.payload : { tenantId: action.payload };
    const { tenantId, page = 1, limit = 10 } = params;
    
    const response = yield call(superAdminAPI.getTenantUsers, tenantId, { page, limit });
    console.log('✅ Tenant users API response:', response);
    
    yield put(fetchTenantUsersSuccess({ 
      tenantId, 
      users: response.users || response.data || [],
      pagination: response.pagination 
    }));

    // Update the tenant's actual user count in the tenants list
    yield put(updateTenantUserCount({
      tenantId: tenantId,
      actualUserCount: response.pagination?.total || 0
    }));
  } catch (error) {
    console.error('❌ Error in fetchTenantUsersSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch tenant users';
    yield put(fetchTenantUsersFailure(errorMessage));
  }
}

function* fetchTenantAnalyticsSaga(action) {
  try {
    console.log('📊 fetchTenantAnalyticsSaga called with:', action.payload);
    
    const filters = action.payload || {};
    const response = yield call(superAdminAPI.getTenantAnalytics, filters);
    console.log('✅ Tenant analytics API response:', response);
    
    yield put(fetchTenantAnalyticsSuccess(response.data || response));
  } catch (error) {
    console.error('❌ Error in fetchTenantAnalyticsSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch tenant analytics';
    yield put(fetchTenantAnalyticsFailure(errorMessage));
  }
}

// Watcher sagas
function* watchFetchTenants() {
  console.log('🔧 watchFetchTenants started');
  yield takeLatest(fetchTenantsRequest.type, fetchTenantsSaga);
}

function* watchFetchSubscriptionPlans() {
  console.log('🔧 watchFetchSubscriptionPlans started');
  yield takeLatest(fetchSubscriptionPlansRequest.type, fetchSubscriptionPlansSaga);
}

function* watchCreateTenant() {
  console.log('🔧 watchCreateTenant started');
  yield takeEvery(createTenantRequest.type, createTenantSaga);
}

function* watchUpdateTenant() {
  console.log('🔧 watchUpdateTenant started');
  yield takeEvery(updateTenantRequest.type, updateTenantSaga);
}

function* watchSuspendTenant() {
  console.log('🔧 watchSuspendTenant started');
  yield takeEvery(suspendTenantRequest.type, suspendTenantSaga);
}

function* watchDeleteTenant() {
  console.log('🔧 watchDeleteTenant started');
  yield takeEvery(deleteTenantRequest.type, deleteTenantSaga);
}

function* watchFetchTenantUsers() {
  console.log('🔧 watchFetchTenantUsers started');
  yield takeEvery(fetchTenantUsersRequest.type, fetchTenantUsersSaga);
}

function* watchFetchTenantAnalytics() {
  console.log('🔧 watchFetchTenantAnalytics started');
  yield takeLatest(fetchTenantAnalyticsRequest.type, fetchTenantAnalyticsSaga);
}

// Root tenant saga
export default function* tenantSaga() {
  console.log('🔧 Tenant saga initialized');
  yield all([
    fork(watchFetchTenants),
    fork(watchFetchSubscriptionPlans),
    fork(watchCreateTenant),
    fork(watchUpdateTenant),
    fork(watchSuspendTenant),
    fork(watchDeleteTenant),
    fork(watchFetchTenantUsers),
    fork(watchFetchTenantAnalytics)
  ]);
  console.log('✅ Tenant saga watchers started');
}
