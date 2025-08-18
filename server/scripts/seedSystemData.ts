
import { db } from '../db.js';
import { 
  activityLogs, 
  tenants, 
  users, 
  documents, 
  subscriptions, 
  subscriptionPlans 
} from '../../shared/schema.js';

async function seedSystemData() {
  try {
    console.log('🌱 Starting system data seeding...');

    // First, ensure we have some tenants and users for foreign key relationships
    let existingTenants = await db.select().from(tenants).limit(5);
    let existingUsers = await db.select().from(users).limit(5);

    if (existingTenants.length === 0) {
      console.log('📝 Creating sample tenants...');
      const sampleTenants = [
        {
          name: 'SecureLife Insurance',
          domain: 'securelife.com',
          isActive: true,
          maxUsers: 50,
          contactEmail: 'admin@securelife.com'
        },
        {
          name: 'HealthGuard Corp',
          domain: 'healthguard.com', 
          isActive: true,
          maxUsers: 100,
          contactEmail: 'admin@healthguard.com'
        },
        {
          name: 'SafetyFirst Insurance',
          domain: 'safetyfirst.com',
          isActive: true,
          maxUsers: 75,
          contactEmail: 'admin@safetyfirst.com'
        }
      ];
      existingTenants = await db.insert(tenants).values(sampleTenants).returning();
      console.log(`✅ Created ${existingTenants.length} sample tenants`);
    }

    if (existingUsers.length === 0) {
      console.log('📝 Creating sample users...');
      const sampleUsers = [
        {
          email: 'admin@securelife.com',
          name: 'Admin User',
          role: 'tenant-admin',
          tenantId: existingTenants[0]?.id,
          isActive: true
        },
        {
          email: 'user@healthguard.com',
          name: 'John Doe',
          role: 'user',
          tenantId: existingTenants[1]?.id,
          isActive: true
        },
        {
          email: 'manager@safetyfirst.com',
          name: 'Jane Smith',
          role: 'user',
          tenantId: existingTenants[2]?.id,
          isActive: true
        }
      ];
      existingUsers = await db.insert(users).values(sampleUsers).returning();
      console.log(`✅ Created ${existingUsers.length} sample users`);
    }

    // Now create comprehensive activity logs
    console.log('📝 Creating sample activity logs...');
    
    const currentTime = new Date();
    const activityLogsData = [];

    // Generate logs for the past 30 days
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const minutesAgo = Math.floor(Math.random() * 60);
      
      const logTime = new Date(currentTime);
      logTime.setDate(logTime.getDate() - daysAgo);
      logTime.setHours(logTime.getHours() - hoursAgo);
      logTime.setMinutes(logTime.getMinutes() - minutesAgo);

      const tenant = existingTenants[Math.floor(Math.random() * existingTenants.length)];
      const user = Math.random() > 0.3 ? existingUsers[Math.floor(Math.random() * existingUsers.length)] : null;

      // Different types of activities with appropriate levels
      const activities = [
        // Error level activities
        {
          action: 'authentication_failed',
          resource: 'auth',
          level: 'error',
          details: `Failed login attempt from IP address. User: ${user?.email || 'unknown@example.com'}`
        },
        {
          action: 'document_upload_failed',
          resource: 'document',
          level: 'error', 
          details: 'File upload failed due to invalid format or size limit exceeded'
        },
        {
          action: 'subscription_payment_failed',
          resource: 'subscription',
          level: 'error',
          details: 'Payment processing failed for monthly subscription renewal'
        },
        {
          action: 'database_connection_timeout',
          resource: 'system',
          level: 'error',
          details: 'Database connection timeout occurred during data retrieval operation'
        },
        {
          action: 'api_rate_limit_exceeded',
          resource: 'api',
          level: 'error',
          details: 'API rate limit exceeded for tenant. Requests temporarily blocked'
        },
        
        // Warning level activities
        {
          action: 'storage_limit_warning',
          resource: 'storage',
          level: 'warning',
          details: 'Tenant storage usage has reached 80% of allocated limit'
        },
        {
          action: 'subscription_expiring',
          resource: 'subscription',
          level: 'warning',
          details: 'Subscription will expire in 7 days. Renewal notification sent'
        },
        {
          action: 'multiple_login_attempts',
          resource: 'auth',
          level: 'warning',
          details: 'Multiple failed login attempts detected from same IP address'
        },
        {
          action: 'performance_degradation',
          resource: 'system',
          level: 'warning',
          details: 'System performance degradation detected. Response times increased'
        },

        // Info level activities
        {
          action: 'user_login',
          resource: 'auth', 
          level: 'info',
          details: `Successful user login. User: ${user?.email || 'user@example.com'}`
        },
        {
          action: 'document_processed',
          resource: 'document',
          level: 'info',
          details: 'Document successfully processed and indexed for search'
        },
        {
          action: 'user_created',
          resource: 'user',
          level: 'info',
          details: 'New user account created and activation email sent'
        },
        {
          action: 'system_backup_completed',
          resource: 'system',
          level: 'info',
          details: 'Automated system backup completed successfully'
        },
        {
          action: 'subscription_renewed',
          resource: 'subscription',
          level: 'info',
          details: 'Subscription successfully renewed for another billing period'
        }
      ];

      const activity = activities[Math.floor(Math.random() * activities.length)];

      activityLogsData.push({
        tenantId: tenant.id,
        userId: user?.id || null,
        action: activity.action,
        resource: activity.resource,
        resourceId: `${activity.resource}_${Math.floor(Math.random() * 1000)}`,
        details: {
          message: activity.details,
          timestamp: logTime.toISOString(),
          context: {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            sessionId: `sess_${Math.random().toString(36).substr(2, 9)}`
          }
        },
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        level: activity.level,
        createdAt: logTime
      });
    }

    // Insert activity logs in batches
    const batchSize = 10;
    let insertedCount = 0;
    
    for (let i = 0; i < activityLogsData.length; i += batchSize) {
      const batch = activityLogsData.slice(i, i + batchSize);
      await db.insert(activityLogs).values(batch);
      insertedCount += batch.length;
      console.log(`📊 Inserted ${insertedCount}/${activityLogsData.length} activity logs`);
    }

    // Create some sample documents and subscriptions for better metrics
    console.log('📝 Creating sample documents...');
    const sampleDocuments = [];
    for (let i = 0; i < 25; i++) {
      sampleDocuments.push({
        tenantId: existingTenants[Math.floor(Math.random() * existingTenants.length)].id,
        userId: existingUsers[Math.floor(Math.random() * existingUsers.length)].id,
        filename: `document_${i + 1}.pdf`,
        originalName: `Document ${i + 1}.pdf`,
        fileSize: Math.floor(Math.random() * 5000000) + 100000, // 100KB to 5MB
        mimeType: 'application/pdf',
        status: Math.random() > 0.1 ? 'active' : 'deleted'
      });
    }
    
    try {
      await db.insert(documents).values(sampleDocuments);
      console.log(`✅ Created ${sampleDocuments.length} sample documents`);
    } catch (docError) {
      console.log('ℹ️ Documents may already exist or table structure differs');
    }

    // Create subscription plans if they don't exist
    try {
      const existingPlans = await db.select().from(subscriptionPlans).limit(1);
      if (existingPlans.length === 0) {
        const plans = [
          {
            name: 'Basic Plan',
            description: 'Basic features for small teams',
            price: 29.99,
            currency: 'USD',
            interval: 'monthly',
            features: JSON.stringify(['5 users', '10GB storage', 'Basic support']),
            isActive: true
          },
          {
            name: 'Pro Plan', 
            description: 'Advanced features for growing businesses',
            price: 99.99,
            currency: 'USD',
            interval: 'monthly',
            features: JSON.stringify(['25 users', '100GB storage', 'Priority support']),
            isActive: true
          }
        ];
        const createdPlans = await db.insert(subscriptionPlans).values(plans).returning();
        console.log(`✅ Created ${createdPlans.length} subscription plans`);

        // Create some subscriptions
        const subscriptionsData = existingTenants.slice(0, 2).map((tenant, index) => ({
          tenantId: tenant.id,
          planId: createdPlans[index % createdPlans.length].id,
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          autoRenew: true
        }));

        await db.insert(subscriptions).values(subscriptionsData);
        console.log(`✅ Created ${subscriptionsData.length} subscriptions`);
      }
    } catch (subError) {
      console.log('ℹ️ Subscriptions may already exist or table structure differs');
    }

    console.log('🎉 System data seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Activity Logs: ${activityLogsData.length}`);
    console.log(`   - Tenants: ${existingTenants.length}`);
    console.log(`   - Users: ${existingUsers.length}`);
    console.log(`   - Documents: ${sampleDocuments.length}`);

  } catch (error) {
    console.error('❌ Error seeding system data:', error);
    throw error;
  }
}

// Run the seeding function
seedSystemData()
  .then(() => {
    console.log('✅ System data seeding script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 System data seeding failed:', error);
    process.exit(1);
  });
