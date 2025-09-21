import { db } from './server/db.js';
import { users } from './shared/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function createSuperAdmin(email, password) {
  try {
    console.log('🔧 Creating super admin user...');
    console.log('📧 Email:', email);
    
    // Check if user already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      console.log('⚠️  User with this email already exists');
      console.log('Current role:', existingUser[0].role);
      
      // Update existing user to super-admin if not already
      if (existingUser[0].role !== 'super-admin') {
        const hashedPassword = await bcrypt.hash(password, 12);
        await db.update(users)
          .set({
            role: 'super-admin',
            password: hashedPassword,
            isActive: true,
            emailVerified: true,
            updatedAt: new Date()
          })
          .where(eq(users.id, existingUser[0].id));
        
        console.log('✅ Updated existing user to super-admin role');
      } else {
        console.log('✅ User is already a super admin');
      }
      return;
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new super admin user
    console.log('💾 Inserting user into database...');
    const newUser = await db.insert(users).values({
      email: email,
      password: hashedPassword,
      role: 'super-admin',
      isActive: true,
      emailVerified: true,
      failedLoginAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    console.log('✅ Super admin created successfully!');
    console.log('📧 Email:', email);
    console.log('🆔 User ID:', newUser[0].id);
    console.log('👑 Role:', newUser[0].role);
    
  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
    throw error;
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting super admin creation process...');
  
  // Using the provided test credentials
  const email = 'rahul.soni@solulab.co';
  const password = 'Solulab@123';
  
  console.log('📝 Using provided credentials...');
  
  try {
    await createSuperAdmin(email, password);
    console.log('🎉 Process completed successfully!');
    console.log('');
    console.log('🔐 You can now login with:');
    console.log('  Email:', email);
    console.log('  Password: [your provided password]');
    console.log('  Role: super-admin');
  } catch (error) {
    console.error('💥 Process failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main();