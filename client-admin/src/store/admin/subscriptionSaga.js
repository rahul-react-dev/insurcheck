import { takeEvery, call, put } from 'redux-saga/effects';
import { 
  fetchSubscriptionRequest,
  fetchSubscriptionSuccess, 
  fetchSubscriptionFailure,
  fetchAvailablePlansRequest,
  fetchAvailablePlansSuccess,
  fetchAvailablePlansFailure,
  upgradePlanRequest,
  upgradePlanSuccess,
  upgradePlanFailure,
  createPaymentIntentRequest,
  createPaymentIntentSuccess,
  createPaymentIntentFailure,
  verifyPaymentAndUpdateRequest,
  verifyPaymentAndUpdateSuccess,
  verifyPaymentAndUpdateFailure
} from './subscriptionSlice';
import { apiCall } from '../../utils/api';
// Using global notification instead of importing a component

// apiCall automatically handles authentication via localStorage

// Fetch current subscription
function* fetchSubscriptionSaga() {
  try {
    const response = yield call(apiCall, '/api/admin/subscription');

    if (response.success) {
      yield put(fetchSubscriptionSuccess(response.data));
    } else {
      throw new Error(response.message || 'Failed to fetch subscription');
    }
  } catch (error) {
    console.error('Subscription fetch error:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch subscription';
    yield put(fetchSubscriptionFailure(errorMessage));
  }
}

// Fetch available plans
function* fetchAvailablePlansSaga() {
  try {
    const response = yield call(apiCall, '/api/admin/subscription/plans');

    if (response.success) {
      yield put(fetchAvailablePlansSuccess(response.data));
    } else {
      throw new Error(response.message || 'Failed to fetch available plans');
    }
  } catch (error) {
    console.error('Available plans fetch error:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch available plans';
    yield put(fetchAvailablePlansFailure(errorMessage));
  }
}

// Upgrade/change plan
function* upgradePlanSaga(action) {
  try {
    const { planId } = action.payload;
    
    const response = yield call(apiCall, '/api/admin/subscription/upgrade', {
      method: 'POST',
      body: JSON.stringify({ planId })
    });

    if (response.success) {
      yield put(upgradePlanSuccess(response.data));
      
      // Show success notification
      if (window.showNotification) {
        window.showNotification('Subscription plan updated successfully!', 'success', 5000);
      }

      // Refresh subscription data
      yield put(fetchSubscriptionRequest());
    } else {
      throw new Error(response.message || 'Failed to upgrade plan');
    }
  } catch (error) {
    console.error('Plan upgrade error:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to upgrade plan';
    yield put(upgradePlanFailure(errorMessage));
    
    // Show error notification
    if (window.showNotification) {
      window.showNotification(errorMessage, 'error', 5000);
    }
  }
}

// Create payment intent for subscription upgrade
function* createPaymentIntentSaga(action) {
  try {
    const { planId } = action.payload;
    
    const response = yield call(apiCall, '/api/admin/subscription/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ planId })
    });

    if (response.success) {
      yield put(createPaymentIntentSuccess(response.data));
    } else {
      throw new Error(response.message || 'Failed to create payment intent');
    }
  } catch (error) {
    console.error('Payment intent creation error:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create payment intent';
    yield put(createPaymentIntentFailure(errorMessage));
    
    // Show error notification
    if (window.showNotification) {
      window.showNotification(errorMessage, 'error', 5000);
    }
  }
}

// Verify payment and update subscription (fallback for webhook issues)
function* verifyPaymentAndUpdateSaga(action) {
  try {
    const { paymentIntentId } = action.payload;
    
    const response = yield call(apiCall, '/api/admin/subscription/verify-payment', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId })
    });

    if (response.success) {
      yield put(verifyPaymentAndUpdateSuccess(response.data));
      
      // Show success notification
      if (window.showNotification) {
        window.showNotification('Subscription updated successfully!', 'success', 5000);
      }
    } else {
      throw new Error(response.message || 'Failed to verify payment and update subscription');
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to verify payment';
    yield put(verifyPaymentAndUpdateFailure(errorMessage));
    
    // Show error notification
    if (window.showNotification) {
      window.showNotification(errorMessage, 'error', 5000);
    }
  }
}

// Root saga
export default function* subscriptionSaga() {
  yield takeEvery(fetchSubscriptionRequest.type, fetchSubscriptionSaga);
  yield takeEvery(fetchAvailablePlansRequest.type, fetchAvailablePlansSaga);
  yield takeEvery(upgradePlanRequest.type, upgradePlanSaga);
  yield takeEvery(createPaymentIntentRequest.type, createPaymentIntentSaga);
  yield takeEvery(verifyPaymentAndUpdateRequest.type, verifyPaymentAndUpdateSaga);
}