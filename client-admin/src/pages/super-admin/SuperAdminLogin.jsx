
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { loginRequest, clearErrors } from '../../store/super-admin/superAdminSlice';
import { SUPER_ADMIN_MESSAGES } from '../../constants/superAdmin';

const SuperAdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isLoading, error, isAuthenticated, user } = useSelector(state => state.superAdmin);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Clear any existing errors when component mounts
    dispatch(clearErrors());
    
    // Redirect if already authenticated
    if (isAuthenticated && user?.role === 'super-admin') {
      navigate('/super-admin/dashboard', { replace: true });
    }
  }, [dispatch, isAuthenticated, user, navigate]);

  // Additional useEffect to handle navigation after login success
  useEffect(() => {
    if (isAuthenticated && user?.role === 'super-admin' && !isLoading) {
      navigate('/super-admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.email && formData.password) {
      dispatch(loginRequest(formData));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo Section */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <i className="fas fa-shield-alt text-white text-2xl sm:text-3xl"></i>
          </div>
          <h2 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-900">
            {SUPER_ADMIN_MESSAGES.LOGIN.TITLE}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Access your super admin dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl rounded-xl border border-gray-200">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <i className="fas fa-exclamation-triangle text-red-400"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 break-words">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => dispatch(clearErrors())}
                    className="text-red-400 hover:text-red-600"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label={SUPER_ADMIN_MESSAGES.LOGIN.EMAIL_LABEL}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              leftIcon={<i className="fas fa-envelope"></i>}
              placeholder="Enter your email address"
              disabled={isLoading}
            />

            <Input
              label={SUPER_ADMIN_MESSAGES.LOGIN.PASSWORD_LABEL}
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              leftIcon={<i className="fas fa-lock"></i>}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              }
              placeholder="Enter your password"
              disabled={isLoading}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => navigate('/super-admin/forgot-password')}
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  {SUPER_ADMIN_MESSAGES.LOGIN.FORGOT_PASSWORD}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !formData.email || !formData.password}
              loading={isLoading}
              fullWidth
              size="large"
              className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
            >
              {SUPER_ADMIN_MESSAGES.LOGIN.LOGIN_BUTTON}
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
    </div>
  );
};

export default SuperAdminLogin;
