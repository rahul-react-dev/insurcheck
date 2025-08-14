
import { call, put, takeEvery, takeLatest, all, fork } from 'redux-saga/effects';
import { superAdminAPI } from '../../utils/api';
import {
  fetchSubscriptionPlansRequest,
  fetchSubscriptionPlansSuccess,
  fetchSubscriptionPlansFailure,
  createSubscriptionPlanRequest,
  createSubscriptionPlanSuccess,
  createSubscriptionPlanFailure,
  updateSubscriptionPlanRequest,
  updateSubscriptionPlanSuccess,
  updateSubscriptionPlanFailure,
  deleteSubscriptionPlanRequest,
  deleteSubscriptionPlanSuccess,
  deleteSubscriptionPlanFailure,
  fetchSubscriptionsRequest,
  fetchSubscriptionsSuccess,
  fetchSubscriptionsFailure,
  createSubscriptionRequest,
  createSubscriptionSuccess,
  createSubscriptionFailure,
  updateSubscriptionRequest,
  updateSubscriptionSuccess,
  updateSubscriptionFailure,
  cancelSubscriptionRequest,
  cancelSubscriptionSuccess,
  cancelSubscriptionFailure
} from './subscriptionSlice';

// Saga functions for subscription plans
function* fetchSubscriptionPlansSaga(action) {
  try {
    const params = action.payload || {};
    const response = yield call(superAdminAPI.getSubscriptionPlans, params);
    const plans = response.data || response;
    yield put(fetchSubscriptionPlansSuccess(plans));
  } catch (error) {
    console.error('❌ Error in fetchSubscriptionPlansSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to fetch subscription plans';
    yield put(fetchSubscriptionPlansFailure(errorMessage));
  }
}

function* createSubscriptionPlanSaga(action) {
  try {
    const response = yield call(superAdminAPI.createSubscriptionPlan, action.payload);
    const newPlan = response.data || response;
    yield put(createSubscriptionPlanSuccess(newPlan));

    if (window.showNotification) {
      window.showNotification('Subscription plan created successfully', 'success');
    }

    // Refresh plans list
    yield put(fetchSubscriptionPlansRequest());
  } catch (error) {
    console.error('❌ Error in createSubscriptionPlanSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to create subscription plan';
    yield put(createSubscriptionPlanFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to create subscription plan', 'error');
    }
  }
}

function* updateSubscriptionPlanSaga(action) {
  try {
    const { id, ...planData } = action.payload;
    const response = yield call(superAdminAPI.updateSubscriptionPlan, id, planData);
    const updatedPlan = response.data || response;
    yield put(updateSubscriptionPlanSuccess(updatedPlan));

    if (window.showNotification) {
      window.showNotification('Subscription plan updated successfully', 'success');
    }
  } catch (error) {
    console.error('❌ Error in updateSubscriptionPlanSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to update subscription plan';
    yield put(updateSubscriptionPlanFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to update subscription plan', 'error');
    }
  }
}

function* deleteSubscriptionPlanSaga(action) {
  try {
    const planId = action.payload;
    yield call(superAdminAPI.deleteSubscriptionPlan, planId);
    yield put(deleteSubscriptionPlanSuccess(planId));

    if (window.showNotification) {
      window.showNotification('Subscription plan deleted successfully', 'success');
    }
  } catch (error) {
    console.error('❌ Error in deleteSubscriptionPlanSaga:', error);
    const errorMessage = error?.message || error?.response?.data?.message || 'Failed to delete subscription plan';
    yield put(deleteSubscriptionPlanFailure(errorMessage));

    if (window.showNotification) {
      window.showNotification('Failed to delete subscription plan', 'error');
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

// Watcher sagas
function* watchFetchSubscriptionPlans() {
  yield takeLatest(fetchSubscriptionPlansRequest.type, fetchSubscriptionPlansSaga);
}

function* watchCreateSubscriptionPlan() {
  yield takeEvery(createSubscriptionPlanRequest.type, createSubscriptionPlanSaga);
}

function* watchUpdateSubscriptionPlan() {
  yield takeEvery(updateSubscriptionPlanRequest.type, updateSubscriptionPlanSaga);
}

function* watchDeleteSubscriptionPlan() {
  yield takeEvery(deleteSubscriptionPlanRequest.type, deleteSubscriptionPlanSaga);
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

// Root saga
export default function* subscriptionSaga() {
  yield all([
    fork(watchFetchSubscriptionPlans),
    fork(watchCreateSubscriptionPlan),
    fork(watchUpdateSubscriptionPlan),
    fork(watchDeleteSubscriptionPlan),
    fork(watchFetchSubscriptions),
    fork(watchCreateSubscription),
    fork(watchUpdateSubscription),
    fork(watchCancelSubscription)
  ]);
}
