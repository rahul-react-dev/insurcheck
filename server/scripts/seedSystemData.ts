
import { db } from '../db.js';
import { sql } from 'drizzle-orm';

const seedSystemData = async () => {
  try {
    console.log('🌱 Starting system data seeding...');

    // First check if we have any existing data
    const existingMetrics = await db.execute(sql`
      SELECT COUNT(*) as count FROM system_metrics;
    `);

    if (existingMetrics.rows[0]?.count > 0) {
      console.log('📊 System metrics already exist, skipping...');
    } else {
      // Insert sample system metrics
      await db.execute(sql`
        INSERT INTO system_metrics (
          total_tenants, active_tenants, total_users, total_documents,
          storage_used, revenue_this_month, active_subscriptions,
          error_logs_count, created_at
        ) VALUES (
          3, 3, 12, 156, 2.5, 15000.00, 3, 2, NOW()
        );
      `);
      console.log('✅ System metrics seeded');
    }

    // Check if we have any existing activity logs
    const existingLogs = await db.execute(sql`
      SELECT COUNT(*) as count FROM activity_logs;
    `);

    if (existingLogs.rows[0]?.count > 0) {
      console.log('📊 Activity logs already exist, skipping...');
    } else {
      // Insert sample activity logs
      const sampleLogs = [
        {
          action: 'User Login',
          actor: 'john.doe@securelife.com',
          target: 'Authentication System',
          details: 'User successfully logged in',
          timestamp: new Date().toISOString(),
          tenant_id: 1,
          ip_address: '192.168.1.100'
        },
        {
          action: 'Document Upload',
          actor: 'jane.smith@healthguard.com',
          target: 'Document Management',
          details: 'Uploaded insurance policy document',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          tenant_id: 2,
          ip_address: '192.168.1.101'
        },
        {
          action: 'System Error',
          actor: 'system',
          target: 'Payment Processing',
          details: 'Payment gateway timeout error',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          tenant_id: null,
          ip_address: 'internal'
        }
      ];

      for (const log of sampleLogs) {
        await db.execute(sql`
          INSERT INTO activity_logs (
            action, actor, target, details, timestamp, tenant_id, ip_address
          ) VALUES (
            ${log.action}, ${log.actor}, ${log.target}, ${log.details}, 
            ${log.timestamp}, ${log.tenant_id}, ${log.ip_address}
          );
        `);
      }
      console.log('✅ Activity logs seeded');
    }

    console.log('🎉 System data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding system data:', error);
    throw error;
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedSystemData()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 System data seeding failed:', error);
      process.exit(1);
    });
}

export { seedSystemData };
