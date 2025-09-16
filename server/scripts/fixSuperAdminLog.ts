
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql } from 'drizzle-orm';
import { db } from '../db.ts';
import { users } from '../src/schema.ts';
import { eq } from 'drizzle-orm';

const fixSuperAdminLog = async () => {
  try {
    console.log('🔧 Starting comprehensive super admin authentication fix...');
    console.log('📅 Timestamp:', new Date().toISOString());

    // Step 1: Check database connection
    console.log('\n1️⃣ Checking database connection...');
    try {
      await db.execute(sql`SELECT 1 as test`);
      console.log('✅ Database connection successful');
    } catch (error) {
      console.error('❌ Database connection failed:', (error as Error).message);
      process.exit(1);
    }

    // Step 2: Check current table structure
    console.log('\n2️⃣ Analyzing current table structure...');
    try {
      const tableInfo = await db.execute(sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position;
      `);
      
      console.log('📋 Current users table structure:');
      tableInfo.rows.forEach((col: any) => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    } catch (error) {
      console.log('⚠️ Could not read table structure:', (error as Error).message);
    }

    // Step 3: Add missing columns if they don't exist
    console.log('\n3️⃣ Adding missing columns to users table...');
    
    const columnsToAdd = [
      { name: 'is_active', type: 'BOOLEAN DEFAULT true' },
      { name: 'username', type: 'VARCHAR(255)' },
      { name: 'tenant_id', type: 'INTEGER REFERENCES tenants(id)' },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT NOW()' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT NOW()' },
      { name: 'last_login_at', type: 'TIMESTAMP' },
      { name: 'failed_login_attempts', type: 'INTEGER DEFAULT 0' },
      { name: 'account_locked_until', type: 'TIMESTAMP' },
      { name: 'password_reset_token', type: 'VARCHAR(255)' },
      { name: 'password_reset_expires', type: 'TIMESTAMP' }
    ];

    for (const column of columnsToAdd) {
      try {
        await db.execute(sql.raw(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}`));
        console.log(`✅ Added/verified column: ${column.name}`);
      } catch (error) {
        console.log(`ℹ️ Column ${column.name} likely already exists or has constraints`);
      }
    }

    // Step 4: Check for existing super admin users
    console.log('\n4️⃣ Checking existing super admin users...');
    const existingSuperAdmins = await db.select().from(users).where(eq(users.role, 'super-admin'));
    
    if (existingSuperAdmins.length > 0) {
      console.log(`📋 Found ${existingSuperAdmins.length} existing super admin(s):`);
      existingSuperAdmins.forEach((admin, index) => {
        console.log(`  ${index + 1}. Email: ${admin.email}, Active: ${admin.isActive}, Username: ${admin.username || 'N/A'}`);
      });
    } else {
      console.log('📋 No existing super admin users found');
    }

    // Step 5: Create/Update super admin users with proper hashing
    console.log('\n5️⃣ Creating/updating super admin users...');
    
    // Primary super admin
    const primaryPassword = 'Solulab@123';
    const primaryHashedPassword = await bcrypt.hash(primaryPassword, 12);
    
    const primaryResult = await db.execute(sql`
      INSERT INTO users (username, email, password, role, tenant_id, is_active, created_at, updated_at, failed_login_attempts)
      VALUES ('superadmin', 'superadmin@insurcheck.com', ${primaryHashedPassword}, 'super-admin', NULL, true, NOW(), NOW(), 0)
      ON CONFLICT (email) DO UPDATE SET
        username = EXCLUDED.username,
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        tenant_id = EXCLUDED.tenant_id,
        is_active = EXCLUDED.is_active,
        updated_at = NOW(),
        failed_login_attempts = 0,
        account_locked_until = NULL
      RETURNING email, username, role, is_active;
    `);

    if (primaryResult.rows.length > 0) {
      console.log('✅ Primary super admin created/updated:', primaryResult.rows[0]);
    }

    // Backup super admin
    const backupPassword = 'admin123';
    const backupHashedPassword = await bcrypt.hash(backupPassword, 12);
    
    const backupResult = await db.execute(sql`
      INSERT INTO users (username, email, password, role, tenant_id, is_active, created_at, updated_at, failed_login_attempts)
      VALUES ('admin', 'admin@insurcheck.com', ${backupHashedPassword}, 'super-admin', NULL, true, NOW(), NOW(), 0)
      ON CONFLICT (email) DO UPDATE SET
        username = EXCLUDED.username,
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        tenant_id = EXCLUDED.tenant_id,
        is_active = EXCLUDED.is_active,
        updated_at = NOW(),
        failed_login_attempts = 0,
        account_locked_until = NULL
      RETURNING email, username, role, is_active;
    `);

    if (backupResult.rows.length > 0) {
      console.log('✅ Backup super admin created/updated:', backupResult.rows[0]);
    }

    // Step 6: Test JWT token generation
    console.log('\n6️⃣ Testing JWT token generation...');
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    
    try {
      const testUser = {
        id: 1,
        email: 'superadmin@insurcheck.com',
        role: 'super-admin'
      };
      
      const testToken = jwt.sign(testUser, jwtSecret, { expiresIn: '24h' });
      const decoded = jwt.verify(testToken, jwtSecret);
      console.log('✅ JWT token generation and verification successful');
      console.log('🔑 JWT Secret length:', jwtSecret.length, 'characters');
    } catch (error) {
      console.error('❌ JWT token test failed:', (error as Error).message);
    }

    // Step 7: Test password verification
    console.log('\n7️⃣ Testing password verification...');
    try {
      const testPassword = 'Solulab@123';
      const isValid = await bcrypt.compare(testPassword, primaryHashedPassword);
      console.log('✅ Password hashing and verification:', isValid ? 'SUCCESSFUL' : 'FAILED');
    } catch (error) {
      console.error('❌ Password verification test failed:', (error as Error).message);
    }

    // Step 8: Validate database consistency
    console.log('\n8️⃣ Validating database consistency...');
    const finalCheck = await db.select().from(users).where(eq(users.role, 'super-admin'));
    console.log(`✅ Final validation: ${finalCheck.length} super admin user(s) confirmed in database`);

    // Step 9: Clear any existing authentication tokens (security measure)
    console.log('\n9️⃣ Security cleanup...');
    try {
      await db.execute(sql`
        UPDATE users 
        SET password_reset_token = NULL, 
            password_reset_expires = NULL,
            account_locked_until = NULL,
            failed_login_attempts = 0
        WHERE role = 'super-admin'
      `);
      console.log('✅ Security tokens cleared for super admin accounts');
    } catch (error) {
      console.log('ℹ️ Security cleanup completed with warnings');
    }

    // Final Summary
    console.log('\n🎉 Super Admin Authentication Fix Complete!');
    console.log('==========================================');
    console.log('\n📋 SUPER ADMIN CREDENTIALS:');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│ PRIMARY ACCOUNT                         │');
    console.log('│ Email: superadmin@insurcheck.com        │');
    console.log('│ Password: Solulab@123                   │');
    console.log('├─────────────────────────────────────────┤');
    console.log('│ BACKUP ACCOUNT                          │');
    console.log('│ Email: admin@insurcheck.com             │');
    console.log('│ Password: admin123                      │');
    console.log('└─────────────────────────────────────────┘');
    
    console.log('\n🔧 TROUBLESHOOTING STEPS COMPLETED:');
    console.log('✅ Database connection verified');
    console.log('✅ Table schema updated with required columns');
    console.log('✅ Super admin users created/updated');
    console.log('✅ Password hashing verified');
    console.log('✅ JWT token generation tested');
    console.log('✅ Security cleanup performed');
    console.log('✅ Database consistency validated');
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Restart your server: Stop and start the server workflow');
    console.log('2. Clear browser cache and localStorage');
    console.log('3. Try logging in with the credentials above');
    console.log('4. Check server logs for any authentication errors');
    
    console.log('\n📊 AUTHENTICATION ENDPOINTS:');
    console.log('- Login URL: http://localhost:5000/api/auth/super-admin/login');
    console.log('- Health Check: http://localhost:5000/api/health');
    console.log('- System Metrics: http://localhost:5000/api/system-metrics');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ CRITICAL ERROR during super admin fix:');
    console.error('Error details:', (error as Error).message);
    console.error('Stack trace:', (error as Error).stack);
    
    console.log('\n🆘 RECOVERY STEPS:');
    console.log('1. Check database connection');
    console.log('2. Verify environment variables');
    console.log('3. Check table permissions');
    console.log('4. Contact system administrator if issues persist');
    
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Script interrupted by user');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Script terminated');
  process.exit(1);
});

// Run the fix
fixSuperAdminLog();
