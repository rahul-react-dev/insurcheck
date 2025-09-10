import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  // Signup specific states
  isSigningUp: false,
  signupError: null,
  signupSuccess: false,
  // Email check states
  isCheckingEmail: false,
  emailExists: null,
  emailCheckError: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest: (state, action) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      // Clear token from localStorage on logout
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },

    // Signup actions
    signupRequest: (state, action) => {
      state.isSigningUp = true;
      state.signupError = null;
      state.signupSuccess = false;
    },
    signupSuccess: (state, action) => {
      state.isSigningUp = false;
      state.signupSuccess = true;
      state.signupError = null;
      // Optionally auto-login the user
      if (action.payload.user && action.payload.token) {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      }
    },
    signupFailure: (state, action) => {
      state.isSigningUp = false;
      state.signupError = action.payload;
      state.signupSuccess = false;
    },
    clearSignupState: (state) => {
      state.isSigningUp = false;
      state.signupError = null;
      state.signupSuccess = false;
    },

    // Email check actions
    checkEmailRequest: (state, action) => {
      state.isCheckingEmail = true;
      state.emailCheckError = null;
      state.emailExists = null;
    },
    checkEmailSuccess: (state, action) => {
      state.isCheckingEmail = false;
      state.emailExists = action.payload.exists;
      state.emailCheckError = null;
    },
    checkEmailFailure: (state, action) => {
      state.isCheckingEmail = false;
      state.emailCheckError = action.payload;
      state.emailExists = null;
    },
    clearEmailCheck: (state) => {
      state.isCheckingEmail = false;
      state.emailExists = null;
      state.emailCheckError = null;
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  signupRequest,
  signupSuccess,
  signupFailure,
  clearSignupState,
  checkEmailRequest,
  checkEmailSuccess,
  checkEmailFailure,
  clearEmailCheck,
} = authSlice.actions;

export default authSlice.reducer;
