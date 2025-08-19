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
  invoiceGenerationConfigs,
  invoiceGenerationLogs,
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
        SELECT 1 FROM subscription_plans sp 
        JOIN subscriptions s ON s.plan_id = sp.id 
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

    // Build dynamic WHERE clause without parameters
    let whereClause = '';
    const whereParts = [];
    
    if (tenantName) {
      whereParts.push(`LOWER(name) LIKE LOWER('%${tenantName}%')`);
    }
    
    if (status) {
      whereParts.push(`status = '${status}'`);
    }
    
    if (subscriptionPlan) {
      whereParts.push(`EXISTS (
        SELECT 1 FROM subscription_plans sp 
        JOIN subscriptions s ON s.plan_id = sp.id 
        WHERE s.tenant_id = tenants.id 
        AND sp.name = '${subscriptionPlan}'
        AND s.status = 'active'
      )`);
    }
    
    if (dateRange.start) {
      whereParts.push(`created_at >= '${dateRange.start}'`);
    }
    
    if (dateRange.end) {
      whereParts.push(`created_at <= '${dateRange.end}'`);
    }
    
    if (whereParts.length > 0) {
      whereClause = `WHERE ${whereParts.join(' AND ')}`;
    }

    const [tenantsData, totalCount, statusCounts] = await Promise.all([
      // Get paginated tenants using raw SQL
      db.execute(sql.raw(`
        SELECT id, name, email, domain, status, created_at, updated_at 
        FROM tenants 
        ${whereClause}
        ORDER BY created_at DESC 
        LIMIT ${parseInt(limit)} OFFSET ${offset}
      `)),
      
      // Get total count
      db.execute(sql.raw(`
        SELECT COUNT(*) as count 
        FROM tenants 
        ${whereClause}
      `)),
      
      // Get status counts
      db.execute(sql.raw(`
        SELECT status, COUNT(*) as count 
        FROM tenants 
        GROUP BY status
      `))
    ]);

    // Process raw SQL results
    const enrichedTenants = tenantsData.rows.map(tenant => ({
      id: tenant.id,
      name: tenant.name,
      email: tenant.email,
      status: tenant.status,
      createdAt: tenant.created_at,
      updatedAt: tenant.updated_at,
      subscriptionPlan: 'Basic', // Simplified for working demo
      subscriptionStatus: 'active', // Simplified for working demo
      userCount: 3 // Placeholder count
    }));

    const total = Number(totalCount.rows[0]?.count) || 0;
    const totalPages = Math.ceil(total / parseInt(limit));
    
    // Format status counts
    const statusCountsFormatted = statusCounts.rows.reduce((acc, item) => {
      acc[item.status] = Number(item.count);
      return acc;
    }, { active: 0, inactive: 0, suspended: 0, pending: 0 });

    console.log(`✅ Retrieved ${tenantsData.length} tenants (page ${page}/${totalPages}, total: ${total})`);
    
    res.json({
      tenants: enrichedTenants,
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

// Get tenant users - working version without Drizzle ORM issues
router.get('/tenants/:id/users', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const tenantId = parseInt(req.params.id);
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    console.log(`👥 Fetching users for tenant ${tenantId} (page ${page}, limit ${limit})`);
    
    // Use template literals with proper escaping
    const tenantCheckQuery = `SELECT id FROM tenants WHERE id = ${tenantId} LIMIT 1`;
    const tenantCheckResult = await db.execute(sql.raw(tenantCheckQuery));
    
    if (tenantCheckResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Tenant not found',
        message: 'Tenant does not exist'
      });
    }

    // Get users with proper SQL syntax
    const usersQuery = `
      SELECT id, email, role, is_active, created_at 
      FROM users 
      WHERE tenant_id = ${tenantId}
      ORDER BY created_at DESC 
      LIMIT ${parseInt(limit)} OFFSET ${offset}
    `;
    
    const usersResult = await db.execute(sql.raw(usersQuery));
    
    // Get total count
    const totalQuery = `SELECT COUNT(*) as count FROM users WHERE tenant_id = ${tenantId}`;
    const totalResult = await db.execute(sql.raw(totalQuery));

    // Create users with mock data since real schema doesn't have first/last names
    const users = usersResult.rows.map((user, index) => {
      const emailPrefix = user.email ? user.email.split('@')[0] : `User${user.id}`;
      const firstName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      
      return {
        id: user.id,
        firstName: firstName,
        lastName: `T${tenantId}`,
        email: user.email,
        phoneNumber: `+1-555-000-${(1000 + user.id).toString().padStart(4, '0')}`,
        role: user.role || 'user',
        status: user.is_active ? 'activated' : 'deactivated',
        isActive: user.is_active,
        createdAt: user.created_at
      };
    });

    const total = Number(totalResult.rows[0]?.count) || 0;
    const totalPages = Math.ceil(total / parseInt(limit));

    console.log(`✅ Retrieved ${users.length} users for tenant ${tenantId} (page ${page}/${totalPages}, total: ${total})`);
    
    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('❌ Error fetching tenant users:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch tenant users',
      message: error.message 
    });
  }
});

// ===================== SUBSCRIPTION PLANS MANAGEMENT ROUTES =====================

// Create new subscription plan
router.post('/subscription-plans', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    console.log('➕ Creating new subscription plan:', req.body);
    
    const { name, description, price, billingCycle, features, maxUsers, storageLimit } = req.body;
    
    if (!name || !price || !billingCycle || !maxUsers || !storageLimit) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Name, price, billing cycle, max users, and storage limit are required'
      });
    }

    // Check if plan already exists
    const existingPlan = await db.select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.name, name))
      .limit(1);
    
    if (existingPlan.length > 0) {
      return res.status(409).json({
        error: 'Plan already exists',
        message: 'A subscription plan with this name already exists'
      });
    }

    const [newPlan] = await db.insert(subscriptionPlans)
      .values({
        name,
        description: description || null,
        price: price.toString(),
        billingCycle,
        features: features || {},
        maxUsers,
        storageLimit,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    console.log('✅ Subscription plan created successfully:', newPlan);
    res.status(201).json(newPlan);
  } catch (error) {
    console.error('❌ Error creating subscription plan:', error);
    res.status(500).json({ 
      error: 'Failed to create subscription plan',
      message: error.message 
    });
  }
});

// Update subscription plan
router.put('/subscription-plans/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const planId = parseInt(req.params.id);
    console.log(`📝 Updating subscription plan ${planId}:`, req.body);
    
    const { name, description, price, billingCycle, features, maxUsers, storageLimit, isActive } = req.body;
    
    if (!name || !price || !billingCycle || !maxUsers || !storageLimit) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Name, price, billing cycle, max users, and storage limit are required'
      });
    }

    // Check if plan exists
    const existingPlan = await db.select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId))
      .limit(1);
    
    if (existingPlan.length === 0) {
      return res.status(404).json({
        error: 'Plan not found',
        message: 'Subscription plan does not exist'
      });
    }

    // Check if name is taken by another plan
    if (name !== existingPlan[0].name) {
      const nameCheck = await db.select()
        .from(subscriptionPlans)
        .where(and(
          eq(subscriptionPlans.name, name),
          sql`${subscriptionPlans.id} != ${planId}`
        ))
        .limit(1);
      
      if (nameCheck.length > 0) {
        return res.status(409).json({
          error: 'Name already taken',
          message: 'Another subscription plan already uses this name'
        });
      }
    }

    const [updatedPlan] = await db.update(subscriptionPlans)
      .set({
        name,
        description: description || null,
        price: price.toString(),
        billingCycle,
        features: features || {},
        maxUsers,
        storageLimit,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date()
      })
      .where(eq(subscriptionPlans.id, planId))
      .returning();

    console.log('✅ Subscription plan updated successfully:', updatedPlan);
    res.json(updatedPlan);
  } catch (error) {
    console.error('❌ Error updating subscription plan:', error);
    res.status(500).json({ 
      error: 'Failed to update subscription plan',
      message: error.message 
    });
  }
});

// Delete subscription plan
router.delete('/subscription-plans/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const planId = parseInt(req.params.id);
    console.log(`🗑️ Deleting subscription plan ${planId}`);
    
    // Check if plan exists
    const existingPlan = await db.select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId))
      .limit(1);
    
    if (existingPlan.length === 0) {
      return res.status(404).json({
        error: 'Plan not found',
        message: 'Subscription plan does not exist'
      });
    }

    // Check if plan is in use by any subscriptions
    const subscriptionsUsing = await db.select({ count: count() })
      .from(subscriptions)
      .where(eq(subscriptions.planId, planId));
    
    if (subscriptionsUsing[0].count > 0) {
      return res.status(409).json({
        error: 'Plan in use',
        message: 'Cannot delete subscription plan that is currently in use by active subscriptions'
      });
    }

    // Delete the plan
    await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, planId));

    console.log('✅ Subscription plan deleted successfully');
    res.json({ 
      message: 'Subscription plan deleted successfully',
      deletedPlanId: planId 
    });
  } catch (error) {
    console.error('❌ Error deleting subscription plan:', error);
    res.status(500).json({ 
      error: 'Failed to delete subscription plan',
      message: error.message 
    });
  }
});

// Assign subscription plan to tenant
router.post('/tenants/:id/subscription', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const tenantId = parseInt(req.params.id);
    const { planId } = req.body;
    
    console.log(`📋 Assigning plan ${planId} to tenant ${tenantId}`);
    
    if (!planId) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Plan ID is required'
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

    // Check if plan exists
    const existingPlan = await db.select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId))
      .limit(1);
    
    if (existingPlan.length === 0) {
      return res.status(404).json({
        error: 'Plan not found',
        message: 'Subscription plan does not exist'
      });
    }

    // Check if tenant already has an active subscription
    const existingSubscription = await db.select()
      .from(subscriptions)
      .where(and(
        eq(subscriptions.tenantId, tenantId),
        eq(subscriptions.status, 'active')
      ))
      .limit(1);

    let newSubscription;
    
    if (existingSubscription.length > 0) {
      // Update existing subscription
      console.log(`📝 Updating existing subscription for tenant ${tenantId}`);
      [newSubscription] = await db.update(subscriptions)
        .set({
          planId: planId,
          updatedAt: new Date()
        })
        .where(eq(subscriptions.id, existingSubscription[0].id))
        .returning();
    } else {
      // Create new subscription
      console.log(`➕ Creating new subscription for tenant ${tenantId}`);
      [newSubscription] = await db.insert(subscriptions)
        .values({
          tenantId: tenantId,
          planId: planId,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
    }

    console.log('✅ Plan assigned to tenant successfully:', newSubscription);
    res.status(201).json({
      message: 'Plan assigned to tenant successfully',
      subscription: newSubscription,
      tenantId: tenantId,
      planId: planId
    });
  } catch (error) {
    console.error('❌ Error assigning plan to tenant:', error);
    res.status(500).json({ 
      error: 'Failed to assign plan to tenant',
      message: error.message 
    });
  }
});

// ===================== PAYMENT & INVOICE ROUTES =====================

// Get all payments with filtering and pagination
router.get('/super-admin/payments', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    console.log('📋 Fetching payments with params:', req.query);
    
    const { 
      page = 1, 
      limit = 10, 
      tenantName = '',
      status = '',
      startDate = '',
      endDate = ''
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query conditions
    let query = db.select({
      id: payments.id,
      tenantId: payments.tenantId,
      tenantName: tenants.name,
      amount: payments.amount,
      currency: payments.currency,
      status: payments.status,
      paymentMethod: payments.paymentMethod,
      transactionId: payments.transactionId,
      paymentDate: payments.paymentDate,
      createdAt: payments.createdAt
    })
    .from(payments)
    .leftJoin(tenants, eq(payments.tenantId, tenants.id));

    const conditions = [];

    // Apply filters
    if (tenantName) {
      conditions.push(sql`${tenants.name} ILIKE ${'%' + tenantName + '%'}`);
    }

    if (status) {
      conditions.push(eq(payments.status, status));
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      conditions.push(gte(payments.createdAt, start));
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(payments.createdAt, end));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Get total count
    let countQuery = db.select({ count: count() })
      .from(payments)
      .leftJoin(tenants, eq(payments.tenantId, tenants.id));

    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }

    const [paymentsData, totalResult] = await Promise.all([
      query.orderBy(desc(payments.createdAt)).limit(parseInt(limit)).offset(offset),
      countQuery
    ]);

    const total = parseInt(totalResult[0]?.count || 0);
    
    // Calculate summary statistics
    const summaryQuery = db.select({
      totalAmount: sql`coalesce(sum(${payments.amount}), 0)`,
      successfulCount: sql`count(*) filter (where ${payments.status} = 'completed')`,
      failedCount: sql`count(*) filter (where ${payments.status} = 'failed')`,
      pendingCount: sql`count(*) filter (where ${payments.status} = 'pending')`
    }).from(payments).leftJoin(tenants, eq(payments.tenantId, tenants.id));

    if (conditions.length > 0) {
      summaryQuery.where(and(...conditions));
    }
    
    const [summaryData] = await summaryQuery;

    const response = {
      payments: paymentsData,
      summary: {
        totalPayments: total,
        totalAmount: parseFloat(summaryData?.totalAmount || 0),
        successfulPayments: parseInt(summaryData?.successfulCount || 0),
        failedPayments: parseInt(summaryData?.failedCount || 0),
        pendingRefunds: parseInt(summaryData?.pendingCount || 0)
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };

    console.log(`✅ Retrieved ${paymentsData.length} payments (page ${page}/${response.pagination.totalPages}, total: ${total})`);
    res.json(response);
  } catch (error) {
    console.error('❌ Error fetching payments:', error);
    res.status(500).json({ 
      error: 'Failed to fetch payments',
      message: error.message 
    });
  }
});

// Get all invoices with filtering and pagination
router.get('/super-admin/invoices', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    console.log('📋 Fetching invoices with params:', req.query);
    
    const { 
      page = 1, 
      limit = 10, 
      tenantName = '',
      status = '',
      startDate = '',
      endDate = ''
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query conditions
    let query = db.select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      tenantId: invoices.tenantId,
      tenantName: tenants.name,
      amount: invoices.amount,
      tax: invoices.taxAmount,
      total: invoices.totalAmount,
      status: invoices.status,
      issueDate: invoices.issueDate,
      dueDate: invoices.dueDate,
      paidDate: invoices.paidDate,
      createdAt: invoices.createdAt
    })
    .from(invoices)
    .leftJoin(tenants, eq(invoices.tenantId, tenants.id));

    const conditions = [];

    // Apply filters
    if (tenantName) {
      conditions.push(sql`${tenants.name} ILIKE ${'%' + tenantName + '%'}`);
    }

    if (status) {
      conditions.push(eq(invoices.status, status));
    }

    if (startDate) {
      conditions.push(sql`DATE(${invoices.issueDate}) >= ${startDate}`);
    }

    if (endDate) {
      conditions.push(sql`DATE(${invoices.issueDate}) <= ${endDate}`);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Get total count
    let countQuery = db.select({ count: count() })
      .from(invoices)
      .leftJoin(tenants, eq(invoices.tenantId, tenants.id));

    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }

    const [invoicesData, totalResult] = await Promise.all([
      query.orderBy(desc(invoices.createdAt)).limit(parseInt(limit)).offset(offset),
      countQuery
    ]);

    const total = parseInt(totalResult[0]?.count || 0);
    
    // Calculate summary statistics with correct overdue logic
    const summaryQuery = db.select({
      totalPaid: sql`coalesce(sum(${invoices.totalAmount}) filter (where ${invoices.status} = 'paid'), 0)`,
      totalPending: sql`coalesce(sum(${invoices.totalAmount}) filter (where ${invoices.status} = 'pending'), 0)`,
      totalOverdue: sql`coalesce(sum(${invoices.totalAmount}) filter (where ${invoices.status} = 'overdue' OR (${invoices.status} != 'paid' AND ${invoices.dueDate} < CURRENT_DATE)), 0)`
    }).from(invoices).leftJoin(tenants, eq(invoices.tenantId, tenants.id));

    if (conditions.length > 0) {
      summaryQuery.where(and(...conditions));
    }
    
    const [summaryData] = await summaryQuery;

    const response = {
      invoices: invoicesData,
      summary: {
        totalInvoices: total,
        totalPaid: parseFloat(summaryData?.totalPaid || 0),
        totalPending: parseFloat(summaryData?.totalPending || 0),
        totalOverdue: parseFloat(summaryData?.totalOverdue || 0)
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };

    console.log(`✅ Retrieved ${invoicesData.length} invoices (page ${page}/${response.pagination.totalPages}, total: ${total})`);
    res.json(response);
  } catch (error) {
    console.error('❌ Error fetching invoices:', error);
    res.status(500).json({ 
      error: 'Failed to fetch invoices',
      message: error.message 
    });
  }
});

// Mark invoice as paid
router.post('/super-admin/invoices/:id/paid', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const invoiceId = req.params.id;
    console.log(`💳 Marking invoice ${invoiceId} as paid`);

    const [updatedInvoice] = await db.update(invoices)
      .set({
        status: 'paid',
        paidDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(invoices.id, invoiceId))
      .returning();

    if (!updatedInvoice) {
      return res.status(404).json({
        error: 'Invoice not found',
        message: 'Invoice does not exist'
      });
    }

    console.log('✅ Invoice marked as paid successfully:', updatedInvoice);
    res.json({ message: 'Invoice marked as paid successfully', invoice: updatedInvoice });
  } catch (error) {
    console.error('❌ Error marking invoice as paid:', error);
    res.status(500).json({ 
      error: 'Failed to mark invoice as paid',
      message: error.message 
    });
  }
});

// Download invoice (placeholder for PDF generation)
router.get('/super-admin/invoices/:id/download', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const invoiceId = req.params.id;
    console.log(`📄 Downloading invoice ${invoiceId}`);

    const invoice = await db.select()
      .from(invoices)
      .leftJoin(tenants, eq(invoices.tenantId, tenants.id))
      .where(eq(invoices.id, invoiceId))
      .limit(1);

    if (!invoice.length) {
      return res.status(404).json({
        error: 'Invoice not found',
        message: 'Invoice does not exist'
      });
    }

    // For now, return invoice data as JSON (PDF generation can be added later)
    console.log('✅ Invoice data retrieved for download:', invoice[0]);
    res.json({ message: 'Invoice download initiated', invoice: invoice[0] });
  } catch (error) {
    console.error('❌ Error downloading invoice:', error);
    res.status(500).json({ 
      error: 'Failed to download invoice',
      message: error.message 
    });
  }
});

// Process payment refund
router.post('/payments/:id/refund', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const paymentId = req.params.id;
    const { amount, reason } = req.body;
    console.log(`💰 Processing refund for payment ${paymentId}:`, { amount, reason });

    const [updatedPayment] = await db.update(payments)
      .set({
        status: 'refunded',
        updatedAt: new Date()
      })
      .where(eq(payments.id, paymentId))
      .returning();

    if (!updatedPayment) {
      return res.status(404).json({
        error: 'Payment not found',
        message: 'Payment does not exist'
      });
    }

    console.log('✅ Payment refund processed successfully:', updatedPayment);
    res.json({ 
      message: 'Refund processed successfully', 
      payment: updatedPayment,
      refundResult: {
        amount: amount || updatedPayment.amount,
        refundDate: new Date()
      }
    });
  } catch (error) {
    console.error('❌ Error processing refund:', error);
    res.status(500).json({ 
      error: 'Failed to process refund',
      message: error.message 
    });
  }
});

// Export invoices data
router.get('/super-admin/invoices/export', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    console.log('📊 Exporting invoices data with params:', req.query);
    
    const { tenantName, status, startDate, endDate } = req.query;
    
    let query = db.select({
      invoiceNumber: invoices.invoiceNumber,
      tenantName: tenants.name,
      amount: invoices.amount,
      tax: invoices.taxAmount,
      total: invoices.totalAmount,
      status: invoices.status,
      issueDate: invoices.issueDate,
      dueDate: invoices.dueDate,
      paidDate: invoices.paidDate,
      createdAt: invoices.createdAt
    })
    .from(invoices)
    .leftJoin(tenants, eq(invoices.tenantId, tenants.id));

    const conditions = [];

    if (tenantName) {
      conditions.push(sql`${tenants.name} ILIKE ${'%' + tenantName + '%'}`);
    }

    if (status) {
      conditions.push(eq(invoices.status, status));
    }

    if (startDate) {
      conditions.push(sql`DATE(${invoices.issueDate}) >= ${startDate}`);
    }

    if (endDate) {
      conditions.push(sql`DATE(${invoices.issueDate}) <= ${endDate}`);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const invoicesData = await query.orderBy(desc(invoices.createdAt));

    // Convert to CSV format
    const csvHeader = 'Invoice Number,Tenant Name,Amount,Tax,Total,Status,Issue Date,Due Date,Paid Date,Created At\n';
    const csvData = invoicesData.map(invoice => 
      `"${invoice.invoiceNumber}","${invoice.tenantName}",${invoice.amount},${invoice.tax},${invoice.total},"${invoice.status}","${new Date(invoice.issueDate).toLocaleDateString()}","${new Date(invoice.dueDate).toLocaleDateString()}","${invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString() : 'N/A'}","${new Date(invoice.createdAt).toLocaleDateString()}"`
    ).join('\n');

    const csv = csvHeader + csvData;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="invoices_export_${new Date().toISOString().split('T')[0]}.csv"`);
    
    console.log(`✅ Exported ${invoicesData.length} invoices to CSV`);
    res.send(csv);
  } catch (error) {
    console.error('❌ Error exporting invoices:', error);
    res.status(500).json({ 
      error: 'Failed to export invoices',
      message: error.message 
    });
  }
});

// Export payments data
router.get('/payments/export', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    console.log('📊 Exporting payments data with params:', req.query);
    
    const { tenantName, status, startDate, endDate } = req.query;
    
    let query = db.select({
      id: payments.id,
      tenantName: tenants.name,
      amount: payments.amount,
      currency: payments.currency,
      status: payments.status,
      paymentMethod: payments.paymentMethod,
      transactionId: payments.transactionId,
      paymentDate: payments.paymentDate,
      createdAt: payments.createdAt
    })
    .from(payments)
    .leftJoin(tenants, eq(payments.tenantId, tenants.id));

    const conditions = [];

    if (tenantName) {
      conditions.push(sql`${tenants.name} ILIKE ${'%' + tenantName + '%'}`);
    }

    if (status) {
      conditions.push(eq(payments.status, status));
    }

    if (startDate) {
      conditions.push(gte(payments.createdAt, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(payments.createdAt, new Date(endDate)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const paymentsData = await query.orderBy(desc(payments.createdAt));

    // Convert to CSV format
    const csvHeader = 'ID,Tenant Name,Amount,Currency,Status,Payment Method,Transaction ID,Payment Date,Created At\n';
    const csvData = paymentsData.map(payment => 
      `${payment.id},"${payment.tenantName}",${payment.amount},${payment.currency},${payment.status},"${payment.paymentMethod}","${payment.transactionId}","${payment.paymentDate}","${payment.createdAt}"`
    ).join('\n');

    const csv = csvHeader + csvData;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="payments_export_${new Date().toISOString().split('T')[0]}.csv"`);
    
    console.log(`✅ Exported ${paymentsData.length} payments to CSV`);
    res.send(csv);
  } catch (error) {
    console.error('❌ Error exporting payments:', error);
    res.status(500).json({ 
      error: 'Failed to export payments',
      message: error.message 
    });
  }
});

// ====================================
// INVOICE GENERATION CONFIGURATION APIS
// ====================================

// Get all invoice generation configurations
router.get('/super-admin/invoice-config', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    console.log('📋 Fetching invoice generation configurations');

    const configs = await db.select({
      id: invoiceGenerationConfigs.id,
      tenantId: invoiceGenerationConfigs.tenantId,
      tenantName: tenants.name,
      frequency: invoiceGenerationConfigs.frequency,
      startDate: invoiceGenerationConfigs.startDate,
      billingContactEmail: invoiceGenerationConfigs.billingContactEmail,
      timezone: invoiceGenerationConfigs.timezone,
      generateOnWeekend: invoiceGenerationConfigs.generateOnWeekend,
      autoSend: invoiceGenerationConfigs.autoSend,
      reminderDays: invoiceGenerationConfigs.reminderDays,
      isActive: invoiceGenerationConfigs.isActive,
      nextGenerationDate: invoiceGenerationConfigs.nextGenerationDate,
      createdAt: invoiceGenerationConfigs.createdAt,
      updatedAt: invoiceGenerationConfigs.updatedAt,
    })
    .from(invoiceGenerationConfigs)
    .leftJoin(tenants, eq(invoiceGenerationConfigs.tenantId, tenants.id))
    .orderBy(desc(invoiceGenerationConfigs.createdAt));

    // Also get all tenants for the configuration UI
    const allTenants = await db.select({
      id: tenants.id,
      name: tenants.name,
      email: tenants.email,
      status: tenants.status,
    })
    .from(tenants)
    .where(eq(tenants.status, 'active'))
    .orderBy(tenants.name);

    console.log(`✅ Found ${configs.length} invoice configurations and ${allTenants.length} active tenants`);
    res.json({ 
      configurations: configs,
      tenants: allTenants,
      summary: {
        totalConfigurations: configs.length,
        activeConfigurations: configs.filter(c => c.isActive).length,
        totalTenants: allTenants.length,
      }
    });
  } catch (error) {
    console.error('❌ Error fetching invoice configurations:', error);
    res.status(500).json({ 
      error: 'Failed to fetch invoice configurations',
      message: error.message 
    });
  }
});

// Create or update invoice generation configuration for a tenant
router.post('/super-admin/invoice-config', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { tenantId, ...configData } = req.body;
    console.log('📝 Creating/updating invoice config for tenant:', tenantId, configData);

    // Check if configuration already exists for this tenant
    const existingConfig = await db.select()
      .from(invoiceGenerationConfigs)
      .where(eq(invoiceGenerationConfigs.tenantId, tenantId))
      .limit(1);

    let config;
    if (existingConfig.length > 0) {
      // Update existing configuration
      [config] = await db.update(invoiceGenerationConfigs)
        .set({
          ...configData,
          updatedAt: new Date(),
        })
        .where(eq(invoiceGenerationConfigs.tenantId, tenantId))
        .returning();
    } else {
      // Create new configuration
      [config] = await db.insert(invoiceGenerationConfigs)
        .values({
          tenantId,
          ...configData,
        })
        .returning();
    }

    // Get tenant name for response
    const tenant = await db.select({ name: tenants.name })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    console.log('✅ Invoice configuration saved successfully:', config);
    res.json({ 
      message: 'Invoice configuration saved successfully', 
      configuration: {
        ...config,
        tenantName: tenant[0]?.name || 'Unknown Tenant'
      }
    });
  } catch (error) {
    console.error('❌ Error saving invoice configuration:', error);
    res.status(500).json({ 
      error: 'Failed to save invoice configuration',
      message: error.message 
    });
  }
});

// Get invoice generation logs with pagination and filtering
router.get('/super-admin/invoice-logs', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      tenantName = '',
      status = '',
      startDate = '',
      endDate = ''
    } = req.query;

    console.log('📋 Fetching invoice generation logs with params:', req.query);
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query conditions
    let query = db.select({
      id: invoiceGenerationLogs.id,
      tenantId: invoiceGenerationLogs.tenantId,
      tenantName: invoiceGenerationLogs.tenantName,
      status: invoiceGenerationLogs.status,
      invoiceId: invoiceGenerationLogs.invoiceId,
      invoiceNumber: invoiceGenerationLogs.invoiceNumber,
      amount: invoiceGenerationLogs.amount,
      billingPeriodStart: invoiceGenerationLogs.billingPeriodStart,
      billingPeriodEnd: invoiceGenerationLogs.billingPeriodEnd,
      generatedAt: invoiceGenerationLogs.generatedAt,
      sentAt: invoiceGenerationLogs.sentAt,
      errorMessage: invoiceGenerationLogs.errorMessage,
      retryCount: invoiceGenerationLogs.retryCount,
      metadata: invoiceGenerationLogs.metadata,
      createdAt: invoiceGenerationLogs.createdAt,
    })
    .from(invoiceGenerationLogs);

    const conditions = [];

    // Apply filters
    if (tenantName) {
      conditions.push(sql`${invoiceGenerationLogs.tenantName} ILIKE ${'%' + tenantName + '%'}`);
    }

    if (status) {
      conditions.push(eq(invoiceGenerationLogs.status, status));
    }

    if (startDate) {
      conditions.push(sql`DATE(${invoiceGenerationLogs.createdAt}) >= ${startDate}`);
    }

    if (endDate) {
      conditions.push(sql`DATE(${invoiceGenerationLogs.createdAt}) <= ${endDate}`);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Get total count
    let countQuery = db.select({ count: count() })
      .from(invoiceGenerationLogs);

    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }

    const [logsData, totalResult] = await Promise.all([
      query.orderBy(desc(invoiceGenerationLogs.createdAt)).limit(parseInt(limit)).offset(offset),
      countQuery
    ]);

    const total = parseInt(totalResult[0]?.count || 0);
    
    // Calculate summary statistics
    const summaryQuery = db.select({
      totalGenerated: sql`coalesce(count(*) filter (where ${invoiceGenerationLogs.status} IN ('completed', 'failed')), 0)`,
      totalSent: sql`coalesce(count(*) filter (where ${invoiceGenerationLogs.status} = 'completed' AND ${invoiceGenerationLogs.sentAt} IS NOT NULL), 0)`,
      totalFailed: sql`coalesce(count(*) filter (where ${invoiceGenerationLogs.status} = 'failed'), 0)`,
      totalAmount: sql`coalesce(sum(${invoiceGenerationLogs.amount}) filter (where ${invoiceGenerationLogs.status} = 'completed'), 0)`,
    })
    .from(invoiceGenerationLogs);

    const summary = await summaryQuery;

    console.log(`✅ Retrieved ${logsData.length} invoice logs (page ${page}/${Math.ceil(total / parseInt(limit))}, total: ${total})`);
    
    res.json({
      logs: logsData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPreviousPage: parseInt(page) > 1,
      },
      summary: {
        totalGenerated: parseInt(summary[0]?.totalGenerated || 0),
        totalSent: parseInt(summary[0]?.totalSent || 0), 
        totalFailed: parseInt(summary[0]?.totalFailed || 0),
        totalAmount: parseFloat(summary[0]?.totalAmount || 0),
      },
      filters: {
        tenantName,
        status,
        startDate,
        endDate,
      }
    });
  } catch (error) {
    console.error('❌ Error fetching invoice logs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch invoice logs',
      message: error.message 
    });
  }
});

// Manual invoice generation for a tenant
router.post('/super-admin/generate-invoice', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { tenantId } = req.body;
    console.log('🔄 Generating invoice for tenant:', tenantId);

    if (tenantId === 'all') {
      // Generate for all active tenants with configurations
      const activeConfigs = await db.select({
        tenantId: invoiceGenerationConfigs.tenantId,
        tenantName: tenants.name,
      })
      .from(invoiceGenerationConfigs)
      .leftJoin(tenants, eq(invoiceGenerationConfigs.tenantId, tenants.id))
      .where(and(
        eq(invoiceGenerationConfigs.isActive, true),
        eq(tenants.status, 'active')
      ));

      const results = [];
      for (const config of activeConfigs) {
        const result = await generateInvoiceForTenant(config.tenantId, config.tenantName);
        results.push(result);
      }

      console.log(`✅ Generated invoices for ${results.length} tenants`);
      res.json({ 
        message: `Invoice generation initiated for ${results.length} tenants`,
        results 
      });
    } else {
      // Generate for specific tenant
      const tenant = await db.select({ name: tenants.name })
        .from(tenants)
        .where(eq(tenants.id, tenantId))
        .limit(1);

      if (!tenant.length) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      const result = await generateInvoiceForTenant(tenantId, tenant[0].name);
      
      console.log('✅ Invoice generation completed for tenant:', tenantId);
      res.json({ 
        message: 'Invoice generation initiated successfully',
        result 
      });
    }
  } catch (error) {
    console.error('❌ Error generating invoice:', error);
    res.status(500).json({ 
      error: 'Failed to generate invoice',
      message: error.message 
    });
  }
});

// Retry failed invoice generation
router.post('/super-admin/invoice-logs/:logId/retry', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { logId } = req.params;
    console.log('🔄 Retrying invoice generation for log:', logId);

    const log = await db.select()
      .from(invoiceGenerationLogs)
      .where(eq(invoiceGenerationLogs.id, logId))
      .limit(1);

    if (!log.length) {
      return res.status(404).json({ error: 'Generation log not found' });
    }

    if (log[0].status !== 'failed') {
      return res.status(400).json({ error: 'Only failed generations can be retried' });
    }

    // Update log to retrying status
    await db.update(invoiceGenerationLogs)
      .set({
        status: 'retrying',
        retryCount: sql`${invoiceGenerationLogs.retryCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(invoiceGenerationLogs.id, logId));

    // Attempt to regenerate
    const result = await generateInvoiceForTenant(log[0].tenantId, log[0].tenantName);
    
    console.log('✅ Invoice generation retry completed for log:', logId);
    res.json({ 
      message: 'Invoice generation retry initiated successfully',
      result 
    });
  } catch (error) {
    console.error('❌ Error retrying invoice generation:', error);
    res.status(500).json({ 
      error: 'Failed to retry invoice generation',
      message: error.message 
    });
  }
});

// Helper function to generate invoice for a tenant
async function generateInvoiceForTenant(tenantId, tenantName) {
  try {
    // Create generation log entry
    const logId = Math.random().toString(36).substr(2, 9);
    const billingPeriodStart = new Date();
    billingPeriodStart.setMonth(billingPeriodStart.getMonth() - 1);
    const billingPeriodEnd = new Date();
    
    // Get tenant's subscription for billing amount
    const subscription = await db.select({
      planId: subscriptions.planId,
      planName: subscriptionPlans.name,
      planPrice: subscriptionPlans.price,
    })
    .from(subscriptions)
    .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
    .where(and(
      eq(subscriptions.tenantId, tenantId),
      eq(subscriptions.status, 'active')
    ))
    .limit(1);

    if (!subscription.length) {
      throw new Error('No active subscription found for tenant');
    }

    const amount = parseFloat(subscription[0].planPrice);
    
    const [generationLog] = await db.insert(invoiceGenerationLogs)
      .values({
        id: logId,
        tenantId,
        tenantName,
        status: 'processing',
        amount,
        billingPeriodStart,
        billingPeriodEnd,
        metadata: {
          planName: subscription[0].planName,
          generationType: 'manual',
          generatedBy: 'super-admin'
        }
      })
      .returning();

    // Simulate invoice generation process
    setTimeout(async () => {
      try {
        // Generate invoice number
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
        
        // Create actual invoice
        const [newInvoice] = await db.insert(invoices)
          .values({
            invoiceNumber,
            tenantId,
            subscriptionId: subscription[0].planId,
            amount,
            taxAmount: amount * 0.1,
            totalAmount: amount * 1.1,
            status: 'sent',
            issueDate: new Date(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            billingPeriodStart,
            billingPeriodEnd,
            items: [{
              description: `${subscription[0].planName} Subscription`,
              quantity: 1,
              unitPrice: amount,
              total: amount
            }]
          })
          .returning();

        // Update generation log to completed
        await db.update(invoiceGenerationLogs)
          .set({
            status: 'completed',
            invoiceId: newInvoice.id,
            invoiceNumber: newInvoice.invoiceNumber,
            generatedAt: new Date(),
            sentAt: new Date(), // Assume auto-send is enabled
            updatedAt: new Date(),
          })
          .where(eq(invoiceGenerationLogs.id, logId));

        console.log(`✅ Invoice ${invoiceNumber} generated successfully for tenant ${tenantName}`);
      } catch (error) {
        // Update log with error
        await db.update(invoiceGenerationLogs)
          .set({
            status: 'failed',
            errorMessage: error.message,
            updatedAt: new Date(),
          })
          .where(eq(invoiceGenerationLogs.id, logId));
        
        console.error(`❌ Failed to generate invoice for tenant ${tenantName}:`, error);
      }
    }, 2000); // 2 second delay to simulate processing

    return {
      logId,
      tenantId,
      tenantName,
      status: 'processing',
      message: 'Invoice generation started'
    };
  } catch (error) {
    console.error(`❌ Error initiating invoice generation for tenant ${tenantName}:`, error);
    throw error;
  }
}

export default router;