
import { call, put, takeEvery, takeLatest, all, fork } from 'redux-saga/effects';
import { superAdminAPI } from '../../utils/api';
import {
  fetchPlansRequest,
  fetchPlansSuccess,
  fetchPlansFailure,
  fetchTenantsRequest,
  fetchTenantsSuccess,
  fetchTenantsFailure,
  createPlanRequest,
  createPlanSuccess,
  createPlanFailure,
  updatePlanRequest,
  updatePlanSuccess,
  updatePlanFailure,
  deletePlanRequest,
  deletePlanSuccess,
  deletePlanFailure,
  assignPlanToTenantRequest,
  assignPlanToTenantSuccess,
  assignPlanToTenantFailure,
  hidePlanModal
} from './subscriptionSlice';

// Saga functions for subscription plans
function* fetchPlansSaga(action) {
  try {
    const params = action.payload || {};
    const response = yield call(superAdminAPI.getSubscriptionPlans, params);
    const plans = response.data || response;
    yield put(fetchPlansSuccess(plans));
  } catch (error) {
    console.error('❌ Error in fetchPlansSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch subscription plans';
    yield put(fetchPlansFailure(errorMessage));
  }
}

function* createPlanSaga(action) {
  try {
    const response = yield call(superAdminAPI.createSubscriptionPlan, action.payload);
    const newPlan = response.data || response;
    yield put(createPlanSuccess(newPlan));
    yield put(hidePlanModal());

    if (window.showNotification) {
      window.showNotification('Subscription plan created successfully', 'success');
    }

    // Refresh plans list
    yield put(fetchPlansRequest());
  } catch (error) {
    console.error('❌ Error in createPlanSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to create subscription plan';
    yield put(createPlanFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification(`Failed to create subscription plan: ${errorMessage}`, 'error');
    }
  }
}

function* updatePlanSaga(action) {
  try {
    const { id, ...planData } = action.payload;
    const response = yield call(superAdminAPI.updateSubscriptionPlan, id, planData);
    const updatedPlan = response.data || response;
    yield put(updatePlanSuccess(updatedPlan));
    yield put(hidePlanModal());

    if (window.showNotification) {
      window.showNotification('Subscription plan updated successfully', 'success');
    }

    // Refresh plans list
    yield put(fetchPlansRequest());
  } catch (error) {
    console.error('❌ Error in updatePlanSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to update subscription plan';
    yield put(updatePlanFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification(`Failed to update subscription plan: ${errorMessage}`, 'error');
    }
  }
}

function* deletePlanSaga(action) {
  try {
    const planId = action.payload;
    yield call(superAdminAPI.deleteSubscriptionPlan, planId);
    yield put(deletePlanSuccess(planId));

    if (window.showNotification) {
      window.showNotification('Subscription plan deleted successfully', 'success');
    }
  } catch (error) {
    console.error('❌ Error in deletePlanSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to delete subscription plan';
    yield put(deletePlanFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification(`Failed to delete subscription plan: ${errorMessage}`, 'error');
    }
  }
}

// Saga functions for subscriptions
function* fetchSubscriptionsSaga(action) {
  try {
    const params = action.payload || { page: 1, limit: 10 };
    const response = yield call(superAdminAPI.getSubscriptions, params);
    
    const validatedResponse = {
      subscriptions: response.subscriptions || response.data || [],
      pagination: response.pagination || {
        page: params.page || 1,
        limit: params.limit || 10,
        total: response.total || 0,
        totalPages: Math.ceil((response.total || 0) / (params.limit || 10))
      }
    };

    yield put(fetchSubscriptionsSuccess(validatedResponse));
  } catch (error) {
    console.error('❌ Error in fetchSubscriptionsSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch subscriptions';
    yield put(fetchSubscriptionsFailure(errorMessage));
  }
}

function* createSubscriptionSaga(action) {
  try {
    const response = yield call(superAdminAPI.createSubscription, action.payload);
    const newSubscription = response.data || response;
    yield put(createSubscriptionSuccess(newSubscription));

    if (window.showNotification) {
      window.showNotification('Subscription created successfully', 'success');
    }

    // Refresh subscriptions list
    yield put(fetchSubscriptionsRequest({ page: 1, limit: 10 }));
  } catch (error) {
    console.error('❌ Error in createSubscriptionSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to create subscription';
    yield put(createSubscriptionFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to create subscription', 'error');
    }
  }
}

function* updateSubscriptionSaga(action) {
  try {
    const { id, ...subscriptionData } = action.payload;
    const response = yield call(superAdminAPI.updateSubscription, id, subscriptionData);
    const updatedSubscription = response.data || response;
    yield put(updateSubscriptionSuccess(updatedSubscription));

    if (window.showNotification) {
      window.showNotification('Subscription updated successfully', 'success');
    }
  } catch (error) {
    console.error('❌ Error in updateSubscriptionSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to update subscription';
    yield put(updateSubscriptionFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to update subscription', 'error');
    }
  }
}

function* cancelSubscriptionSaga(action) {
  try {
    const subscriptionId = action.payload;
    const response = yield call(superAdminAPI.cancelSubscription, subscriptionId);
    const cancelledSubscription = response.data || response;
    yield put(cancelSubscriptionSuccess(cancelledSubscription));

    if (window.showNotification) {
      window.showNotification('Subscription cancelled successfully', 'success');
    }
  } catch (error) {
    console.error('❌ Error in cancelSubscriptionSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to cancel subscription';
    yield put(cancelSubscriptionFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to cancel subscription', 'error');
    }
  }
}

// Watcher sagas for subscription plans
function* watchFetchPlans() {
  yield takeLatest(fetchPlansRequest.type, fetchPlansSaga);
}

function* watchCreatePlan() {
  yield takeEvery(createPlanRequest.type, createPlanSaga);
}

function* watchUpdatePlan() {
  yield takeEvery(updatePlanRequest.type, updatePlanSaga);
}

function* watchDeletePlan() {
  yield takeEvery(deletePlanRequest.type, deletePlanSaga);
}

function* watchFetchTenants() {
  yield takeLatest(fetchTenantsRequest.type, fetchTenantsSaga);
}

function* watchAssignPlanToTenant() {
  yield takeEvery(assignPlanToTenantRequest.type, assignPlanToTenantSaga);
}

function* watchFetchSubscriptions() {
  yield takeLatest(fetchSubscriptionsRequest.type, fetchSubscriptionsSaga);
}

function* watchCreateSubscription() {
  yield takeEvery(createSubscriptionRequest.type, createSubscriptionSaga);
}

function* watchUpdateSubscription() {
  yield takeEvery(updateSubscriptionRequest.type, updateSubscriptionSaga);
}

function* watchCancelSubscription() {
  yield takeEvery(cancelSubscriptionRequest.type, cancelSubscriptionSaga);
}

// Missing saga functions for tenants and assignment
function* fetchTenantsSaga(action) {
  try {
    const params = action.payload || {};
    const response = yield call(superAdminAPI.getTenants, params);
    // Handle the API response structure {tenants: [...]}
    const responseData = response.data || response;
    yield put(fetchTenantsSuccess(responseData));
  } catch (error) {
    console.error('❌ Error in fetchTenantsSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch tenants';
    yield put(fetchTenantsFailure(errorMessage));
  }
}

function* assignPlanToTenantSaga(action) {
  try {
    const { tenantId, planId } = action.payload;
    console.log('🔄 Starting plan assignment:', { tenantId, planId });
    
    const response = yield call(superAdminAPI.assignSubscriptionToTenant, tenantId, { planId });
    console.log('✅ Assignment API response:', response);
    
    yield put(assignPlanToTenantSuccess({ tenantId, planId, subscription: response.data || response }));

    // Refresh tenants data to show updated plan assignment
    yield put(fetchTenantsRequest());

    if (window.showNotification) {
      window.showNotification('Plan assigned to tenant successfully', 'success');
    } else {
      console.log('✅ Plan assigned successfully but notification system not available');
    }
  } catch (error) {
    console.error('❌ Error in assignPlanToTenantSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to assign plan to tenant';
    yield put(assignPlanToTenantFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification(`Failed to assign plan: ${errorMessage}`, 'error');
    } else {
      console.error('❌ Plan assignment failed:', errorMessage);
    }
  }
}

// Root saga
export default function* subscriptionSaga() {
  yield all([
    fork(watchFetchPlans),
    fork(watchCreatePlan),
    fork(watchUpdatePlan),
    fork(watchDeletePlan),
    fork(watchFetchTenants),
    fork(watchAssignPlanToTenant)
  ]);
}
