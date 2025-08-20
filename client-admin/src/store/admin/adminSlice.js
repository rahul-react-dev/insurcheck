
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  loginAttempts: 0,
  isLocked: false,
  lockoutTime: null,
  forgotPasswordLoading: false,
  forgotPasswordSuccess: false,
  forgotPasswordError: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Login actions
    loginRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      state.loginAttempts = 0;
      state.isLocked = false;
      state.lockoutTime = null;
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.loginAttempts += 1;
      state.isAuthenticated = false;

      // Lock account after 5 failed attempts for 15 minutes
      if (state.loginAttempts >= 5) {
        state.isLocked = true;
        state.lockoutTime = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      }
    },
    clearLoginError: (state) => {
      state.error = null;
    },
    checkLockout: (state) => {
      if (state.isLocked && state.lockoutTime) {
        const now = new Date();
        const lockoutEnd = new Date(state.lockoutTime);
        if (now >= lockoutEnd) {
          state.isLocked = false;
          state.lockoutTime = null;
          state.loginAttempts = 0;
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
      state.loginAttempts = 0;
      state.isLocked = false;
      state.lockoutTime = null;
      localStorage.removeItem('adminToken');
    },
    
    // Forgot Password actions
    forgotPasswordRequest: (state) => {
      state.forgotPasswordLoading = true;
      state.forgotPasswordError = null;
      state.forgotPasswordSuccess = false;
    },
    forgotPasswordSuccess: (state) => {
      state.forgotPasswordLoading = false;
      state.forgotPasswordSuccess = true;
      state.forgotPasswordError = null;
    },
    forgotPasswordFailure: (state, action) => {
      state.forgotPasswordLoading = false;
      state.forgotPasswordError = action.payload;
      state.forgotPasswordSuccess = false;
    },
    resetForgotPassword: (state) => {
      state.forgotPasswordLoading = false;
      state.forgotPasswordSuccess = false;
      state.forgotPasswordError = null;
    },
    
    // Clear all errors
    clearErrors: (state) => {
      state.error = null;
      state.forgotPasswordError = null;
    },
    
    // Hydrate authentication state from localStorage
    hydrateAdminAuth: (state) => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        try {
          // Decode JWT token to get user info
          const payload = JSON.parse(atob(token.split('.')[1]));
          const now = Date.now() / 1000;
          
          // Check if token is not expired
          if (payload.exp > now) {
            state.token = token;
            state.isAuthenticated = true;
            state.user = {
              id: payload.userId,
              email: payload.email,
              role: payload.role,
              tenantId: payload.tenantId
            };
            console.log('✅ Admin auth state hydrated from localStorage');
          } else {
            // Token expired, clear it
            localStorage.removeItem('adminToken');
            console.log('❌ Admin token expired, cleared from localStorage');
          }
        } catch (error) {
          // Invalid token, clear it
          localStorage.removeItem('adminToken');
          console.log('❌ Invalid admin token, cleared from localStorage');
        }
      }
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  clearLoginError,
  checkLockout,
  logout,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  resetForgotPassword,
  clearErrors,
  hydrateAdminAuth,
} = adminSlice.actions;

export default adminSlice.reducer;
