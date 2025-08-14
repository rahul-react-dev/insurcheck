
import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';
import { db } from '../db.ts';

const fixSuperAdmin = async () => {
  try {
    console.log('🔧 Fixing database schema and super admin user...');

    // First, let's check if the table exists and what columns it has
    console.log('🔍 Checking current table structure...');
    
    try {
      const tableInfo = await db.execute(sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position;
      `);
      
      console.log('📋 Current users table columns:');
      tableInfo.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    } catch (error) {
      console.log('⚠️ Could not read table structure:', error.message);
    }

    // Add missing columns if they don't exist
    console.log('🔨 Adding missing columns...');
    
    try {
      await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`);
      console.log('✅ Added is_active column');
    } catch (error) {
      console.log('ℹ️ is_active column likely already exists');
    }

    try {
      await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255)`);
      console.log('✅ Added username column');
    } catch (error) {
      console.log('ℹ️ username column likely already exists');
    }

    try {
      await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id)`);
      console.log('✅ Added tenant_id column');
    } catch (error) {
      console.log('ℹ️ tenant_id column likely already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create or update super admin user
    console.log('👤 Creating/updating super admin user...');
    
    const result = await db.execute(sql`
      INSERT INTO users (username, email, password, role, tenant_id, is_active)
      VALUES ('superadmin', 'superadmin@insurcheck.com', ${hashedPassword}, 'super-admin', NULL, true)
      ON CONFLICT (email) DO UPDATE SET
        username = EXCLUDED.username,
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        tenant_id = EXCLUDED.tenant_id,
        is_active = EXCLUDED.is_active
      RETURNING email, username, role;
    `);

    if (result.rows.length > 0) {
      console.log('✅ Super admin user created/updated:', result.rows[0]);
    }

    console.log('\n🎉 Database fixed successfully!');
    console.log('\n📋 Super Admin Credentials:');
    console.log('Email: superadmin@insurcheck.com');
    console.log('Password: admin123');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error fixing database:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
};

fixSuperAdmin();
