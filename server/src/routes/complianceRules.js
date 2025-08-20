import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { adminRoleMiddleware } from '../middleware/adminRole.js';
import {
  getComplianceRules,
  getRuleStats,
  createComplianceRule,
  updateComplianceRule,
  deleteComplianceRule,
  previewRuleImpact,
  getRuleAuditLogs
} from '../controllers/complianceRuleController.js';
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

// Get all compliance rules with filtering and pagination
router.get(
  '/',
  authMiddleware,
  adminRoleMiddleware,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('sortBy').optional().isIn(['ruleId', 'fieldName', 'ruleType', 'createdAt', 'updatedAt']).withMessage('Invalid sort field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
    query('ruleType').optional().isIn(['required', 'format', 'range', 'length', 'custom']).withMessage('Invalid rule type'),
    query('isActive').optional().isBoolean().withMessage('isActive must be boolean')
  ],
  handleValidationErrors,
  getComplianceRules
);

// Get rule statistics
router.get(
  '/stats',
  authMiddleware,
  adminRoleMiddleware,
  getRuleStats
);

// Create new compliance rule
router.post(
  '/',
  authMiddleware,
  adminRoleMiddleware,
  [
    body('fieldName')
      .notEmpty()
      .withMessage('Field name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Field name must be between 2 and 100 characters'),
    body('ruleType')
      .isIn(['required', 'format', 'range', 'length', 'custom'])
      .withMessage('Rule type must be one of: required, format, range, length, custom'),
    body('value')
      .notEmpty()
      .withMessage('Value is required')
      .isLength({ max: 500 })
      .withMessage('Value must not exceed 500 characters'),
    body('description')
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters')
  ],
  handleValidationErrors,
  createComplianceRule
);

// Update compliance rule
router.put(
  '/:id',
  authMiddleware,
  adminRoleMiddleware,
  [
    param('id').isUUID().withMessage('Invalid rule ID'),
    body('fieldName')
      .notEmpty()
      .withMessage('Field name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Field name must be between 2 and 100 characters'),
    body('ruleType')
      .isIn(['required', 'format', 'range', 'length', 'custom'])
      .withMessage('Rule type must be one of: required, format, range, length, custom'),
    body('value')
      .notEmpty()
      .withMessage('Value is required')
      .isLength({ max: 500 })
      .withMessage('Value must not exceed 500 characters'),
    body('description')
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    body('isActive').isBoolean().withMessage('isActive must be boolean')
  ],
  handleValidationErrors,
  updateComplianceRule
);

// Delete compliance rule
router.delete(
  '/:id',
  authMiddleware,
  adminRoleMiddleware,
  [
    param('id').isUUID().withMessage('Invalid rule ID')
  ],
  handleValidationErrors,
  deleteComplianceRule
);

// Preview rule impact on existing documents
router.post(
  '/preview',
  authMiddleware,
  adminRoleMiddleware,
  [
    body('fieldName')
      .notEmpty()
      .withMessage('Field name is required'),
    body('ruleType')
      .isIn(['required', 'format', 'range', 'length', 'custom'])
      .withMessage('Rule type must be one of: required, format, range, length, custom'),
    body('value')
      .notEmpty()
      .withMessage('Value is required')
  ],
  handleValidationErrors,
  previewRuleImpact
);

// Get audit logs for compliance rules
router.get(
  '/audit-logs',
  authMiddleware,
  adminRoleMiddleware,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('ruleId').optional().isUUID().withMessage('Invalid rule ID')
  ],
  handleValidationErrors,
  getRuleAuditLogs
);

export default router;