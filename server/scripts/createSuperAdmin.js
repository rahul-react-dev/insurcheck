
import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';
import { db } from '../db.js';

const createSuperAdmin = async () => {
  try {
    console.log('🔧 Creating super admin user with provided credentials...');

    // Hash the password 'Solulab@123'
    const hashedPassword = await bcrypt.hash('Solulab@123', 12);

    // Create or update super admin user
    console.log('👤 Creating/updating super admin user...');
    
    const result = await db.execute(sql`
      INSERT INTO users (username, email, password, role, tenant_id, is_active, created_at, updated_at)
      VALUES ('superadmin', 'superadmin@insurcheck.com', ${hashedPassword}, 'super-admin', NULL, true, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        username = EXCLUDED.username,
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        tenant_id = EXCLUDED.tenant_id,
        is_active = EXCLUDED.is_active,
        updated_at = NOW()
      RETURNING email, username, role, is_active;
    `);

    if (result.rows.length > 0) {
      console.log('✅ Super admin user created/updated:', result.rows[0]);
    }

    // Also create the original credentials for backup
    const hashedPassword2 = await bcrypt.hash('admin123', 12);
    
    const result2 = await db.execute(sql`
      INSERT INTO users (username, email, password, role, tenant_id, is_active, created_at, updated_at)
      VALUES ('admin', 'admin@insurcheck.com', ${hashedPassword2}, 'super-admin', NULL, true, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        username = EXCLUDED.username,
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        tenant_id = EXCLUDED.tenant_id,
        is_active = EXCLUDED.is_active,
        updated_at = NOW()
      RETURNING email, username, role, is_active;
    `);

    if (result2.rows.length > 0) {
      console.log('✅ Backup super admin user created/updated:', result2.rows[0]);
    }

    console.log('\n🎉 Super admin users created successfully!');
    console.log('\n📋 Super Admin Credentials:');
    console.log('Email: superadmin@insurcheck.com');
    console.log('Password: Solulab@123');
    console.log('\n📋 Backup Super Admin Credentials:');
    console.log('Email: admin@insurcheck.com');
    console.log('Password: admin123');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
};

createSuperAdmin();
