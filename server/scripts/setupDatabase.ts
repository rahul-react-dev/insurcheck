
import { db } from '../db.ts';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const setupDatabase = async () => {
  try {
    console.log('🚀 Setting up database...');

    // Check existing tables first
    console.log('🔍 Checking existing tables...');
    const existingTables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('📋 Existing tables:', existingTables.rows.map(row => row.table_name));

    // Create missing tables only
    console.log('📝 Creating missing tables...');
    
    // Create activity_logs table if it doesn't exist
    const hasActivityLogs = existingTables.rows.some(row => row.table_name === 'activity_logs');
    if (!hasActivityLogs) {
      console.log('Creating activity_logs table...');
      
      // Create log_level enum first
      await db.execute(sql`
        DO $$ BEGIN
          CREATE TYPE log_level AS ENUM ('info', 'warning', 'error', 'critical');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS activity_logs (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id INTEGER REFERENCES tenants(id),
          user_id INTEGER REFERENCES users(id),
          action TEXT NOT NULL,
          resource TEXT NOT NULL,
          resource_id TEXT,
          details JSONB,
          ip_address TEXT,
          user_agent TEXT,
          level log_level NOT NULL DEFAULT 'info',
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log('✅ Activity logs table created');
    } else {
      console.log('ℹ️ Activity logs table already exists');
    }

    // Create system_metrics table if it doesn't exist
    const hasSystemMetrics = existingTables.rows.some(row => row.table_name === 'system_metrics');
    if (!hasSystemMetrics) {
      console.log('Creating system_metrics table...');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS system_metrics (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          metric_name TEXT NOT NULL,
          metric_value DECIMAL(15, 2) NOT NULL,
          metric_type TEXT NOT NULL,
          tags JSONB,
          timestamp TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log('✅ System metrics table created');
    } else {
      console.log('ℹ️ System metrics table already exists');
    }

    // Check and ensure super admin exists
    console.log('👤 Checking super admin...');
    const existingSuperAdmin = await db.execute(sql`
      SELECT email, username, role FROM users WHERE role = 'super-admin' LIMIT 1;
    `);

    if (existingSuperAdmin.rows.length === 0) {
      console.log('Creating super admin user...');
      const hashedPassword = await bcrypt.hash('Solulab@123', 12);
      
      await db.execute(sql`
        INSERT INTO users (username, email, password, role, tenant_id, is_active, created_at, updated_at)
        VALUES ('superadmin', 'superadmin@insurcheck.com', ${hashedPassword}, 'super-admin', NULL, true, NOW(), NOW());
      `);
      console.log('✅ Super admin created');
    } else {
      console.log('ℹ️ Super admin already exists:', existingSuperAdmin.rows[0]);
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('\n📋 Super Admin Credentials:');
    console.log('Email: superadmin@insurcheck.com');
    console.log('Password: Solulab@123');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase()
    .then(() => {
      console.log('✅ Setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}

export { setupDatabase };
