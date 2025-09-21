#!/bin/bash

# Simple Super Admin Creation Script
# Usage: ./simple-create-admin.sh [email] [password]

echo "🚀 Simple Super Admin Creation Script"
echo "===================================="

# Default to provided test credentials if no arguments
EMAIL=${1:-"rahul.soni@solulab.co"}
PASSWORD=${2:-"Solulab@123"}

echo "📧 Email: $EMAIL"

# Validate email format (basic check)
if [[ ! "$EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    echo "❌ Invalid email format"
    exit 1
fi

# Validate password (basic check)
if [ ${#PASSWORD} -lt 6 ]; then
    echo "❌ Password must be at least 6 characters long"
    exit 1
fi

echo "🔐 Hashing password with bcrypt..."

# Generate hashed password using Node.js (simplified)
HASHED_PASSWORD=$(cd server && node -e "
import bcrypt from 'bcryptjs';
bcrypt.hash('$PASSWORD', 12).then(hash => {
    console.log(hash);
    process.exit(0);
}).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
")

if [ $? -ne 0 ]; then
    echo "❌ Failed to hash password"
    exit 1
fi

echo "💾 Creating/updating super admin in database..."

# Create SQL commands to upsert the user
cat > temp_create_admin.sql << EOF
-- Check if user exists and create/update accordingly
DO \$\$
BEGIN
    IF EXISTS (SELECT 1 FROM users WHERE email = '$EMAIL') THEN
        -- Update existing user
        UPDATE users SET 
            password = '$HASHED_PASSWORD',
            role = 'super-admin',
            is_active = true,
            email_verified = true,
            failed_login_attempts = 0,
            updated_at = NOW()
        WHERE email = '$EMAIL';
        RAISE NOTICE 'Updated existing user % to super-admin', '$EMAIL';
    ELSE
        -- Insert new user
        INSERT INTO users (email, password, role, is_active, email_verified, failed_login_attempts, created_at, updated_at) 
        VALUES ('$EMAIL', '$HASHED_PASSWORD', 'super-admin', true, true, 0, NOW(), NOW());
        RAISE NOTICE 'Created new super-admin user %', '$EMAIL';
    END IF;
END
\$\$;

-- Verify the user
SELECT email, role, is_active, email_verified FROM users WHERE email = '$EMAIL';
EOF

# Execute the SQL
echo "🗃️ Executing database operations..."
if command -v psql &> /dev/null && [ ! -z "$DATABASE_URL" ]; then
    # Use psql if available
    psql "$DATABASE_URL" -f temp_create_admin.sql
else
    echo "📊 Using Node.js to execute SQL..."
    # Alternative approach using node
    node -e "
    import pg from 'pg';
    import fs from 'fs';
    const { Pool } = pg;
    
    async function executeSql() {
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        try {
            const sql = fs.readFileSync('temp_create_admin.sql', 'utf8');
            const result = await pool.query(sql);
            console.log('✅ SQL executed successfully');
            if (result[result.length - 1].rows) {
                console.log('User details:', result[result.length - 1].rows[0]);
            }
        } catch (error) {
            console.error('❌ SQL execution failed:', error.message);
            process.exit(1);
        } finally {
            await pool.end();
        }
    }
    
    executeSql();
    " 2>/dev/null
fi

# Clean up temporary file
rm -f temp_create_admin.sql

echo ""
echo "🎉 Process completed successfully!"
echo ""
echo "🔐 Super Admin Credentials:"
echo "  📧 Email: $EMAIL"
echo "  🔑 Password: $PASSWORD"
echo "  👑 Role: super-admin"
echo ""
echo "🌐 You can now login at:"
echo "  https://dev-admin.insurcheck.ai/super-admin/login"
echo ""

# Test login
echo "🧪 Testing login..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/super-admin/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Login test successful!"
else
    echo "❌ Login test failed. Response: $RESPONSE"
fi