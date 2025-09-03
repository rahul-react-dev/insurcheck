import { takeEvery, call, put, select } from 'redux-saga/effects';
import { 
  fetchSubscriptionRequest,
  fetchSubscriptionSuccess, 
  fetchSubscriptionFailure,
  fetchAvailablePlansRequest,
  fetchAvailablePlansSuccess,
  fetchAvailablePlansFailure,
  upgradePlanRequest,
  upgradePlanSuccess,
  upgradePlanFailure
} from './subscriptionSlice';
import apiRequest from '../../utils/api';
// Using global notification instead of importing a component

// Get token from state
const getToken = (state) => state.admin.token;

// Fetch current subscription
function* fetchSubscriptionSaga() {
  try {
    const token = yield select(getToken);
    const response = yield call(apiRequest, '/api/admin/subscription', 'GET', null, {
      'Authorization': `Bearer ${token}`
    });

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
    const token = yield select(getToken);
    const response = yield call(apiRequest, '/api/admin/subscription/plans', 'GET', null, {
      'Authorization': `Bearer ${token}`
    });

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
    const token = yield select(getToken);
    const { planId } = action.payload;
    
    const response = yield call(apiRequest, '/api/admin/subscription/upgrade', 'POST', 
      { planId }, 
      {
        'Authorization': `Bearer ${token}`
      }
    );

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

// Root saga
export default function* subscriptionSaga() {
  yield takeEvery(fetchSubscriptionRequest.type, fetchSubscriptionSaga);
  yield takeEvery(fetchAvailablePlansRequest.type, fetchAvailablePlansSaga);
  yield takeEvery(upgradePlanRequest.type, upgradePlanSaga);
}