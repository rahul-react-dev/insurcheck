import express from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Enhanced rate limiting for password-related endpoints
const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Very strict: only 3 password reset attempts per window
  message: 'Too many password reset attempts. Please wait 15 minutes before trying again.',
  standardHeaders: true,
  legacyHeaders: false,
  // Use default key generator for proper IPv6 support
  skip: (req) => {
    // Skip rate limiting for health checks and other non-sensitive operations
    return false;
  }
});

// Rate limiter for token validation (slightly more permissive)
const tokenValidationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes  
  max: 10, // Allow more validation attempts
  message: 'Too many token validation attempts. Please wait 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

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

router.post('/admin/forgot-password', passwordLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email')
], authController.adminForgotPassword);

// User password reset routes
router.post('/forgot-password', passwordLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email')
], authController.userForgotPassword);

// Validate reset token
router.get('/validate-reset-token', tokenValidationLimiter, authController.validateResetToken);

router.post('/reset-password', passwordLimiter, [
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

router.post('/admin-forgot-password', passwordLimiter, [
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

router.post('/register', registerValidation, authController.register);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.getCurrentUser);

export default router;