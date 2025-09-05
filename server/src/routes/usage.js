import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { trackUsage, getUsageForBillingPeriod, getUsageAnalytics, checkUsageLimits } from '../controllers/usageController.js';
import { calculateUsageBilling, getBillingSummary } from '../controllers/billingController.js';
import { exportUsageData, exportUsageAnalytics } from '../controllers/usageExportController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Middleware to handle validation errors
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

// POST /api/usage/track - Track usage event
router.post('/track',
  authMiddleware,
  [
    body('eventType')
      .notEmpty()
      .withMessage('Event type is required')
      .isIn(['document_upload', 'document_download', 'api_call', 'user_creation', 'storage_usage', 'compliance_check'])
      .withMessage('Invalid event type'),
    body('quantity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Quantity must be a positive integer'),
    body('resourceId')
      .optional()
      .isString()
      .withMessage('Resource ID must be a string'),
    body('metadata')
      .optional()
      .isObject()
      .withMessage('Metadata must be an object')
  ],
  handleValidationErrors,
  trackUsage
);

// GET /api/usage/billing-period - Get usage for billing period
router.get('/billing-period',
  authMiddleware,
  [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date'),
    query('eventType')
      .optional()
      .isIn(['document_upload', 'document_download', 'api_call', 'user_creation', 'storage_usage', 'compliance_check'])
      .withMessage('Invalid event type'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],
  handleValidationErrors,
  getUsageForBillingPeriod
);

// GET /api/usage/analytics - Get usage analytics with filtering
router.get('/analytics',
  authMiddleware,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('search')
      .optional()
      .isString()
      .withMessage('Search must be a string'),
    query('eventType')
      .optional()
      .isIn(['document_upload', 'document_download', 'api_call', 'user_creation', 'storage_usage', 'compliance_check'])
      .withMessage('Invalid event type'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date'),
    query('sortBy')
      .optional()
      .isIn(['createdAt', 'eventType', 'quantity'])
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc')
  ],
  handleValidationErrors,
  getUsageAnalytics
);

// GET /api/usage/limits - Check usage limits
router.get('/limits',
  authMiddleware,
  checkUsageLimits
);

// POST /api/billing/calculate-usage - Calculate usage-based billing
router.post('/calculate-usage',
  authMiddleware,
  [
    body('billingPeriodStart')
      .notEmpty()
      .isISO8601()
      .withMessage('Billing period start date is required and must be valid'),
    body('billingPeriodEnd')
      .notEmpty()
      .isISO8601()
      .withMessage('Billing period end date is required and must be valid'),
    body('generateInvoice')
      .optional()
      .isBoolean()
      .withMessage('Generate invoice must be a boolean')
  ],
  handleValidationErrors,
  calculateUsageBilling
);

// GET /api/billing/summary - Get billing summary
router.get('/summary',
  authMiddleware,
  [
    query('billingPeriodStart')
      .optional()
      .isISO8601()
      .withMessage('Billing period start must be a valid ISO 8601 date'),
    query('billingPeriodEnd')
      .optional()
      .isISO8601()
      .withMessage('Billing period end must be a valid ISO 8601 date')
  ],
  handleValidationErrors,
  getBillingSummary
);

// GET /api/usage/export - Export usage data
router.get('/export',
  authMiddleware,
  [
    query('format')
      .optional()
      .isIn(['csv', 'json', 'pdf'])
      .withMessage('Format must be csv, json, or pdf'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date'),
    query('eventType')
      .optional()
      .isIn(['document_upload', 'document_download', 'api_call', 'user_creation', 'storage_usage', 'compliance_check'])
      .withMessage('Invalid event type'),
    query('includeDetails')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('Include details must be true or false')
  ],
  handleValidationErrors,
  exportUsageData
);

// GET /api/usage/export/analytics - Export usage analytics
router.get('/export/analytics',
  authMiddleware,
  [
    query('format')
      .optional()
      .isIn(['csv', 'json'])
      .withMessage('Format must be csv or json'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date')
  ],
  handleValidationErrors,
  exportUsageAnalytics
);

export default router;