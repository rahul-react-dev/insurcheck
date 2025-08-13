import { db } from '../db';
import { 
  tenants, 
  users, 
  subscriptionPlans, 
  subscriptions, 
  documents, 
  payments, 
  invoices, 
  activityLogs, 
  systemConfig,
  systemMetrics
} from '../../shared/schema';
import bcrypt from 'bcryptjs';

async function seedTestData() {
  console.log('🌱 Starting test data seeding...');

  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // 1. Create Super Admin User
    console.log('👤 Creating Super Admin...');
    const superAdminUser = await db.insert(users).values({
      username: 'superadmin',
      email: 'admin@insurcheck.com',
      password: hashedPassword,
      role: 'super-admin',
      tenantId: null,
      isActive: true
    }).returning();
    console.log('✅ Super Admin created:', superAdminUser[0].email);

    // 2. Create Subscription Plans
    console.log('📋 Creating subscription plans...');
    const plans = await db.insert(subscriptionPlans).values([
      {
        name: 'Basic Plan',
        description: 'Essential features for small businesses',
        price: '29.99',
        billingCycle: 'monthly',
        features: JSON.stringify(['Document Storage: 1GB', 'Users: 5', 'Basic Support']),
        maxUsers: 5,
        storageLimit: 1,
        isActive: true
      },
      {
        name: 'Professional Plan',
        description: 'Advanced features for growing businesses',
        price: '79.99',
        billingCycle: 'monthly', 
        features: JSON.stringify(['Document Storage: 10GB', 'Users: 25', 'Priority Support', 'Analytics']),
        maxUsers: 25,
        storageLimit: 10,
        isActive: true
      },
      {
        name: 'Enterprise Plan',
        description: 'Full features for large organizations',
        price: '199.99',
        billingCycle: 'monthly',
        features: JSON.stringify(['Document Storage: 100GB', 'Users: Unlimited', '24/7 Support', 'Custom Integrations']),
        maxUsers: 1000,
        storageLimit: 100,
        isActive: true
      }
    ]).returning();
    console.log(`✅ Created ${plans.length} subscription plans`);

    // 3. Create Test Tenants
    console.log('🏢 Creating test tenants...');
    const testTenants = await db.insert(tenants).values([
      {
        name: 'SecureLife Insurance',
        domain: 'securelife.com',
        status: 'active',
        subscriptionId: plans[1].id, // Professional plan
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isTrialActive: false,
        maxUsers: 25,
        storageLimit: 10
      },
      {
        name: 'HealthGuard Plus',
        domain: 'healthguard.com', 
        status: 'active',
        subscriptionId: plans[0].id, // Basic plan
        trialEndsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        isTrialActive: true,
        maxUsers: 5,
        storageLimit: 1
      },
      {
        name: 'Global Insurance Corp',
        domain: 'globalinsurance.com',
        status: 'active',
        subscriptionId: plans[2].id, // Enterprise plan
        trialEndsAt: null,
        isTrialActive: false,
        maxUsers: 1000,
        storageLimit: 100
      },
      {
        name: 'FastClaim Services',
        domain: 'fastclaim.com',
        status: 'inactive',
        subscriptionId: plans[0].id,
        trialEndsAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        isTrialActive: false,
        maxUsers: 5,
        storageLimit: 1
      }
    ]).returning();
    console.log(`✅ Created ${testTenants.length} test tenants`);

    // 4. Create Tenant Admin Users
    console.log('👥 Creating tenant admin users...');
    const tenantAdmins = [];
    for (const tenant of testTenants) {
      const admin = await db.insert(users).values({
        username: `admin_${tenant.domain?.split('.')[0] || tenant.id}`,
        email: `admin@${tenant.domain || 'tenant' + tenant.id + '.com'}`,
        password: hashedPassword,
        role: 'tenant-admin',
        tenantId: tenant.id,
        isActive: true
      }).returning();
      tenantAdmins.push(admin[0]);
    }
    console.log(`✅ Created ${tenantAdmins.length} tenant admin users`);

    // 5. Create Regular Users
    console.log('👤 Creating regular users...');
    const regularUsers = [];
    for (const tenant of testTenants.slice(0, 2)) { // Only for first 2 tenants
      for (let i = 1; i <= 3; i++) {
        const user = await db.insert(users).values({
          username: `user${i}_${tenant.domain?.split('.')[0] || tenant.id}`,
          email: `user${i}@${tenant.domain || 'tenant' + tenant.id + '.com'}`,
          password: hashedPassword,
          role: 'user',
          tenantId: tenant.id,
          isActive: true,
          lastLoginAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        }).returning();
        regularUsers.push(user[0]);
      }
    }
    console.log(`✅ Created ${regularUsers.length} regular users`);

    // 6. Create Subscriptions
    console.log('💳 Creating subscriptions...');
    const subscriptionData = [];
    for (const tenant of testTenants) {
      if (tenant.subscriptionId) {
        subscriptionData.push({
          tenantId: tenant.id,
          planId: tenant.subscriptionId,
          status: tenant.status === 'active' ? 'active' : 'inactive',
          startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 270 * 24 * 60 * 60 * 1000),
          autoRenew: true
        });
      }
    }
    const createdSubscriptions = await db.insert(subscriptions).values(subscriptionData).returning();
    console.log(`✅ Created ${createdSubscriptions.length} subscriptions`);

    // 7. Create Documents
    console.log('📄 Creating documents...');
    const documentData = [];
    for (const user of [...tenantAdmins.slice(0, 2), ...regularUsers]) {
      for (let i = 1; i <= 5; i++) {
        documentData.push({
          tenantId: user.tenantId!,
          userId: user.id,
          filename: `document_${user.id}_${i}.pdf`,
          originalName: `Policy Document ${i}.pdf`,
          fileSize: Math.floor(Math.random() * 5000000) + 100000, // 100KB to 5MB
          mimeType: 'application/pdf',
          status: Math.random() > 0.1 ? 'active' : 'deleted', // 10% chance of deleted
          deletedAt: Math.random() > 0.1 ? null : new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          deletedBy: Math.random() > 0.1 ? null : user.id
        });
      }
    }
    const createdDocuments = await db.insert(documents).values(documentData).returning();
    console.log(`✅ Created ${createdDocuments.length} documents`);

    // 8. Create Payments
    console.log('💰 Creating payments...');
    const paymentData = [];
    for (const subscription of createdSubscriptions) {
      // Create 3 payments per subscription
      for (let i = 0; i < 3; i++) {
        const tenant = testTenants.find(t => t.id === subscription.tenantId);
        const plan = plans.find(p => p.id === subscription.planId);

        paymentData.push({
          tenantId: subscription.tenantId,
          subscriptionId: subscription.id,
          amount: plan?.price || '29.99',
          currency: 'USD',
          status: Math.random() > 0.1 ? 'completed' : 'pending',
          paymentMethod: 'credit_card',
          transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          paymentDate: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000)
        });
      }
    }
    const createdPayments = await db.insert(payments).values(paymentData).returning();
    console.log(`✅ Created ${createdPayments.length} payments`);

    // 9. Create Invoices
    console.log('🧾 Creating invoices...');
    const invoiceData = [];
    for (const payment of createdPayments) {
      const tenant = testTenants.find(t => t.id === payment.tenantId);
      const subscription = createdSubscriptions.find(s => s.id === payment.subscriptionId);
      const plan = plans.find(p => p.id === subscription?.planId);

      const amount = parseFloat(payment.amount);
      const taxAmount = amount * 0.1; // 10% tax

      invoiceData.push({
        invoiceNumber: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        tenantId: payment.tenantId,
        subscriptionId: payment.subscriptionId,
        amount: payment.amount,
        taxAmount: taxAmount.toFixed(2),
        totalAmount: (amount + taxAmount).toFixed(2),
        status: payment.status === 'completed' ? 'paid' : 'sent',
        issueDate: payment.paymentDate || new Date(),
        dueDate: new Date((payment.paymentDate || new Date()).getTime() + 30 * 24 * 60 * 60 * 1000),
        paidDate: payment.status === 'completed' ? payment.paymentDate : null,
        billingPeriodStart: new Date((payment.paymentDate || new Date()).getTime() - 30 * 24 * 60 * 60 * 1000),
        billingPeriodEnd: payment.paymentDate || new Date(),
        items: JSON.stringify([{
          description: plan?.name || 'Subscription',
          quantity: 1,
          unitPrice: payment.amount,
          total: payment.amount
        }])
      });
    }
    const createdInvoices = await db.insert(invoices).values(invoiceData).returning();
    console.log(`✅ Created ${createdInvoices.length} invoices`);

    // 10. Create Activity Logs
    console.log('📊 Creating activity logs...');
    const activityData = [];
    const actions = ['create', 'update', 'delete', 'login', 'logout', 'upload', 'download'];
    const resources = ['user', 'document', 'tenant', 'subscription', 'payment'];
    const levels = ['info', 'warning', 'error'];

    // Create logs for various actions
    for (let i = 0; i < 200; i++) {
      const user = [...[superAdminUser[0]], ...tenantAdmins, ...regularUsers][Math.floor(Math.random() * (1 + tenantAdmins.length + regularUsers.length))];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const resource = resources[Math.floor(Math.random() * resources.length)];
      const level = levels[Math.floor(Math.random() * levels.length)];

      activityData.push({
        tenantId: user.tenantId,
        userId: user.id,
        action,
        resource,
        resourceId: Math.random().toString(36).substr(2, 9),
        details: JSON.stringify({ 
          action: `${action} ${resource}`,
          timestamp: new Date().toISOString(),
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }),
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        level: level as any,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      });
    }
    const createdLogs = await db.insert(activityLogs).values(activityData).returning();
    console.log(`✅ Created ${createdLogs.length} activity logs`);

    // 11. Create System Configuration
    console.log('⚙️ Creating system configuration...');
    const configData = [
      {
        key: 'auto_delete_interval',
        value: JSON.stringify({ days: 30 }),
        description: 'Automatic deletion interval for soft-deleted documents',
        category: 'cleanup',
        isActive: true
      },
      {
        key: 'max_file_size',
        value: JSON.stringify({ megabytes: 50 }),
        description: 'Maximum file upload size',
        category: 'uploads',
        isActive: true
      },
      {
        key: 'session_timeout',
        value: JSON.stringify({ minutes: 480 }),
        description: 'User session timeout',
        category: 'security',
        isActive: true
      },
      {
        key: 'backup_frequency',
        value: JSON.stringify({ hours: 24 }),
        description: 'Database backup frequency',
        category: 'backup',
        isActive: true
      }
    ];
    const createdConfigs = await db.insert(systemConfig).values(configData).returning();
    console.log(`✅ Created ${createdConfigs.length} system configurations`);

    console.log('\n🎉 Test data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👤 Super Admin: 1`);
    console.log(`   🏢 Tenants: ${testTenants.length}`);
    console.log(`   👥 Tenant Admins: ${tenantAdmins.length}`);
    console.log(`   👤 Regular Users: ${regularUsers.length}`);
    console.log(`   📋 Subscription Plans: ${plans.length}`);
    console.log(`   💳 Subscriptions: ${createdSubscriptions.length}`);
    console.log(`   📄 Documents: ${createdDocuments.length}`);
    console.log(`   💰 Payments: ${createdPayments.length}`);
    console.log(`   🧾 Invoices: ${createdInvoices.length}`);
    console.log(`   📊 Activity Logs: ${createdLogs.length}`);
    console.log(`   ⚙️ System Configs: ${createdConfigs.length}`);

    console.log('\n🔑 Login Credentials:');
    console.log(`   Super Admin: admin@insurcheck.com / admin123`);
    console.log(`   Tenant Admin 1: admin@securelife.com / admin123`);
    console.log(`   Tenant Admin 2: admin@healthguard.com / admin123`);

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTestData()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}