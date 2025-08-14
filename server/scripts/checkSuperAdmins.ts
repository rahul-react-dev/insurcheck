
import { sql } from 'drizzle-orm';
import { db } from '../db.js';

const checkSuperAdmins = async () => {
  try {
    console.log('🔍 Checking for existing super admin users...');

    // Check for super admin users
    const superAdmins = await db.execute(sql`
      SELECT 
        id, 
        username, 
        email, 
        role, 
        is_active, 
        created_at, 
        last_login_at
      FROM users 
      WHERE role = 'super-admin'
      ORDER BY created_at ASC
    `);

    if (superAdmins.rows.length > 0) {
      console.log('✅ Found super admin users:');
      superAdmins.rows.forEach((admin: any) => {
        console.log(`\n📋 Super Admin Details:`);
        console.log(`  - ID: ${admin.id}`);
        console.log(`  - Username: ${admin.username || 'N/A'}`);
        console.log(`  - Email: ${admin.email}`);
        console.log(`  - Role: ${admin.role}`);
        console.log(`  - Active: ${admin.is_active ? '✅ Yes' : '❌ No'}`);
        console.log(`  - Created: ${admin.created_at || 'N/A'}`);
        console.log(`  - Last Login: ${admin.last_login_at || 'Never'}`);
      });

      console.log(`\n🎯 Total Super Admins Found: ${superAdmins.rows.length}`);
    } else {
      console.log('❌ No super admin users found in database');
      console.log('💡 Run "npx tsx scripts/createSuperAdmin.ts" to create one');
    }

    // Also check table structure
    try {
      const tableInfo = await db.execute(sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📊 Users table structure:');
      tableInfo.rows.forEach((col: any) => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    } catch (error) {
      console.log('⚠️ Could not read table structure:', (error as Error).message);
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Error checking database:', error);
    console.error('Error details:', (error as Error).message);
    process.exit(1);
  }
};

checkSuperAdmins();
