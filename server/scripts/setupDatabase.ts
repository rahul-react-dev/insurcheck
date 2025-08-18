
import { db } from '../db.ts';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const setupDatabase = async () => {
  try {
    console.log('🚀 Setting up database...');

    // Create required tables if they don't exist
    console.log('📝 Creating tables...');
    
    // Create enums first
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE role AS ENUM ('super-admin', 'tenant-admin', 'user');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE log_level AS ENUM ('info', 'warning', 'error');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create tenants table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tenants (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name TEXT NOT NULL,
        domain TEXT UNIQUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        username TEXT UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role role NOT NULL DEFAULT 'user',
        tenant_id INTEGER REFERENCES tenants(id),
        is_active BOOLEAN DEFAULT true,
        failed_login_attempts INTEGER DEFAULT 0,
        account_locked_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create activity_logs table
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

    // Create system_metrics table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS system_metrics (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        total_tenants INTEGER DEFAULT 0,
        active_tenants INTEGER DEFAULT 0,
        total_users INTEGER DEFAULT 0,
        total_documents INTEGER DEFAULT 0,
        storage_used DECIMAL(10, 2) DEFAULT 0,
        revenue_this_month DECIMAL(15, 2) DEFAULT 0,
        active_subscriptions INTEGER DEFAULT 0,
        error_logs_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Tables created successfully');

    // Create super admin user
    console.log('👤 Creating super admin...');
    const hashedPassword = await bcrypt.hash('Solulab@123', 12);
    
    await db.execute(sql`
      INSERT INTO users (username, email, password, role, tenant_id, is_active)
      VALUES ('superadmin', 'superadmin@insurcheck.com', ${hashedPassword}, 'super-admin', NULL, true)
      ON CONFLICT (email) DO UPDATE SET
        username = EXCLUDED.username,
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        updated_at = NOW();
    `);

    console.log('✅ Super admin created/updated');
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
