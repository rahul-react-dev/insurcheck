import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { ButtonLoader } from '../components/ui/PageLoader';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../utils/api';
import { cn } from '../utils/cn';

// Validation schema for forgot password
const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
});

const ForgotPassword = () => {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  const watchedEmail = watch('email');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Simulate API call for forgot password
      // In real implementation, this would call your forgot password endpoint
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      
      // For now, we'll just show success message
      // const response = await apiRequest('/api/auth/forgot-password', {
      //   method: 'POST',
      //   body: JSON.stringify(data)
      // });

      setIsSubmitted(true);
      toast({
        type: 'success',
        title: 'Reset Link Sent',
        description: 'Check your email for password reset instructions.'
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      toast({
        type: 'error',
        title: 'Failed to Send Reset Link',
        description: error.message || 'Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setIsSubmitted(false);
    reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mx-auto h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6">
              <Mail className="text-blue-600 w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600 text-sm">
              {isSubmitted 
                ? "We've sent password reset instructions to your email"
                : "Enter your email to receive password reset instructions"
              }
            </p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-8"
          >
            {!isSubmitted ? (
              <>
                {/* Forgot Password Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                        className={cn(
                          "block w-full pl-10 pr-3 py-3 border rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50",
                          errors.email 
                            ? "border-red-300 focus:ring-red-500" 
                            : "border-gray-200 focus:ring-blue-500 hover:border-gray-300"
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

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading || isSubmitting || !watchedEmail}
                    className={cn(
                      "w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl font-semibold text-sm transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                      "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                    data-testid="button-send-reset"
                  >
                    {isLoading || isSubmitting ? (
                      <>
                        <ButtonLoader size="sm" />
                        <span className="ml-2">Sending Reset Link...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Reset Link</span>
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

                {/* Back to Login Link */}
                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                    data-testid="link-back-to-login"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Login</span>
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Reset Link Sent!
                    </h3>
                    <p className="text-gray-600 text-sm">
                      We've sent password reset instructions to <br />
                      <span className="font-medium text-gray-900">{watchedEmail}</span>
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Didn't receive the email?</strong><br />
                      Check your spam folder or try again with a different email address.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleTryAgain}
                      variant="outline"
                      className="w-full"
                      data-testid="button-try-again"
                    >
                      Try Different Email
                    </Button>
                    
                    <Link
                      to="/login"
                      className="w-full inline-flex justify-center items-center py-3 px-4 border border-transparent rounded-xl font-semibold text-sm transition-all duration-200 bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
                      data-testid="link-goto-login"
                    >
                      Back to Login
                    </Link>
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <p className="text-gray-500 text-sm">
              Need help?{' '}
              <a 
                href="mailto:support@insurcheck.com" 
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                Contact Support
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;