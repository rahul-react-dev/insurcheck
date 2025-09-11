import jwt from 'jsonwebtoken';
import { db } from '../../db.js';
import { users, tenants } from '../../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { config } from '../config/env.js';

const JWT_SECRET = config.jwtSecret;
console.log('🔑 JWT_SECRET loaded:', JWT_SECRET ? 'Present' : 'Missing');

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('🔍 Token decoded successfully:', { userId: decoded.userId, email: decoded.email, role: decoded.role });
      
      // Fetch user details
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1);

      console.log('👤 User lookup result:', user ? { id: user.id, email: user.email, active: user.isActive } : 'No user found');

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token or user inactive'
        });
      }

      // Check tenant status for ongoing session validation (except super-admin)
      if (user.role !== 'super-admin' && user.tenantId) {
        const tenantResult = await db.select()
          .from(tenants)
          .where(eq(tenants.id, user.tenantId))
          .limit(1);
        
        if (tenantResult.length === 0) {
          return res.status(401).json({
            success: false,
            message: 'Your account is inactive. Please contact your administrator.',
            code: 'TENANT_NOT_FOUND'
          });
        }
        
        const tenant = tenantResult[0];
        
        // Check if tenant is deactivated - immediate logout
        if (['deactivated', 'suspended', 'inactive'].includes(tenant.status)) {
          return res.status(403).json({
            success: false,
            message: 'Your account is inactive. Please contact your administrator.',
            code: 'TENANT_DEACTIVATED',
            forceLogout: true
          });
        }
        
        // Check trial expiration - immediate logout
        const now = new Date();
        if (tenant.isTrialActive && tenant.trialEndsAt && new Date(tenant.trialEndsAt) < now) {
          return res.status(403).json({
            success: false,
            message: 'Your trial period has ended. Please upgrade to continue.',
            code: 'TRIAL_EXPIRED',
            forceLogout: true
          });
        }

        // Add tenant info to request for downstream use
        req.tenant = {
          id: tenant.id,
          name: tenant.name,
          status: tenant.status,
          subscriptionPlan: tenant.subscriptionPlan,
          isTrialActive: tenant.isTrialActive,
          trialEndsAt: tenant.trialEndsAt,
          maxUsers: tenant.maxUsers,
          storageLimit: tenant.storageLimit
        };
      }

      // Add user info to request
      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        name: user.name
      };

      next();
    } catch (tokenError) {
      console.error('❌ Token verification failed:', tokenError.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};