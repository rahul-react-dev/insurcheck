import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

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

// Keep legacy routes for backward compatibility
router.post('/admin-login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], authController.adminLogin);

router.post('/admin-forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email')
], authController.adminForgotPassword);

router.post('/register', registerValidation, authController.register);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.getCurrentUser);

export default router;