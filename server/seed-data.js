import { db } from './db.ts';
import {
  tenants,
  users,
  activityLogs,
  documents,
  subscriptions,
  subscriptionPlans,
  payments,
  invoices
} from './src/schema.ts';
import bcrypt from 'bcrypt';

async function seedTestData() {
  try {
    console.log('🌱 Seeding test data for super-admin dashboard...');

    // Create subscription plans
    const plan = await db.insert(subscriptionPlans).values({
      name: 'Premium Plan',
      description: 'Full featured plan for enterprises',
      price: '99.99',
      billingCycle: 'monthly',
      features: JSON.stringify(['unlimited_storage', 'api_access', 'priority_support']),
      maxUsers: 50,
      storageLimit: 1000,
      isActive: true
    }).returning();

    // Create test tenants
    const testTenants = await db.insert(tenants).values([
      {
        name: 'Acme Insurance Corp',
        domain: 'acme-insurance.com',
        status: 'active',
        maxUsers: 25,
        storageLimit: 500,
        isTrialActive: false
      },
      {
        name: 'SafeGuard Insurance',
        domain: 'safeguard.com',
        status: 'active', 
        maxUsers: 15,
        storageLimit: 300,
        isTrialActive: true,
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      {
        name: 'Shield Insurance Group',
        domain: 'shield-group.com',
        status: 'inactive',
        maxUsers: 10,
        storageLimit: 200,
        isTrialActive: false
      }
    ]).returning();

    // Create subscription for first tenant
    const subscription = await db.insert(subscriptions).values({
      tenantId: testTenants[0].id,
      planId: plan[0].id,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      autoRenew: true
    }).returning();

    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const testUsers = await db.insert(users).values([
      {
        username: 'superadmin',
        email: 'superadmin@insurcheck.com',
        password: hashedPassword,
        role: 'super-admin',
        isActive: true
      },
      {
        username: 'johndoe',
        email: 'john@acme-insurance.com',
        password: hashedPassword,
        role: 'tenant-admin',
        tenantId: testTenants[0].id,
        isActive: true
      },
      {
        username: 'janedoe',
        email: 'jane@safeguard.com',
        password: hashedPassword,
        role: 'user',
        tenantId: testTenants[1].id,
        isActive: true
      },
      {
        username: 'mikesmith',
        email: 'mike@shield-group.com',
        password: hashedPassword,
        role: 'user',
        tenantId: testTenants[2].id,
        isActive: false
      }
    ]).returning();

    // Create test documents
    await db.insert(documents).values([
      {
        tenantId: testTenants[0].id,
        userId: testUsers[1].id,
        filename: 'insurance_policy_001.pdf',
        originalName: 'Policy Document 001.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        status: 'active'
      },
      {
        tenantId: testTenants[1].id,
        userId: testUsers[2].id,
        filename: 'claim_form_202.pdf',
        originalName: 'Claim Form 202.pdf',
        fileSize: 512000,
        mimeType: 'application/pdf',
        status: 'active'
      }
    ]);

    // Create test activity logs including error logs
    await db.insert(activityLogs).values([
      {
        tenantId: testTenants[0].id,
        userId: testUsers[1].id,
        action: 'document_upload',
        resource: 'document',
        resourceId: '1',
        details: JSON.stringify({ message: 'Successfully uploaded insurance policy document' }),
        level: 'info',
        ipAddress: '192.168.1.100'
      },
      {
        tenantId: testTenants[0].id,
        userId: testUsers[1].id,
        action: 'authentication_failed',
        resource: 'auth',
        details: JSON.stringify({ message: 'Invalid credentials provided for user login' }),
        level: 'error',
        ipAddress: '192.168.1.101'
      },
      {
        tenantId: testTenants[1].id,
        userId: testUsers[2].id,
        action: 'file_processing_error',
        resource: 'document',
        resourceId: '2',
        details: JSON.stringify({ message: 'Failed to process uploaded document - corrupted file', error_code: 'PROC_ERR_001' }),
        level: 'error',
        ipAddress: '192.168.1.102'
      },
      {
        action: 'database_connection_timeout',
        resource: 'system',
        details: JSON.stringify({ message: 'Database connection timeout after 30 seconds', duration: '30000ms' }),
        level: 'critical',
        ipAddress: '127.0.0.1'
      },
      {
        tenantId: testTenants[0].id,
        action: 'subscription_renewed',
        resource: 'subscription',
        resourceId: subscription[0].id.toString(),
        details: JSON.stringify({ message: 'Subscription automatically renewed for another year' }),
        level: 'info',
        ipAddress: '192.168.1.100'
      }
    ]);

    // Create test payment
    await db.insert(payments).values({
      tenantId: testTenants[0].id,
      subscriptionId: subscription[0].id,
      amount: '99.99',
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'credit_card',
      transactionId: 'txn_1234567890',
      paymentDate: new Date()
    });

    // Create test invoice
    await db.insert(invoices).values({
      invoiceNumber: 'INV-2024-001',
      tenantId: testTenants[0].id,
      subscriptionId: subscription[0].id,
      amount: '99.99',
      taxAmount: '7.99',
      totalAmount: '107.98',
      status: 'paid',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      paidDate: new Date(),
      billingPeriodStart: new Date(),
      billingPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: JSON.stringify([
        { description: 'Premium Plan - Monthly', quantity: 1, rate: '99.99', amount: '99.99' }
      ])
    });

    console.log('✅ Test data seeded successfully!');
    console.log(`📊 Created ${testTenants.length} tenants, ${testUsers.length} users, and sample activity logs`);
    
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTestData()
    .then(() => {
      console.log('🎉 Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export { seedTestData };