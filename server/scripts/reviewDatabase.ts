
import { db } from '../db.js';
import { sql } from 'drizzle-orm';
import * as schema from '../../shared/schema.js';

const reviewDatabase = async () => {
  try {
    console.log('🔍 Reviewing Database Schema and Data...\n');
    console.log('=' * 80);

    // Get all tables in the database
    const tablesResult = await db.execute(sql`
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log(`📊 Found ${tablesResult.length} tables in the database:\n`);

    for (const table of tablesResult) {
      const tableName = table.table_name;
      console.log(`🔸 Table: ${tableName.toUpperCase()}`);
      console.log('─'.repeat(50));

      try {
        // Get table structure
        const columnsResult = await db.execute(sql`
          SELECT 
            column_name, 
            data_type, 
            is_nullable, 
            column_default,
            character_maximum_length
          FROM information_schema.columns 
          WHERE table_name = ${tableName}
          ORDER BY ordinal_position;
        `);

        console.log('📋 Columns:');
        columnsResult.forEach(col => {
          const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
          const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
          const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
          console.log(`   • ${col.column_name}: ${col.data_type}${length} ${nullable}${defaultVal}`);
        });

        // Get row count
        const countResult = await db.execute(sql`
          SELECT COUNT(*) as count FROM ${sql.identifier(tableName)};
        `);
        const rowCount = countResult[0]?.count || 0;
        
        console.log(`\n📊 Total rows: ${rowCount}`);

        // If table has data, show some sample records
        if (rowCount > 0) {
          const sampleResult = await db.execute(sql`
            SELECT * FROM ${sql.identifier(tableName)} 
            ORDER BY 
              CASE 
                WHEN column_name = 'created_at' THEN created_at 
                WHEN column_name = 'id' THEN id::text 
                ELSE NULL 
              END DESC 
            LIMIT 5;
          `);

          console.log('\n📄 Sample data (up to 5 records):');
          if (sampleResult.length > 0) {
            sampleResult.forEach((row, index) => {
              console.log(`\n   Record ${index + 1}:`);
              Object.entries(row).forEach(([key, value]) => {
                let displayValue = value;
                if (value === null) {
                  displayValue = 'NULL';
                } else if (typeof value === 'object') {
                  displayValue = JSON.stringify(value, null, 2);
                } else if (typeof value === 'string' && value.length > 100) {
                  displayValue = value.substring(0, 100) + '...';
                }
                console.log(`     ${key}: ${displayValue}`);
              });
            });
          }
        } else {
          console.log('   ℹ️  No data found in this table');
        }

        // Get foreign key relationships
        const fkResult = await db.execute(sql`
          SELECT
            tc.constraint_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = ${tableName};
        `);

        if (fkResult.length > 0) {
          console.log('\n🔗 Foreign Key Relationships:');
          fkResult.forEach(fk => {
            console.log(`   • ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
          });
        }

        console.log('\n');

      } catch (error) {
        console.log(`   ❌ Error analyzing table ${tableName}:`, error.message);
      }
    }

    // Database summary
    console.log('=' * 80);
    console.log('📈 DATABASE SUMMARY');
    console.log('=' * 80);

    // Get total database size
    try {
      const sizeResult = await db.execute(sql`
        SELECT 
          pg_size_pretty(pg_database_size(current_database())) as db_size;
      `);
      console.log(`💾 Database Size: ${sizeResult[0]?.db_size || 'Unknown'}`);
    } catch (error) {
      console.log('💾 Database Size: Unable to determine');
    }

    // Count total records across all tables
    let totalRecords = 0;
    for (const table of tablesResult) {
      try {
        const countResult = await db.execute(sql`
          SELECT COUNT(*) as count FROM ${sql.identifier(table.table_name)};
        `);
        totalRecords += parseInt(countResult[0]?.count || 0);
      } catch (error) {
        console.log(`   ⚠️  Could not count records in ${table.table_name}`);
      }
    }

    console.log(`📊 Total Tables: ${tablesResult.length}`);
    console.log(`📊 Total Records: ${totalRecords}`);

    // Schema validation
    console.log('\n🔍 SCHEMA VALIDATION');
    console.log('─'.repeat(50));

    const expectedTables = [
      'users', 'tenants', 'subscriptions', 'subscription_plans',
      'payments', 'invoices', 'documents', 'activity_logs',
      'system_config', 'system_metrics'
    ];

    const actualTables = tablesResult.map(t => t.table_name);
    
    console.log('✅ Expected tables found:');
    expectedTables.forEach(table => {
      if (actualTables.includes(table)) {
        console.log(`   ✓ ${table}`);
      } else {
        console.log(`   ✗ ${table} (MISSING)`);
      }
    });

    console.log('\n📋 Additional tables:');
    actualTables.forEach(table => {
      if (!expectedTables.includes(table)) {
        console.log(`   • ${table}`);
      }
    });

    console.log('\n🎉 Database review completed successfully!');

  } catch (error) {
    console.error('❌ Error reviewing database:', error);
  } finally {
    process.exit(0);
  }
};

reviewDatabase();
