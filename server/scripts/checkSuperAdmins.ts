import { db } from '../db.ts';
import { users } from '../src/schema.ts';
import { eq } from 'drizzle-orm';

const checkSuperAdmins = async () => {
  try {
    console.log('🔍 Checking for existing super admin users...');

    const superAdmins = await db.select().from(users).where(eq(users.role, 'super-admin'));

    if (superAdmins.length > 0) {
      console.log(`✅ Found ${superAdmins.length} super admin user(s):`);
      superAdmins.forEach((admin, index) => {
        console.log(`${index + 1}. Email: ${admin.email}`);
        console.log(`   Username: ${admin.username || 'N/A'}`);
        console.log(`   Active: ${admin.is_active ? 'Yes' : 'No'}`);
        console.log(`   Created: ${admin.created_at || 'N/A'}`);
        console.log('   ---');
      });

      console.log('\n🎯 Super Admin Login Credentials:');
      console.log('Email: superadmin@insurcheck.com');
      console.log('Password: admin123');

    } else {
      console.log('❌ No super admin users found in database');
      console.log('💡 Run: npx tsx server/scripts/createSuperAdmin.ts');
    }
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  }

  process.exit(0);
};

checkSuperAdmins();