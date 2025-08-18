import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "./db.js";
import {
  users,
  tenants,
  subscriptions,
  subscriptionPlans,
  payments,
  invoices,
  documents,
  activityLogs,
} from "../shared/schema.js";
import {
  eq,
  and,
  gte,
  lte,
  desc,
  count,
  sql,
  like,
  or,
  isNull,
  isNotNull,
} from "drizzle-orm";

const router = express.Router();

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Access token required",
      message: "Authentication token is missing",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET ||
        "your-super-secret-jwt-key-change-this-in-production",
    );
    req.user = decoded;
    next();
  } catch (error) {
    console.log("Token verification error:", error);

    let errorMessage = "Invalid or expired token";
    if (error.name === "TokenExpiredError") {
      errorMessage = "Token has expired";
    } else if (error.name === "JsonWebTokenError") {
      errorMessage = "Invalid token";
    }

    return res.status(401).json({
      error: errorMessage,
      message: errorMessage,
      tokenExpired: error.name === "TokenExpiredError",
    });
  }
};

// Middleware to check super admin role
const requireSuperAdmin = (req, res, next) => {
  if (req.user?.role !== "super-admin") {
    return res.status(403).json({ error: "Super admin access required" });
  }
  next();
};

// ===================== SYSTEM HEALTH & METRICS ROUTES =====================

// System health check
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || "1.0.0",
  });
});

// System metrics endpoint
router.get('/system-metrics', async (req, res) => {
  try {
    console.log('📊 Fetching system metrics from database...');

    // Get real data from database
    const tenantsCount = await db.execute(sql`SELECT COUNT(*) as count FROM tenants WHERE status = 'active'`);
    const usersCount = await db.execute(sql`SELECT COUNT(*) as count FROM users WHERE is_active = true`);
    const totalStorage = await db.execute(sql`
      SELECT COALESCE(SUM(storage_limit), 0) as total_storage 
      FROM tenants WHERE status = 'active'
    `);
    const activeSubscriptions = await db.execute(sql`
      SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'
    `);
    const errorLogsCount = await db.execute(sql`
      SELECT COUNT(*) as count FROM activity_logs 
      WHERE level = 'error' AND created_at >= NOW() - INTERVAL '24 hours'
    `);
    const documentsCount = await db.execute(sql`SELECT COUNT(*) as count FROM documents WHERE status = 'active'`);

    const metrics = [
      {
        id: 1,
        icon: 'fas fa-building',
        value: tenantsCount.rows[0]?.count || '0',
        label: 'Total Tenants',
        description: 'Active tenant accounts',
        trend: '+8.2%',
        color: 'blue'
      },
      {
        id: 2,
        icon: 'fas fa-users',
        value: usersCount.rows[0]?.count || '0',
        label: 'Active Users',
        description: 'Currently active users',
        trend: '+12.5%',
        color: 'green'
      },
      {
        id: 3,
        icon: 'fas fa-hdd',
        value: `${Math.round((totalStorage.rows[0]?.total_storage || 0) / 1024 * 100) / 100}TB`,
        label: 'Storage Allocated',
        description: 'Total storage allocated',
        trend: '+5.8%',
        color: 'orange'
      },
      {
        id: 4,
        icon: 'fas fa-credit-card',
        value: activeSubscriptions.rows[0]?.count || '0',
        label: 'Active Subscriptions',
        description: 'Currently active subscriptions',
        trend: '+15.3%',
        color: 'purple'
      },
      {
        id: 5,
        icon: 'fas fa-file',
        value: documentsCount.rows[0]?.count || '0',
        label: 'Documents Stored',
        description: 'Total active documents',
        trend: '+10.2%',
        color: 'emerald'
      },
      {
        id: 6,
        icon: 'fas fa-exclamation-triangle',
        value: errorLogsCount.rows[0]?.count || '0',
        label: 'Errors (24h)',
        description: 'Errors in last 24 hours',
        trend: '-25%',
        color: 'red'
      }
    ];

    console.log('✅ System metrics retrieved successfully from database');
    res.json(metrics);
  } catch (error) {
    console.error('❌ Error fetching system metrics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch system metrics',
      message: error.message 
    });
  }
});

// Get activity logs with filters
router.get(
  "/activity-logs",
  authenticateToken,
  requireSuperAdmin,
  async (req, res) => {
    try {
      console.log('📋 Fetching activity logs with filters:', req.query);

      const { 
        page = 1, 
        limit = 10, 
        level,
        tenantId,
        userId,
        action,
        resource,
        startDate,
        endDate,
        search
      } = req.query;

      // Build query conditions
      const conditions = [];

      if (level) {
        conditions.push(sql`level = ${level}`);
      }

      if (tenantId) {
        conditions.push(sql`tenant_id = ${parseInt(tenantId)}`);
      }

      if (userId) {
        conditions.push(sql`user_id = ${userId}`);
      }

      if (action) {
        conditions.push(sql`action ILIKE ${`%${action}%`}`);
      }

      if (resource) {
        conditions.push(sql`resource ILIKE ${`%${resource}%`}`);
      }

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0); // Start of day
        conditions.push(sql`created_at >= ${start.toISOString()}`);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // End of day
        conditions.push(sql`created_at <= ${end.toISOString()}`);
      }

      if (search) {
        conditions.push(sql`(action ILIKE ${`%${search}%`} OR resource ILIKE ${`%${search}%`} OR details::text ILIKE ${`%${search}%`})`);
      }

      // Build the WHERE clause
      let whereClause = sql``;
      if (conditions.length > 0) {
        whereClause = sql`WHERE ${sql.join(conditions, sql` AND `)}`;
      }

      // Calculate offset
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Get total count
      const countQuery = sql`
        SELECT COUNT(*) as count 
        FROM activity_logs 
        ${whereClause}
      `;

      const totalResult = await db.execute(countQuery);
      const total = parseInt(totalResult.rows[0]?.count || 0);

      // Get activity logs with pagination
      const logsQuery = sql`
        SELECT 
          al.*,
          t.name as tenant_name,
          u.email as user_email,
          u.username as user_name
        FROM activity_logs al
        LEFT JOIN tenants t ON al.tenant_id = t.id
        LEFT JOIN users u ON al.user_id = u.id
        ${whereClause}
        ORDER BY al.created_at DESC
        LIMIT ${parseInt(limit)} OFFSET ${offset}
      `;

      const result = await db.execute(logsQuery);
      const logs = result.rows.map(log => ({
        id: log.id,
        tenantId: log.tenant_id,
        tenantName: log.tenant_name || 'Unknown Tenant',
        userId: log.user_id,
        userEmail: log.user_email || 'System',
        userName: log.user_name || 'System',
        action: log.action,
        resource: log.resource,
        resourceId: log.resource_id,
        level: log.level,
        details: log.details,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        timestamp: log.created_at,
        createdAt: log.created_at,

        // Frontend expects these fields
        errorType: log.action,
        affectedTenant: log.tenant_name || 'Unknown',
        message: typeof log.details === 'object' ? log.details?.message || log.action : log.details || log.action,
        severity: log.level
      }));

      const totalPages = Math.ceil(total / parseInt(limit));

      console.log(`✅ Retrieved ${logs.length} activity logs (page ${page}/${totalPages}, total: ${total})`);
      console.log(`🔍 Applied filters:`, { level, tenantId, userId, action, resource, startDate, endDate, search });

      res.json({
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        },
        filters: {
          level,
          tenantId,
          userId,
          action,
          resource,
          startDate,
          endDate,
          search
        }
      });

    } catch (error) {
      console.error('❌ Error fetching activity logs:', error);
      res.status(500).json({ 
        error: 'Failed to fetch activity logs',
        message: error.message 
      });
    }
  },
);

// Export activity logs
router.post(
  "/activity-logs/export",
  authenticateToken,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { filters = {} } = req.body;

      // Use the same mock data as the GET endpoint
      const mockLogs = [
        {
          id: "1",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          level: "error",
          action: "document_upload_failed",
          userId: null,
          tenantId: 1,
          tenantName: "SecureLife Insurance",
          ipAddress: "192.168.1.100",
          details: "File format not supported - .txt files are not allowed",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          id: "2",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          level: "error",
          action: "authentication_failed",
          userId: null,
          tenantId: 2,
          tenantName: "HealthGuard Corp",
          ipAddress: "10.0.0.15",
          details: "Failed login attempt for user: john.doe@healthguard.com",
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        },
        {
          id: "3",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          level: "warning",
          action: "storage_limit_exceeded",
          userId: "user_789",
          tenantId: 1,
          tenantName: "SecureLife Insurance",
          ipAddress: "192.168.1.105",
          details: "Tenant has used 4.5GB of 5GB allocated storage",
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        },
      ];

      // Apply filters
      let filteredLogs = mockLogs;

      if (filters.level) {
        filteredLogs = filteredLogs.filter(
          (log) => log.level === filters.level,
        );
      }

      if (filters.tenantId) {
        filteredLogs = filteredLogs.filter(
          (log) => log.tenantId === Number(filters.tenantId),
        );
      }

      if (filters.startDate) {
        const start = new Date(filters.startDate);
        filteredLogs = filteredLogs.filter((log) => log.createdAt >= start);
      }

      if (filters.endDate) {
        const end = new Date(filters.endDate);
        filteredLogs = filteredLogs.filter((log) => log.createdAt <= end);
      }

      // Convert to CSV format
      const csvHeader =
        "Timestamp,Level,Action,User ID,Tenant ID,Tenant Name,IP Address,Details\n";
      const csvData = filteredLogs
        .map(
          (log) =>
            `${log.timestamp},${log.level},${log.action},"${log.userId || ""}","${log.tenantId || ""}","${log.tenantName || ""}","${log.ipAddress || ""}","${(log.details || "").replace(/"/g, '""')}"`,
        )
        .join("\n");

      const csv = csvHeader + csvData;

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=activity_logs_${new Date().toISOString().split("T")[0]}.csv`,
      );
      res.send(csv);
    } catch (error) {
      console.error("Export activity logs error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to export activity logs",
      });
    }
  },
);

export default router;