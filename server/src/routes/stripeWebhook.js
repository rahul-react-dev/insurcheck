/**
 * Stripe Webhook Routes for InsurCheck
 * Handles Stripe webhook events for payment confirmations
 */

import express from 'express';
import rateLimit from 'express-rate-limit';
import { verifyWebhookSignature } from '../services/stripeService.js';
import { db } from '../../db.ts';
import { subscriptions } from '../schema.ts';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Validate webhook secret is present - CRITICAL for security
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_WEBHOOK_SECRET) {
  console.error('❌ CRITICAL: STRIPE_WEBHOOK_SECRET is missing. This is a production-blocking security vulnerability.');
  throw new Error('STRIPE_WEBHOOK_SECRET environment variable is required for webhook security');
}

// Rate limiting for webhook endpoint to prevent abuse
const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Allow up to 100 webhook requests per window
  message: 'Too many webhook requests',
  standardHeaders: true,
  legacyHeaders: false,
  // Use default key generator for proper IPv6 support
  skip: (req) => {
    // Skip rate limiting for health checks
    return false;
  }
});

if (process.env.NODE_ENV !== 'production') {
  console.log('🔑 Stripe webhook secret loaded: Present');
}

/**
 * Handle Stripe webhook events
 * Raw body parser middleware is required for webhook signature verification
 */
router.post('/webhook', webhookLimiter, express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const payload = req.body;

  // Only log basic webhook info, never headers or payload in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('📨 Received Stripe webhook');
    console.log('🔍 Webhook signature header:', sig ? 'Present' : 'Missing');
    console.log('📦 Webhook payload size:', payload ? payload.length : 0);
    console.log('🕒 Webhook timestamp:', new Date().toISOString());
  } else {
    // Production: minimal logging only
    console.log(`📨 Webhook received at ${new Date().toISOString()}`);
  }

  // Verify webhook signature
  const verification = verifyWebhookSignature(payload, sig, STRIPE_WEBHOOK_SECRET);
  
  if (!verification.success) {
    console.error('❌ Webhook signature verification failed:', verification.error);
    return res.status(400).send('Webhook signature verification failed');
  }

  const event = verification.event;
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🎯 Processing webhook event: ${event.type}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSuccess(event.data.object);
        break;
        
      default:
        console.log(`📝 Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
    
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * Handle successful payment intent
 */
async function handlePaymentSuccess(paymentIntent) {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ Payment succeeded: ${paymentIntent.id}`);
      console.log(`💰 Payment amount: $${(paymentIntent.amount / 100).toFixed(2)}`);
      console.log(`💳 Payment status: ${paymentIntent.status}`);
      console.log(`📋 Payment Intent Metadata:`, JSON.stringify(paymentIntent.metadata, null, 2));
    }
    
    const metadata = paymentIntent.metadata;
    
    if (metadata.source === 'insurcheck_subscription_upgrade') {
      const { tenantId, newPlanId, subscriptionId } = metadata;
      
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔄 Processing subscription upgrade:`, {
          tenantId,
          newPlanId, 
          subscriptionId,
          paymentIntentId: paymentIntent.id
        });
      }
      
      if (tenantId && newPlanId && subscriptionId) {
        // Update subscription in database
        const updateResult = await db
          .update(subscriptions)
          .set({
            planId: parseInt(newPlanId),
            status: 'active',
            updatedAt: new Date()
          })
          .where(eq(subscriptions.id, parseInt(subscriptionId)))
          .returning();
          
        if (process.env.NODE_ENV !== 'production') {
          console.log(`✅ Subscription updated successfully:`, updateResult);
          console.log(`🎉 Subscription ${subscriptionId} upgraded to plan ${newPlanId} for tenant ${tenantId}`);
        }
      } else {
        console.error(`❌ Missing required metadata fields:`, {
          tenantId: !!tenantId,
          newPlanId: !!newPlanId,
          subscriptionId: !!subscriptionId
        });
      }
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`ℹ️ Payment intent not for subscription upgrade. Source: ${metadata.source}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error handling payment success:', error);
    console.error('Error details:', error.stack);
    throw error;
  }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentFailure(paymentIntent) {
  try {
    // Always log payment failures as they are critical for business operations
    console.log(`❌ Payment failed: ${paymentIntent.id}`);
    
    const metadata = paymentIntent.metadata;
    
    if (metadata.source === 'insurcheck_subscription_upgrade') {
      // Log payment failure for potential retry or customer notification
      console.log(`💔 Subscription upgrade payment failed for tenant ${metadata.tenantId}`);
      
      // Could implement notification to admin about failed payment
      // Could set subscription status to 'payment_failed' if needed
    }
    
  } catch (error) {
    console.error('❌ Error handling payment failure:', error);
    throw error;
  }
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdate(subscription) {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔄 Subscription updated: ${subscription.id}`);
    }
    // Handle subscription modifications if using Stripe subscriptions
  } catch (error) {
    console.error('❌ Error handling subscription update:', error);
    throw error;
  }
}

/**
 * Handle successful invoice payments
 */
async function handleInvoicePaymentSuccess(invoice) {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`💰 Invoice payment succeeded: ${invoice.id}`);
    }
    // Handle recurring billing if implemented
  } catch (error) {
    console.error('❌ Error handling invoice payment:', error);
    throw error;
  }
}

export default router;