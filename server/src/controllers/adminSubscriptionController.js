import { db } from '../../db.ts';
import { subscriptions, subscriptionPlans, users } from '@shared/schema';
import { eq, and, count } from 'drizzle-orm';
import { 
  createPaymentIntent, 
  createOrGetCustomer, 
  calculateProratedAmount 
} from '../../services/stripeService.js';

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

// Create payment intent for subscription upgrade
export const createUpgradePaymentIntent = async (req, res) => {
  try {
    const { tenantId, email, firstName, lastName } = req.user;
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID is required'
      });
    }

    console.log(`💳 Creating payment intent for tenant ${tenantId} upgrade to plan ${planId}`);

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

    // Get current subscription with plan details
    const currentSubscription = await db
      .select({
        id: subscriptions.id,
        tenantId: subscriptions.tenantId,
        planId: subscriptions.planId,
        status: subscriptions.status,
        startedAt: subscriptions.startedAt,
        endsAt: subscriptions.endsAt,
        plan: {
          id: subscriptionPlans.id,
          name: subscriptionPlans.name,
          price: subscriptionPlans.price,
          billingCycle: subscriptionPlans.billingCycle
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

    // Check if it's the same plan
    if (currentSubscription[0].planId === planId) {
      return res.status(400).json({
        success: false,
        message: 'You are already on this plan'
      });
    }

    // Calculate prorated amount
    const currentPlan = currentSubscription[0].plan;
    const amount = calculateProratedAmount({
      currentPlanPrice: currentPlan.price,
      newPlanPrice: newPlan[0].price,
      currentPeriodStart: new Date(currentSubscription[0].startedAt),
      currentPeriodEnd: new Date(currentSubscription[0].endsAt)
    });

    // If amount is 0 (downgrade), handle without payment
    if (amount === 0) {
      // Direct upgrade for downgrades or same price
      const updatedSubscription = await db
        .update(subscriptions)
        .set({
          planId: planId,
          updatedAt: new Date()
        })
        .where(eq(subscriptions.id, currentSubscription[0].id))
        .returning();

      return res.json({
        success: true,
        message: 'Subscription updated successfully',
        data: {
          requiresPayment: false,
          subscription: updatedSubscription[0]
        }
      });
    }

    // Create or get Stripe customer
    const customerResult = await createOrGetCustomer({
      email: email,
      name: `${firstName} ${lastName}`,
      tenantId: tenantId
    });

    if (!customerResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create customer',
        error: customerResult.error
      });
    }

    // Create payment intent
    const paymentIntentResult = await createPaymentIntent({
      amount: amount,
      currency: 'usd',
      customerId: customerResult.data.id,
      metadata: {
        tenantId: tenantId.toString(),
        newPlanId: planId.toString(),
        subscriptionId: currentSubscription[0].id.toString(),
        currentPlanId: currentPlan.id.toString(),
        upgradeType: newPlan[0].price > currentPlan.price ? 'upgrade' : 'downgrade'
      }
    });

    if (!paymentIntentResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment intent',
        error: paymentIntentResult.error
      });
    }

    console.log(`✅ Payment intent created for tenant ${tenantId}`);

    res.json({
      success: true,
      data: {
        requiresPayment: true,
        clientSecret: paymentIntentResult.data.clientSecret,
        amount: amount,
        currency: 'usd',
        currentPlan: currentPlan,
        newPlan: newPlan[0]
      }
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating payment intent'
    });
  }
};

// Legacy upgrade endpoint (now deprecated, use payment intent flow)
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

    console.log(`🔄 Direct upgrade for tenant ${tenantId} to plan ${planId}`);

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

// Verify payment and update subscription immediately
export const verifyPaymentAndUpdateSubscription = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { paymentIntentId, planId } = req.body;

    if (!paymentIntentId || !planId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID and plan ID are required'
      });
    }

    console.log(`🔍 Verifying payment intent ${paymentIntentId} for tenant ${tenantId}`);

    // Import stripe here to avoid circular dependencies
    const { retrievePaymentIntent } = await import('../../services/stripeService.js');

    // Retrieve payment intent from Stripe
    const paymentResult = await retrievePaymentIntent(paymentIntentId);

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to retrieve payment information'
      });
    }

    const paymentIntent = paymentResult.data;

    // Check if payment was successful
    if (paymentIntent.status === 'succeeded') {
      console.log(`✅ Payment confirmed for tenant ${tenantId}, updating subscription to plan ${planId}`);

      // Get current subscription
      const currentSubscription = await db
        .select({
          id: subscriptions.id,
          tenantId: subscriptions.tenantId,
          planId: subscriptions.planId,
          status: subscriptions.status
        })
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

      // Update subscription to new plan
      const updatedSubscription = await db
        .update(subscriptions)
        .set({
          planId: parseInt(planId),
          status: 'active',
          updatedAt: new Date()
        })
        .where(eq(subscriptions.id, currentSubscription[0].id))
        .returning();

      console.log(`🎉 Subscription successfully updated for tenant ${tenantId} to plan ${planId}`);

      res.json({
        success: true,
        message: 'Subscription updated successfully',
        data: {
          subscription: updatedSubscription[0],
          paymentStatus: paymentIntent.status
        }
      });

    } else {
      console.log(`❌ Payment not completed for tenant ${tenantId}. Status: ${paymentIntent.status}`);

      res.json({
        success: false,
        message: `Payment not completed. Status: ${paymentIntent.status}`,
        data: {
          paymentStatus: paymentIntent.status
        }
      });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying payment'
    });
  }
};