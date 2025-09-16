
import { db } from '../db.ts';
import { activityLogs } from '../src/schema.ts';

async function seedActivityLogs() {
  try {
    console.log('🌱 Seeding activity logs...');

    const mockActivityLogs = [
      {
        tenantId: 1,
        userId: 'user_456',
        type: 'document_upload_failed',
        description: 'File format not supported - .txt files are not allowed. User attempted to upload insurance_policy.txt but only PDF, DOC, DOCX are supported',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        tenantId: 2,
        userId: 'user_789',
        type: 'authentication_failed',
        description: 'Failed login attempt for user with incorrect password',
        ipAddress: '10.0.0.15',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        tenantId: 1,
        userId: 'user_321',
        type: 'storage_limit_exceeded',
        description: 'Storage limit approaching - 90% of allocated space used. Tenant has used 4.5GB of 5GB allocated storage',
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
      {
        tenantId: 3,
        userId: 'user_654',
        type: 'subscription_payment_failed',
        description: 'Credit card payment declined. Payment of $79.99 for Premium Plan was declined by bank',
        ipAddress: '172.16.0.25',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      },
      {
        tenantId: 1,
        userId: 'user_987',
        type: 'user_login',
        description: 'User successfully logged in from new location',
        ipAddress: '192.168.1.110',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      },
      {
        tenantId: null,
        userId: null,
        type: 'database_connection_timeout',
        description: 'Connection to primary database timed out after 30 seconds during maintenance',
        ipAddress: 'internal',
        userAgent: 'System',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
      },
      {
        tenantId: 4,
        userId: 'user_111',
        type: 'password_reset_failed',
        description: 'Password reset token expired. User attempted to reset password with expired token',
        ipAddress: '203.45.67.89',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
      {
        tenantId: 2,
        userId: 'user_222',
        type: 'multiple_login_attempts',
        description: 'Multiple failed login attempts detected. User account temporarily locked due to 5 consecutive failed login attempts',
        ipAddress: '45.123.67.89',
        userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      },
      {
        tenantId: 3,
        userId: 'user_333',
        type: 'api_rate_limit_exceeded',
        description: 'API rate limit exceeded - 1000 requests per hour. User exceeded API rate limit with 1001 requests in the last hour',
        ipAddress: '172.16.0.30',
        userAgent: 'PostmanRuntime/7.32.3',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      },
      {
        tenantId: null,
        userId: null,
        type: 'disk_space_warning',
        description: 'Low disk space warning - 85% capacity reached. Server disk usage has reached 85% of total capacity (42.5GB of 50GB used)',
        ipAddress: 'internal',
        userAgent: 'System',
        createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7 hours ago
      },
      {
        tenantId: 1,
        userId: null,
        type: 'backup_failed',
        description: 'Automated backup process failed. Daily backup for tenant Tech Corp Inc failed due to network timeout',
        ipAddress: 'internal',
        userAgent: 'BackupAgent/1.0',
        createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000), // 9 hours ago
      },
      {
        tenantId: 2,
        userId: 'user_444',
        type: 'document_processed',
        description: 'Document successfully processed and validated. Insurance document processed successfully with OCR validation',
        ipAddress: '10.0.0.20',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000), // 11 hours ago
      },
      {
        tenantId: 4,
        userId: 'user_666',
        type: 'subscription_expiring',
        description: 'Subscription expiring in 7 days. Premium plan subscription for SecureLife Insurance expires on 2025-01-25',
        ipAddress: '203.45.67.90',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 13 * 60 * 60 * 1000), // 13 hours ago
      },
      {
        tenantId: 3,
        userId: 'user_888',
        type: 'email_delivery_failed',
        description: 'Failed to deliver notification email. Email notification to customer@autoprotect.com bounced - invalid email address',
        ipAddress: 'internal',
        userAgent: 'EmailService/2.1',
        createdAt: new Date(Date.now() - 15 * 60 * 60 * 1000), // 15 hours ago
      },
      {
        tenantId: 1,
        userId: 'admin_111',
        type: 'user_created',
        description: 'New user account created successfully. User account created for newuser@techcorp.com with role: member',
        ipAddress: '192.168.1.115',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 17 * 60 * 60 * 1000), // 17 hours ago
      },
      {
        tenantId: 3,
        userId: 'user_333',
        type: 'api_quota_warning',
        description: 'API quota usage at 80% - 800 of 1000 requests used. Monthly API quota reaching limit for AutoProtect Ltd',
        ipAddress: '172.16.0.35',
        userAgent: 'APIClient/1.5',
        createdAt: new Date(Date.now() - 19 * 60 * 60 * 1000), // 19 hours ago
      },
      {
        tenantId: 2,
        userId: null,
        type: 'integration_failure',
        description: 'Third-party integration service unavailable. Connection to insurance verification service failed - timeout after 30 seconds',
        ipAddress: 'internal',
        userAgent: 'IntegrationService/3.0',
        createdAt: new Date(Date.now() - 21 * 60 * 60 * 1000), // 21 hours ago
      },
      {
        tenantId: null,
        userId: null,
        type: 'system_maintenance',
        description: 'Scheduled system maintenance completed. Weekly system maintenance window completed - all systems operational',
        ipAddress: 'internal',
        userAgent: 'MaintenanceBot/2.0',
        createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000), // 23 hours ago
      },
      {
        tenantId: 4,
        userId: 'user_777',
        type: 'license_validation_failed',
        description: 'Software license validation failed. License key validation failed for advanced features module',
        ipAddress: '203.45.67.95',
        userAgent: 'Mozilla/5.0 (Linux; Ubuntu) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
      },
      {
        tenantId: null,
        userId: null,
        type: 'performance_degradation',
        description: 'System performance degradation detected. Response time increased by 25% over the last hour - investigating',
        ipAddress: 'internal',
        userAgent: 'PerfMonitor/1.0',
        createdAt: new Date(Date.now() - 27 * 60 * 60 * 1000), // 27 hours ago
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
