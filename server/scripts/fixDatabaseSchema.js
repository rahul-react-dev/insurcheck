
import { sql } from 'drizzle-orm';
import { db } from '../db.ts';

const fixDatabaseSchema = async () => {
  try {
    console.log('🔧 Fixing database schema...');

    // Add missing columns to users table
    const alterCommands = [
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255)',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255)',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()'
    ];

    for (const command of alterCommands) {
      try {
        await db.execute(sql.raw(command));
        console.log(`✅ Executed: ${command}`);
      } catch (error) {
        console.log(`ℹ️ Skipped (likely exists): ${command.split('ADD COLUMN IF NOT EXISTS')[1]?.split(' ')[0]}`);
      }
    }

    // Check current table structure
    try {
      const tableInfo = await db.execute(sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📋 Current users table structure:');
      tableInfo.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default || 'none'})`);
      });
    } catch (error) {
      console.log('⚠️ Could not read table structure:', error.message);
    }

    console.log('\n🎉 Database schema fixed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error fixing database schema:', error);
    process.exit(1);
  }
};

fixDatabaseSchema();
