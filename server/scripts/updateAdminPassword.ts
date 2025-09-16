import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';
import { db } from '../db.ts';

const updateAdminPassword = async () => {
  try {
    console.log('🔧 Updating admin password to match requirements...');

    // Hash the password 'Solulab@123'
    const hashedPassword = await bcrypt.hash('Solulab@123', 12);

    // Update admin user password
    const result = await db.execute(sql`
      UPDATE users 
      SET password = ${hashedPassword}, updated_at = NOW()
      WHERE email = 'admin@insurcheck.com'
      RETURNING email, username, role, is_active;
    `);

    if (result.rows.length > 0) {
      console.log('✅ Admin password updated:', result.rows[0]);
    }

    console.log('\n🎉 Admin password updated successfully!');
    console.log('\n📋 Updated Credentials:');
    console.log('Email: admin@insurcheck.com');
    console.log('Password: Solulab@123');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error updating admin password:', error);
    process.exit(1);
  }
};

updateAdminPassword();