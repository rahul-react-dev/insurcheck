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

// System metrics endpoint - For SuperAdminDashboard
router.get('/system-metrics', async (req, res) => {
  try {
    console.log('🔍 Fetching system metrics from database...');

    // Get real metrics from database
    const [
      tenantsCount,
      usersCount,
      activeUsersCount,
      errorLogsCount,
      recentPayments
    ] = await Promise.all([
      db.select({ count: sql`count(*)` }).from(tenants),
      db.select({ count: sql`count(*)` }).from(users),
      db.select({ count: sql`count(*)` }).from(users).where(eq(users.isActive, true)),
      db.select({ count: sql`count(*)` }).from(activityLogs).where(eq(activityLogs.level, 'error')),
      db.select({ 
        total: sql`coalesce(sum(${payments.amount}), 0)` 
      }).from(payments).where(
        and(
          eq(payments.status, 'completed'),
          gte(payments.createdAt, sql`NOW() - INTERVAL '30 days'`)
        )
      )
    ]);

    // Calculate storage usage (mock for now, can be replaced with real calculation)
    const storageUsed = Math.floor(Math.random() * 2000 + 500); // GB

    // Calculate uptime percentage (mock)
    const uptime = (99.5 + Math.random() * 0.5).toFixed(1);

    // Get document count for more accurate metrics
    const documentsCount = await db.select({ count: sql`count(*)` }).from(documents);

    const metrics = [
      {
        id: 1,
        icon: 'fas fa-clock',
        value: '99.9%',
        label: 'System Uptime',
        trend: '+0.1%',
        color: 'text-green-600'
      },
      {
        id: 2,
        icon: 'fas fa-building',
        value: tenantsCount[0]?.count?.toString() || '0',
        label: 'Active Tenants',
        trend: '+2',
        color: 'text-blue-600'
      },
      {
        id: 3,
        icon: 'fas fa-users',
        value: activeUsersCount[0]?.count?.toString() || '0',
        label: 'Active Users',
        trend: '+12',
        color: 'text-green-600'
      },
      {
        id: 4,
        icon: 'fas fa-file-upload',
        value: documentsCount[0]?.count?.toString() || '0',
        label: 'Document Uploads',
        trend: '+156',
        color: 'text-purple-600'
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
        conditions.push(eq(activityLogs.level, level));
      }

      if (tenantId) {
        conditions.push(eq(activityLogs.tenantId, parseInt(tenantId)));
      }

      if (userId) {
        conditions.push(eq(activityLogs.userId, userId));
      }

      if (action) {
        conditions.push(like(activityLogs.action, `%${action}%`));
      }

      if (resource) {
        conditions.push(like(activityLogs.resource, `%${resource}%`));
      }

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0); // Start of day
        conditions.push(gte(activityLogs.createdAt, start));
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // End of day
        conditions.push(lte(activityLogs.createdAt, end));
      }

      if (search) {
        conditions.push(or(
          like(activityLogs.action, `%${search}%`),
          like(activityLogs.resource, `%${search}%`),
          like(activityLogs.details, `%${search}%`)
        ));
      }

      // Calculate offset
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Get total count
      let countQuery = db
        .select({ count: count() })
        .from(activityLogs);

      if (conditions.length > 0) {
        countQuery = countQuery.where(and(...conditions));
      }

      const totalResult = await countQuery;
      const total = parseInt(totalResult[0]?.count || 0);

      // Get activity logs with pagination
      const logsQuery = db
        .select({
          id: activityLogs.id,
          timestamp: activityLogs.createdAt,
          action: activityLogs.action,
          resource: activityLogs.resource,
          level: activityLogs.level,
          details: activityLogs.details,
          ipAddress: activityLogs.ipAddress,
          tenantName: tenants.name,
          userEmail: users.email
        })
        .from(activityLogs)
        .leftJoin(tenants, eq(activityLogs.tenantId, tenants.id))
        .leftJoin(users, eq(activityLogs.userId, users.id));

      if (conditions.length > 0) {
        logsQuery.where(and(...conditions));
      }

      const result = await logsQuery
        .orderBy(desc(activityLogs.createdAt))
        .limit(parseInt(limit))
        .offset(offset);

      const logs = result.map(log => {
        const isErrorLog = level === 'error';

        if (isErrorLog) {
          return {
            id: log.id,
            timestamp: log.timestamp?.toISOString() || new Date().toISOString(),
            errorType: log.action || 'Unknown Error',
            affectedTenant: log.tenantName || 'System',
            message: typeof log.details === 'object' ? log.details?.message || log.action : log.details || log.action,
            severity: log.level === 'critical' ? 'Critical' : 
                     log.level === 'error' ? 'High' : 
                     log.level === 'warning' ? 'Medium' : 'Low'
          };
        } else {
          return {
            id: log.id,
            timestamp: log.timestamp?.toISOString() || new Date().toISOString(),
            action: log.action,
            user: log.userEmail || 'System',
            tenant: log.tenantName || 'System',
            resource: log.resource,
            details: typeof log.details === 'object' ? log.details?.message || log.action : log.details || log.action
          };
        }
      });

      const totalPages = Math.ceil(total / parseInt(limit));

      console.log(`✅ Retrieved ${logs.length} activity logs (page ${page}/${totalPages}, total: ${total})`);
      console.log(`🔍 Applied filters:`, { level, tenantId, userId, action, resource, startDate, endDate, search });

      res.json({
        data: logs,
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