import { sql } from 'drizzle-orm';
import { db } from '../db.ts';
import bcrypt from 'bcryptjs';

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
    // Using ON CONFLICT to ensure tenant is created or updated if it already exists based on domain
    const tenantResult = await db.execute(sql`
      INSERT INTO tenants (name, domain) 
      VALUES ('InsurCheck Demo', 'insurcheck.com')
      ON CONFLICT (domain) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `);

    // tenantResult.rows[0]?.id will be undefined if the tenant already existed and no new row was inserted.
    // In such cases, we need to fetch the existing tenant's ID.
    let tenantId;
    if (tenantResult.rows.length > 0) {
      tenantId = tenantResult.rows[0].id;
      console.log(`✅ Created or updated tenant: InsurCheck Demo (ID: ${tenantId})`);
    } else {
      // If no rows were returned, it means the tenant already exists. Fetch its ID.
      const existingTenant = await db.execute(sql`SELECT id FROM tenants WHERE domain = 'insurcheck.com' LIMIT 1`);
      tenantId = existingTenant.rows[0]?.id;
      console.log(`✅ Tenant 'InsurCheck Demo' already exists with ID: ${tenantId}`);
    }


    // Test users data
    const testUsers = [
      {
        username: 'superadmin',
        email: 'superadmin@insurcheck.com',
        password: hashedPassword,
        role: 'super-admin' as const,
        tenantId: null  // Super admin doesn't belong to a specific tenant
      },
      {
        username: 'admin',
        email: 'admin@insurcheck.com', 
        password: hashedPassword,
        role: 'tenant-admin' as const,
        tenantId: tenantId
      },
      {
        username: 'user',
        email: 'user@insurcheck.com',
        password: hashedPassword,
        role: 'user' as const,
        tenantId: tenantId
      }
    ];

    // Insert users using raw SQL with ON CONFLICT for upserting
    console.log('👥 Creating test users...');
    for (const userData of testUsers) {
      try {
        // Using ON CONFLICT to ensure user is created or updated if it already exists based on email
        const newUser = await db.execute(sql`
          INSERT INTO users (username, email, password, role, tenant_id)
          VALUES (${userData.username}, ${userData.email}, ${userData.password}, ${userData.role}, ${userData.tenantId})
          ON CONFLICT (email) DO UPDATE SET
            username = EXCLUDED.username,
            password = EXCLUDED.password,
            role = EXCLUDED.role,
            tenant_id = EXCLUDED.tenant_id
          RETURNING email
        `);
        
        if (newUser.rows.length > 0) {
          console.log(`✅ Created or updated user: ${newUser.rows[0].email}`);
        } else {
          // This case should ideally not happen with RETURNING clause if the query is successful
          console.log(`ℹ️ User ${userData.email} processed (no new row inserted, likely already up-to-date).`);
        }
      } catch (userError: any) {
        console.error(`❌ Error with user ${userData.email}:`, userError.message);
      }
    }

    console.log('\n🎉 Test users and tenant created successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('================================');
    testUsers.forEach(user => {
      console.log(`Role: ${user.role}, Email: ${user.email}, Password: Solulab@123`);
    });
    
    process.exit(0);

  } catch (error: any) {
    console.error('❌ Error creating test users:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
};

createTestUsers();