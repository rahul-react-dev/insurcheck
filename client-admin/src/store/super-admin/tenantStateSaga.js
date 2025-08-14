
import { call, put, takeEvery, takeLatest, all, fork } from 'redux-saga/effects';
import { superAdminAPI } from '../../utils/api';
import {
  fetchTenantStatesRequest,
  fetchTenantStatesSuccess,
  fetchTenantStatesFailure,
  updateTenantStateRequest,
  updateTenantStateSuccess,
  updateTenantStateFailure,
  fetchTenantStateDetailsRequest,
  fetchTenantStateDetailsSuccess,
  fetchTenantStateDetailsFailure
} from './tenantStateSlice';

// Saga functions
function* fetchTenantStatesSaga(action) {
  try {
    const params = action.payload || { page: 1, limit: 10 };
    console.log('📡 fetchTenantStatesSaga triggered with params:', params);

    const response = yield call(superAdminAPI.getTenantStates, params);
    console.log('✅ Tenant states API response received:', response);

    const validatedResponse = {
      tenantStates: response.tenantStates || response.data || [],
      pagination: response.pagination || {
        page: params.page || 1,
        limit: params.limit || 10,
        total: response.total || 0,
        totalPages: Math.ceil((response.total || 0) / (params.limit || 10))
      }
    };

    console.log('📤 Dispatching tenant states success with:', validatedResponse);
    yield put(fetchTenantStatesSuccess(validatedResponse));
  } catch (error) {
    console.error('❌ Error in fetchTenantStatesSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch tenant states';
    yield put(fetchTenantStatesFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to load tenant states. Please try again.', 'error');
    }
  }
}

function* updateTenantStateSaga(action) {
  try {
    const { id, ...stateData } = action.payload;
    console.log('📡 updateTenantStateSaga triggered with:', { id, stateData });

    const response = yield call(superAdminAPI.updateTenantState, id, stateData);
    const updatedState = response.data || response;
    
    yield put(updateTenantStateSuccess(updatedState));

    if (window.showNotification) {
      window.showNotification('Tenant state updated successfully', 'success');
    }
  } catch (error) {
    console.error('❌ Error in updateTenantStateSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to update tenant state';
    yield put(updateTenantStateFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to update tenant state', 'error');
    }
  }
}

function* fetchTenantStateDetailsSaga(action) {
  try {
    const tenantId = action.payload;
    console.log('📡 fetchTenantStateDetailsSaga triggered for tenant:', tenantId);

    // Get tenant details and state information
    const [tenantResponse, stateResponse] = yield all([
      call(superAdminAPI.getTenants, { id: tenantId }),
      call(superAdminAPI.getTenantStates, { tenantId })
    ]);

    const tenantDetails = tenantResponse.data || tenantResponse;
    const stateDetails = stateResponse.data || stateResponse;

    yield put(fetchTenantStateDetailsSuccess({
      tenantId,
      tenantDetails: Array.isArray(tenantDetails) ? tenantDetails[0] : tenantDetails,
      stateDetails: Array.isArray(stateDetails) ? stateDetails[0] : stateDetails
    }));
  } catch (error) {
    console.error('❌ Error in fetchTenantStateDetailsSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch tenant state details';
    yield put(fetchTenantStateDetailsFailure(errorMessage));
  }
}

// Watcher sagas
function* watchFetchTenantStates() {
  yield takeLatest(fetchTenantStatesRequest.type, fetchTenantStatesSaga);
}

function* watchUpdateTenantState() {
  yield takeEvery(updateTenantStateRequest.type, updateTenantStateSaga);
}

function* watchFetchTenantStateDetails() {
  yield takeEvery(fetchTenantStateDetailsRequest.type, fetchTenantStateDetailsSaga);
}

// Root saga
export default function* tenantStateSaga() {
  yield all([
    fork(watchFetchTenantStates),
    fork(watchUpdateTenantState),
    fork(watchFetchTenantStateDetails)
  ]);
}
