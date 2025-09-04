import express from 'express';
import { 
  getCurrentSubscription, 
  getAvailablePlans, 
  upgradePlan,
  createUpgradePaymentIntent,
  getSubscriptionAnalytics,
  verifyPaymentAndUpdateSubscription
} from '../controllers/adminSubscriptionController.js';
import { body, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth.js';
import { adminRoleMiddleware } from '../middleware/roles.js';

const router = express.Router();

// Validation middleware
const validateUpgradePlan = [
  body('planId').isInt().withMessage('Plan ID must be a valid integer'),
];

const validatePaymentIntent = [
  body('planId').isInt().withMessage('Plan ID must be a valid integer'),
];

const validatePaymentVerification = [
  body('paymentIntentId').isString().notEmpty().withMessage('Payment Intent ID is required'),
];

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// Apply authentication and admin role middleware to all routes
router.use(authMiddleware);
router.use(adminRoleMiddleware);

// Routes
router.get('/', getCurrentSubscription);
router.get('/plans', getAvailablePlans);
router.get('/analytics', getSubscriptionAnalytics);
router.post('/create-payment-intent', validatePaymentIntent, handleValidationErrors, createUpgradePaymentIntent);
router.post('/upgrade', validateUpgradePlan, handleValidationErrors, upgradePlan);
router.post('/verify-payment', validatePaymentVerification, handleValidationErrors, verifyPaymentAndUpdateSubscription);

export default router;