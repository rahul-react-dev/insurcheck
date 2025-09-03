import { db } from '../../db.ts';
import { subscriptions, subscriptionPlans, users } from '@shared/schema';
import { eq, and, count } from 'drizzle-orm';

// Get current subscription for the tenant admin
export const getCurrentSubscription = async (req, res) => {
  try {
    const { tenantId } = req.user;

    console.log(`📋 Fetching subscription for tenant ${tenantId}`);

    // Get tenant's active subscription with plan details
    const currentSubscription = await db
      .select({
        id: subscriptions.id,
        tenantId: subscriptions.tenantId,
        planId: subscriptions.planId,
        status: subscriptions.status,
        startedAt: subscriptions.startedAt,
        endsAt: subscriptions.endsAt,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
        // Plan details
        plan: {
          id: subscriptionPlans.id,
          name: subscriptionPlans.name,
          description: subscriptionPlans.description,
          price: subscriptionPlans.price,
          billingCycle: subscriptionPlans.billingCycle,
          features: subscriptionPlans.features,
          maxUsers: subscriptionPlans.maxUsers,
          storageLimit: subscriptionPlans.storageLimit,
          isActive: subscriptionPlans.isActive
        }
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

    if (currentSubscription.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found for this tenant'
      });
    }

    // Get current user count for this tenant
    const userCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.tenantId, tenantId));

    // Calculate storage usage (you can enhance this based on your document storage logic)
    const storageUsed = 0; // Placeholder - you can calculate actual storage usage

    // Enhance subscription data with usage information
    const subscriptionData = {
      ...currentSubscription[0],
      currentUsers: userCount[0].count,
      storageUsed: storageUsed
    };

    console.log(`✅ Subscription fetched for tenant ${tenantId}`);

    res.json({
      success: true,
      data: subscriptionData
    });

  } catch (error) {
    console.error('Get current subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching subscription'
    });
  }
};

// Get all available subscription plans
export const getAvailablePlans = async (req, res) => {
  try {
    console.log('📋 Fetching available subscription plans');

    const plans = await db
      .select({
        id: subscriptionPlans.id,
        name: subscriptionPlans.name,
        description: subscriptionPlans.description,
        price: subscriptionPlans.price,
        billingCycle: subscriptionPlans.billingCycle,
        features: subscriptionPlans.features,
        maxUsers: subscriptionPlans.maxUsers,
        storageLimit: subscriptionPlans.storageLimit,
        isActive: subscriptionPlans.isActive,
        createdAt: subscriptionPlans.createdAt
      })
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(subscriptionPlans.price);

    console.log(`✅ Found ${plans.length} available plans`);

    res.json({
      success: true,
      data: plans
    });

  } catch (error) {
    console.error('Get available plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching available plans'
    });
  }
};

// Upgrade/change subscription plan
export const upgradePlan = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID is required'
      });
    }

    console.log(`🔄 Upgrading subscription for tenant ${tenantId} to plan ${planId}`);

    // Verify the new plan exists and is active
    const newPlan = await db
      .select()
      .from(subscriptionPlans)
      .where(and(eq(subscriptionPlans.id, planId), eq(subscriptionPlans.isActive, true)))
      .limit(1);

    if (newPlan.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or inactive plan selected'
      });
    }

    // Get current subscription
    const currentSubscription = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.tenantId, tenantId),
          eq(subscriptions.status, 'active')
        )
      )
      .limit(1);

    if (currentSubscription.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Check if user count is within new plan limits
    const userCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.tenantId, tenantId));

    if (userCount[0].count > newPlan[0].maxUsers) {
      return res.status(400).json({
        success: false,
        message: `Cannot downgrade to this plan. Current user count (${userCount[0].count}) exceeds the plan limit (${newPlan[0].maxUsers}). Please remove users before downgrading.`,
        data: {
          currentUsers: userCount[0].count,
          planLimit: newPlan[0].maxUsers
        }
      });
    }

    // Update subscription plan
    const updatedSubscription = await db
      .update(subscriptions)
      .set({
        planId: planId,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, currentSubscription[0].id))
      .returning();

    // Fetch updated subscription with plan details
    const newSubscriptionData = await db
      .select({
        id: subscriptions.id,
        tenantId: subscriptions.tenantId,
        planId: subscriptions.planId,
        status: subscriptions.status,
        startedAt: subscriptions.startedAt,
        endsAt: subscriptions.endsAt,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
        plan: {
          id: subscriptionPlans.id,
          name: subscriptionPlans.name,
          description: subscriptionPlans.description,
          price: subscriptionPlans.price,
          billingCycle: subscriptionPlans.billingCycle,
          features: subscriptionPlans.features,
          maxUsers: subscriptionPlans.maxUsers,
          storageLimit: subscriptionPlans.storageLimit,
          isActive: subscriptionPlans.isActive
        }
      })
      .from(subscriptions)
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(eq(subscriptions.id, updatedSubscription[0].id))
      .limit(1);

    console.log(`✅ Subscription upgraded successfully for tenant ${tenantId}`);

    res.json({
      success: true,
      message: 'Subscription plan updated successfully',
      data: {
        ...newSubscriptionData[0],
        currentUsers: userCount[0].count,
        storageUsed: 0 // Placeholder
      }
    });

  } catch (error) {
    console.error('Upgrade plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating subscription plan'
    });
  }
};

// Get subscription usage analytics
export const getSubscriptionAnalytics = async (req, res) => {
  try {
    const { tenantId } = req.user;

    console.log(`📊 Fetching subscription analytics for tenant ${tenantId}`);

    // Get current subscription
    const subscription = await db
      .select({
        planId: subscriptions.planId,
        maxUsers: subscriptionPlans.maxUsers,
        storageLimit: subscriptionPlans.storageLimit,
        startedAt: subscriptions.startedAt,
        endsAt: subscriptions.endsAt
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

    // Get user analytics
    const totalUsers = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.tenantId, tenantId));

    const activeUsers = await db
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.tenantId, tenantId), eq(users.isActive, true)));

    // Calculate days remaining
    const today = new Date();
    const endDate = new Date(subscription[0].endsAt);
    const daysRemaining = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));

    const analytics = {
      users: {
        total: totalUsers[0].count,
        active: activeUsers[0].count,
        inactive: totalUsers[0].count - activeUsers[0].count,
        limit: subscription[0].maxUsers,
        usagePercentage: Math.round((totalUsers[0].count / subscription[0].maxUsers) * 100)
      },
      storage: {
        used: 0, // Placeholder - calculate actual storage usage
        limit: subscription[0].storageLimit,
        usagePercentage: 0 // Placeholder
      },
      billing: {
        startedAt: subscription[0].startedAt,
        endsAt: subscription[0].endsAt,
        daysRemaining: daysRemaining,
        isExpiringSoon: daysRemaining <= 30
      }
    };

    console.log(`✅ Subscription analytics fetched for tenant ${tenantId}`);

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Get subscription analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching subscription analytics'
    });
  }
};