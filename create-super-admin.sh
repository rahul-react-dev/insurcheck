#!/bin/bash

# Super Admin Creation Script
# Usage: ./create-super-admin.sh [email] [password]
# If no arguments provided, it will prompt for them

echo "🚀 Super Admin Creation Script"
echo "=============================="

# Check if arguments are provided
if [ $# -eq 2 ]; then
    EMAIL="$1"
    PASSWORD="$2"
    echo "📝 Using provided credentials..."
else
    # Prompt for email and password
    read -p "📧 Enter email: " EMAIL
    read -s -p "🔐 Enter password: " PASSWORD
    echo ""
fi

echo "📧 Email: $EMAIL"

# Validate email format (basic check)
if [[ ! "$EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    echo "❌ Invalid email format"
    exit 1
fi

# Validate password (basic check)
if [ ${#PASSWORD} -lt 8 ]; then
    echo "❌ Password must be at least 8 characters long"
    exit 1
fi

echo "🔐 Hashing password..."

# Generate hashed password using Node.js
HASHED_PASSWORD=$(node -e "
import bcrypt from 'bcryptjs';
const password = '$PASSWORD';
bcrypt.hash(password, 12).then(hash => {
    console.log(hash);
    process.exit(0);
}).catch(err => {
    console.error('Error hashing password:', err.message);
    process.exit(1);
});
")

if [ $? -ne 0 ]; then
    echo "❌ Failed to hash password"
    exit 1
fi

echo "💾 Creating/updating super admin in database..."

# Check if user exists and get their current role
EXISTING_USER=$(node -e "
import { db } from './server/db.js';
import { users } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function checkUser() {
    try {
        const result = await db.select()
            .from(users)
            .where(eq(users.email, '$EMAIL'))
            .limit(1);
        
        if (result.length > 0) {
            console.log('EXISTS:' + result[0].role);
        } else {
            console.log('NOT_EXISTS');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkUser();
" 2>/dev/null)

if [[ $EXISTING_USER == EXISTS:* ]]; then
    CURRENT_ROLE=${EXISTING_USER#EXISTS:}
    echo "⚠️  User already exists with role: $CURRENT_ROLE"
    
    if [ "$CURRENT_ROLE" = "super-admin" ]; then
        echo "✅ User is already a super admin. Updating password..."
    else
        echo "🔄 Updating user to super-admin role..."
    fi
    
    # Update existing user
    UPDATE_RESULT=$(node -e "
    import { db } from './server/db.js';
    import { users } from './shared/schema.js';
    import { eq } from 'drizzle-orm';
    
    async function updateUser() {
        try {
            await db.update(users)
                .set({
                    password: '$HASHED_PASSWORD',
                    role: 'super-admin',
                    isActive: true,
                    emailVerified: true,
                    failedLoginAttempts: 0,
                    updatedAt: new Date()
                })
                .where(eq(users.email, '$EMAIL'));
            console.log('SUCCESS');
            process.exit(0);
        } catch (error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    }
    
    updateUser();
    " 2>/dev/null)
    
    if [ "$UPDATE_RESULT" = "SUCCESS" ]; then
        echo "✅ Super admin updated successfully!"
    else
        echo "❌ Failed to update user"
        exit 1
    fi
    
else
    echo "👤 Creating new super admin user..."
    
    # Create new user
    CREATE_RESULT=$(node -e "
    import { db } from './server/db.js';
    import { users } from './shared/schema.js';
    
    async function createUser() {
        try {
            const newUser = await db.insert(users).values({
                email: '$EMAIL',
                password: '$HASHED_PASSWORD',
                role: 'super-admin',
                isActive: true,
                emailVerified: true,
                failedLoginAttempts: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            }).returning();
            
            console.log('SUCCESS:' + newUser[0].id);
            process.exit(0);
        } catch (error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    }
    
    createUser();
    " 2>/dev/null)
    
    if [[ $CREATE_RESULT == SUCCESS:* ]]; then
        USER_ID=${CREATE_RESULT#SUCCESS:}
        echo "✅ Super admin created successfully!"
        echo "🆔 User ID: $USER_ID"
    else
        echo "❌ Failed to create user"
        exit 1
    fi
fi

echo ""
echo "🎉 Process completed successfully!"
echo ""
echo "🔐 Super Admin Credentials:"
echo "  📧 Email: $EMAIL"
echo "  🔑 Password: [your provided password]"
echo "  👑 Role: super-admin"
echo ""
echo "🌐 You can now login at:"
echo "  https://dev-admin.insurcheck.ai/super-admin/login"
echo ""