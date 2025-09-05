import { db } from '../../db.js';
import { usageEvents, usageLimits, subscriptions } from '../../../shared/schema.js';
import { eq, and } from 'drizzle-orm';

// Helper function to get current billing period
const getCurrentBillingPeriod = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

// Middleware to automatically track API calls
export const trackApiCall = (eventType = 'api_call') => {
  return async (req, res, next) => {
    // Skip tracking for certain routes to avoid infinite loops
    const skipRoutes = [
      '/api/usage/track',
      '/api/health',
      '/api/system-metrics',
      '/api/auth/login',
      '/api/auth/logout'
    ];

    if (skipRoutes.some(route => req.path.startsWith(route))) {
      return next();
    }

    // Only track for authenticated users with tenantId
    if (req.user && req.user.tenantId && req.method !== 'OPTIONS') {
      try {
        const { start: billingPeriodStart, end: billingPeriodEnd } = getCurrentBillingPeriod();

        // Track the API call
        await db.insert(usageEvents).values({
          tenantId: req.user.tenantId,
          userId: req.user.id,
          eventType,
          resourceId: `${req.method} ${req.path}`,
          quantity: 1,
          metadata: {
            method: req.method,
            path: req.path,
            userAgent: req.get('User-Agent'),
            ip: req.ip
          },
          billingPeriodStart,
          billingPeriodEnd
        });

        console.log(`📊 API call tracked: ${req.method} ${req.path} for tenant ${req.user.tenantId}`);
      } catch (error) {
        // Don't fail the request if usage tracking fails
        console.warn('⚠️ Failed to track API call:', error.message);
      }
    }

    next();
  };
};

// Middleware to track document uploads
export const trackDocumentUpload = async (req, res, next) => {
  // Store original res.json to intercept successful responses
  const originalJson = res.json;

  res.json = function(body) {
    // Track usage if upload was successful and user is authenticated
    if (req.user && req.user.tenantId && res.statusCode >= 200 && res.statusCode < 300) {
      trackUsageEvent(req.user.tenantId, req.user.id, 'document_upload', body.documentId || body.id, {
        filename: body.filename || req.body.filename,
        fileSize: body.fileSize || req.body.fileSize,
        mimeType: body.mimeType || req.body.mimeType
      }).catch(error => {
        console.warn('⚠️ Failed to track document upload:', error.message);
      });
    }

    // Call original res.json
    return originalJson.call(this, body);
  };

  next();
};

// Middleware to track document downloads
export const trackDocumentDownload = (documentId) => {
  return (req, res, next) => {
    // Store original res.send to intercept successful responses
    const originalSend = res.send;

    res.send = function(body) {
      // Track usage if download was successful and user is authenticated
      if (req.user && req.user.tenantId && res.statusCode >= 200 && res.statusCode < 300) {
        trackUsageEvent(req.user.tenantId, req.user.id, 'document_download', documentId || req.params.id, {
          downloadedAt: new Date().toISOString()
        }).catch(error => {
          console.warn('⚠️ Failed to track document download:', error.message);
        });
      }

      // Call original res.send
      return originalSend.call(this, body);
    };

    next();
  };
};

// Middleware to track user creation
export const trackUserCreation = async (req, res, next) => {
  // Store original res.json to intercept successful responses
  const originalJson = res.json;

  res.json = function(body) {
    // Track usage if user creation was successful and admin is authenticated
    if (req.user && req.user.tenantId && res.statusCode >= 200 && res.statusCode < 300) {
      trackUsageEvent(req.user.tenantId, req.user.id, 'user_creation', body.userId || body.id, {
        newUserEmail: body.email || req.body.email,
        newUserRole: body.role || req.body.role
      }).catch(error => {
        console.warn('⚠️ Failed to track user creation:', error.message);
      });
    }

    // Call original res.json
    return originalJson.call(this, body);
  };

  next();
};

// Middleware to track compliance checks
export const trackComplianceCheck = async (req, res, next) => {
  // Store original res.json to intercept successful responses
  const originalJson = res.json;

  res.json = function(body) {
    // Track usage if compliance check was successful and user is authenticated
    if (req.user && req.user.tenantId && res.statusCode >= 200 && res.statusCode < 300) {
      trackUsageEvent(req.user.tenantId, req.user.id, 'compliance_check', body.ruleId || req.params.id, {
        ruleType: body.ruleType || req.body.ruleType,
        checkResult: body.result || 'passed'
      }).catch(error => {
        console.warn('⚠️ Failed to track compliance check:', error.message);
      });
    }

    // Call original res.json
    return originalJson.call(this, body);
  };

  next();
};

// Helper function to track usage events
const trackUsageEvent = async (tenantId, userId, eventType, resourceId, metadata = {}) => {
  try {
    const { start: billingPeriodStart, end: billingPeriodEnd } = getCurrentBillingPeriod();

    await db.insert(usageEvents).values({
      tenantId,
      userId,
      eventType,
      resourceId,
      quantity: 1,
      metadata,
      billingPeriodStart,
      billingPeriodEnd
    });

    console.log(`📊 Usage tracked: ${eventType} for tenant ${tenantId}`);
  } catch (error) {
    console.error('❌ Error tracking usage event:', error);
    throw error;
  }
};

// Middleware to check usage limits before allowing certain actions
export const checkUsageLimit = (eventType) => {
  return async (req, res, next) => {
    if (!req.user || !req.user.tenantId) {
      return next();
    }

    try {
      // Get tenant's subscription plan
      const subscription = await db
        .select({
          planId: subscriptions.planId
        })
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.tenantId, req.user.tenantId),
            eq(subscriptions.status, 'active')
          )
        )
        .limit(1);

      if (subscription.length === 0) {
        return next(); // No subscription, allow action
      }

      // Get usage limit for this event type
      const limit = await db
        .select()
        .from(usageLimits)
        .where(
          and(
            eq(usageLimits.planId, subscription[0].planId),
            eq(usageLimits.eventType, eventType),
            eq(usageLimits.isActive, true)
          )
        )
        .limit(1);

      if (limit.length === 0 || limit[0].limitQuantity === null) {
        return next(); // No limit or unlimited, allow action
      }

      // Check current usage
      const { start: billingPeriodStart, end: billingPeriodEnd } = getCurrentBillingPeriod();
      
      const currentUsage = await db.execute(sql`
        SELECT COALESCE(SUM(quantity), 0) as total_usage
        FROM usage_events 
        WHERE tenant_id = ${req.user.tenantId}
          AND event_type = ${eventType}
          AND billing_period_start = ${billingPeriodStart}
      `);

      const totalUsage = parseInt(currentUsage.rows[0]?.total_usage || 0);

      if (totalUsage >= limit[0].limitQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Limit exceeded; upgrade required',
          error: 'USAGE_LIMIT_EXCEEDED',
          data: {
            eventType,
            currentUsage: totalUsage,
            limit: limit[0].limitQuantity,
            billingPeriod: {
              start: billingPeriodStart,
              end: billingPeriodEnd
            }
          }
        });
      }

      next();
    } catch (error) {
      console.error('❌ Error checking usage limit:', error);
      // Don't fail the request if limit check fails
      next();
    }
  };
};