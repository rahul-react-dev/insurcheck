
import { call, put, takeEvery } from 'redux-saga/effects';
import {
  loginRequest,
  loginSuccess,
  loginFailure,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  forgotPasswordFailure,
} from './adminSlice';
import { adminAuthApi } from '../../utils/api';

// Saga workers
function* adminLoginSaga(action) {
  try {
    const response = yield call(adminAuthApi.login, action.payload);

    if (response?.success && response?.data) {
      yield put(loginSuccess(response.data));

      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
      }
    } else {
      yield put(loginFailure(response?.message || 'Invalid response from server'));
    }
  } catch (error) {
    console.error('Admin login error:', error);

    let errorMessage = 'Login failed';

    // Handle our custom error responses
    if (error?.message) {
      try {
        const parsedError = JSON.parse(error.message);
        if (parsedError?.message) {
          errorMessage = parsedError.message;
        } else if (parsedError?.error) {
          errorMessage = parsedError.error;
        }
      } catch {
        errorMessage = error.message;
      }
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error?.response?.status === 401) {
      errorMessage = 'Invalid credentials or insufficient privileges';
    } else if (error?.response?.status === 423) {
      errorMessage = 'Account locked. Try again in 15 minutes.';
    } else if (error?.response?.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    }

    yield put(loginFailure(errorMessage));
  }
}

function* forgotPasswordSaga(action) {
  try {
    const response = yield call(adminAuthApi.forgotPassword, action.payload);
    yield put(forgotPasswordSuccess(response.message || 'Password reset email sent successfully'));
  } catch (error) {
    console.error('Forgot password error:', error);
    
    let errorMessage = 'Failed to send reset email';
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    yield put(forgotPasswordFailure(errorMessage));
  }
}

// Root saga
function* adminSaga() {
  yield takeEvery(loginRequest.type, adminLoginSaga);
  yield takeEvery(forgotPasswordRequest.type, forgotPasswordSaga);
}

export default adminSaga;
