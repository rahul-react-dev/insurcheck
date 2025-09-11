import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle, XCircle, Loader2, Shield } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import Button from '../components/ui/Button';

// Validation schema for password reset
const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(10, 'Password must be at least 10 characters')
    .regex(/[a-z]/, 'Password must include lowercase letter')
    .regex(/[A-Z]/, 'Password must include uppercase letter')
    .regex(/\d/, 'Password must include number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must include special character'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(null); // null = checking, true = valid, false = invalid
  const [token, setToken] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    setError
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      newPassword: '',
      confirmPassword: ''
    }
  });

  const watchedNewPassword = watch('newPassword');

  // Password validation helpers
  const getPasswordValidations = (password) => {
    return {
      length: password.length >= 10,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const validations = getPasswordValidations(watchedNewPassword || '');

  // Check token validity on component mount
  useEffect(() => {
    const resetToken = searchParams.get('token');
    
    if (!resetToken) {
      setIsTokenValid(false);
      toast({
        type: 'error',
        title: 'Invalid Reset Link',
        description: 'No reset token found in the link.'
      });
      return;
    }

    setToken(resetToken);
    
    // Validate token with backend
    const validateToken = async () => {
      try {
        const response = await fetch(`/api/auth/validate-reset-token?token=${encodeURIComponent(resetToken)}`);
        const result = await response.json();
        
        if (response.ok && result.success && result.valid) {
          setIsTokenValid(true);
          console.log('Token validation successful');
        } else {
          setIsTokenValid(false);
          toast({
            type: 'error',
            title: 'Invalid or Expired Link',
            description: result.message || 'This password reset link is no longer valid.'
          });
        }
      } catch (error) {
        console.error('Token validation error:', error);
        setIsTokenValid(false);
        toast({
          type: 'error',
          title: 'Validation Failed',
          description: 'Unable to validate reset link. Please try again.'
        });
      }
    };
    
    validateToken();
  }, [searchParams, toast]);

  const onSubmit = async (data) => {
    if (!token) {
      toast({
        type: 'error',
        title: 'Invalid Token',
        description: 'Reset token is missing or invalid.'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          password: data.newPassword
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          type: 'success',
          title: 'Password Reset Successful',
          description: result.message || 'Password has been reset successfully. Please log in with your new password.'
        });
        
        // Redirect to login after success
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      
      // Try to get the actual error message from the server response
      let errorMessage = 'Failed to reset password. Please try again.';
      
      try {
        // If it's a fetch error with response, try to parse it
        if (error.message && typeof error.message === 'string') {
          errorMessage = error.message;
        }
      } catch (parseError) {
        console.error('Error parsing reset password error:', parseError);
      }
      
      if (errorMessage.includes('Invalid or expired')) {
        setIsTokenValid(false);
        toast({
          type: 'error',
          title: 'Invalid or Expired Link',
          description: errorMessage
        });
      } else {
        toast({
          type: 'error',
          title: 'Reset Failed',
          description: errorMessage
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state while checking token
  if (isTokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Reset Link</h2>
            <p className="text-gray-600">Please wait while we verify your password reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (isTokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">InsurCheck</h1>
            <p className="text-blue-200">Secure Insurance Management</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid or Expired Link</h2>
              <p className="text-gray-600 mb-6">
                This password reset link is invalid or has expired. Please request a new password reset.
              </p>
              <Button
                onClick={() => navigate('/forgot-password')}
                variant="primary"
                size="lg"
                className="w-full"
                data-testid="button-request-new-reset"
              >
                Request New Reset Link
              </Button>
              <Button
                onClick={() => navigate('/login')}
                variant="secondary"
                size="lg"
                className="w-full mt-3"
                data-testid="button-back-to-login"
              >
                Back to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Valid token - show reset form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">InsurCheck</h1>
          <p className="text-blue-200">Secure Insurance Management</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h2>
            <p className="text-gray-600">Enter your new password below</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* New Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('newPassword')}
                  type={showNewPassword ? 'text' : 'password'}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.newPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your new password"
                  data-testid="input-new-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  data-testid="button-toggle-new-password"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600" data-testid="error-new-password">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Password Requirements */}
            {watchedNewPassword && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
                <div className="space-y-1">
                  {[
                    { key: 'length', label: 'At least 10 characters', valid: validations.length },
                    { key: 'uppercase', label: 'One uppercase letter', valid: validations.uppercase },
                    { key: 'lowercase', label: 'One lowercase letter', valid: validations.lowercase },
                    { key: 'number', label: 'One number', valid: validations.number },
                    { key: 'special', label: 'One special character', valid: validations.special }
                  ].map(({ key, label, valid }) => (
                    <div key={key} className="flex items-center space-x-2">
                      {valid ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm ${valid ? 'text-green-700' : 'text-red-600'}`}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your new password"
                  data-testid="input-confirm-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  data-testid="button-toggle-confirm-password"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600" data-testid="error-confirm-password">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={isSubmitting}
              disabled={!isValid}
              data-testid="button-reset-password"
            >
              {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
            </Button>

            {/* Back to Login */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                data-testid="link-back-to-login"
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;