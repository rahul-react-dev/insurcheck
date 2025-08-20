import express from 'express';
import { body, query } from 'express-validator';
import * as adminUserController from '../controllers/adminUserController.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminRoleMiddleware } from '../middleware/adminRole.js';

const router = express.Router();

// Validation rules for user invitation
const inviteUserValidation = [
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('role').optional().isIn(['user', 'tenant-admin']).withMessage('Invalid role')
];

// Validation rules for listing users
const getUsersValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isIn(['10', '25', '50']).withMessage('Limit must be 10, 25, or 50'),
  query('sortBy').optional().isIn(['firstName', 'lastName', 'email', 'createdAt']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('search').optional().isLength({ max: 100 }).withMessage('Search term too long')
];

// Validation rules for export
const exportValidation = [
  query('format').optional().isIn(['csv', 'pdf', 'excel', 'json']).withMessage('Invalid export format'),
  query('search').optional().isLength({ max: 100 }).withMessage('Search term too long')
];

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(adminRoleMiddleware);

// Routes
router.get('/', getUsersValidation, adminUserController.getAdminUsers);
router.post('/invite', inviteUserValidation, adminUserController.inviteUser);
router.get('/export', exportValidation, adminUserController.exportUsers);
router.get('/stats', adminUserController.getUserStats);

export default router;