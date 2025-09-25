import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendOTP, verifyOTP, formatPhoneNumber } from '../../services/twilioService.js';

const router = express.Router();

// Validation rules
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['super-admin', 'tenant-admin', 'user']).withMessage('Invalid role')
];

const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name is required'),
  body('role').isIn(['super-admin', 'tenant-admin', 'user']).withMessage('Invalid role')
];

// Routes
router.post('/login', loginValidation, authController.login);
router.post('/super-admin/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], authController.superAdminLogin);

// Admin-specific routes (tenant-admin) - following same pattern as super-admin
router.post('/admin/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], authController.adminLogin);

router.post('/admin/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email')
], authController.adminForgotPassword);

// User password reset routes
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email')
], authController.userForgotPassword);

// Validate reset token
router.get('/validate-reset-token', authController.validateResetToken);

router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 10 }).withMessage('Password must be at least 10 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
    .withMessage('Password must include uppercase, lowercase, number, and special character')
], authController.resetPassword);

// Keep legacy routes for backward compatibility
router.post('/admin-login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], authController.adminLogin);

router.post('/admin-forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email')
], authController.adminForgotPassword);

// Email check endpoint for signup validation
router.post('/check-email', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email')
], authController.checkEmail);

// User signup endpoint (for client-user panel)
router.post('/signup', [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 10 }).withMessage('Password must be at least 10 characters'),
  body('fullName').trim().isLength({ min: 1, max: 100 }).withMessage('Full Name must be alphabetic and up to 100 characters'),
  body('companyName').trim().isLength({ min: 1, max: 100 }).withMessage('Company Name must be 100 characters or less')
], authController.signup);

// Email verification endpoints
router.post('/verify-email', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('token').isLength({ min: 1 }).withMessage('Verification token is required')
], authController.verifyEmail);

router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email')
], authController.resendVerificationEmail);

// OTP verification endpoints
router.post('/send-otp', [
  body('phoneNumber').isMobilePhone().withMessage('Please enter a valid phone number')
], async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    console.log(`📱 OTP request for phone: ${formattedPhone}`);
    
    const result = await sendOTP(formattedPhone);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'OTP sent successfully',
        status: result.status
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'Failed to send OTP'
      });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/verify-otp', [
  body('phoneNumber').isMobilePhone().withMessage('Please enter a valid phone number'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Please enter a valid 6-digit code')
], async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    console.log(`🔍 OTP verification for phone: ${formattedPhone}, code: ${code}`);
    
    const result = await verifyOTP(formattedPhone, code);
    
    if (result.success && result.verified) {
      res.json({
        success: true,
        message: 'Phone number verified successfully',
        verified: true
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid verification code',
        verified: false
      });
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/register', registerValidation, authController.register);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.getCurrentUser);

export default router;