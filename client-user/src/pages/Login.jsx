import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { loginRequest, clearError } from '../store/authSlice';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import TenantStatusError from '../components/ui/TenantStatusError';
import UpgradePrompt from '../components/ui/UpgradePrompt';
import { useToast } from '../hooks/use-toast';
import { cn } from '../utils/cn';

// Enhanced validation schema for login
const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z.string()
    .min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const { toast } = useToast();
  
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(null);
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);
  
  // Tenant status error handling
  const [tenantError, setTenantError] = useState(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  
  // Initialize form with react-hook-form and zod validation
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  // Clear any stale error state on component mount and handle account lockout logic
  useEffect(() => {
    // Clear any previous error state from Redux persist
    if (error) {
      dispatch(clearError());
    }
    
    const storedFailedAttempts = localStorage.getItem('loginFailedAttempts');
    const storedLockoutTime = localStorage.getItem('loginLockoutTime');
    
    if (storedFailedAttempts) {
      setFailedAttempts(parseInt(storedFailedAttempts));
    }
    
    if (storedLockoutTime) {
      const lockoutExpiry = new Date(storedLockoutTime);
      const now = new Date();
      
      if (now < lockoutExpiry) {
        setIsLocked(true);
        setLockoutTime(lockoutExpiry);
        
        // Set timer to unlock account
        const timeToUnlock = lockoutExpiry.getTime() - now.getTime();
        setTimeout(() => {
          setIsLocked(false);
          setLockoutTime(null);
          setFailedAttempts(0);
          localStorage.removeItem('loginFailedAttempts');
          localStorage.removeItem('loginLockoutTime');
          toast({
            type: 'success',
            title: 'Account Unlocked',
            description: 'You can now try logging in again.'
          });
        }, timeToUnlock);
      } else {
        // Lockout has expired
        setIsLocked(false);
        setLockoutTime(null);
        setFailedAttempts(0);
        localStorage.removeItem('loginFailedAttempts');
        localStorage.removeItem('loginLockoutTime');
      }
    }
  }, [dispatch, toast]);
  
  // Handle failed login attempts and tenant status errors
  const lastProcessedErrorRef = useRef(null);
  const attemptIdRef = useRef(0);
  
  useEffect(() => {
    if (error && hasAttemptedLogin && !error.includes('Account locked')) {
      // Create unique identifier for this error occurrence
      attemptIdRef.current += 1;
      const currentAttemptId = attemptIdRef.current;
      
      // Prevent processing the same specific attempt multiple times
      if (lastProcessedErrorRef.current === currentAttemptId) {
        return;
      }
      
      lastProcessedErrorRef.current = currentAttemptId;
      
      // Try to parse error as JSON to get detailed error info
      let errorData;
      try {
        errorData = typeof error === 'string' ? JSON.parse(error) : error;
      } catch {
        errorData = { message: error };
      }

      // Check for tenant status errors
      if (errorData.code && ['TENANT_DEACTIVATED', 'TRIAL_EXPIRED', 'SUBSCRIPTION_CANCELLED', 'TENANT_NOT_FOUND'].includes(errorData.code)) {
        setTenantError({
          code: errorData.code,
          message: errorData.message,
          tenantStatus: errorData.tenantStatus,
          trialEndDate: errorData.trialEndDate,
          trialEnded: errorData.trialEnded
        });
        
        // For trial expired, automatically show upgrade prompt
        if (errorData.code === 'TRIAL_EXPIRED') {
          setShowUpgradePrompt(true);
        }
        return; // Don't process as regular login failure
      }
      
      // Handle regular login failures - increment count every time we get a real error
      const currentFailedAttempts = parseInt(localStorage.getItem('loginFailedAttempts') || '0');
      const newFailedAttempts = currentFailedAttempts + 1;
      
      console.log(`Failed login attempt #${newFailedAttempts} - Error: ${errorData.message || error}`);
      
      setFailedAttempts(newFailedAttempts);
      localStorage.setItem('loginFailedAttempts', newFailedAttempts.toString());
      
      if (newFailedAttempts >= 5) {
        const lockoutExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        setIsLocked(true);
        setLockoutTime(lockoutExpiry);
        localStorage.setItem('loginLockoutTime', lockoutExpiry.toISOString());
        
        toast({
          type: 'error',
          title: 'Account Locked',
          description: 'Too many failed attempts. Account locked for 15 minutes.'
        });
        
        // Set timer to unlock
        setTimeout(() => {
          setIsLocked(false);
          setLockoutTime(null);
          setFailedAttempts(0);
          localStorage.removeItem('loginFailedAttempts');
          localStorage.removeItem('loginLockoutTime');
          toast({
            type: 'success',
            title: 'Account Unlocked',
            description: 'You can now try logging in again.'
          });
        }, 15 * 60 * 1000);
      } else {
        toast({
          type: 'error',
          title: 'Login Failed',
          description: `${errorData.message || error}. ${5 - newFailedAttempts} attempts remaining.`
        });
      }
    }
  }, [error, hasAttemptedLogin, toast]);
  
  // Clear error when user starts typing
  useEffect(() => {
    const subscription = watch(() => {
      if (error) {
        dispatch(clearError());
        clearErrors();
        setTenantError(null); // Clear tenant error as well
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, error, dispatch, clearErrors]);

  // Handler functions for tenant status error actions
  const handleUpgrade = (selectedPlan) => {
    setIsUpgrading(true);
    // TODO: Implement actual upgrade logic
    toast({
      type: 'info',
      title: 'Upgrade Initiated',
      description: `Upgrading to ${selectedPlan?.name || 'selected plan'}...`
    });
    
    // Simulate upgrade process
    setTimeout(() => {
      setIsUpgrading(false);
      setShowUpgradePrompt(false);
      setTenantError(null);
      toast({
        type: 'success',
        title: 'Upgrade Successful',
        description: 'Please try logging in again.'
      });
    }, 2000);
  };

  const handleContactSupport = () => {
    // TODO: Implement contact support functionality
    toast({
      type: 'info',
      title: 'Contact Support',
      description: 'Please contact support at support@insurcheck.com or call 1-800-SUPPORT'
    });
  };

  const handleRetryLogin = () => {
    setTenantError(null);
    dispatch(clearError());
    clearErrors();
  };
  
  const onSubmit = (data) => {
    if (isLocked) {
      toast({
        type: 'error',
        title: 'Account Locked',
        description: `Account is locked. Try again in ${Math.ceil((lockoutTime - new Date()) / 60000)} minutes.`
      });
      return;
    }
    
    // Mark that a login attempt has been made
    setHasAttemptedLogin(true);
    
    // Add role for user login
    const loginData = {
      ...data,
      role: 'user'
    };
    
    dispatch(loginRequest(loginData));
  };
  
  // Reset failed attempts on successful login and handle navigation
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !error && !isLoading) {
      setFailedAttempts(0);
      setIsLocked(false);
      setLockoutTime(null);
      localStorage.removeItem('loginFailedAttempts');
      localStorage.removeItem('loginLockoutTime');
      errorProcessedRef.current = null; // Reset error tracking
      
      // Navigate to dashboard on successful login
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    }
  }, [error, isLoading, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Calculate remaining lockout time
  const getRemainingLockoutTime = () => {
    if (!lockoutTime) return 0;
    const remaining = Math.max(0, Math.ceil((lockoutTime - new Date()) / 60000));
    return remaining;
  };
  
  const watchedEmail = watch('email');
  const watchedPassword = watch('password');

  return (
    <div className="min-h-screen gradient-primary">
      {/* Main Container - constrains max width on ultrawide screens */}
      <div className="max-w-7xl mx-auto min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6">
            <i className="fas fa-shield-alt text-blue-600 text-2xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">InsurCheck</h1>
          <p className="text-blue-100 text-sm font-medium">Professional Insurance Management Platform</p>
        </div>

        {/* Show tenant status error instead of login form */}
        {tenantError ? (
          <TenantStatusError
            code={tenantError.code}
            message={tenantError.message}
            tenantStatus={tenantError.tenantStatus}
            trialEndDate={tenantError.trialEndDate}
            onUpgrade={() => setShowUpgradePrompt(true)}
            onContactSupport={handleContactSupport}
            onRetry={handleRetryLogin}
          />
        ) : (
          /* Login Form Card */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-8 space-y-6"
          >
            {/* Welcome Text */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome Back</h2>
              <p className="text-gray-500 text-sm">Sign in to access your dashboard</p>
            </div>
          
          {/* Account Status Messages */}
          {isLocked && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium text-sm">Account Temporarily Locked</p>
                <p className="text-red-600 text-xs mt-1">
                  Too many failed attempts. Try again in {getRemainingLockoutTime()} minutes.
                </p>
              </div>
            </motion.div>
          )}
          
          {/* API Error Message - Only show after login attempt */}
          {error && !isLocked && hasAttemptedLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium text-sm">Login Failed</p>
                <p className="text-red-600 text-xs mt-1">{error}</p>
              </div>
            </motion.div>
          )}
          
          {failedAttempts > 0 && failedAttempts < 5 && !isLocked && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center space-x-3"
            >
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <div>
                <p className="text-yellow-800 font-medium text-sm">Authentication Warning</p>
                <p className="text-yellow-600 text-xs mt-1">
                  {5 - failedAttempts} attempts remaining before account lockout.
                </p>
              </div>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-800">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={cn(
                    "w-4 h-4 transition-colors duration-200",
                    errors.email ? "text-red-400" : watchedEmail ? "text-blue-500" : "text-gray-400"
                  )} />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  disabled={isLocked}
                  className={cn(
                    "block w-full pl-10 pr-3 py-3 border rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50",
                    errors.email 
                      ? "border-red-300 focus:ring-red-500" 
                      : "border-gray-200 focus:ring-blue-500 hover:border-gray-300",
                    isLocked && "opacity-50 cursor-not-allowed"
                  )}
                  placeholder="Enter your email address"
                  data-testid="input-email"
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-xs mt-1 flex items-center"
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-800">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={cn(
                    "w-4 h-4 transition-colors duration-200",
                    errors.password ? "text-red-400" : watchedPassword ? "text-blue-500" : "text-gray-400"
                  )} />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  disabled={isLocked}
                  className={cn(
                    "block w-full pl-10 pr-10 py-3 border rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50",
                    errors.password 
                      ? "border-red-300 focus:ring-red-500" 
                      : "border-gray-200 focus:ring-blue-500 hover:border-gray-300",
                    isLocked && "opacity-50 cursor-not-allowed"
                  )}
                  placeholder="Enter your password"
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={isLocked}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  data-testid="button-toggle-password"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                  )}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-xs mt-1 flex items-center"
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <input
                  {...register('rememberMe')}
                  type="checkbox"
                  id="rememberMe"
                  disabled={isLocked}
                  className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                  data-testid="checkbox-remember-me"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600 select-none">
                  Remember me for 30 days
                </label>
              </div>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200 focus:outline-none focus:underline"
                data-testid="link-forgot-password"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isLoading || isSubmitting || isLocked || !watchedEmail || !watchedPassword}
              className={cn(
                "w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl font-semibold text-sm transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                isLocked 
                  ? "bg-gray-400 text-white cursor-not-allowed" 
                  : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              data-testid="button-login"
            >
              {isLoading || isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : isLocked ? (
                <span>Account Locked</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <motion.div
                    initial={{ x: 0 }}
                    whileHover={{ x: 3 }}
                    className="ml-2"
                  >
                    →
                  </motion.div>
                </>
              )}
            </Button>
          </form>

        </motion.div>
        )}

        {/* Footer - Only show when not showing tenant error */}
        {!tenantError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <p className="text-blue-100 text-sm">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-white hover:text-blue-200 transition-colors duration-200 underline focus:outline-none"
                data-testid="link-signup"
              >
                Sign up here
              </Link>
            </p>
            <div className="mt-4 flex justify-center items-center space-x-4 text-blue-200 text-xs">
              <Link 
                to="/privacy"
                className="hover:text-white transition-colors duration-200 focus:outline-none"
              >
                Privacy Policy
              </Link>
              <span>•</span>
              <Link 
                to="/terms"
                className="hover:text-white transition-colors duration-200 focus:outline-none"
              >
                Terms of Service
              </Link>
              <span>•</span>
              <a href="mailto:support@insurcheck.com" className="hover:text-white transition-colors duration-200">
                Support
              </a>
            </div>
          </motion.div>
        )}
      </div>
      </div>

      {/* Upgrade Prompt Modal */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        onUpgrade={handleUpgrade}
        trialEndDate={tenantError?.trialEndDate}
        isLoading={isUpgrading}
      />
    </div>
  );
};

export default Login;
