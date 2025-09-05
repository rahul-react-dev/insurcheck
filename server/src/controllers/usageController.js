import { db } from '../../db.js';
import { usageEvents, usageSummaries, usageLimits, subscriptionPlans, subscriptions, tenants } from '../../../shared/schema.js';
import { eq, and, gte, lte, sql, desc, count, sum } from 'drizzle-orm';

// Helper function to get current billing period
const getCurrentBillingPeriod = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); // Last day of current month
  return { start, end };
};

// Helper function to get billing period for a specific date
const getBillingPeriodForDate = (date) => {
  const targetDate = new Date(date);
  const start = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
  const end = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

// Track usage event
export const trackUsage = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { eventType, resourceId, quantity = 1, metadata = {} } = req.body;

    if (!eventType) {
      return res.status(400).json({
        success: false,
        message: 'Event type is required'
      });
    }

    console.log(`📊 Tracking usage event: ${eventType} for tenant ${tenantId}`);

    const { start: billingPeriodStart, end: billingPeriodEnd } = getCurrentBillingPeriod();

    // Create usage event
    const newEvent = await db.insert(usageEvents).values({
      tenantId,
      userId: req.user.id,
      eventType,
      resourceId,
      quantity,
      metadata,
      billingPeriodStart,
      billingPeriodEnd
    }).returning();

    // Update or create usage summary for this billing period
    await updateUsageSummary(tenantId, eventType, billingPeriodStart, billingPeriodEnd, quantity);

    console.log(`✅ Usage tracked successfully: ${quantity} ${eventType} events`);
    
    res.json({
      success: true,
      message: 'Usage updated',
      data: {
        eventId: newEvent[0].id,
        eventType,
        quantity,
        billingPeriod: {
          start: billingPeriodStart,
          end: billingPeriodEnd
        }
      }
    });

  } catch (error) {
    console.error('❌ Error tracking usage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track usage',
      error: error.message
    });
  }
};

// Update usage summary helper
const updateUsageSummary = async (tenantId, eventType, billingPeriodStart, billingPeriodEnd, quantity) => {
  try {
    // Check if summary exists for this billing period
    const existingSummary = await db
      .select()
      .from(usageSummaries)
      .where(
        and(
          eq(usageSummaries.tenantId, tenantId),
          eq(usageSummaries.eventType, eventType),
          eq(usageSummaries.billingPeriodStart, billingPeriodStart)
        )
      )
      .limit(1);

    if (existingSummary.length > 0) {
      // Update existing summary
      await db
        .update(usageSummaries)
        .set({
          totalQuantity: sql`${usageSummaries.totalQuantity} + ${quantity}`,
          updatedAt: new Date()
        })
        .where(eq(usageSummaries.id, existingSummary[0].id));
    } else {
      // Get unit price from usage limits
      const unitPrice = await getUnitPrice(tenantId, eventType);
      
      // Create new summary
      await db.insert(usageSummaries).values({
        tenantId,
        eventType,
        billingPeriodStart,
        billingPeriodEnd,
        totalQuantity: quantity,
        unitPrice,
        totalAmount: sql`${quantity} * ${unitPrice}`,
        status: 'pending'
      });
    }
  } catch (error) {
    console.error('❌ Error updating usage summary:', error);
    throw error;
  }
};

// Get unit price for tenant and event type
const getUnitPrice = async (tenantId, eventType) => {
  try {
    // Get tenant's current subscription plan
    const subscription = await db
      .select({
        planId: subscriptions.planId
      })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.tenantId, tenantId),
          eq(subscriptions.status, 'active')
        )
      )
      .limit(1);

    if (subscription.length === 0) {
      return '0.0000'; // Default price if no subscription
    }

    // Get usage limit for this plan and event type
    const usageLimit = await db
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

    return usageLimit.length > 0 ? usageLimit[0].unitPrice : '0.0000';
  } catch (error) {
    console.error('❌ Error getting unit price:', error);
    return '0.0000';
  }
};

// Get usage data for billing period
export const getUsageForBillingPeriod = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { 
      startDate, 
      endDate, 
      eventType,
      page = 1, 
      limit = 10 
    } = req.query;

    console.log(`📊 Fetching usage for tenant ${tenantId} billing period`);

    let billingPeriodStart, billingPeriodEnd;

    if (startDate && endDate) {
      billingPeriodStart = new Date(startDate);
      billingPeriodEnd = new Date(endDate);
    } else {
      const period = getCurrentBillingPeriod();
      billingPeriodStart = period.start;
      billingPeriodEnd = period.end;
    }

    const skip = (page - 1) * limit;

    // Build where conditions
    let whereConditions = [
      eq(usageEvents.tenantId, tenantId),
      gte(usageEvents.billingPeriodStart, billingPeriodStart),
      lte(usageEvents.billingPeriodEnd, billingPeriodEnd)
    ];

    if (eventType) {
      whereConditions.push(eq(usageEvents.eventType, eventType));
    }

    // Get usage events with pagination
    const events = await db
      .select()
      .from(usageEvents)
      .where(and(...whereConditions))
      .orderBy(desc(usageEvents.createdAt))
      .limit(parseInt(limit))
      .offset(skip);

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(usageEvents)
      .where(and(...whereConditions));

    const total = totalResult[0]?.count || 0;

    // Get usage summaries for the period
    const summaries = await db
      .select()
      .from(usageSummaries)
      .where(
        and(
          eq(usageSummaries.tenantId, tenantId),
          gte(usageSummaries.billingPeriodStart, billingPeriodStart),
          lte(usageSummaries.billingPeriodEnd, billingPeriodEnd)
        )
      );

    res.json({
      success: true,
      data: {
        events,
        summaries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        },
        billingPeriod: {
          start: billingPeriodStart,
          end: billingPeriodEnd
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching usage for billing period:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch usage data',
      error: error.message
    });
  }
};

// Get usage analytics with filtering and search
export const getUsageAnalytics = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { 
      page = 1, 
      limit = 10,
      search = '',
      eventType = '',
      startDate = '',
      endDate = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    console.log(`📊 Fetching usage analytics for tenant ${tenantId}`);

    const skip = (page - 1) * limit;

    // Build where conditions
    let whereConditions = [eq(usageEvents.tenantId, tenantId)];

    if (eventType) {
      whereConditions.push(eq(usageEvents.eventType, eventType));
    }

    if (startDate) {
      whereConditions.push(gte(usageEvents.createdAt, new Date(startDate)));
    }

    if (endDate) {
      whereConditions.push(lte(usageEvents.createdAt, new Date(endDate)));
    }

    if (search) {
      whereConditions.push(
        sql`${usageEvents.eventType} ILIKE ${`%${search}%`} OR ${usageEvents.resourceId} ILIKE ${`%${search}%`}`
      );
    }

    // Get usage events with pagination
    const events = await db
      .select()
      .from(usageEvents)
      .where(and(...whereConditions))
      .orderBy(sortOrder === 'desc' ? desc(usageEvents[sortBy]) : usageEvents[sortBy])
      .limit(parseInt(limit))
      .offset(skip);

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(usageEvents)
      .where(and(...whereConditions));

    const total = totalResult[0]?.count || 0;

    // Get aggregated summary data
    const summary = await db
      .select({
        eventType: usageEvents.eventType,
        totalEvents: count(),
        totalQuantity: sum(usageEvents.quantity)
      })
      .from(usageEvents)
      .where(and(...whereConditions))
      .groupBy(usageEvents.eventType);

    res.json({
      success: true,
      data: {
        events,
        summary,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching usage analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch usage analytics',
      error: error.message
    });
  }
};

// Check usage limits and warn if approaching
export const checkUsageLimits = async (req, res) => {
  try {
    const { tenantId } = req.user;

    console.log(`🔍 Checking usage limits for tenant ${tenantId}`);

    // Get tenant's current subscription plan
    const subscription = await db
      .select({
        planId: subscriptions.planId,
        planName: subscriptionPlans.name
      })
      .from(subscriptions)
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(
        and(
          eq(subscriptions.tenantId, tenantId),
          eq(subscriptions.status, 'active')
        )
      )
      .limit(1);

    if (subscription.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Get usage limits for this plan
    const limits = await db
      .select()
      .from(usageLimits)
      .where(
        and(
          eq(usageLimits.planId, subscription[0].planId),
          eq(usageLimits.isActive, true)
        )
      );

    const { start: billingPeriodStart, end: billingPeriodEnd } = getCurrentBillingPeriod();

    // Check current usage against limits
    const limitChecks = await Promise.all(
      limits.map(async (limit) => {
        const currentUsage = await db
          .select({
            totalQuantity: sum(usageEvents.quantity)
          })
          .from(usageEvents)
          .where(
            and(
              eq(usageEvents.tenantId, tenantId),
              eq(usageEvents.eventType, limit.eventType),
              gte(usageEvents.billingPeriodStart, billingPeriodStart),
              lte(usageEvents.billingPeriodEnd, billingPeriodEnd)
            )
          );

        const usage = parseInt(currentUsage[0]?.totalQuantity) || 0;
        const limitQuantity = limit.limitQuantity;
        const percentUsed = limitQuantity ? (usage / limitQuantity) * 100 : 0;
        const isOverLimit = limitQuantity && usage > limitQuantity;
        const isNearLimit = limitQuantity && percentUsed >= 80;

        return {
          eventType: limit.eventType,
          currentUsage: usage,
          limit: limitQuantity,
          percentUsed: Math.round(percentUsed * 100) / 100,
          isOverLimit,
          isNearLimit,
          remaining: limitQuantity ? Math.max(0, limitQuantity - usage) : null
        };
      })
    );

    // Check if any limits are exceeded
    const overLimits = limitChecks.filter(check => check.isOverLimit);

    if (overLimits.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Limit exceeded; upgrade required',
        data: {
          plan: subscription[0].planName,
          limitChecks,
          overLimits,
          billingPeriod: {
            start: billingPeriodStart,
            end: billingPeriodEnd
          }
        }
      });
    }

    res.json({
      success: true,
      message: 'Usage within limits',
      data: {
        plan: subscription[0].planName,
        limitChecks,
        billingPeriod: {
          start: billingPeriodStart,
          end: billingPeriodEnd
        }
      }
    });

  } catch (error) {
    console.error('❌ Error checking usage limits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check usage limits',
      error: error.message
    });
  }
};