
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { loginRequest, clearLoginError, checkLockout } from '../../store/super-admin/superAdminSlice';
import { SUPER_ADMIN_MESSAGES } from '../../constants/superAdmin';

const SuperAdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    isLoading,
    error,
    isAuthenticated,
    loginAttempts,
    isLocked,
    lockoutTime
  } = useSelector(state => state.superAdmin);

  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated) {
      navigate('/super-admin/dashboard');
    }

    // Check lockout status on component mount and every minute
    dispatch(checkLockout());
    const lockoutInterval = setInterval(() => {
      dispatch(checkLockout());
    }, 60000);

    return () => clearInterval(lockoutInterval);
  }, [isAuthenticated, navigate, dispatch]);

  useEffect(() => {
    // Clear error when component mounts
    return () => {
      dispatch(clearLoginError());
    };
  }, [dispatch]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isLocked) return;

    // Validate email
    if (!email || !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!password) {
      return;
    }

    dispatch(loginRequest({ email, password }));
  };

  const getRemainingLockoutTime = () => {
    if (!isLocked || !lockoutTime) return '';
    
    const now = new Date();
    const lockoutEnd = new Date(lockoutTime);
    const diff = lockoutEnd - now;
    
    if (diff <= 0) return '';
    
    const minutes = Math.ceil(diff / 60000);
    return `Try again in ${minutes} minutes.`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">InsurCheck</h1>
          <p className="text-blue-200">Super Admin Portal</p>
        </div>

        <Card className="p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {SUPER_ADMIN_MESSAGES.LOGIN.TITLE}
            </h2>
            <p className="text-gray-600">
              Sign in to access the system monitoring dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {SUPER_ADMIN_MESSAGES.LOGIN.EMAIL_LABEL}
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                disabled={isLoading || isLocked}
                className={`w-full ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="admin@insurcheck.com"
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {SUPER_ADMIN_MESSAGES.LOGIN.PASSWORD_LABEL}
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || isLocked}
                className="w-full"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {isLocked && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-700">
                  {SUPER_ADMIN_MESSAGES.LOGIN.ACCOUNT_LOCKED}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  {getRemainingLockoutTime()}
                </p>
              </div>
            )}

            {loginAttempts > 0 && loginAttempts < 5 && !isLocked && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                <p className="text-sm text-orange-700">
                  {5 - loginAttempts} attempts remaining before account lockout.
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || isLocked || !email || !password || emailError}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition duration-200"
            >
              {isLoading ? 'Signing In...' : SUPER_ADMIN_MESSAGES.LOGIN.LOGIN_BUTTON}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/super-admin/forgot-password')}
              className="text-sm text-blue-600 hover:text-blue-700 transition duration-200"
            >
              {SUPER_ADMIN_MESSAGES.LOGIN.FORGOT_PASSWORD}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
