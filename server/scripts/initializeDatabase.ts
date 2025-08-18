
import { db } from '../db.js';
import { sql } from 'drizzle-orm';

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing database schema...');

    // Create enums first
    console.log('📝 Creating enums...');
    
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE role AS ENUM ('super-admin', 'tenant-admin', 'user');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'suspended', 'expired');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE tenant_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE document_status AS ENUM ('active', 'deleted', 'archived');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE log_level AS ENUM ('info', 'warning', 'error', 'critical');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log('✅ Enums created/verified');

    // Create subscription_plans table first (no dependencies)
    console.log('📝 Creating subscription_plans table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        billing_cycle TEXT NOT NULL,
        features JSONB NOT NULL,
        max_users INTEGER NOT NULL,
        storage_limit_gb INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create tenants table (depends on subscription_plans)
    console.log('📝 Creating tenants table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tenants (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name TEXT NOT NULL,
        domain TEXT UNIQUE,
        status tenant_status NOT NULL DEFAULT 'active',
        subscription_id INTEGER REFERENCES subscription_plans(id),
        trial_ends_at TIMESTAMP,
        is_trial_active BOOLEAN DEFAULT false,
        max_users INTEGER DEFAULT 10,
        storage_limit_gb INTEGER DEFAULT 100,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create subscriptions table (depends on tenants and subscription_plans)
    console.log('📝 Creating subscriptions table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        tenant_id INTEGER REFERENCES tenants(id) NOT NULL,
        plan_id INTEGER REFERENCES subscription_plans(id) NOT NULL,
        status subscription_status NOT NULL DEFAULT 'active',
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        auto_renew BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Update tenants table to reference subscriptions
    await db.execute(sql`
      ALTER TABLE tenants 
      DROP CONSTRAINT IF EXISTS tenants_subscription_id_fkey;
    `);
    
    await db.execute(sql`
      ALTER TABLE tenants 
      ADD CONSTRAINT tenants_subscription_id_fkey 
      FOREIGN KEY (subscription_id) REFERENCES subscriptions(id);
    `);

    // Create users table (depends on tenants)
    console.log('📝 Creating users table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255),
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        tenant_id INTEGER REFERENCES tenants(id),
        is_active BOOLEAN DEFAULT true,
        last_login_at TIMESTAMP,
        failed_login_attempts INTEGER DEFAULT 0,
        account_locked_until TIMESTAMP,
        password_reset_token VARCHAR(255),
        password_reset_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create activity_logs table (depends on tenants and users)
    console.log('📝 Creating activity_logs table...');
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
    console.log('📝 Creating system_metrics table...');
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

    // Create other tables
    console.log('📝 Creating remaining tables...');
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS documents (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id INTEGER REFERENCES tenants(id) NOT NULL,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type TEXT NOT NULL,
        status document_status NOT NULL DEFAULT 'active',
        deleted_at TIMESTAMP,
        deleted_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id INTEGER REFERENCES tenants(id) NOT NULL,
        subscription_id INTEGER REFERENCES subscriptions(id) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        currency TEXT DEFAULT 'USD',
        status payment_status NOT NULL DEFAULT 'pending',
        payment_method TEXT,
        transaction_id TEXT,
        payment_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_number TEXT UNIQUE NOT NULL,
        tenant_id INTEGER REFERENCES tenants(id) NOT NULL,
        subscription_id INTEGER REFERENCES subscriptions(id) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        tax_amount DECIMAL(10, 2) DEFAULT 0,
        total_amount DECIMAL(10, 2) NOT NULL,
        status invoice_status NOT NULL DEFAULT 'draft',
        issue_date TIMESTAMP NOT NULL,
        due_date TIMESTAMP NOT NULL,
        paid_date TIMESTAMP,
        billing_period_start TIMESTAMP NOT NULL,
        billing_period_end TIMESTAMP NOT NULL,
        items JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS system_config (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value JSONB NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Database schema initialized successfully');

    // Verify tables were created
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📋 Created tables:');
    tables.rows.forEach((row: any) => console.log('  -', row.table_name));

    console.log('🎉 Database initialization completed!');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    console.log('✅ Database initialization script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Database initialization failed:', error);
    process.exit(1);
  });
