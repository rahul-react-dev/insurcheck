/**
 * Stripe Webhook Routes for InsurCheck
 * Handles Stripe webhook events for payment confirmations
 */

import express from 'express';
import { verifyWebhookSignature } from '../../services/stripeService.js';
import { db } from '../../db.ts';
import { subscriptions } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Webhook endpoint secret (should be set in environment)
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_webhook_secret';

/**
 * Handle Stripe webhook events
 * Raw body parser middleware is required for webhook signature verification
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const payload = req.body;

  console.log('📨 Received Stripe webhook');

  // Verify webhook signature
  const verification = verifyWebhookSignature(payload, sig, STRIPE_WEBHOOK_SECRET);
  
  if (!verification.success) {
    console.error('❌ Webhook signature verification failed');
    return res.status(400).send('Webhook signature verification failed');
  }

  const event = verification.event;
  console.log(`🎯 Processing webhook event: ${event.type}`);

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
    console.log(`✅ Payment succeeded: ${paymentIntent.id}`);
    
    const metadata = paymentIntent.metadata;
    
    if (metadata.source === 'insurcheck_subscription_upgrade') {
      const { tenantId, newPlanId, subscriptionId } = metadata;
      
      if (tenantId && newPlanId && subscriptionId) {
        // Update subscription in database
        await db
          .update(subscriptions)
          .set({
            planId: parseInt(newPlanId),
            status: 'active',
            updatedAt: new Date()
          })
          .where(eq(subscriptions.id, parseInt(subscriptionId)));
          
        console.log(`✅ Subscription ${subscriptionId} upgraded to plan ${newPlanId} for tenant ${tenantId}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error handling payment success:', error);
    throw error;
  }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentFailure(paymentIntent) {
  try {
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
    console.log(`🔄 Subscription updated: ${subscription.id}`);
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
    console.log(`💰 Invoice payment succeeded: ${invoice.id}`);
    // Handle recurring billing if implemented
  } catch (error) {
    console.error('❌ Error handling invoice payment:', error);
    throw error;
  }
}

export default router;