import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building, Phone, Eye, EyeOff, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../utils/query-client';
import { cn } from '../utils/cn';

// Enhanced validation schema matching user story requirements
const signUpSchema = z.object({
  fullName: z.string()
    .min(1, 'Full Name is required')
    .max(100, 'Full Name must be 100 characters or less')
    .regex(/^[a-zA-Z\s]+$/, 'Full Name must be alphabetic and up to 100 characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z.string()
    .min(10, 'Password must be at least 10 characters with uppercase, lowercase, number, and special character')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/, 'Password must be at least 10 characters with uppercase, lowercase, number, and special character'),
  confirmPassword: z.string(),
  phoneNumber: z.string()
    .optional()
    .refine((val) => !val || /^\+?[\d\s\-()]{10,15}$/.test(val), 'Invalid phone number format'),
  companyName: z.string()
    .min(1, 'Company Name is required')
    .max(100, 'Company Name must be 100 characters or less'),
  acceptTerms: z.boolean()
    .refine((val) => val === true, 'You must accept the Terms and Conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailCheckStatus, setEmailCheckStatus] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
    setError,
    clearErrors,
  } = useForm({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      companyName: '',
      acceptTerms: false,
    },
  });

  const watchedEmail = watch('email');
  const watchedFullName = watch('fullName');
  const watchedPassword = watch('password');

  // Real-time email uniqueness check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (watchedEmail && z.string().email().safeParse(watchedEmail).success) {
        checkEmailUniqueness(watchedEmail);
      } else {
        setEmailCheckStatus(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedEmail]);

  const checkEmailUniqueness = async (email) => {
    try {
      setEmailCheckStatus('checking');
      const response = await apiRequest('/auth/check-email', {
        method: 'POST',
        data: { email },
      });
      
      if (response.exists) {
        setEmailCheckStatus('exists');
        setError('email', {
          type: 'manual',
          message: 'Email already registered',
        });
      } else {
        setEmailCheckStatus('available');
        clearErrors('email');
      }
    } catch (error) {
      setEmailCheckStatus(null);
      console.error('Email check failed:', error);
    }
  };

  const onSubmit = async (data) => {
    if (emailCheckStatus === 'exists') {
      toast({
        type: 'error',
        title: 'Email Already Registered',
        description: 'Please log in or use a different email address.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiRequest('/auth/signup', {
        method: 'POST',
        data: {
          fullName: data.fullName,
          email: data.email,
          password: data.password,
          phoneNumber: data.phoneNumber || null,
          companyName: data.companyName,
          trialPeriod: 7,
        },
      });

      // Show success modal
      setShowSuccessModal(true);
      
      toast({
        type: 'success',
        title: 'Sign-up Successful',
        description: 'Please check your email for verification.',
      });

    } catch (error) {
      toast({
        type: 'error',
        title: 'Failed to Submit Form',
        description: error.message || 'Failed to submit form. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    'Complete document management',
    'Real-time compliance checking',
    'Advanced analytics dashboard',
    'Team collaboration tools',
    'Mobile-responsive interface',
    '24/7 customer support',
  ];

  // Password strength indicator
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(watchedPassword || '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 flex flex-col lg:flex-row">
      {/* Success Modal */}
      {showSuccessModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to InsurCheck!</h3>
            <p className="text-gray-600 mb-6">
              Sign-up successful. Please check your email for verification.
            </p>
            <Button
              onClick={() => navigate('/login')}
              variant="primary"
              size="lg"
              className="w-full"
              data-testid="modal-login-button"
            >
              Continue to Login
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Features Section - Mobile & Desktop */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-6 lg:p-12 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6 lg:mb-8">
            <div className="h-8 lg:h-10 w-8 lg:w-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="h-5 lg:h-6 w-5 lg:w-6 text-white" />
            </div>
            <span className="text-xl lg:text-2xl font-bold text-white">InsurCheck</span>
          </div>
          
          <h2 className="text-2xl lg:text-4xl font-bold text-white mb-4 lg:mb-6 text-center lg:text-left">
            Start Your 7-Day Free Trial
          </h2>
          <p className="text-blue-100 text-base lg:text-lg mb-6 lg:mb-8 text-center lg:text-left">
            Join thousands of insurance professionals who trust InsurCheck to streamline their operations.
          </p>

          {/* Features - Horizontal on mobile, vertical on desktop */}
          <div className="grid grid-cols-2 lg:flex lg:flex-col gap-3 lg:gap-4 mb-6 lg:mb-0">
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="flex items-center space-x-2 lg:space-x-3"
              >
                <CheckCircle className="h-4 lg:h-5 w-4 lg:w-5 text-green-300 flex-shrink-0" />
                <span className="text-white text-sm lg:text-base">{feature}</span>
              </motion.div>
            ))}
          </div>

          <div className="hidden lg:block mt-8 p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
            <p className="text-white text-sm">
              <strong>No Credit Card Required</strong><br />
              Get full access to all features for 7 days. Cancel anytime.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >

          <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-200">
            <div className="text-center mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Complete Sign-Up Form</h1>
              <p className="text-gray-600">
                Create your profile and access the system
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name Field */}
              <div>
                <Input
                  {...register('fullName')}
                  type="text"
                  label="Full Name"
                  placeholder="Enter your full name"
                  icon={<User className="h-4 w-4 text-gray-400" />}
                  error={errors.fullName?.message}
                  data-testid="input-fullname"
                />
              </div>

              {/* Email Field with validation indicator */}
              <div>
                <Input
                  {...register('email')}
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email address"
                  icon={<Mail className="h-4 w-4 text-gray-400" />}
                  rightIcon={
                    emailCheckStatus === 'checking' ? (
                      <div className="animate-spin h-4 w-4 border-2 border-blue-600 rounded-full border-t-transparent"></div>
                    ) : emailCheckStatus === 'available' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : emailCheckStatus === 'exists' ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : null
                  }
                  error={errors.email?.message}
                  data-testid="input-email"
                />
              </div>

              {/* Password Field with strength indicator */}
              <div>
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="Create a strong password"
                  icon={<Lock className="h-4 w-4 text-gray-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600"
                      data-testid="toggle-password"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  error={errors.password?.message}
                  data-testid="input-password"
                />
                {/* Password Strength Indicator */}
                {watchedPassword && (
                  <div className="mt-2">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={cn(
                            'h-1 flex-1 rounded-full',
                            level <= passwordStrength
                              ? passwordStrength <= 2
                                ? 'bg-red-400'
                                : passwordStrength <= 3
                                ? 'bg-yellow-400'
                                : 'bg-green-400'
                              : 'bg-gray-200'
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Password strength: {passwordStrength <= 2 ? 'Weak' : passwordStrength <= 3 ? 'Medium' : 'Strong'}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <Input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  icon={<Lock className="h-4 w-4 text-gray-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 hover:text-gray-600"
                      data-testid="toggle-confirm-password"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  error={errors.confirmPassword?.message}
                  data-testid="input-confirm-password"
                />
              </div>

              {/* Phone Number Field (Optional) */}
              <div>
                <Input
                  {...register('phoneNumber')}
                  type="tel"
                  label="Phone Number (Optional)"
                  placeholder="+1 (555) 123-4567"
                  icon={<Phone className="h-4 w-4 text-gray-400" />}
                  error={errors.phoneNumber?.message}
                  data-testid="input-phone"
                />
              </div>

              {/* Company Name Field */}
              <div>
                <Input
                  {...register('companyName')}
                  type="text"
                  label="Company Name"
                  placeholder="Enter your company name"
                  icon={<Building className="h-4 w-4 text-gray-400" />}
                  error={errors.companyName?.message}
                  data-testid="input-company"
                />
              </div>

              {/* Accept Terms and Conditions */}
              <div className="flex items-start space-x-3">
                <input
                  {...register('acceptTerms')}
                  type="checkbox"
                  id="acceptTerms"
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  data-testid="checkbox-terms"
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                  I accept the{' '}
                  <Link to="/terms" className="text-blue-600 hover:text-blue-500 underline">
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-500 underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="text-sm text-red-600" data-testid="terms-error">
                  {errors.acceptTerms.message}
                </p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={isSubmitting}
                disabled={emailCheckStatus === 'exists' || isSubmitting}
                data-testid="button-signup"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  'Complete Sign-Up'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  data-testid="link-login"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
                Your 7-day trial includes access to all premium features.
              </p>
            </div>

            {/* Mobile Trial Info */}
            <div className="lg:hidden mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-blue-700 text-sm text-center">
                <strong>No Credit Card Required</strong><br />
                Get full access to all features for 7 days. Cancel anytime.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUp;