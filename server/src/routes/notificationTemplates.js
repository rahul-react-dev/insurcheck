import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { adminRoleMiddleware } from '../middleware/adminRole.js';
import {
  getNotificationTemplates,
  getTemplateStats,
  createNotificationTemplate,
  updateNotificationTemplate,
  deleteNotificationTemplate,
  previewNotificationTemplate,
  getTemplateAuditLogs
} from '../controllers/notificationTemplateController.js';
import { body, param, query, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Get all notification templates with filtering and pagination
router.get(
  '/',
  authMiddleware,
  adminRoleMiddleware,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('sortBy').optional().isIn(['name', 'templateType', 'subject', 'createdAt', 'updatedAt']).withMessage('Invalid sort field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
    query('templateType').optional().isIn(['compliance_result', 'audit_log', 'user_notification', 'system_alert', '']).withMessage('Invalid template type'),
    query('isActive').optional().isIn(['true', 'false', '', 'True', 'False']).withMessage('isActive must be boolean')
  ],
  handleValidationErrors,
  getNotificationTemplates
);

// Get template statistics
router.get(
  '/stats',
  authMiddleware,
  adminRoleMiddleware,
  getTemplateStats
);

// Create new notification template
router.post(
  '/',
  authMiddleware,
  adminRoleMiddleware,
  [
    body('templateType')
      .isIn(['compliance_result', 'audit_log', 'user_notification', 'system_alert'])
      .withMessage('Template type must be one of: compliance_result, audit_log, user_notification, system_alert'),
    body('name')
      .notEmpty()
      .withMessage('Template name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Template name must be between 2 and 100 characters'),
    body('subject')
      .notEmpty()
      .withMessage('Subject is required')
      .isLength({ min: 3, max: 200 })
      .withMessage('Subject must be between 3 and 200 characters'),
    body('header')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Header must not exceed 1000 characters'),
    body('body')
      .notEmpty()
      .withMessage('Body is required')
      .isLength({ min: 10, max: 5000 })
      .withMessage('Body must be between 10 and 5000 characters'),
    body('footer')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Footer must not exceed 1000 characters'),
    body('variables')
      .optional()
      .isArray()
      .withMessage('Variables must be an array')
  ],
  handleValidationErrors,
  createNotificationTemplate
);

// Update notification template (only editable fields as per requirements)
router.put(
  '/:id',
  authMiddleware,
  adminRoleMiddleware,
  [
    param('id').isUUID().withMessage('Invalid template ID'),
    // Only validate editable fields: Subject, Header, Body, Footer
    body('subject')
      .notEmpty()
      .withMessage('Subject is required')
      .isLength({ min: 3, max: 200 })
      .withMessage('Subject must be between 3 and 200 characters'),
    body('header')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Header must not exceed 1000 characters'),
    body('body')
      .notEmpty()
      .withMessage('Body is required')
      .isLength({ min: 10, max: 5000 })
      .withMessage('Body must be between 10 and 5000 characters'),
    body('footer')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Footer must not exceed 1000 characters'),
  ],
  handleValidationErrors,
  updateNotificationTemplate
);

// Delete notification template
router.delete(
  '/:id',
  authMiddleware,
  adminRoleMiddleware,
  [
    param('id').isUUID().withMessage('Invalid template ID')
  ],
  handleValidationErrors,
  deleteNotificationTemplate
);

// Preview notification template with sample data
router.post(
  '/preview',
  authMiddleware,
  adminRoleMiddleware,
  [
    body('templateType')
      .isIn(['compliance_result', 'audit_log', 'user_notification', 'system_alert'])
      .withMessage('Template type must be one of: compliance_result, audit_log, user_notification, system_alert'),
    body('subject')
      .notEmpty()
      .withMessage('Subject is required'),
    body('body')
      .notEmpty()
      .withMessage('Body is required'),
    body('header')
      .optional(),
    body('footer')
      .optional(),
    body('variables')
      .optional()
      .isArray()
      .withMessage('Variables must be an array')
  ],
  handleValidationErrors,
  previewNotificationTemplate
);

// Get audit logs for notification templates
router.get(
  '/audit-logs',
  authMiddleware,
  adminRoleMiddleware,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('templateId').optional().isUUID().withMessage('Invalid template ID')
  ],
  handleValidationErrors,
  getTemplateAuditLogs
);

export default router;