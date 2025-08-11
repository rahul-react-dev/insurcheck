
import { sql } from 'drizzle-orm';
import { db } from '../db.ts';
import { users, tenants } from '../../shared/schema.ts';

const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');

    // Test database connection
    console.log('🔍 Testing database connection...');
    const testConnection = await db.execute(sql`SELECT NOW()`);
    console.log('✅ Database connected successfully');

    // Drop existing tables if they exist (to reset schema)
    console.log('🗑️ Dropping existing tables...');
    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS tenants CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS role CASCADE`);

    // Create role enum
    console.log('📋 Creating role enum...');
    await db.execute(sql`
      CREATE TYPE role AS ENUM ('super-admin', 'tenant-admin', 'user')
    `);

    // Create tenants table
    console.log('🏢 Creating tenants table...');
    await db.execute(sql`
      CREATE TABLE tenants (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name TEXT NOT NULL,
        domain TEXT UNIQUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create users table
    console.log('👥 Creating users table...');
    await db.execute(sql`
      CREATE TABLE users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role role NOT NULL DEFAULT 'user',
        tenant_id INTEGER REFERENCES tenants(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('✅ Database initialized successfully!');
    process.exit(0);

  } catch (error: any) {
    console.error('❌ Error initializing database:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
};

initDatabase();
