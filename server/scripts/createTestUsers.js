
import bcrypt from 'bcryptjs';
import { pool } from '../src/config/database.js';

const createTestUsers = async () => {
  try {
    console.log('🚀 Creating test users...');

    // Hash the password
    const hashedPassword = await bcrypt.hash('Solulab@123', 12);

    // Test users data
    const testUsers = [
      {
        email: 'superadmin@insurcheck.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super-admin',
        tenantId: null
      },
      {
        email: 'admin@insurcheck.com',
        password: hashedPassword,
        firstName: 'Tenant',
        lastName: 'Admin',
        role: 'tenant-admin',
        tenantId: 1
      },
      {
        email: 'user@insurcheck.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        tenantId: 1
      }
    ];

    // Create a test tenant first
    const tenantQuery = `
      INSERT INTO tenants (name, domain, is_active)
      VALUES ($1, $2, $3)
      ON CONFLICT DO NOTHING
      RETURNING id
    `;
    
    await pool.query(tenantQuery, ['Test Company', 'testcompany.com', true]);

    // Insert users
    for (const user of testUsers) {
      const userQuery = `
        INSERT INTO users (email, password, first_name, last_name, role, tenant_id, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (email) DO UPDATE SET
          password = EXCLUDED.password,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          role = EXCLUDED.role,
          tenant_id = EXCLUDED.tenant_id,
          is_active = EXCLUDED.is_active
        RETURNING id, email, role
      `;

      const result = await pool.query(userQuery, [
        user.email,
        user.password,
        user.firstName,
        user.lastName,
        user.role,
        user.tenantId,
        true
      ]);

      console.log(`✅ Created/Updated user: ${result.rows[0].email} (${result.rows[0].role})`);
    }

    console.log('\n🎉 Test users created successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Super Admin: superadmin@insurcheck.com / Solulab@123');
    console.log('Tenant Admin: admin@insurcheck.com / Solulab@123');
    console.log('User: user@insurcheck.com / Solulab@123');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating test users:', error);
    process.exit(1);
  }
};

createTestUsers();
