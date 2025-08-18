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
        level = 'error',
        tenantId,
        tenantName,
        userId,
        action,
        errorType,
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

      // Handle tenantName filter - case insensitive search
      if (tenantName) {
        conditions.push(sql`${tenants.name} ILIKE ${'%' + tenantName + '%'}`);
      }

      // Handle errorType filter (maps to action field)
      if (errorType) {
        conditions.push(like(activityLogs.action, `%${errorType}%`));
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

      // Remove search functionality as requested - only use tenant name filter

      // Calculate offset
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Get total count with proper joins for filtering
      let countQuery = db
        .select({ count: count() })
        .from(activityLogs)
        .leftJoin(tenants, eq(activityLogs.tenantId, tenants.id))
        .leftJoin(users, eq(activityLogs.userId, users.id));

      if (conditions.length > 0) {
        countQuery = countQuery.where(and(...conditions));
      }

      const totalResult = await countQuery;
      const total = parseInt(totalResult[0]?.count || 0);

      // Get activity logs with pagination, including tenant and user info
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
          userEmail: users.email,
          userId: activityLogs.userId,
          tenantId: activityLogs.tenantId
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
            tenantName: log.tenantName || 'System',
            userEmail: log.userEmail || 'System',
            user: log.userEmail || 'System',
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
            user: log.userEmail || log.user || 'System', 
            userEmail: log.userEmail || log.user || 'System',
            tenant: log.tenantName || 'System',
            tenantName: log.tenantName || 'System',
            affectedTenant: log.tenantName || 'System',
            resource: log.resource,
            details: typeof log.details === 'object' ? log.details?.message || log.action : log.details || log.action
          };
        }
      });

      const totalPages = Math.ceil(total / parseInt(limit));

      console.log(`✅ Retrieved ${logs.length} activity logs (page ${page}/${totalPages}, total: ${total})`);
      console.log(`🔍 Applied filters:`, { level, tenantId, tenantName, userId, action, errorType, resource, startDate, endDate, search });

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
          tenantName,
          userId,
          action,
          errorType,
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

// ===================== TENANTS MANAGEMENT ROUTES =====================

// Get all tenants with filtering, pagination, and search
router.get('/tenants', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    console.log('📋 Fetching tenants with params:', req.query);
    
    const {
      page = 1,
      limit = 10,
      tenantName = '',
      status = '',
      subscriptionPlan = '',
      dateRange = {}
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where conditions
    const conditions = [];
    
    if (tenantName) {
      conditions.push(sql`LOWER(${tenants.name}) LIKE LOWER(${'%' + tenantName + '%'})`);
    }
    
    if (status) {
      conditions.push(eq(tenants.status, status));
    }
    
    if (subscriptionPlan) {
      conditions.push(sql`EXISTS (
        SELECT 1 FROM ${subscriptions} s 
        JOIN ${subscriptionPlans} sp ON s.plan_id = sp.id 
        WHERE s.tenant_id = ${tenants.id} 
        AND sp.name = ${subscriptionPlan}
        AND s.status = 'active'
      )`);
    }
    
    if (dateRange.start) {
      conditions.push(gte(tenants.createdAt, new Date(dateRange.start)));
    }
    
    if (dateRange.end) {
      conditions.push(lte(tenants.createdAt, new Date(dateRange.end)));
    }

    // Execute queries
    const [tenantsData, totalCount, statusCounts] = await Promise.all([
      // Get paginated tenants with subscription info
      db.select({
        id: tenants.id,
        name: tenants.name,
        email: tenants.email,
        status: tenants.status,
        createdAt: tenants.createdAt,
        updatedAt: tenants.updatedAt,
        subscriptionPlan: subscriptionPlans.name,
        subscriptionStatus: subscriptions.status
      })
      .from(tenants)
      .leftJoin(subscriptions, and(
        eq(subscriptions.tenantId, tenants.id),
        eq(subscriptions.status, 'active')
      ))
      .leftJoin(subscriptionPlans, eq(subscriptionPlans.id, subscriptions.planId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(tenants.createdAt))
      .limit(parseInt(limit))
      .offset(offset),
      
      // Get total count
      db.select({ count: count() })
        .from(tenants)
        .where(conditions.length > 0 ? and(...conditions) : undefined),
      
      // Get status counts
      db.select({
        status: tenants.status,
        count: count()
      })
      .from(tenants)
      .groupBy(tenants.status)
    ]);

    const total = totalCount[0]?.count || 0;
    const totalPages = Math.ceil(total / parseInt(limit));
    
    // Format status counts
    const statusCountsFormatted = statusCounts.reduce((acc, item) => {
      acc[item.status] = item.count;
      return acc;
    }, { active: 0, suspended: 0, unverified: 0, locked: 0, deactivated: 0 });

    console.log(`✅ Retrieved ${tenantsData.length} tenants (page ${page}/${totalPages}, total: ${total})`);
    
    res.json({
      tenants: tenantsData,
      summary: {
        totalTenants: total,
        statusCounts: statusCountsFormatted
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('❌ Error fetching tenants:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tenants',
      message: error.message 
    });
  }
});

// Get subscription plans
router.get('/subscription-plans', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    console.log('📋 Fetching subscription plans');
    
    const plans = await db.select()
      .from(subscriptionPlans)
      .orderBy(subscriptionPlans.name);
    
    console.log(`✅ Retrieved ${plans.length} subscription plans`);
    res.json(plans);
  } catch (error) {
    console.error('❌ Error fetching subscription plans:', error);
    res.status(500).json({ 
      error: 'Failed to fetch subscription plans',
      message: error.message 
    });
  }
});

// Create new tenant
router.post('/tenants', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    console.log('➕ Creating new tenant:', req.body);
    
    const { name, email, status = 'unverified' } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Name and email are required'
      });
    }

    // Check if tenant already exists
    const existingTenant = await db.select()
      .from(tenants)
      .where(eq(tenants.email, email))
      .limit(1);
    
    if (existingTenant.length > 0) {
      return res.status(409).json({
        error: 'Tenant already exists',
        message: 'A tenant with this email already exists'
      });
    }

    const [newTenant] = await db.insert(tenants)
      .values({
        name,
        email,
        status,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    console.log('✅ Tenant created successfully:', newTenant);
    res.status(201).json(newTenant);
  } catch (error) {
    console.error('❌ Error creating tenant:', error);
    res.status(500).json({ 
      error: 'Failed to create tenant',
      message: error.message 
    });
  }
});

// Update tenant
router.put('/tenants/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const tenantId = parseInt(req.params.id);
    console.log(`📝 Updating tenant ${tenantId}:`, req.body);
    
    const { name, email, status } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Name and email are required'
      });
    }

    // Check if tenant exists
    const existingTenant = await db.select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);
    
    if (existingTenant.length === 0) {
      return res.status(404).json({
        error: 'Tenant not found',
        message: 'Tenant does not exist'
      });
    }

    // Check if email is taken by another tenant
    if (email !== existingTenant[0].email) {
      const emailCheck = await db.select()
        .from(tenants)
        .where(and(
          eq(tenants.email, email),
          sql`${tenants.id} != ${tenantId}`
        ))
        .limit(1);
      
      if (emailCheck.length > 0) {
        return res.status(409).json({
          error: 'Email already taken',
          message: 'Another tenant already uses this email'
        });
      }
    }

    const [updatedTenant] = await db.update(tenants)
      .set({
        name,
        email,
        status,
        updatedAt: new Date()
      })
      .where(eq(tenants.id, tenantId))
      .returning();

    console.log('✅ Tenant updated successfully:', updatedTenant);
    res.json(updatedTenant);
  } catch (error) {
    console.error('❌ Error updating tenant:', error);
    res.status(500).json({ 
      error: 'Failed to update tenant',
      message: error.message 
    });
  }
});

// Delete tenant
router.delete('/tenants/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const tenantId = parseInt(req.params.id);
    console.log(`🗑️ Deleting tenant ${tenantId}`);
    
    // Check if tenant exists
    const existingTenant = await db.select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);
    
    if (existingTenant.length === 0) {
      return res.status(404).json({
        error: 'Tenant not found',
        message: 'Tenant does not exist'
      });
    }

    // Delete related data first (cascade delete)
    await Promise.all([
      db.delete(subscriptions).where(eq(subscriptions.tenantId, tenantId)),
      db.delete(users).where(eq(users.tenantId, tenantId)),
      db.delete(documents).where(eq(documents.tenantId, tenantId)),
      db.delete(payments).where(eq(payments.tenantId, tenantId)),
      db.delete(activityLogs).where(eq(activityLogs.tenantId, tenantId))
    ]);

    // Delete the tenant
    await db.delete(tenants).where(eq(tenants.id, tenantId));

    console.log('✅ Tenant deleted successfully');
    res.json({ 
      message: 'Tenant deleted successfully',
      deletedTenantId: tenantId 
    });
  } catch (error) {
    console.error('❌ Error deleting tenant:', error);
    res.status(500).json({ 
      error: 'Failed to delete tenant',
      message: error.message 
    });
  }
});

// Get tenant users
router.get('/tenants/:id/users', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const tenantId = parseInt(req.params.id);
    console.log(`👥 Fetching users for tenant ${tenantId}`);
    
    // Check if tenant exists
    const tenant = await db.select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);
    
    if (tenant.length === 0) {
      return res.status(404).json({
        error: 'Tenant not found',
        message: 'Tenant does not exist'
      });
    }

    const tenantUsers = await db.select({
      id: users.id,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      lastLogin: users.lastLogin,
      createdAt: users.createdAt
    })
    .from(users)
    .where(eq(users.tenantId, tenantId))
    .orderBy(desc(users.createdAt));

    console.log(`✅ Retrieved ${tenantUsers.length} users for tenant ${tenantId}`);
    res.json(tenantUsers);
  } catch (error) {
    console.error('❌ Error fetching tenant users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tenant users',
      message: error.message 
    });
  }
});

export default router;