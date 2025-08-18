
import { db } from '../db.ts';
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
      // Insert sample activity logs based on actual table structure
      const sampleLogs = [
        {
          action: 'User Login',
          resource: 'Authentication System',
          details: { message: 'User successfully logged in', actor: 'john.doe@securelife.com' },
          tenant_id: 1,
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0',
          level: 'info'
        },
        {
          action: 'Document Upload',
          resource: 'Document Management',
          details: { message: 'Uploaded insurance policy document', actor: 'jane.smith@healthguard.com' },
          tenant_id: 2,
          ip_address: '192.168.1.101',
          user_agent: 'Mozilla/5.0',
          level: 'info'
        },
        {
          action: 'System Error',
          resource: 'Payment Processing',
          details: { message: 'Payment gateway timeout error', actor: 'system' },
          tenant_id: null,
          ip_address: 'internal',
          user_agent: 'system',
          level: 'error'
        }
      ];

      for (const log of sampleLogs) {
        await db.execute(sql`
          INSERT INTO activity_logs (
            action, resource, details, tenant_id, ip_address, user_agent, level
          ) VALUES (
            ${log.action}, ${log.resource}, ${JSON.stringify(log.details)}, 
            ${log.tenant_id}, ${log.ip_address}, ${log.user_agent}, ${log.level}
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
