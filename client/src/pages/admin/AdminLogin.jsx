
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { 
  loginRequest, 
  clearErrors, 
  checkLockout,
  forgotPasswordRequest,
  resetForgotPassword 
} from '../../store/admin/adminSlice';

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { 
    isLoading, 
    error, 
    isAuthenticated, 
    user, 
    loginAttempts, 
    isLocked, 
    lockoutTime,
    forgotPasswordLoading,
    forgotPasswordSuccess,
    forgotPasswordError
  } = useSelector(state => state.admin);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [remainingTime, setRemainingTime] = useState(0);

  // Check lockout status on component mount
  useEffect(() => {
    dispatch(checkLockout());
  }, [dispatch]);

  // Calculate remaining lockout time
  useEffect(() => {
    if (isLocked && lockoutTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const lockEnd = new Date(lockoutTime);
        const remaining = Math.max(0, Math.floor((lockEnd - now) / 1000));
        
        setRemainingTime(remaining);
        
        if (remaining === 0) {
          dispatch(checkLockout());
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isLocked, lockoutTime, dispatch]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user && (user.role === 'tenant-admin' || user.role === 'admin')) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearErrors());
    return () => {
      dispatch(clearErrors());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (error) {
      dispatch(clearErrors());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isLocked) {
      return;
    }
    
    if (formData.email && formData.password) {
      // Add role specification for admin login
      dispatch(loginRequest({
        ...formData,
        role: 'tenant-admin' // This will be validated on the backend
      }));
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (forgotPasswordEmail) {
      dispatch(forgotPasswordRequest(forgotPasswordEmail));
    }
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setForgotPasswordEmail('');
    dispatch(resetForgotPassword());
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isFormValid = formData.email && formData.password && !isLocked;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo Section */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
            <i className="fas fa-shield-alt text-white text-2xl sm:text-3xl"></i>
          </div>
          <h2 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-900">
            Admin Panel Login
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Access your admin dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Account Locked Warning */}
            {isLocked && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <i className="fas fa-lock mr-2"></i>
                  <div className="text-sm">
                    <p className="font-semibold">Account Locked</p>
                    <p>Too many failed attempts. Try again in {formatTime(remainingTime)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Login Attempts Warning */}
            {loginAttempts > 0 && loginAttempts < 5 && !isLocked && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  <span className="text-sm">
                    {5 - loginAttempts} attempt{5 - loginAttempts !== 1 ? 's' : ''} remaining before account lock
                  </span>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                disabled={isLoading || isLocked}
                className="text-base"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  disabled={isLoading || isLocked}
                  className="text-base pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isLocked}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm font-medium text-green-600 hover:text-green-500 transition-colors"
                disabled={isLoading}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              loading={isLoading}
              fullWidth
              size="large"
              className="bg-green-600 hover:bg-green-700 focus:ring-green-500 disabled:bg-gray-300"
            >
              {isLocked ? 'Account Locked' : 'Sign In to Admin Panel'}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            © 2024 InsurCheck. All rights reserved.
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Reset Password</h3>
                <button
                  onClick={closeForgotPasswordModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {/* Success Message */}
              {forgotPasswordSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                  <div className="flex items-center">
                    <i className="fas fa-check-circle mr-2"></i>
                    <span className="text-sm">Password reset email sent successfully!</span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {forgotPasswordError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  <div className="flex items-center">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    <span className="text-sm">{forgotPasswordError}</span>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleForgotPassword}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    disabled={forgotPasswordLoading}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeForgotPasswordModal}
                    disabled={forgotPasswordLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={forgotPasswordLoading}
                    disabled={!forgotPasswordEmail || forgotPasswordLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Send Reset Email
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;
