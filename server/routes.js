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
    // Get real metrics from database
    const activeTenantsCount = await db.select({ count: count() })
      .from(tenants)
      .where(eq(tenants.status, 'active'));

    const activeUsersCount = await db.select({ count: count() })
      .from(users)
      .where(eq(users.isActive, true));

    const totalDocuments = await db.select({ count: count() })
      .from(documents);

    const recentErrors = await db.select({ count: count() })
      .from(activityLogs)
      .where(and(
        eq(activityLogs.level, 'error'),
        gte(activityLogs.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000))
      ));

    // Create dashboard metrics
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
        value: activeTenantsCount[0]?.count?.toString() || '0',
        label: 'Active Tenants',
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
        icon: 'fas fa-file-alt',
        value: totalDocuments[0]?.count?.toString() || '0',
        label: 'Documents',
        trend: 'up',
        trendValue: '+156',
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
      tenantId, 
      userId,
      action,
      startDate,
      endDate
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // Build where conditions
    let whereConditions = [];

    if (level) {
      whereConditions.push(eq(activityLogs.level, level));
    }

    if (tenantId) {
      whereConditions.push(eq(activityLogs.tenantId, Number(tenantId)));
    }

    if (userId) {
      whereConditions.push(eq(activityLogs.userId, userId));
    }

    if (action) {
      whereConditions.push(like(activityLogs.action, `%${action}%`));
    }

    if (startDate) {
      whereConditions.push(gte(activityLogs.createdAt, new Date(startDate)));
    }

    if (endDate) {
      whereConditions.push(gte(new Date(endDate), activityLogs.createdAt));
    }

    // Get logs with pagination
    const logs = await db.select()
      .from(activityLogs)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(activityLogs.createdAt))
      .limit(Number(limit))
      .offset(offset);

    // Get total count for pagination
    const totalResult = await db.select({ count: count() })
      .from(activityLogs)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: logs,
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

    // Build where conditions based on filters
    let whereConditions = [];

    if (filters.level) {
      whereConditions.push(eq(activityLogs.level, filters.level));
    }

    if (filters.tenantId) {
      whereConditions.push(eq(activityLogs.tenantId, Number(filters.tenantId)));
    }

    if (filters.startDate) {
      whereConditions.push(gte(activityLogs.createdAt, new Date(filters.startDate)));
    }

    if (filters.endDate) {
      whereConditions.push(gte(new Date(filters.endDate), activityLogs.createdAt));
    }

    // Get all logs for export
    const logs = await db.select()
      .from(activityLogs)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(activityLogs.createdAt));

    // Convert to CSV format
    const csvHeader = 'Timestamp,Level,Action,User ID,Tenant ID,IP Address,Details\n';
    const csvData = logs.map(log => 
      `${log.createdAt},${log.level},${log.action},${log.userId || ''},${log.tenantId || ''},${log.ipAddress || ''},"${log.details || ''}"`
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