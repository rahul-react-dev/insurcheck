import { call, put, takeEvery } from 'redux-saga/effects';
import { loginRequest, loginSuccess, loginFailure } from '../authSlice';
import { loginApi } from '../../utils/api';

function* loginSaga(action) {
  try {
    const response = yield call(loginApi, action.payload);
    yield put(loginSuccess(response.data));
    
    // Store token in localStorage
    localStorage.setItem('token', response.data.token);
    
    // Redirect based on role (placeholder for now)
    // window.location.href = '/dashboard';
  } catch (error) {
    yield put(loginFailure(error.response?.data?.message || 'Login failed'));
  }
}

function* authSaga() {
  yield takeEvery(loginRequest.type, loginSaga);
}

export default authSaga;
