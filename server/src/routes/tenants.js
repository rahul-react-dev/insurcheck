import express from 'express';
import { body } from 'express-validator';
import * as tenantController from '../controllers/tenantController.js';
import { authMiddleware, superAdminOnly } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const createTenantValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Tenant name is required'),
  body('domain').isURL().withMessage('Valid domain is required'),
  body('adminEmail').isEmail().withMessage('Valid admin email is required'),
  body('adminPassword').isLength({ min: 6 }).withMessage('Admin password must be at least 6 characters')
];

// Routes - All require super admin access
router.use(authMiddleware);
router.use(superAdminOnly);

router.get('/', tenantController.getTenants);
router.post('/', createTenantValidation, tenantController.createTenant);
router.put('/:id', tenantController.updateTenant);
router.delete('/:id', tenantController.deleteTenant);
router.get('/:id/users', tenantController.getTenantUsers);

export default router;