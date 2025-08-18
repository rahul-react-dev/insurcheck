import { call, put, takeEvery } from 'redux-saga/effects';
import { loginRequest, loginSuccess, loginFailure } from '../authSlice';
import { authAPI } from '../../utils/api';

function* loginSaga(action) {
  try {
    // Determine which login API to use based on role or route
    const loginMethod = action.payload.role === 'admin' || window.location.pathname.includes('/admin/') 
      ? authAPI.adminLogin 
      : authAPI.superAdminLogin;
    
    const response = yield call(loginMethod, action.payload);
    
    // Check if response has data
    if (response?.data) {
      yield put(loginSuccess(response.data));
      
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      // Redirect based on role (placeholder for now)
      // window.location.href = '/dashboard';
    } else {
      yield put(loginFailure('Invalid response from server'));
    }
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle different error types
    let errorMessage = 'Login failed';
    
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (error?.response?.status === 401) {
      errorMessage = 'Invalid credentials';
    } else if (error?.response?.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (!navigator.onLine) {
      errorMessage = 'No internet connection';
    }
    
    yield put(loginFailure(errorMessage));
  }
}

function* authSaga() {
  yield takeEvery(loginRequest.type, loginSaga);
}

export default authSaga;
