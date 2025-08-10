import express from 'express';
import { body } from 'express-validator';
import { 
  login,
  register,
  logout,
  getCurrentUser 
} from '../controllers/authController.js';
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
router.post('/login', loginValidation, login);
router.post('/register', registerValidation, register);
router.post('/logout', logout);
router.get('/me', authMiddleware, getCurrentUser);

export default router;
