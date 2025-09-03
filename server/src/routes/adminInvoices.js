import { Router } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth.js';
import { adminRoleMiddleware } from '../middleware/adminRole.js';

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
import {
  getAdminInvoices,
  getAdminInvoiceStats,
  getAdminInvoiceDetails,
  processAdminPayment,
  downloadAdminReceipt,
  exportAdminInvoices
} from '../controllers/adminInvoiceController.js';

const router = Router();

// Get all invoices for tenant admin with pagination, filtering, and sorting
router.get(
  '/',
  authMiddleware,
  adminRoleMiddleware,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('sortBy').optional().isIn(['invoiceNumber', 'issueDate', 'dueDate', 'paidDate', 'totalAmount', 'amount', 'status', 'createdAt']).withMessage('Invalid sort field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
    query('status').optional().isIn(['paid', 'unpaid', 'overdue', 'pending', '']).withMessage('Invalid status filter'),
    query('startDate').optional().custom((value) => {
      if (!value || value === '') return true;
      const date = new Date(value);
      return !isNaN(date.getTime());
    }).withMessage('Start date must be valid date'),
    query('endDate').optional().custom((value) => {
      if (!value || value === '') return true;
      const date = new Date(value);
      return !isNaN(date.getTime());
    }).withMessage('End date must be valid date')
  ],
  handleValidationErrors,
  getAdminInvoices
);

// Get invoice statistics for tenant admin
router.get(
  '/stats',
  authMiddleware,
  adminRoleMiddleware,
  getAdminInvoiceStats
);

// Get single invoice details for tenant admin
router.get(
  '/:id',
  authMiddleware,
  adminRoleMiddleware,
  [
    param('id').isLength({ min: 1 }).withMessage('Invoice ID is required')
  ],
  handleValidationErrors,
  getAdminInvoiceDetails
);

// Process payment for invoice (tenant admin)
router.post(
  '/pay',
  authMiddleware,
  adminRoleMiddleware,
  [
    body('invoiceId')
      .isUUID()
      .withMessage('Valid invoice ID is required'),
    body('paymentMethod')
      .isIn(['credit_card', 'bank_transfer', 'paypal'])
      .withMessage('Payment method must be credit_card, bank_transfer, or paypal'),
    body('cardNumber')
      .optional()
      .isLength({ min: 16, max: 19 })
      .withMessage('Card number must be 16-19 digits'),
    body('cardHolder')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Card holder name must be 2-100 characters'),
    body('expiryMonth')
      .optional()
      .isInt({ min: 1, max: 12 })
      .withMessage('Expiry month must be 1-12'),
    body('expiryYear')
      .optional()
      .isInt({ min: 2024, max: 2040 })
      .withMessage('Expiry year must be valid'),
    body('cvv')
      .optional()
      .isLength({ min: 3, max: 4 })
      .withMessage('CVV must be 3-4 digits'),
    body('bankAccount')
      .optional()
      .isLength({ min: 8, max: 20 })
      .withMessage('Bank account must be 8-20 characters'),
    body('routingNumber')
      .optional()
      .isLength({ min: 9, max: 9 })
      .withMessage('Routing number must be 9 digits')
  ],
  handleValidationErrors,
  processAdminPayment
);

// Download receipt for paid invoice (tenant admin)
router.get(
  '/:id/receipt',
  authMiddleware,
  adminRoleMiddleware,
  [
    param('id').isLength({ min: 1 }).withMessage('Invoice ID is required')
  ],
  handleValidationErrors,
  downloadAdminReceipt
);

// Export invoices for tenant admin
router.get(
  '/export/:format',
  authMiddleware,
  adminRoleMiddleware,
  [
    param('format').isIn(['csv', 'pdf', 'excel']).withMessage('Format must be csv, pdf, or excel'),
    query('status').optional().isIn(['paid', 'unpaid', 'overdue', 'pending', '']).withMessage('Invalid status filter'),
    query('startDate').optional().custom((value) => {
      if (!value || value === '') return true;
      const date = new Date(value);
      return !isNaN(date.getTime());
    }).withMessage('Start date must be valid date'),
    query('endDate').optional().custom((value) => {
      if (!value || value === '') return true;
      const date = new Date(value);
      return !isNaN(date.getTime());
    }).withMessage('End date must be valid date')
  ],
  handleValidationErrors,
  exportAdminInvoices
);

export default router;