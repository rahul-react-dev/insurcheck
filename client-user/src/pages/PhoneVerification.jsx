import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, ArrowLeft, RotateCcw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';
import { cn } from '../utils/cn';

const PhoneVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get phone number from navigation state
  const phoneNumber = location.state?.phoneNumber;
  const signupData = location.state?.signupData;
  
  // Redirect if no phone number provided
  useEffect(() => {
    if (!phoneNumber || !signupData) {
      navigate('/signup');
    }
  }, [phoneNumber, signupData, navigate]);

  // State
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState(null); // 'success' | 'error' | null
  const [hasInitialOtpSent, setHasInitialOtpSent] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isCompletingSignup, setIsCompletingSignup] = useState(false);
  
  // Refs for OTP inputs
  const inputRefs = useRef([]);

  // Start countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = useCallback(async () => {
    setIsSendingOtp(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "OTP Sent",
          description: `Verification code sent to ${phoneNumber}`,
          type: "success"
        });
        setCountdown(60); // 60 seconds countdown
        setVerificationStatus(null);
      } else {
        // Handle specific Twilio trial account error
        const errorMessage = data.message || "Failed to send OTP";
        let userFriendlyMessage = errorMessage;
        
        if (errorMessage.includes("unverified") && errorMessage.includes("Trial accounts")) {
          userFriendlyMessage = `This phone number needs to be verified in your Twilio account first. Trial accounts can only send to verified numbers. Please verify ${phoneNumber} at twilio.com/console/phone-numbers/verified`;
        }
        
        toast({
          title: "Error Sending OTP",
          description: userFriendlyMessage,
          type: "error"
        });
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        type: "error"
      });
    } finally {
      setIsSendingOtp(false);
    }
  }, [phoneNumber, toast]);

  // Auto-send OTP on component mount (only once)
  useEffect(() => {
    if (phoneNumber && !hasInitialOtpSent) {
      setHasInitialOtpSent(true);
      // Call the function directly to avoid dependency issues
      (async () => {
        setIsSendingOtp(true);
        try {
          const response = await fetch('/api/auth/send-otp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phoneNumber }),
          });

          const data = await response.json();

          if (data.success) {
            toast({
              title: "OTP Sent",
              description: `Verification code sent to ${phoneNumber}`,
              type: "success"
            });
            setCountdown(60);
            setVerificationStatus(null);
          } else {
            const errorMessage = data.message || "Failed to send OTP";
            let userFriendlyMessage = errorMessage;
            
            if (errorMessage.includes("unverified") && errorMessage.includes("Trial accounts")) {
              userFriendlyMessage = `This phone number needs to be verified in your Twilio account first. Trial accounts can only send to verified numbers. Please verify ${phoneNumber} at twilio.com/console/phone-numbers/verified`;
            }
            
            toast({
              title: "Error Sending OTP",
              description: userFriendlyMessage,
              type: "error"
            });
          }
        } catch (error) {
          console.error('Send OTP error:', error);
          toast({
            title: "Error",
            description: "Network error. Please try again.",
            type: "error"
          });
        } finally {
          setIsSendingOtp(false);
        }
      })();
    }
  }, [phoneNumber, hasInitialOtpSent, toast]);

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtpCode = [...otpCode];
    newOtpCode[index] = value;
    setOtpCode(newOtpCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits are entered
    if (newOtpCode.every(digit => digit !== '') && newOtpCode.join('').length === 6) {
      handleVerifyOtp(newOtpCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (code = otpCode.join('')) => {
    if (code.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit code",
        type: "error"
      });
      return;
    }

    setIsVerifying(true);
    setVerificationStatus(null);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber, 
          code 
        }),
      });

      const data = await response.json();

      if (data.success && data.verified) {
        setVerificationStatus('success');
        toast({
          title: "Phone Verified",
          description: "Your phone number has been verified successfully!",
          type: "success"
        });
        
        // Proceed with signup after successful verification
        setTimeout(() => {
          handleCompleteSignup();
        }, 1500);
      } else {
        setVerificationStatus('error');
        setOtpCode(['', '', '', '', '', '']); // Clear OTP inputs
        toast({
          title: "Verification Failed",
          description: data.message || "Invalid verification code",
          type: "error"
        });
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      setVerificationStatus('error');
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        type: "error"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCompleteSignup = async () => {
    setIsCompletingSignup(true);
    try {
      // Add phone verification status to signup data
      const completeSignupData = {
        ...signupData,
        phoneVerified: true
      };

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeSignupData),
      });

      const data = await response.json();

      if (data.success) {
        // Show success modal instead of direct redirect
        setShowSuccessModal(true);
        toast({
          type: 'success',
          title: 'Account Created Successfully!',
          description: 'Please check your email for verification.',
        });
      } else {
        toast({
          title: "Signup Error",
          description: data.message || "Failed to complete signup",
          type: "error"
        });
      }
    } catch (error) {
      console.error('Complete signup error:', error);
      toast({
        title: "Error",
        description: "Failed to complete signup. Please try again.",
        type: "error"
      });
    } finally {
      setIsCompletingSignup(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate('/login', { 
      state: { 
        message: 'Account created successfully! Please check your email to verify your account.',
        messageType: 'success'
      } 
    });
  };

  const handleGoBack = () => {
    navigate('/signup', { state: { formData: signupData } });
  };

  if (!phoneNumber) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <motion.div 
        className="max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verify Your Phone
            </h1>
            <p className="text-gray-600">
              We've sent a 6-digit code to
            </p>
            <p className="font-medium text-gray-900">
              {phoneNumber}
            </p>
          </div>

          {/* OTP Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Enter Verification Code
            </label>
            <div className="flex justify-center space-x-3">
              {otpCode.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => inputRefs.current[index] = el}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  maxLength={1}
                  className={cn(
                    "w-12 h-12 text-center text-xl font-bold rounded-lg border-2 transition-all duration-200",
                    "focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none",
                    digit ? "border-blue-500 bg-blue-50" : "border-gray-300",
                    verificationStatus === 'success' && "border-green-500 bg-green-50",
                    verificationStatus === 'error' && "border-red-500 bg-red-50"
                  )}
                  disabled={isVerifying}
                  data-testid={`otp-input-${index}`}
                />
              ))}
            </div>
          </div>

          {/* Status Message */}
          {verificationStatus === 'success' && (
            <div className="flex items-center justify-center text-green-600 mb-4">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Phone verified successfully!</span>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="flex items-center justify-center text-red-600 mb-4">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Invalid code. Please try again.</span>
            </div>
          )}

          {/* Verify Button */}
          <Button
            onClick={() => handleVerifyOtp()}
            disabled={otpCode.some(digit => digit === '') || isVerifying}
            className="w-full mb-4"
            data-testid="button-verify"
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Phone Number'
            )}
          </Button>

          {/* Resend OTP */}
          <div className="text-center mb-6">
            {countdown > 0 ? (
              <p className="text-gray-500 text-sm">
                Resend code in {countdown} seconds
              </p>
            ) : (
              <Button
                variant="ghost"
                onClick={handleSendOtp}
                disabled={isSendingOtp}
                className="text-blue-600 hover:text-blue-700"
                data-testid="button-resend"
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Resend Code
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="w-full text-gray-600 hover:text-gray-700"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign Up
          </Button>
        </div>
      </motion.div>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Account Created Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Your account has been created and a verification link has been sent to your email address. 
                Please check your email and click the verification link to activate your account.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={handleModalClose}
                  className="w-full"
                  disabled={isCompletingSignup}
                  data-testid="button-continue-to-login"
                >
                  {isCompletingSignup ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Continue to Login'
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PhoneVerification;