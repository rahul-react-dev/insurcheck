import { db } from '../../db.ts';
import { tenants } from '../schema.ts';
import { eq } from 'drizzle-orm';

/**
 * Middleware to check document access permissions based on tenant status
 * Implements read-only mode for deactivated tenants or cancelled subscriptions
 */
export const documentAccessMiddleware = async (req, res, next) => {
  try {
    // Super admins always have full access
    if (req.user?.role === 'super-admin') {
      return next();
    }

    // Skip check if no tenant ID (shouldn't happen for tenant users)
    if (!req.user?.tenantId) {
      return next();
    }

    // Use tenant info from auth middleware if available
    let tenant = req.tenant;
    
    // If not available, fetch tenant info
    if (!tenant) {
      const tenantResult = await db.select()
        .from(tenants)
        .where(eq(tenants.id, req.user.tenantId))
        .limit(1);
      
      if (tenantResult.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Your account is inactive. Please contact your administrator.',
          code: 'TENANT_NOT_FOUND'
        });
      }
      
      tenant = tenantResult[0];
    }

    // Check if this is a write operation
    const isWriteOperation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    
    // For deactivated tenants - block all document operations
    if (['deactivated', 'suspended', 'inactive'].includes(tenant.status)) {
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive. Document access is not available.',
        code: 'TENANT_DEACTIVATED',
        readOnly: true
      });
    }

    // For cancelled subscriptions - allow read-only access
    if (tenant.status === 'cancelled' && isWriteOperation) {
      return res.status(403).json({
        success: false,
        message: 'Your subscription is inactive. Please renew to regain full access.',
        code: 'SUBSCRIPTION_CANCELLED',
        readOnly: true,
        allowedActions: ['view', 'download']
      });
    }

    // Check trial expiration - block all operations
    const now = new Date();
    if (tenant.isTrialActive && tenant.trialEndsAt && new Date(tenant.trialEndsAt) < now) {
      return res.status(403).json({
        success: false,
        message: 'Your trial period has ended. Please upgrade to continue.',
        code: 'TRIAL_EXPIRED',
        upgradeRequired: true
      });
    }

    // All checks passed - allow access
    next();
    
  } catch (error) {
    console.error('Document access middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking document access permissions'
    });
  }
};

/**
 * Middleware specifically for document upload operations
 * Provides more specific restrictions for file uploads
 */
export const documentUploadMiddleware = async (req, res, next) => {
  try {
    // Super admins always have full access
    if (req.user?.role === 'super-admin') {
      return next();
    }

    // Use tenant info from auth middleware
    const tenant = req.tenant;
    
    if (!tenant) {
      return res.status(403).json({
        success: false,
        message: 'Tenant information not available',
        code: 'TENANT_INFO_MISSING'
      });
    }

    // Block uploads for deactivated tenants
    if (['deactivated', 'suspended', 'inactive'].includes(tenant.status)) {
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive. Document uploads are not allowed.',
        code: 'TENANT_DEACTIVATED'
      });
    }

    // Block uploads for cancelled subscriptions
    if (tenant.status === 'cancelled') {
      return res.status(403).json({
        success: false,
        message: 'Your subscription is inactive. Please renew to upload documents.',
        code: 'SUBSCRIPTION_CANCELLED',
        upgradeRequired: true
      });
    }

    // Block uploads for expired trials
    const now = new Date();
    if (tenant.isTrialActive && tenant.trialEndsAt && new Date(tenant.trialEndsAt) < now) {
      return res.status(403).json({
        success: false,
        message: 'Your trial period has ended. Please upgrade to upload documents.',
        code: 'TRIAL_EXPIRED',
        upgradeRequired: true
      });
    }

    // Check storage limits (if implemented)
    // TODO: Implement storage usage checking against tenant.storageLimit
    
    next();
    
  } catch (error) {
    console.error('Document upload middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking upload permissions'
    });
  }
};