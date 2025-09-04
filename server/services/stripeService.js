/**
 * Stripe Service for InsurCheck
 * Handles payment processing, subscription management, and webhook events
 */

import Stripe from 'stripe';

/**
 * Initialize Stripe with secret key
 */
const initializeStripeService = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️ STRIPE_SECRET_KEY not found. Stripe service disabled.');
    return null;
  }
  
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });
  
  console.log('✅ Stripe service initialized');
  return stripe;
};

const stripe = initializeStripeService();

/**
 * Create payment intent for subscription upgrade
 * @param {Object} params - Payment parameters
 * @param {number} params.amount - Amount in cents
 * @param {string} params.currency - Currency code (default: 'usd')
 * @param {string} params.customerId - Stripe customer ID (optional)
 * @param {Object} params.metadata - Additional metadata
 */
const createPaymentIntent = async ({ amount, currency = 'usd', customerId, metadata = {} }) => {
  try {
    if (!stripe) {
      throw new Error('Stripe service not initialized');
    }

    console.log(`💳 Creating payment intent for amount: $${amount / 100}`);

    const paymentIntentData = {
      amount: Math.round(amount), // Ensure integer
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        source: 'insurcheck_subscription_upgrade',
        ...metadata
      }
    };

    // Add customer if provided
    if (customerId) {
      paymentIntentData.customer = customerId;
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);
    
    console.log(`✅ Payment intent created: ${paymentIntent.id}`);
    
    return {
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      }
    };
    
  } catch (error) {
    console.error('❌ Stripe payment intent error:', error.message);
    return {
      success: false,
      error: error.message,
      details: error.type || 'stripe_error'
    };
  }
};

/**
 * Retrieve payment intent status
 * @param {string} paymentIntentId - Payment intent ID
 */
const getPaymentIntent = async (paymentIntentId) => {
  try {
    if (!stripe) {
      throw new Error('Stripe service not initialized');
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    return {
      success: true,
      data: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata
      }
    };
    
  } catch (error) {
    console.error('❌ Error retrieving payment intent:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Alias for compatibility
const retrievePaymentIntent = getPaymentIntent;

/**
 * Create or retrieve Stripe customer
 * @param {Object} params - Customer parameters
 * @param {string} params.email - Customer email
 * @param {string} params.name - Customer name
 * @param {string} params.tenantId - Tenant ID for metadata
 */
const createOrGetCustomer = async ({ email, name, tenantId }) => {
  try {
    if (!stripe) {
      throw new Error('Stripe service not initialized');
    }

    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      console.log(`👤 Found existing Stripe customer: ${existingCustomers.data[0].id}`);
      return {
        success: true,
        data: existingCustomers.data[0]
      };
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        tenantId: tenantId.toString(),
        source: 'insurcheck'
      }
    });

    console.log(`✅ Created new Stripe customer: ${customer.id}`);
    
    return {
      success: true,
      data: customer
    };
    
  } catch (error) {
    console.error('❌ Error creating/retrieving customer:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verify webhook signature
 * @param {string} payload - Raw webhook payload
 * @param {string} signature - Stripe signature header
 * @param {string} endpointSecret - Webhook endpoint secret
 */
const verifyWebhookSignature = (payload, signature, endpointSecret) => {
  try {
    if (!stripe) {
      throw new Error('Stripe service not initialized');
    }

    const event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    return {
      success: true,
      event
    };
    
  } catch (error) {
    console.error('❌ Webhook signature verification failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Calculate prorated amount for subscription upgrade
 * @param {Object} params - Proration parameters
 * @param {number} params.currentPlanPrice - Current plan monthly price
 * @param {number} params.newPlanPrice - New plan monthly price
 * @param {Date} params.currentPeriodStart - Current billing period start
 * @param {Date} params.currentPeriodEnd - Current billing period end
 */
const calculateProratedAmount = ({ currentPlanPrice, newPlanPrice, currentPeriodStart, currentPeriodEnd }) => {
  try {
    // Input validation
    if (!currentPlanPrice || !newPlanPrice || !currentPeriodStart || !currentPeriodEnd) {
      console.warn('⚠️ Invalid parameters for proration calculation');
      return newPlanPrice * 100; // Default to full new plan price
    }

    const now = new Date();
    const totalPeriodDays = Math.ceil((currentPeriodEnd - currentPeriodStart) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.ceil((currentPeriodEnd - now) / (1000 * 60 * 60 * 24));
    
    console.log(`💰 Proration calculation:`, {
      currentPrice: currentPlanPrice,
      newPrice: newPlanPrice,
      totalDays: totalPeriodDays,
      remainingDays: remainingDays
    });
    
    if (remainingDays <= 0) {
      // If period has ended, charge full new plan price
      console.log(`⏰ Billing period ended, charging full price: $${newPlanPrice}`);
      return newPlanPrice * 100; // Convert to cents
    }
    
    // Handle same price - no charge needed
    if (currentPlanPrice === newPlanPrice) {
      console.log(`💵 Same price plans, no charge needed`);
      return 0;
    }
    
    // Calculate prorated amounts
    const dailyCurrentRate = currentPlanPrice / totalPeriodDays;
    const dailyNewRate = newPlanPrice / totalPeriodDays;
    
    // Credit for remaining days on current plan
    const currentPlanCredit = dailyCurrentRate * remainingDays;
    
    // Charge for remaining days on new plan
    const newPlanCharge = dailyNewRate * remainingDays;
    
    // Net amount to charge (could be negative for downgrades)
    const netAmount = newPlanCharge - currentPlanCredit;
    
    console.log(`📊 Proration details:`, {
      currentPlanCredit: currentPlanCredit.toFixed(2),
      newPlanCharge: newPlanCharge.toFixed(2),
      netAmount: netAmount.toFixed(2)
    });
    
    // For downgrades or same price, return 0 (no payment required)
    const finalAmount = Math.max(0, Math.round(netAmount * 100));
    console.log(`✅ Final amount to charge: $${finalAmount / 100}`);
    
    return finalAmount; // Convert to cents, minimum 0
    
  } catch (error) {
    console.error('❌ Error calculating prorated amount:', error.message);
    // Default to full new plan price on error
    return (newPlanPrice || 0) * 100;
  }
};

export {
  stripe,
  initializeStripeService,
  createPaymentIntent,
  getPaymentIntent,
  retrievePaymentIntent,
  createOrGetCustomer,
  verifyWebhookSignature,
  calculateProratedAmount
};