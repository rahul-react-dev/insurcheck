
import { db } from '../db.js';
import { sql } from 'drizzle-orm';

async function checkDatabaseStructure() {
  try {
    console.log('🔍 Checking existing tables...');
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log('📋 Available tables:');
    tables.rows.forEach((row: any) => console.log('  -', row.table_name));
    
    // Check tenants table structure if it exists
    const tenantExists = tables.rows.some((row: any) => row.table_name === 'tenants');
    if (tenantExists) {
      console.log('\n📊 Tenants table structure:');
      const columns = await db.execute(sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'tenants'
        ORDER BY ordinal_position;
      `);
      columns.rows.forEach((col: any) => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    } else {
      console.log('\n❌ Tenants table does not exist');
    }

    // Check activity_logs table structure if it exists
    const activityLogsExists = tables.rows.some((row: any) => row.table_name === 'activity_logs');
    if (activityLogsExists) {
      console.log('\n📊 Activity logs table structure:');
      const columns = await db.execute(sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'activity_logs'
        ORDER BY ordinal_position;
      `);
      columns.rows.forEach((col: any) => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    } else {
      console.log('\n❌ Activity logs table does not exist');
    }

    // Check system_metrics table structure if it exists
    const systemMetricsExists = tables.rows.some((row: any) => row.table_name === 'system_metrics');
    if (systemMetricsExists) {
      console.log('\n📊 System metrics table structure:');
      const columns = await db.execute(sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'system_metrics'
        ORDER BY ordinal_position;
      `);
      columns.rows.forEach((col: any) => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    } else {
      console.log('\n❌ System metrics table does not exist');
    }

  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
  }
  process.exit(0);
}

checkDatabaseStructure();
