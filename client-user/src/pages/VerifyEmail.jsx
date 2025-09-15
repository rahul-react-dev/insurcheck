import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, CheckCircle, AlertCircle, Shield, Loader2, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';
import { apiRequest } from '../utils/api';

const resendSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
});

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Get token and email from URL parameters
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  // Local state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null); // null, 'success', 'error', 'expired', 'already-verified'
  const [verificationMessage, setVerificationMessage] = useState('');
  const [showResendForm, setShowResendForm] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(resendSchema),
    defaultValues: {
      email: email || '',
    },
  });

  // Auto-verify if token and email are provided
  useEffect(() => {
    if (token && email) {
      verifyEmailToken();
    }
  }, [token, email]);

  const verifyEmailToken = async () => {
    setIsVerifying(true);
    try {
      const response = await apiRequest('/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({
          token,
          email
        }),
      });

      if (response.success) {
        setVerificationStatus('success');
        setVerificationMessage('Email verified successfully! You can now log in to your account.');
        
        toast({
          type: 'success',
          title: 'Email Verified!',
          description: 'Your account has been activated. Please log in to continue.',
        });
      } else {
        handleVerificationError(response);
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setVerificationStatus('error');
      setVerificationMessage('An error occurred during verification. Please try again or request a new verification link.');
      toast({
        type: 'error',
        title: 'Verification Failed',
        description: 'An error occurred during verification.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerificationError = (response) => {
    if (response.alreadyVerified) {
      setVerificationStatus('already-verified');
      setVerificationMessage('Email is already verified. You can now log in.');
    } else if (response.expired) {
      setVerificationStatus('expired');
      setVerificationMessage('Verification link has expired. Please request a new one.');
      setShowResendForm(true);
    } else {
      setVerificationStatus('error');
      setVerificationMessage(response.message || 'Invalid verification link.');
      setShowResendForm(true);
    }
  };

  const onResendSubmit = async (data) => {
    setIsResending(true);
    try {
      const response = await apiRequest('/api/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({
          email: data.email
        }),
      });

      if (response.success) {
        setResendCount(prev => prev + 1);
        toast({
          type: 'success',
          title: 'Verification Email Sent',
          description: 'Please check your email for the new verification link.',
        });
        setShowResendForm(false);
      } else {
        if (response.message?.includes('limit reached')) {
          toast({
            type: 'error',
            title: 'Resend Limit Reached',
            description: `Please wait ${response.retryAfter || 60} minutes before requesting another verification email.`,
            duration: 8000,
          });
        } else if (response.alreadyVerified) {
          setVerificationStatus('already-verified');
          setVerificationMessage('Email is already verified. You can now log in.');
          setShowResendForm(false);
        } else {
          toast({
            type: 'error',
            title: 'Resend Failed',
            description: response.message || 'Failed to send verification email.',
          });
        }
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      toast({
        type: 'error',
        title: 'Resend Failed',
        description: 'An error occurred while sending the verification email.',
      });
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-600" />;
      case 'already-verified':
        return <CheckCircle className="w-16 h-16 text-blue-600" />;
      case 'error':
      case 'expired':
        return <AlertCircle className="w-16 h-16 text-red-600" />;
      default:
        return <Mail className="w-16 h-16 text-blue-600" />;
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'success':
        return 'bg-green-100';
      case 'already-verified':
        return 'bg-blue-100';
      case 'error':
      case 'expired':
        return 'bg-red-100';
      default:
        return 'bg-blue-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">InsurCheck</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verification</h1>
          </div>

          {/* Verification Status */}
          <div className="text-center mb-8">
            <div className={`w-20 h-20 ${getStatusColor()} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {isVerifying ? (
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              ) : (
                getStatusIcon()
              )}
            </div>

            {isVerifying ? (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Your Email...</h2>
                <p className="text-gray-600">Please wait while we verify your email address.</p>
              </div>
            ) : verificationMessage ? (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {verificationStatus === 'success' ? 'Verification Successful!' :
                   verificationStatus === 'already-verified' ? 'Already Verified' :
                   verificationStatus === 'expired' ? 'Link Expired' : 'Verification Failed'}
                </h2>
                <p className="text-gray-600">{verificationMessage}</p>
              </div>
            ) : !token || !email ? (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Verification Link</h2>
                <p className="text-gray-600">
                  The verification link is missing required information. Please use the link from your email or request a new verification email.
                </p>
              </div>
            ) : null}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {verificationStatus === 'success' && (
              <Button
                onClick={() => navigate('/login')}
                variant="primary"
                size="lg"
                className="w-full"
                data-testid="button-continue"
              >
                Continue to Login
              </Button>
            )}

            {(verificationStatus === 'already-verified' || verificationStatus === 'error') && (
              <Button
                onClick={() => navigate('/login')}
                variant="primary"
                size="lg"
                className="w-full"
                data-testid="button-login"
              >
                Go to Login
              </Button>
            )}

            {(verificationStatus === 'expired' || verificationStatus === 'error' || (!token || !email)) && !showResendForm && (
              <Button
                onClick={() => {
                  setShowResendForm(true);
                  if (email) setValue('email', email);
                }}
                variant="secondary"
                size="lg"
                className="w-full"
                data-testid="button-show-resend"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Request New Verification Email
              </Button>
            )}
          </div>

          {/* Resend Form */}
          {showResendForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Request New Verification Email</h3>
              <form onSubmit={handleSubmit(onResendSubmit)} className="space-y-4">
                <Input
                  {...register('email')}
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email address"
                  icon={<Mail className="h-4 w-4 text-gray-400" />}
                  error={errors.email?.message}
                  data-testid="input-resend-email"
                />
                
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    loading={isResending}
                    data-testid="button-resend"
                  >
                    {isResending ? (
                      <>
                        <LoadingSpinner size="sm" variant="white" className="mr-2" />
                        Sending...
                      </>
                    ) : (
                      'Send Verification Email'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowResendForm(false)}
                    data-testid="button-cancel-resend"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
              
              {resendCount > 0 && (
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Verification email sent {resendCount} time{resendCount !== 1 ? 's' : ''}. 
                  Please check your inbox and spam folder.
                </p>
              )}
            </motion.div>
          )}

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Need help? Contact our support team or try signing up again with a different email address.
            </p>
            <div className="flex justify-center space-x-4 mt-3">
              <button
                onClick={() => navigate('/signup')}
                className="text-sm text-blue-600 hover:text-blue-500"
                data-testid="link-signup"
              >
                Sign up again
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => navigate('/login')}
                className="text-sm text-blue-600 hover:text-blue-500"
                data-testid="link-login"
              >
                Back to login
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;