import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import { users, tenants, subscriptions, subscriptionPlans, payments, invoices, documents, activityLogs } from '../shared/schema.js';
import { eq, and, gte, lte, desc, count, sql, like, or, isNull, isNotNull } from 'drizzle-orm';

const router = express.Router();

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      message: 'Authentication token is missing'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
    req.user = decoded;
    next();
  } catch (error) {
    console.log('Token verification error:', error);

    let errorMessage = 'Invalid or expired token';
    if (error.name === 'TokenExpiredError') {
      errorMessage = 'Token has expired';
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Invalid token';
    }

    return res.status(401).json({ 
      error: errorMessage,
      message: errorMessage,
      tokenExpired: error.name === 'TokenExpiredError'
    });
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
      'dateRange[end]': endDate,
      startDate: altStartDate,
      endDate: altEndDate
    } = req.query;

    // Handle both dateRange[start]/dateRange[end] and startDate/endDate formats
    const actualStartDate = startDate || altStartDate;
    const actualEndDate = endDate || altEndDate;

    console.log('Activity logs request params:', { 
      page, limit, level, tenantName, errorType, 
      startDate, endDate, altStartDate, altEndDate, 
      actualStartDate, actualEndDate 
    });

    // Build database query
    let query = db.select({
      id: activityLogs.id,
      tenantId: activityLogs.tenantId,
      tenantName: tenants.name,
      userId: activityLogs.userId,
      userEmail: users.email,
      type: activityLogs.type,
      description: activityLogs.description,
      ipAddress: activityLogs.ipAddress,
      userAgent: activityLogs.userAgent,
      createdAt: activityLogs.createdAt
    })
    .from(activityLogs)
    .leftJoin(tenants, eq(activityLogs.tenantId, tenants.id))
    .leftJoin(users, eq(activityLogs.userId, users.id));

    // Build where conditions
    const conditions = [];

    // Date range filtering
    if (actualStartDate) {
      const start = new Date(actualStartDate);
      console.log('Date filter - Start date:', start);
      conditions.push(gte(activityLogs.createdAt, start));
    }

    if (actualEndDate) {
      const end = new Date(actualEndDate);
      end.setHours(23, 59, 59, 999); // Include the entire end date
      console.log('Date filter - End date:', end);
      conditions.push(lte(activityLogs.createdAt, end));
    }

    // Tenant name filtering
    if (tenantName && tenantName.trim()) {
      conditions.push(like(tenants.name, `%${tenantName}%`));
    }

    // Type/Error type filtering (map level to type for compatibility)
    if (level) {
      // Map UI levels to database activity types
      const typeMapping = {
        'error': ['authentication_failed', 'document_upload_failed', 'subscription_payment_failed', 'database_connection_timeout', 'password_reset_failed', 'api_rate_limit_exceeded', 'backup_failed', 'email_delivery_failed', 'integration_failure', 'license_validation_failed'],
        'warning': ['storage_limit_exceeded', 'multiple_login_attempts', 'disk_space_warning', 'subscription_expiring', 'api_quota_warning', 'performance_degradation'],
        'info': ['user_login', 'document_processed', 'system_maintenance', 'user_created']
      };

      if (typeMapping[level]) {
        conditions.push(or(...typeMapping[level].map(type => eq(activityLogs.type, type))));
      }
    }

    if (errorType && errorType.trim()) {
      conditions.push(like(activityLogs.type, `%${errorType}%`));
    }

    // Apply conditions to query if any exist
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Get total count for pagination
    let countQuery = db.select({ count: count() }).from(activityLogs);
    if (tenantName && tenantName.trim()) {
      countQuery = countQuery.leftJoin(tenants, eq(activityLogs.tenantId, tenants.id));
    }
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }

    const [totalResult, logs] = await Promise.all([
      countQuery,
      query
        .orderBy(desc(activityLogs.createdAt))
        .limit(Number(limit))
        .offset((Number(page) - 1) * Number(limit))
    ]);

    const total = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(total / Number(limit));

    // Transform data to match frontend expectations
    const transformedLogs = logs.map((log, index) => {
      // Map activity type to level for UI
      const getLevel = (type) => {
        const errorTypes = ['authentication_failed', 'document_upload_failed', 'subscription_payment_failed', 'database_connection_timeout', 'password_reset_failed', 'api_rate_limit_exceeded', 'backup_failed', 'email_delivery_failed', 'integration_failure', 'license_validation_failed'];
        const warningTypes = ['storage_limit_exceeded', 'multiple_login_attempts', 'disk_space_warning', 'subscription_expiring', 'api_quota_warning', 'performance_degradation'];

        if (errorTypes.includes(type)) return 'error';
        if (warningTypes.includes(type)) return 'warning';
        return 'info';
      };

      return {
        id: log.id.toString(),
        logId: `LOG-${String(log.id).padStart(6, '0')}`,
        timestamp: log.createdAt.toISOString(),
        level: getLevel(log.type),
        action: log.type,
        resource: log.type.split('_')[0] || 'system',
        resourceId: `${log.type}_${log.id}`,
        userId: log.userId,
        tenantId: log.tenantId,
        tenantName: log.tenantName || 'System',
        errorType: getLevel(log.type) === 'error' ? log.type : null,
        message: log.description.split('.')[0] || log.description,
        details: log.description,
        description: log.description,
        tenant: log.tenantName || 'System Internal',
        user: log.userEmail || 'System Process',
        userEmail: log.userEmail || 'system@internal.com',
        userType: log.userEmail ? 'user' : 'system',
        ipAddress: log.ipAddress || 'internal',
        userAgent: log.userAgent || 'System',
        createdAt: log.createdAt,
        actionPerformed: log.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        actionDetails: log.description,
        status: getLevel(log.type) === 'error' ? 'failed' : 'success',
        severity: getLevel(log.type) === 'error' ? 'high' : getLevel(log.type) === 'warning' ? 'medium' : 'low'
      };
    });

    console.log(`📊 Retrieved ${transformedLogs.length} logs from database (total: ${total})`);

    res.json({
      success: true,
      data: transformedLogs,
      logs: transformedLogs, // For compatibility
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