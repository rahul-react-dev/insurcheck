
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
import bcrypt from 'bcrypt';

async function seedTestData() {
  console.log('🌱 Starting to seed test data...');

  try {
    // Create Super Admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const superAdmin = await db.insert(users).values({
      username: 'superadmin',
      email: 'admin@insurcheck.com',
      password: hashedPassword,
      role: 'super-admin',
      isActive: true
    }).returning();
    console.log('✅ Created Super Admin user');

    // Create subscription plans
    const plans = await db.insert(subscriptionPlans).values([
      {
        name: 'Basic Plan',
        description: 'Perfect for small businesses',
        price: '29.99',
        billingCycle: 'monthly',
        features: { 
          maxUsers: 5, 
          storage: '10GB', 
          support: 'Email',
          features: ['Document Upload', 'Basic Analytics'] 
        },
        maxUsers: 5,
        storageLimit: 10
      },
      {
        name: 'Professional Plan',
        description: 'Ideal for growing companies',
        price: '79.99',
        billingCycle: 'monthly',
        features: { 
          maxUsers: 25, 
          storage: '100GB', 
          support: 'Phone & Email',
          features: ['Document Upload', 'Advanced Analytics', 'API Access'] 
        },
        maxUsers: 25,
        storageLimit: 100
      },
      {
        name: 'Enterprise Plan',
        description: 'For large organizations',
        price: '199.99',
        billingCycle: 'monthly',
        features: { 
          maxUsers: 'unlimited', 
          storage: '1TB', 
          support: '24/7 Priority',
          features: ['All Features', 'Custom Integration', 'Dedicated Support'] 
        },
        maxUsers: 1000,
        storageLimit: 1000
      }
    ]).returning();
    console.log('✅ Created subscription plans');

    // Create test tenants
    const testTenants = await db.insert(tenants).values([
      {
        name: 'Acme Insurance Corp',
        domain: 'acme.insurcheck.com',
        status: 'active',
        maxUsers: 25,
        storageLimit: 100,
        isTrialActive: false
      },
      {
        name: 'SafeGuard Insurance',
        domain: 'safeguard.insurcheck.com',
        status: 'active',
        maxUsers: 10,
        storageLimit: 50,
        isTrialActive: true,
        trialEndsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'ProTect Solutions',
        domain: 'protect.insurcheck.com',
        status: 'inactive',
        maxUsers: 5,
        storageLimit: 25,
        isTrialActive: false
      },
      {
        name: 'SecureLife Insurance',
        domain: 'securelife.insurcheck.com',
        status: 'active',
        maxUsers: 50,
        storageLimit: 200,
        isTrialActive: false
      },
      {
        name: 'RiskShield Corp',
        domain: 'riskshield.insurcheck.com',
        status: 'suspended',
        maxUsers: 15,
        storageLimit: 75,
        isTrialActive: false
      }
    ]).returning();
    console.log('✅ Created test tenants');

    // Create subscriptions for tenants
    const testSubscriptions = await db.insert(subscriptions).values([
      {
        tenantId: testTenants[0].id,
        planId: plans[1].id,
        status: 'active',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
        autoRenew: true
      },
      {
        tenantId: testTenants[1].id,
        planId: plans[0].id,
        status: 'active',
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        autoRenew: true
      },
      {
        tenantId: testTenants[3].id,
        planId: plans[2].id,
        status: 'active',
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 305 * 24 * 60 * 60 * 1000),
        autoRenew: true
      }
    ]).returning();

    // Update tenants with subscription IDs
    await Promise.all([
      db.update(tenants).set({ subscriptionId: testSubscriptions[0].id }).where({ id: testTenants[0].id }),
      db.update(tenants).set({ subscriptionId: testSubscriptions[1].id }).where({ id: testTenants[1].id }),
      db.update(tenants).set({ subscriptionId: testSubscriptions[2].id }).where({ id: testTenants[3].id })
    ]);
    console.log('✅ Created subscriptions');

    // Create tenant admin users
    const tenantAdmins = [];
    for (let i = 0; i < testTenants.length; i++) {
      const tenant = testTenants[i];
      const hashedAdminPassword = await bcrypt.hash('admin123', 10);
      
      const admin = await db.insert(users).values({
        username: `admin_${tenant.name.toLowerCase().replace(/\s+/g, '_')}`,
        email: `admin@${tenant.domain}`,
        password: hashedAdminPassword,
        role: 'tenant-admin',
        tenantId: tenant.id,
        isActive: true,
        lastLoginAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      }).returning();
      
      tenantAdmins.push(admin[0]);

      // Create regular users for each tenant
      const userCount = Math.floor(Math.random() * 8) + 2; // 2-10 users per tenant
      for (let j = 0; j < userCount; j++) {
        const hashedUserPassword = await bcrypt.hash('user123', 10);
        await db.insert(users).values({
          username: `user${j + 1}_${tenant.name.toLowerCase().replace(/\s+/g, '_')}`,
          email: `user${j + 1}@${tenant.domain}`,
          password: hashedUserPassword,
          role: 'user',
          tenantId: tenant.id,
          isActive: Math.random() > 0.1, // 90% active users
          lastLoginAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null
        });
      }
    }
    console.log('✅ Created tenant users');

    // Create test payments
    const testPayments = [];
    for (let i = 0; i < testSubscriptions.length; i++) {
      const subscription = testSubscriptions[i];
      const plan = plans.find(p => p.id === subscription.planId);
      
      // Create multiple payments for each subscription
      for (let j = 0; j < 3; j++) {
        const payment = await db.insert(payments).values({
          tenantId: subscription.tenantId,
          subscriptionId: subscription.id,
          amount: plan?.price || '29.99',
          currency: 'USD',
          status: Math.random() > 0.1 ? 'completed' : 'pending',
          paymentMethod: ['credit_card', 'bank_transfer', 'paypal'][Math.floor(Math.random() * 3)],
          transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
          paymentDate: new Date(Date.now() - j * 30 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - j * 30 * 24 * 60 * 60 * 1000)
        }).returning();
        
        testPayments.push(payment[0]);
      }
    }
    console.log('✅ Created test payments');

    // Create test invoices
    for (let i = 0; i < testSubscriptions.length; i++) {
      const subscription = testSubscriptions[i];
      const plan = plans.find(p => p.id === subscription.planId);
      
      for (let j = 0; j < 2; j++) {
        const baseAmount = parseFloat(plan?.price || '29.99');
        const taxAmount = baseAmount * 0.1; // 10% tax
        
        await db.insert(invoices).values({
          invoiceNumber: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          tenantId: subscription.tenantId,
          subscriptionId: subscription.id,
          amount: baseAmount.toString(),
          taxAmount: taxAmount.toString(),
          totalAmount: (baseAmount + taxAmount).toString(),
          status: ['draft', 'sent', 'paid', 'overdue'][Math.floor(Math.random() * 4)] as any,
          issueDate: new Date(Date.now() - j * 30 * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() - j * 30 * 24 * 60 * 60 * 1000 + 30 * 24 * 60 * 60 * 1000),
          billingPeriodStart: new Date(Date.now() - (j + 1) * 30 * 24 * 60 * 60 * 1000),
          billingPeriodEnd: new Date(Date.now() - j * 30 * 24 * 60 * 60 * 1000),
          items: {
            planName: plan?.name,
            description: `${plan?.name} - Monthly Subscription`,
            quantity: 1,
            unitPrice: baseAmount,
            total: baseAmount
          }
        });
      }
    }
    console.log('✅ Created test invoices');

    // Create test documents
    const allUsers = await db.select().from(users).where({ role: 'user' });
    
    for (let i = 0; i < allUsers.length; i++) {
      const user = allUsers[i];
      const documentCount = Math.floor(Math.random() * 5) + 1; // 1-5 documents per user
      
      for (let j = 0; j < documentCount; j++) {
        const isDeleted = Math.random() > 0.8; // 20% deleted documents
        
        await db.insert(documents).values({
          tenantId: user.tenantId!,
          userId: user.id,
          filename: `document_${i}_${j}_${Date.now()}.pdf`,
          originalName: `Insurance Document ${j + 1}.pdf`,
          fileSize: Math.floor(Math.random() * 5000000) + 100000, // 100KB to 5MB
          mimeType: 'application/pdf',
          status: isDeleted ? 'deleted' : 'active',
          deletedAt: isDeleted ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
          deletedBy: isDeleted ? tenantAdmins[Math.floor(Math.random() * tenantAdmins.length)]?.id : null,
          createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
        });
      }
    }
    console.log('✅ Created test documents');

    // Create activity logs
    const actions = ['login', 'logout', 'create', 'update', 'delete', 'view', 'export'];
    const resources = ['document', 'user', 'tenant', 'subscription', 'payment', 'invoice'];
    const levels = ['info', 'warning', 'error'];
    
    for (let i = 0; i < 100; i++) {
      const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const randomResource = resources[Math.floor(Math.random() * resources.length)];
      const randomLevel = levels[Math.floor(Math.random() * levels.length)];
      
      await db.insert(activityLogs).values({
        tenantId: randomUser.tenantId,
        userId: randomUser.id,
        action: randomAction,
        resource: randomResource,
        resourceId: `res_${Math.random().toString(36).substr(2, 8)}`,
        details: {
          action: randomAction,
          resource: randomResource,
          timestamp: new Date(),
          success: Math.random() > 0.1
        },
        ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        level: randomLevel as any,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      });
    }
    console.log('✅ Created activity logs');

    // Create system configuration
    await db.insert(systemConfig).values([
      {
        key: 'auto_delete_interval',
        value: { days: 90 },
        description: 'Automatically delete documents after specified days',
        category: 'cleanup'
      },
      {
        key: 'max_file_size',
        value: { size: '50MB' },
        description: 'Maximum file size for document uploads',
        category: 'upload'
      },
      {
        key: 'backup_schedule',
        value: { frequency: 'daily', time: '02:00' },
        description: 'Database backup schedule',
        category: 'backup'
      },
      {
        key: 'notification_settings',
        value: { 
          email_enabled: true, 
          sms_enabled: false,
          push_enabled: true 
        },
        description: 'System notification preferences',
        category: 'notifications'
      },
      {
        key: 'security_settings',
        value: { 
          password_min_length: 8,
          require_2fa: false,
          session_timeout: 480
        },
        description: 'Security policy settings',
        category: 'security'
      }
    ]);
    console.log('✅ Created system configuration');

    // Create system metrics
    const metricNames = ['cpu_usage', 'memory_usage', 'disk_usage', 'response_time', 'error_rate'];
    
    for (let i = 0; i < 50; i++) {
      const randomMetric = metricNames[Math.floor(Math.random() * metricNames.length)];
      
      await db.insert(systemMetrics).values({
        metricName: randomMetric,
        metricValue: (Math.random() * 100).toFixed(2),
        metricType: 'gauge',
        tags: {
          environment: 'production',
          server: `server-${Math.floor(Math.random() * 5) + 1}`
        },
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
      });
    }
    console.log('✅ Created system metrics');

    console.log('🎉 Test data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`• Super Admin: admin@insurcheck.com (password: admin123)`);
    console.log(`• Tenants: ${testTenants.length}`);
    console.log(`• Subscription Plans: ${plans.length}`);
    console.log(`• Users: ~${testTenants.length * 5} (including tenant admins)`);
    console.log(`• Payments: ${testPayments.length}`);
    console.log(`• Activity Logs: 100+`);
    console.log(`• System Configs: 5`);
    
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    throw error;
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
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

export default seedTestData;
