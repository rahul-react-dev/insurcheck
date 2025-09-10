import { call, put, takeEvery } from 'redux-saga/effects';
import { 
  loginRequest, 
  loginSuccess, 
  loginFailure,
  signupRequest,
  signupSuccess,
  signupFailure,
  checkEmailRequest,
  checkEmailSuccess,
  checkEmailFailure
} from '../authSlice';
import { authApi } from '../../utils/api';

function* loginSaga(action) {
  try {
    const { rememberMe, ...loginData } = action.payload;
    const response = yield call(authApi.login, loginData);
    
    // Check if response has data
    if (response?.data?.data) {
      yield put(loginSuccess(response.data.data));
      
      // Enhanced token storage with Remember Me functionality
      if (response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        
        // Set session expiry based on Remember Me
        const expiryTime = new Date();
        if (rememberMe) {
          expiryTime.setDate(expiryTime.getDate() + 30); // 30 days
          localStorage.setItem('sessionType', 'remember');
        } else {
          expiryTime.setMinutes(expiryTime.getMinutes() + 30); // 30 minutes
          localStorage.setItem('sessionType', 'session');
        }
        localStorage.setItem('sessionExpiry', expiryTime.toISOString());
        localStorage.setItem('lastActivity', new Date().toISOString());
        
        // Clear failed attempts on successful login
        localStorage.removeItem('loginFailedAttempts');
        localStorage.removeItem('loginLockoutTime');
        
        console.log(`✅ Login successful - Remember Me: ${rememberMe ? 'Yes' : 'No'}, Session expires: ${expiryTime.toISOString()}`);
      }
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
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
      errorMessage = 'Invalid email or password';
    } else if (error?.response?.status === 403) {
      errorMessage = 'Account locked. Try again in 15 minutes.';
    } else if (error?.response?.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (!navigator.onLine) {
      errorMessage = 'No internet connection';
    }
    
    yield put(loginFailure(errorMessage));
  }
}

function* signupSaga(action) {
  try {
    const response = yield call(authApi.signup, action.payload);
    
    // Check if response has data
    if (response?.data) {
      yield put(signupSuccess(response.data));
      
      // Store token in localStorage if user is auto-logged in
      if (response.data.token) {
        localStorage.setItem('userToken', response.data.token);
      }
      
    } else {
      yield put(signupFailure('Invalid response from server'));
    }
  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle different error types
    let errorMessage = 'Sign-up failed';
    
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (error?.response?.status === 400) {
      errorMessage = 'Invalid signup data';
    } else if (error?.response?.status === 409) {
      errorMessage = 'Email already registered';
    } else if (error?.response?.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (!navigator.onLine) {
      errorMessage = 'No internet connection';
    }
    
    yield put(signupFailure(errorMessage));
  }
}

function* checkEmailSaga(action) {
  try {
    const response = yield call(authApi.checkEmail, action.payload);
    
    if (response?.data) {
      yield put(checkEmailSuccess(response.data));
    } else {
      yield put(checkEmailFailure('Invalid response from server'));
    }
  } catch (error) {
    console.error('Check email error:', error);
    
    let errorMessage = 'Email check failed';
    
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (error?.response?.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (!navigator.onLine) {
      errorMessage = 'No internet connection';
    }
    
    yield put(checkEmailFailure(errorMessage));
  }
}

function* authSaga() {
  yield takeEvery(loginRequest.type, loginSaga);
  yield takeEvery(signupRequest.type, signupSaga);
  yield takeEvery(checkEmailRequest.type, checkEmailSaga);
}

export default authSaga;
