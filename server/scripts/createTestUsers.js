
import bcrypt from 'bcryptjs';
import { pool } from '../src/config/database.js';

const createTestUsers = async () => {
  try {
    console.log('🚀 Creating test users...');

    // Test database connection first
    console.log('🔍 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');

    // Hash the password
    const hashedPassword = await bcrypt.hash('Solulab@123', 12);

    // First ensure tables exist by calling the createTables function
    await createTables();

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
    console.log('📦 Creating test tenant...');
    const tenantQuery = `
      INSERT INTO tenants (name, domain, is_active)
      VALUES ($1, $2, $3)
      ON CONFLICT DO NOTHING
      RETURNING id
    `;
    
    const tenantResult = await pool.query(tenantQuery, ['Test Company', 'testcompany.com', true]);
    console.log('✅ Test tenant created/verified');

    // Insert users
    console.log('👥 Creating test users...');
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
    console.error('Error details:', error.message);
    process.exit(1);
  }
};

// Function to create tables if they don't exist
const createTables = async () => {
  const createTenantsTable = `
    CREATE TABLE IF NOT EXISTS tenants (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      domain VARCHAR(255),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      tenant_id INTEGER,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(createTenantsTable);
    await pool.query(createUsersTable);
    console.log('✅ Database tables created/verified');
  } catch (err) {
    console.error('❌ Error creating tables:', err.message);
    throw err;
  }
};

createTestUsers();
