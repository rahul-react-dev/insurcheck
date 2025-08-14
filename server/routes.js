import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import { users, tenants, subscriptions, subscriptionPlans, payments, invoices, documents, activityLogs } from '../shared/schema.js';
import { eq, and, gte, desc, count, sql, like, or, isNull, isNotNull } from 'drizzle-orm';

const router = express.Router();

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Middleware to check super admin role
const requireSuperAdmin = (req, res, next) => {
  if (req.user?.role !== 'super-admin') {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  next();
};

// ===================== SYSTEM HEALTH & METRICS ROUTES =====================

// System health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Get system metrics for dashboard
router.get('/system-metrics', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    // Get real metrics from database using existing columns
    const allTenantsCount = await db.select({ count: count() })
      .from(tenants);

    const activeUsersCount = await db.select({ count: count() })
      .from(users)
      .where(eq(users.isActive, true));

    const totalUsersCount = await db.select({ count: count() })
      .from(users);

    // Create dashboard metrics with real data where possible
    const metrics = [
      {
        id: 1,
        icon: 'fas fa-server',
        value: '99.9%',
        label: 'System Uptime',
        trend: 'up',
        trendValue: '+0.1%',
        color: 'green'
      },
      {
        id: 2,
        icon: 'fas fa-building',
        value: allTenantsCount[0]?.count?.toString() || '0',
        label: 'Total Tenants',
        trend: 'up',
        trendValue: '+2',
        color: 'blue'
      },
      {
        id: 3,
        icon: 'fas fa-users',
        value: activeUsersCount[0]?.count?.toString() || '0',
        label: 'Active Users',
        trend: 'up',
        trendValue: '+12',
        color: 'purple'
      },
      {
        id: 4,
        icon: 'fas fa-users-cog',
        value: totalUsersCount[0]?.count?.toString() || '0',
        label: 'Total Users',
        trend: 'up',
        trendValue: '+5',
        color: 'orange'
      }
    ];

    res.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('System metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system metrics'
    });
  }
});

// Get activity logs with filters
router.get('/activity-logs', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      level, 
      tenantName,
      errorType,
      'dateRange[start]': startDate,
      'dateRange[end]': endDate
    } = req.query;

    console.log('Activity logs request params:', { page, limit, level, tenantName, errorType, startDate, endDate });

    // Generate mock activity logs data
    const mockLogs = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        level: 'error',
        action: 'document_upload_failed',
        resource: 'documents',
        resourceId: 'doc_123',
        userId: 'user_456',
        tenantId: 1,
        tenantName: 'Tech Corp Inc',
        errorType: 'validation_error',
        message: 'File format not supported - .txt files are not allowed',
        details: 'User attempted to upload insurance_policy.txt but only PDF, DOC, DOCX are supported',
        description: 'Failed document upload with unsupported file format (.txt)',
        tenant: 'Tech Corp Inc',
        user: 'johndoe@techcorp.com',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        level: 'error',
        action: 'authentication_failed',
        resource: 'auth',
        resourceId: 'login_attempt_456',
        userId: 'user_789',
        tenantId: 2,
        tenantName: 'HealthGuard Corp',
        errorType: 'authentication_error',
        message: 'Invalid credentials provided',
        details: 'Failed login attempt for user with incorrect password',
        description: 'Failed login attempt with invalid credentials',
        tenant: 'HealthGuard Corp',
        user: 'jane.smith@healthguard.com',
        ipAddress: '10.0.0.15',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        level: 'warning',
        action: 'storage_limit_exceeded',
        resource: 'storage',
        resourceId: 'storage_789',
        userId: 'user_321',
        tenantId: 1,
        tenantName: 'Tech Corp Inc',
        errorType: 'storage_warning',
        message: 'Storage limit approaching - 90% of allocated space used',
        details: 'Tenant has used 4.5GB of 5GB allocated storage',
        description: 'Storage limit approaching - 90% capacity reached',
        tenant: 'Tech Corp Inc',
        user: 'admin@techcorp.com',
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        level: 'error',
        action: 'subscription_payment_failed',
        resource: 'payments',
        resourceId: 'payment_321',
        userId: 'user_654',
        tenantId: 3,
        tenantName: 'AutoProtect Ltd',
        errorType: 'payment_error',
        message: 'Credit card payment declined',
        details: 'Payment of $79.99 for Premium Plan was declined by bank',
        description: 'Credit card payment declined for subscription renewal',
        tenant: 'AutoProtect Ltd',
        user: 'billing@autoprotect.com',
        ipAddress: '172.16.0.25',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        level: 'info',
        action: 'user_login',
        resource: 'auth',
        resourceId: 'login_654',
        userId: 'user_987',
        tenantId: 1,
        tenantName: 'Tech Corp Inc',
        errorType: null,
        message: 'User successfully logged in',
        details: 'User logged in successfully from new location',
        description: 'Successful user login from verified location',
        tenant: 'Tech Corp Inc',
        user: 'manager@techcorp.com',
        ipAddress: '192.168.1.110',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      },
      {
        id: '6',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        level: 'error',
        action: 'database_connection_timeout',
        resource: 'database',
        resourceId: 'db_conn_987',
        userId: null,
        tenantId: null,
        tenantName: 'System',
        errorType: 'database_error',
        message: 'Database connection timeout',
        details: 'Connection to primary database timed out after 30 seconds',
        description: 'System database connection timeout during maintenance',
        tenant: 'System Internal',
        user: 'System Process',
        ipAddress: 'internal',
        userAgent: 'System',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: '7',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        level: 'error',
        action: 'password_reset_failed',
        resource: 'auth',
        resourceId: 'reset_123',
        userId: 'user_111',
        tenantId: 4,
        tenantName: 'SecureLife Insurance',
        errorType: 'validation_error',
        message: 'Password reset token expired',
        details: 'User attempted to reset password with expired token',
        description: 'Password reset attempt with expired security token',
        tenant: 'SecureLife Insurance',
        user: 'support@securelife.com',
        ipAddress: '203.45.67.89',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        id: '8',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        level: 'warning',
        action: 'multiple_login_attempts',
        resource: 'auth',
        resourceId: 'security_alert_456',
        userId: 'user_222',
        tenantId: 2,
        tenantName: 'HealthGuard Corp',
        errorType: 'security_warning',
        message: 'Multiple failed login attempts detected',
        details: 'User account temporarily locked due to 5 consecutive failed login attempts',
        description: 'Account temporarily locked due to multiple failed login attempts',
        tenant: 'HealthGuard Corp',
        user: 'security@healthguard.com',
        ipAddress: '45.123.67.89',
        userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
      },
      {
        id: '9',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        level: 'error',
        action: 'api_rate_limit_exceeded',
        resource: 'api',
        resourceId: 'rate_limit_789',
        userId: 'user_333',
        tenantId: 3,
        tenantName: 'AutoProtect Ltd',
        errorType: 'rate_limit_error',
        message: 'API rate limit exceeded - 1000 requests per hour',
        details: 'User exceeded API rate limit with 1001 requests in the last hour',
        description: 'API rate limit exceeded - temporary access restriction applied',
        tenant: 'AutoProtect Ltd',
        user: 'api@autoprotect.com',
        ipAddress: '172.16.0.30',
        userAgent: 'PostmanRuntime/7.32.3',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
      },
      {
        id: '10',
        timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        level: 'warning',
        action: 'disk_space_warning',
        resource: 'system',
        resourceId: 'disk_monitor_456',
        userId: null,
        tenantId: null,
        tenantName: 'System',
        errorType: 'storage_warning',
        message: 'Low disk space warning - 85% capacity reached',
        details: 'Server disk usage has reached 85% of total capacity (42.5GB of 50GB used)',
        description: 'System disk space warning - cleanup recommended',
        tenant: 'System Internal',
        user: 'System Monitor',
        ipAddress: 'internal',
        userAgent: 'System',
        createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000)
      }
    ];

    // Apply filters
    let filteredLogs = mockLogs;

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    if (tenantName && tenantName.trim()) {
      filteredLogs = filteredLogs.filter(log => 
        log.tenantName.toLowerCase().includes(tenantName.toLowerCase())
      );
    }

    if (errorType && errorType.trim()) {
      filteredLogs = filteredLogs.filter(log => 
        log.errorType && log.errorType.toLowerCase().includes(errorType.toLowerCase())
      );
    }

    if (startDate) {
      const start = new Date(startDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end date
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= end);
    }

    // Apply pagination
    const offset = (Number(page) - 1) * Number(limit);
    const paginatedLogs = filteredLogs.slice(offset, offset + Number(limit));

    const total = filteredLogs.length;
    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: paginatedLogs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('Activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs'
    });
  }
});

// Export activity logs
router.post('/activity-logs/export', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { filters = {} } = req.body;

    // Use the same mock data as the GET endpoint
    const mockLogs = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        level: 'error',
        action: 'document_upload_failed',
        userId: null,
        tenantId: 1,
        tenantName: 'SecureLife Insurance',
        ipAddress: '192.168.1.100',
        details: 'File format not supported - .txt files are not allowed',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        level: 'error',
        action: 'authentication_failed',
        userId: null,
        tenantId: 2,
        tenantName: 'HealthGuard Corp',
        ipAddress: '10.0.0.15',
        details: 'Failed login attempt for user: john.doe@healthguard.com',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        level: 'warning',
        action: 'storage_limit_exceeded',
        userId: 'user_789',
        tenantId: 1,
        tenantName: 'SecureLife Insurance',
        ipAddress: '192.168.1.105',
        details: 'Tenant has used 4.5GB of 5GB allocated storage',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      }
    ];

    // Apply filters
    let filteredLogs = mockLogs;

    if (filters.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filters.level);
    }

    if (filters.tenantId) {
      filteredLogs = filteredLogs.filter(log => log.tenantId === Number(filters.tenantId));
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate);
      filteredLogs = filteredLogs.filter(log => log.createdAt >= start);
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      filteredLogs = filteredLogs.filter(log => log.createdAt <= end);
    }

    // Convert to CSV format
    const csvHeader = 'Timestamp,Level,Action,User ID,Tenant ID,Tenant Name,IP Address,Details\n';
    const csvData = filteredLogs.map(log => 
      `${log.timestamp},${log.level},${log.action},"${log.userId || ''}","${log.tenantId || ''}","${log.tenantName || ''}","${log.ipAddress || ''}","${(log.details || '').replace(/"/g, '""')}"`
    ).join('\n');

    const csv = csvHeader + csvData;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=activity_logs_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);

  } catch (error) {
    console.error('Export activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export activity logs'
    });
  }
});

export default router;