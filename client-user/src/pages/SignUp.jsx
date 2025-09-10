import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building, Phone, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../utils/query-client';
import { cn } from '../utils/cn';

// Validation schema
const signUpSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailCheckStatus, setEmailCheckStatus] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
  });

  const watchedEmail = watch('email');

  // Check email uniqueness
  const checkEmailUniqueness = async (email) => {
    if (!email || !z.string().email().safeParse(email).success) {
      setEmailCheckStatus(null);
      return;
    }

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
          message: 'Email already registered. Please log in or use a different email.',
        });
      } else {
        setEmailCheckStatus('available');
      }
    } catch (error) {
      setEmailCheckStatus(null);
      console.error('Email check failed:', error);
    }
  };

  // Debounced email check
  useState(() => {
    const timeoutId = setTimeout(() => {
      if (watchedEmail) {
        checkEmailUniqueness(watchedEmail);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedEmail]);

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
          ...data,
          trialPeriod: 7, // 7-day trial
        },
      });

      toast({
        type: 'success',
        title: 'Account Created Successfully!',
        description: 'Welcome to InsurCheck! Your 7-day free trial has started.',
      });

      // Store auth token
      localStorage.setItem('authToken', response.token);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      toast({
        type: 'error',
        title: 'Sign Up Failed',
        description: error.message || 'An error occurred during sign up. Please try again.',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 flex">
      {/* Left Side - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-12 flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-3 mb-8">
            <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">InsurCheck</span>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Your 7-Day Free Trial
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join thousands of insurance professionals who trust InsurCheck to streamline their operations.
          </p>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="flex items-center space-x-3"
              >
                <CheckCircle className="h-5 w-5 text-green-300 flex-shrink-0" />
                <span className="text-white">{feature}</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
            <p className="text-white text-sm">
              <strong>No Credit Card Required</strong><br />
              Get full access to all features for 7 days. Cancel anytime.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                InsurCheck
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
              <p className="text-gray-600">
                Start your 7-day free trial today
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    {...register('firstName')}
                    type="text"
                    placeholder="First Name"
                    icon={<User className="h-4 w-4 text-gray-400" />}
                    error={errors.firstName?.message}
                    data-testid="input-firstname"
                  />
                </div>
                <div>
                  <Input
                    {...register('lastName')}
                    type="text"
                    placeholder="Last Name"
                    icon={<User className="h-4 w-4 text-gray-400" />}
                    error={errors.lastName?.message}
                    data-testid="input-lastname"
                  />
                </div>
              </div>

              {/* Email Field with validation indicator */}
              <div className="relative">
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="Email Address"
                  icon={<Mail className="h-4 w-4 text-gray-400" />}
                  error={errors.email?.message}
                  data-testid="input-email"
                />
                {emailCheckStatus === 'checking' && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 rounded-full border-t-transparent"></div>
                  </div>
                )}
                {emailCheckStatus === 'available' && (
                  <div className="absolute right-3 top-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                )}
                {emailCheckStatus === 'exists' && (
                  <div className="absolute right-3 top-3">
                    <div className="h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✕</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Phone and Company */}
              <div>
                <Input
                  {...register('phoneNumber')}
                  type="tel"
                  placeholder="Phone Number"
                  icon={<Phone className="h-4 w-4 text-gray-400" />}
                  error={errors.phoneNumber?.message}
                  data-testid="input-phone"
                />
              </div>

              <div>
                <Input
                  {...register('companyName')}
                  type="text"
                  placeholder="Company Name"
                  icon={<Building className="h-4 w-4 text-gray-400" />}
                  error={errors.companyName?.message}
                  data-testid="input-company"
                />
              </div>

              {/* Password Fields */}
              <div>
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  icon={<Lock className="h-4 w-4 text-gray-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  error={errors.password?.message}
                  data-testid="input-password"
                />
              </div>

              <div>
                <Input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  icon={<Lock className="h-4 w-4 text-gray-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  error={errors.confirmPassword?.message}
                  data-testid="input-confirm-password"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={isSubmitting}
                disabled={emailCheckStatus === 'exists'}
                data-testid="button-signup"
              >
                {isSubmitting ? 'Creating Account...' : 'Start Free Trial'}
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
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUp;