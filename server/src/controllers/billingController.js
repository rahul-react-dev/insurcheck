import { db } from '../../db.js';
import { usageEvents, usageSummaries, usageLimits, subscriptionPlans, subscriptions, invoices } from '../../../shared/schema.js';
import { eq, and, gte, lte, sql, sum } from 'drizzle-orm';

// Calculate usage-based billing for a tenant
export const calculateUsageBilling = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { 
      billingPeriodStart, 
      billingPeriodEnd,
      generateInvoice = false 
    } = req.body;

    console.log(`💰 Calculating usage billing for tenant ${tenantId}`);

    // Validate billing period
    if (!billingPeriodStart || !billingPeriodEnd) {
      return res.status(400).json({
        success: false,
        message: 'Billing period start and end dates are required'
      });
    }

    const periodStart = new Date(billingPeriodStart);
    const periodEnd = new Date(billingPeriodEnd);

    // Get tenant's current subscription plan
    const subscription = await db
      .select({
        id: subscriptions.id,
        planId: subscriptions.planId,
        planName: subscriptionPlans.name,
        planPrice: subscriptionPlans.price
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

    // Calculate usage billing for each event type
    const billingCalculations = await Promise.all(
      limits.map(async (limit) => {
        // Get total usage for this event type in billing period
        const usageResult = await db
          .select({
            totalQuantity: sum(usageEvents.quantity)
          })
          .from(usageEvents)
          .where(
            and(
              eq(usageEvents.tenantId, tenantId),
              eq(usageEvents.eventType, limit.eventType),
              gte(usageEvents.billingPeriodStart, periodStart),
              lte(usageEvents.billingPeriodEnd, periodEnd)
            )
          );

        const totalUsage = parseInt(usageResult[0]?.totalQuantity) || 0;
        const limitQuantity = limit.limitQuantity;
        const unitPrice = parseFloat(limit.unitPrice);
        const overagePrice = parseFloat(limit.overagePrice || 0);

        let baseCharge = 0;
        let overageCharge = 0;
        let totalCharge = 0;

        if (limitQuantity === null) {
          // Unlimited usage with per-unit pricing
          totalCharge = totalUsage * unitPrice;
          baseCharge = totalCharge;
        } else {
          // Usage with limits
          const includedUsage = Math.min(totalUsage, limitQuantity);
          const overageUsage = Math.max(0, totalUsage - limitQuantity);

          baseCharge = includedUsage * unitPrice;
          overageCharge = overageUsage * overagePrice;
          totalCharge = baseCharge + overageCharge;
        }

        return {
          eventType: limit.eventType,
          totalUsage,
          limitQuantity,
          unitPrice,
          overagePrice,
          baseCharge: Math.round(baseCharge * 100) / 100,
          overageCharge: Math.round(overageCharge * 100) / 100,
          totalCharge: Math.round(totalCharge * 100) / 100,
          includedUsage: limitQuantity ? Math.min(totalUsage, limitQuantity) : totalUsage,
          overageUsage: limitQuantity ? Math.max(0, totalUsage - limitQuantity) : 0
        };
      })
    );

    // Calculate total billing amount
    const totalUsageCharges = billingCalculations.reduce((sum, calc) => sum + calc.totalCharge, 0);
    const subscriptionFee = parseFloat(subscription[0].planPrice);
    const totalAmount = subscriptionFee + totalUsageCharges;

    const billingData = {
      subscriptionId: subscription[0].id,
      planName: subscription[0].planName,
      billingPeriod: {
        start: periodStart,
        end: periodEnd
      },
      subscriptionFee: Math.round(subscriptionFee * 100) / 100,
      usageCharges: billingCalculations,
      totalUsageCharges: Math.round(totalUsageCharges * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      calculatedAt: new Date()
    };

    // Generate invoice if requested
    if (generateInvoice && totalAmount > 0) {
      try {
        const invoiceData = await generateUsageInvoice(tenantId, billingData);
        billingData.invoice = invoiceData;
      } catch (invoiceError) {
        console.error('❌ Error generating invoice:', invoiceError);
        billingData.invoiceError = invoiceError.message;
      }
    }

    // Update usage summaries with calculated amounts
    await Promise.all(
      billingCalculations.map(async (calc) => {
        try {
          await db
            .update(usageSummaries)
            .set({
              totalAmount: calc.totalCharge.toString(),
              status: 'calculated',
              updatedAt: new Date()
            })
            .where(
              and(
                eq(usageSummaries.tenantId, tenantId),
                eq(usageSummaries.eventType, calc.eventType),
                eq(usageSummaries.billingPeriodStart, periodStart)
              )
            );
        } catch (updateError) {
          console.warn(`⚠️ Could not update summary for ${calc.eventType}:`, updateError.message);
        }
      })
    );

    console.log(`✅ Usage billing calculated: $${totalAmount} for tenant ${tenantId}`);

    res.json({
      success: true,
      message: 'Usage billing calculated successfully',
      data: billingData
    });

  } catch (error) {
    console.error('❌ Error calculating usage billing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate usage billing',
      error: error.message
    });
  }
};

// Generate invoice from usage billing data
const generateUsageInvoice = async (tenantId, billingData) => {
  try {
    const invoiceNumber = `INV-${Date.now()}-${tenantId}`;
    const issueDate = new Date();
    const dueDate = new Date(issueDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days

    // Prepare invoice items
    const items = [
      {
        description: `${billingData.planName} Subscription`,
        quantity: 1,
        unitPrice: billingData.subscriptionFee,
        amount: billingData.subscriptionFee
      },
      ...billingData.usageCharges.map(charge => ({
        description: `${charge.eventType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Usage (${charge.totalUsage} units)`,
        quantity: charge.totalUsage,
        unitPrice: charge.unitPrice,
        amount: charge.totalCharge,
        metadata: {
          eventType: charge.eventType,
          limitQuantity: charge.limitQuantity,
          overageUsage: charge.overageUsage,
          overageCharge: charge.overageCharge
        }
      }))
    ];

    // Create invoice
    const newInvoice = await db.insert(invoices).values({
      tenantId,
      subscriptionId: billingData.subscriptionId,
      invoiceNumber,
      amount: billingData.totalUsageCharges,
      taxAmount: 0, // TODO: Add tax calculation if needed
      totalAmount: billingData.totalAmount,
      status: 'sent',
      issueDate,
      dueDate,
      billingPeriodStart: billingData.billingPeriod.start,
      billingPeriodEnd: billingData.billingPeriod.end,
      items
    }).returning();

    console.log(`📄 Usage invoice generated: ${invoiceNumber}`);

    return {
      id: newInvoice[0].id,
      invoiceNumber,
      amount: billingData.totalAmount,
      status: 'sent',
      issueDate,
      dueDate
    };

  } catch (error) {
    console.error('❌ Error generating usage invoice:', error);
    throw error;
  }
};

// Get billing summary for tenant
export const getBillingSummary = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { 
      billingPeriodStart, 
      billingPeriodEnd 
    } = req.query;

    console.log(`📊 Getting billing summary for tenant ${tenantId}`);

    let periodStart, periodEnd;

    if (billingPeriodStart && billingPeriodEnd) {
      periodStart = new Date(billingPeriodStart);
      periodEnd = new Date(billingPeriodEnd);
    } else {
      // Current month
      const now = new Date();
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    // Get usage summaries for the period
    const summaries = await db
      .select()
      .from(usageSummaries)
      .where(
        and(
          eq(usageSummaries.tenantId, tenantId),
          gte(usageSummaries.billingPeriodStart, periodStart),
          lte(usageSummaries.billingPeriodEnd, periodEnd)
        )
      );

    // Get subscription info
    const subscription = await db
      .select({
        planName: subscriptionPlans.name,
        planPrice: subscriptionPlans.price
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

    const totalUsageCharges = summaries.reduce((sum, summary) => {
      return sum + parseFloat(summary.totalAmount || 0);
    }, 0);

    const subscriptionFee = subscription.length > 0 ? parseFloat(subscription[0].planPrice) : 0;

    res.json({
      success: true,
      data: {
        billingPeriod: {
          start: periodStart,
          end: periodEnd
        },
        subscription: subscription[0] || null,
        subscriptionFee: Math.round(subscriptionFee * 100) / 100,
        usageSummaries: summaries,
        totalUsageCharges: Math.round(totalUsageCharges * 100) / 100,
        totalAmount: Math.round((subscriptionFee + totalUsageCharges) * 100) / 100
      }
    });

  } catch (error) {
    console.error('❌ Error getting billing summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get billing summary',
      error: error.message
    });
  }
};