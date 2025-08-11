
import bcrypt from 'bcryptjs';
import { db } from '../db.ts';
import { users, tenants, insertUserSchema } from '@shared/schema';
import { eq } from 'drizzle-orm';

const createTestUsers = async () => {
  try {
    console.log('🚀 Creating test users and tenants...');

    // Test database connection first
    console.log('🔍 Testing database connection...');
    const testConnection = await db.execute(sql`SELECT NOW()`);
    console.log('✅ Database connected successfully');

    // Hash the password
    const hashedPassword = await bcrypt.hash('Solulab@123', 12);

    // First create a test tenant
    console.log('🏢 Creating test tenant...');
    const tenant = await db.insert(tenants).values({
      name: 'InsurCheck Demo',
      domain: 'insurcheck.demo'
    }).returning();

    const tenantId = tenant[0].id;
    console.log(`✅ Created tenant: ${tenant[0].name} (ID: ${tenantId})`);

    // Test users data using the new schema
    const testUsers = [
      {
        username: 'superadmin',
        email: 'superadmin@insurcheck.com',
        password: hashedPassword,
        role: 'super-admin',
        tenantId: null  // Super admin doesn't belong to a specific tenant
      },
      {
        username: 'admin',
        email: 'admin@insurcheck.com', 
        password: hashedPassword,
        role: 'tenant-admin',
        tenantId: tenantId
      },
      {
        username: 'user',
        email: 'user@insurcheck.com',
        password: hashedPassword,
        role: 'user',
        tenantId: tenantId
      }
    ];

    // Insert users using Drizzle ORM
    console.log('👥 Creating test users...');
    for (const userData of testUsers) {
      try {
        // Check if user exists
        const existingUser = await db.select()
          .from(users)
          .where(eq(users.email, userData.email))
          .limit(1);

        if (existingUser.length > 0) {
          // Update existing user
          const updatedUser = await db.update(users)
            .set({ 
              password: userData.password,
              role: userData.role,
              tenantId: userData.tenantId
            })
            .where(eq(users.email, userData.email))
            .returning();
          
          console.log(`🔄 Updated user: ${updatedUser[0].email}`);
        } else {
          // Create new user
          const newUser = await db.insert(users)
            .values(userData)
            .returning();
          
          console.log(`✅ Created user: ${newUser[0].email}`);
        }
      } catch (userError) {
        console.error(`❌ Error with user ${userData.email}:`, userError.message);
      }
    }

    console.log('\n🎉 Test users and tenant created successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Super Admin: superadmin@insurcheck.com / Solulab@123');
    console.log('Tenant Admin: admin@insurcheck.com / Solulab@123');
    console.log('User: user@insurcheck.com / Solulab@123');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating test users:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
};

createTestUsers();
