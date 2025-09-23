
import { db } from '../db.js';
import { activityLogs } from '../../shared/schema.js';

async function seedActivityLogs() {
  try {
    console.log('🌱 Seeding activity logs...');

    const mockActivityLogs = [
      {
        tenantId: 1,
        userId: 'user_456',
        action: 'document_upload_failed',
        resource: 'document',
        details: { message: 'File format not supported - .txt files are not allowed. User attempted to upload insurance_policy.txt but only PDF, DOC, DOCX are supported' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        level: 'error',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        tenantId: 2,
        userId: 'user_789',
        action: 'authentication_failed',
        resource: 'auth',
        details: { message: 'Failed login attempt for user with incorrect password' },
        ipAddress: '10.0.0.15',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        level: 'error',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        tenantId: 1,
        userId: 'user_321',
        action: 'storage_limit_exceeded',
        resource: 'storage',
        details: { message: 'Storage limit approaching - 90% of allocated space used. Tenant has used 4.5GB of 5GB allocated storage' },
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        level: 'warning',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
      {
        tenantId: 3,
        userId: 'user_654',
        action: 'subscription_payment_failed',
        resource: 'payment',
        details: { message: 'Credit card payment declined. Payment of $79.99 for Premium Plan was declined by bank' },
        ipAddress: '172.16.0.25',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        level: 'error',
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      },
      {
        tenantId: null,
        userId: null,
        action: 'database_connection_timeout',
        resource: 'system',
        details: { message: 'Connection to primary database timed out after 30 seconds during maintenance', duration: '30000ms' },
        ipAddress: 'internal',
        userAgent: 'System',
        level: 'critical',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
      },
      {
        tenantId: 4,
        userId: 'user_111',
        action: 'password_reset_failed',
        resource: 'auth',
        details: { message: 'Password reset token expired. User attempted to reset password with expired token' },
        ipAddress: '203.45.67.89',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        level: 'error',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
      {
        tenantId: 2,
        userId: 'user_222',
        action: 'multiple_login_attempts',
        resource: 'auth',
        details: { message: 'Multiple failed login attempts detected. User account temporarily locked due to 5 consecutive failed login attempts', attempts: 5 },
        ipAddress: '45.123.67.89',
        userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36',
        level: 'error',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      },
      {
        tenantId: 3,
        userId: 'user_333',
        action: 'api_rate_limit_exceeded',
        resource: 'api',
        details: { message: 'API rate limit exceeded - 1000 requests per hour. User exceeded API rate limit with 1001 requests in the last hour', limit: 1000, requests: 1001 },
        ipAddress: '172.16.0.30',
        userAgent: 'PostmanRuntime/7.32.3',
        level: 'warning',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      },
      {
        tenantId: 1,
        userId: 'user_987',
        action: 'user_login',
        resource: 'auth',
        details: { message: 'User successfully logged in from new location' },
        ipAddress: '192.168.1.110',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        level: 'info',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      },
      {
        tenantId: 2,
        userId: null,
        action: 'email_delivery_failed',
        resource: 'email',
        details: { message: 'Failed to deliver notification email. Email notification to customer@example.com bounced - invalid email address' },
        ipAddress: 'internal',
        userAgent: 'EmailService/2.1',
        level: 'error',
        createdAt: new Date(Date.now() - 15 * 60 * 60 * 1000), // 15 hours ago
      }
    ];

    // Clear existing activity logs
    await db.delete(activityLogs);
    console.log('🗑️ Cleared existing activity logs');

    // Insert new mock data
    await db.insert(activityLogs).values(mockActivityLogs);
    
    console.log('✅ Successfully seeded', mockActivityLogs.length, 'activity logs');
    console.log('📊 Activity logs created with timestamps ranging from', new Date(Date.now() - 27 * 60 * 60 * 1000).toLocaleString(), 'to', new Date().toLocaleString());

  } catch (error) {
    console.error('❌ Error seeding activity logs:', error);
    throw error;
  }
}

// Run the seeding function
if (import.meta.url === `file://${process.argv[1]}`) {
  seedActivityLogs()
    .then(() => {
      console.log('🎉 Activity logs seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Activity logs seeding failed:', error);
      process.exit(1);
    });
}

export { seedActivityLogs };
