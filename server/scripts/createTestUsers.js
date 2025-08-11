
import bcrypt from 'bcryptjs';
import { pool } from '../db.ts';

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

    // Test users data - using the schema from shared/schema.ts
    const testUsers = [
      {
        username: 'superadmin@insurcheck.com',
        password: hashedPassword
      },
      {
        username: 'admin@insurcheck.com', 
        password: hashedPassword
      },
      {
        username: 'user@insurcheck.com',
        password: hashedPassword
      }
    ];

    // Insert users using the correct schema
    console.log('👥 Creating test users...');
    for (const user of testUsers) {
      const userQuery = `
        INSERT INTO users (username, password)
        VALUES ($1, $2)
        ON CONFLICT (username) DO UPDATE SET
          password = EXCLUDED.password
        RETURNING id, username
      `;

      const result = await pool.query(userQuery, [
        user.username,
        user.password
      ]);

      console.log(`✅ Created/Updated user: ${result.rows[0].username}`);
    }

    console.log('\n🎉 Test users created successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Super Admin: superadmin@insurcheck.com / Solulab@123');
    console.log('Admin: admin@insurcheck.com / Solulab@123');
    console.log('User: user@insurcheck.com / Solulab@123');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating test users:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
};

// Function to create tables if they don't exist - using the schema from shared/schema.ts
const createTables = async () => {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  try {
    await pool.query(createUsersTable);
    console.log('✅ Database tables created/verified');
  } catch (err) {
    console.error('❌ Error creating tables:', err.message);
    throw err;
  }
};

createTestUsers();
