
import { Router, Request, Response } from 'express';
import { db } from './db';
import { 
  tenants, 
  users, 
  subscriptionPlans, 
  subscriptions, 
  documents, 
  payments, 
  invoices, 
  activityLogs, 
  systemConfig, 
  systemMetrics 
} from '../shared/schema';
import { eq, and, desc, asc, like, gte, lte, count, sql, inArray } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
const authenticateToken = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Super Admin middleware
const requireSuperAdmin = (req: Request, res: Response, next: any) => {
  if (req.user?.role !== 'super-admin') {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  next();
};

// Health check
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ===================== AUTHENTICATION ROUTES =====================

// Super Admin Login
router.post('/auth/super-admin/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (user.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const foundUser = user[0];

    // Check if user is super admin
    if (foundUser.role !== 'super-admin') {
      return res.status(403).json({ error: 'Invalid email format or insufficient privileges' });
    }

    // Check account lockout
    if (foundUser.accountLockedUntil && new Date() < foundUser.accountLockedUntil) {
      return res.status(423).json({ error: 'Account locked. Try again in 15 minutes' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);

    if (!isPasswordValid) {
      // Increment failed attempts
      const newFailedAttempts = (foundUser.failedLoginAttempts || 0) + 1;
      const lockUntil = newFailedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await db.update(users)
        .set({
          failedLoginAttempts: newFailedAttempts,
          accountLockedUntil: lockUntil,
          updatedAt: new Date()
        })
        .where(eq(users.id, foundUser.id));

      if (newFailedAttempts >= 5) {
        return res.status(423).json({ error: 'Account locked. Try again in 15 minutes' });
      }

      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Reset failed attempts on successful login
    await db.update(users)
      .set({
        failedLoginAttempts: 0,
        accountLockedUntil: null,
        lastLoginAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, foundUser.id));

    // Generate JWT token
    const token = jwt.sign(
      { id: foundUser.id, email: foundUser.email, role: foundUser.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Log activity
    await db.insert(activityLogs).values({
      userId: foundUser.id,
      action: 'login',
      resource: 'authentication',
      details: { loginType: 'super-admin' },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      level: 'info'
    });

    res.json({
      token,
      user: {
        id: foundUser.id,
        email: foundUser.email,
        username: foundUser.username,
        role: foundUser.role
      }
    });

  } catch (error) {
    console.error('Super admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===================== TENANT MANAGEMENT ROUTES =====================

// Get all tenants with pagination and filters
router.get('/tenants', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select({
      id: tenants.id,
      name: tenants.name,
      domain: tenants.domain,
      status: tenants.status,
      subscriptionId: tenants.subscriptionId,
      trialEndsAt: tenants.trialEndsAt,
      isTrialActive: tenants.isTrialActive,
      maxUsers: tenants.maxUsers,
      storageLimit: tenants.storageLimit,
      createdAt: tenants.createdAt,
      updatedAt: tenants.updatedAt,
      userCount: sql<number>`(SELECT COUNT(*) FROM ${users} WHERE ${users.tenantId} = ${tenants.id})`
    }).from(tenants);

    // Apply filters
    const conditions = [];
    if (search) {
      conditions.push(like(tenants.name, `%${search}%`));
    }
    if (status) {
      conditions.push(eq(tenants.status, status as any));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    if (sortOrder === 'asc') {
      query = query.orderBy(asc(tenants[sortBy as keyof typeof tenants]));
    } else {
      query = query.orderBy(desc(tenants[sortBy as keyof typeof tenants]));
    }

    // Apply pagination
    const data = await query.limit(Number(limit)).offset(offset);

    // Get total count
    let countQuery = db.select({ count: count() }).from(tenants);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const [{ count: totalCount }] = await countQuery;

    res.json({
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit))
      }
    });

  } catch (error) {
    console.error('Get tenants error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new tenant
router.post('/tenants', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { name, domain, maxUsers = 10, storageLimit = 100 } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Tenant name is required' });
    }

    // Check if domain already exists
    if (domain) {
      const existingTenant = await db.select().from(tenants).where(eq(tenants.domain, domain)).limit(1);
      if (existingTenant.length > 0) {
        return res.status(400).json({ error: 'Domain already exists' });
      }
    }

    const newTenant = await db.insert(tenants).values({
      name,
      domain,
      maxUsers,
      storageLimit,
      status: 'active',
      isTrialActive: true,
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days trial
    }).returning();

    // Log activity
    await db.insert(activityLogs).values({
      userId: req.user.id,
      action: 'create',
      resource: 'tenant',
      resourceId: newTenant[0].id.toString(),
      details: { tenantName: name, domain },
      level: 'info'
    });

    res.status(201).json(newTenant[0]);

  } catch (error) {
    console.error('Create tenant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update tenant
router.put('/tenants/:id', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const tenantId = parseInt(req.params.id);
    const { name, domain, status, maxUsers, storageLimit } = req.body;

    const updatedTenant = await db.update(tenants)
      .set({
        name,
        domain,
        status,
        maxUsers,
        storageLimit,
        updatedAt: new Date()
      })
      .where(eq(tenants.id, tenantId))
      .returning();

    if (updatedTenant.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Log activity
    await db.insert(activityLogs).values({
      userId: req.user.id,
      action: 'update',
      resource: 'tenant',
      resourceId: tenantId.toString(),
      details: { changes: { name, domain, status, maxUsers, storageLimit } },
      level: 'info'
    });

    res.json(updatedTenant[0]);

  } catch (error) {
    console.error('Update tenant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete tenant
router.delete('/tenants/:id', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const tenantId = parseInt(req.params.id);

    // Check if tenant exists
    const existingTenant = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    if (existingTenant.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Delete tenant and all related data (cascade)
    await db.delete(tenants).where(eq(tenants.id, tenantId));

    // Log activity
    await db.insert(activityLogs).values({
      userId: req.user.id,
      action: 'delete',
      resource: 'tenant',
      resourceId: tenantId.toString(),
      details: { tenantName: existingTenant[0].name },
      level: 'warning'
    });

    res.json({ message: 'Tenant deleted successfully' });

  } catch (error) {
    console.error('Delete tenant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get tenant users
router.get('/tenants/:id/users', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const tenantId = parseInt(req.params.id);

    const tenantUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt
    }).from(users).where(eq(users.tenantId, tenantId));

    res.json(tenantUsers);

  } catch (error) {
    console.error('Get tenant users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===================== SUBSCRIPTION MANAGEMENT ROUTES =====================

// Get subscription plans
router.get('/subscription-plans', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const plans = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true));
    res.json(plans);
  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create subscription plan
router.post('/subscription-plans', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { name, description, price, billingCycle, features, maxUsers, storageLimit } = req.body;

    const newPlan = await db.insert(subscriptionPlans).values({
      name,
      description,
      price,
      billingCycle,
      features,
      maxUsers,
      storageLimit
    }).returning();

    res.status(201).json(newPlan[0]);

  } catch (error) {
    console.error('Create subscription plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get subscriptions with pagination
router.get('/subscriptions', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, tenantId } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select({
      id: subscriptions.id,
      tenantId: subscriptions.tenantId,
      planId: subscriptions.planId,
      status: subscriptions.status,
      startDate: subscriptions.startDate,
      endDate: subscriptions.endDate,
      autoRenew: subscriptions.autoRenew,
      createdAt: subscriptions.createdAt,
      tenant: {
        name: tenants.name,
        domain: tenants.domain
      },
      plan: {
        name: subscriptionPlans.name,
        price: subscriptionPlans.price,
        billingCycle: subscriptionPlans.billingCycle
      }
    })
    .from(subscriptions)
    .leftJoin(tenants, eq(subscriptions.tenantId, tenants.id))
    .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id));

    // Apply filters
    const conditions = [];
    if (status) {
      conditions.push(eq(subscriptions.status, status as any));
    }
    if (tenantId) {
      conditions.push(eq(subscriptions.tenantId, Number(tenantId)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const data = await query.limit(Number(limit)).offset(offset);

    // Get total count
    let countQuery = db.select({ count: count() }).from(subscriptions);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const [{ count: totalCount }] = await countQuery;

    res.json({
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit))
      }
    });

  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===================== PAYMENT MANAGEMENT ROUTES =====================

// Get payments with pagination
router.get('/payments', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, tenantId } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select({
      id: payments.id,
      tenantId: payments.tenantId,
      subscriptionId: payments.subscriptionId,
      amount: payments.amount,
      currency: payments.currency,
      status: payments.status,
      paymentMethod: payments.paymentMethod,
      transactionId: payments.transactionId,
      paymentDate: payments.paymentDate,
      createdAt: payments.createdAt,
      tenant: {
        name: tenants.name,
        domain: tenants.domain
      }
    })
    .from(payments)
    .leftJoin(tenants, eq(payments.tenantId, tenants.id));

    // Apply filters
    const conditions = [];
    if (status) {
      conditions.push(eq(payments.status, status as any));
    }
    if (tenantId) {
      conditions.push(eq(payments.tenantId, Number(tenantId)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const data = await query.limit(Number(limit)).offset(offset);

    // Get total count
    let countQuery = db.select({ count: count() }).from(payments);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const [{ count: totalCount }] = await countQuery;

    res.json({
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit))
      }
    });

  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===================== INVOICE MANAGEMENT ROUTES =====================

// Get invoices with pagination
router.get('/invoices', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, tenantId } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      tenantId: invoices.tenantId,
      amount: invoices.amount,
      taxAmount: invoices.taxAmount,
      totalAmount: invoices.totalAmount,
      status: invoices.status,
      issueDate: invoices.issueDate,
      dueDate: invoices.dueDate,
      paidDate: invoices.paidDate,
      createdAt: invoices.createdAt,
      tenant: {
        name: tenants.name,
        domain: tenants.domain
      }
    })
    .from(invoices)
    .leftJoin(tenants, eq(invoices.tenantId, tenants.id));

    // Apply filters
    const conditions = [];
    if (status) {
      conditions.push(eq(invoices.status, status as any));
    }
    if (tenantId) {
      conditions.push(eq(invoices.tenantId, Number(tenantId)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const data = await query.limit(Number(limit)).offset(offset);

    // Get total count
    let countQuery = db.select({ count: count() }).from(invoices);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const [{ count: totalCount }] = await countQuery;

    res.json({
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit))
      }
    });

  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate invoice
router.post('/invoices/generate', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { tenantId, subscriptionId, amount, taxAmount, billingPeriodStart, billingPeriodEnd, items } = req.body;

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    const newInvoice = await db.insert(invoices).values({
      invoiceNumber,
      tenantId,
      subscriptionId,
      amount,
      taxAmount: taxAmount || 0,
      totalAmount: Number(amount) + Number(taxAmount || 0),
      status: 'draft',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      billingPeriodStart: new Date(billingPeriodStart),
      billingPeriodEnd: new Date(billingPeriodEnd),
      items
    }).returning();

    res.status(201).json(newInvoice[0]);

  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===================== ACTIVITY LOGS ROUTES =====================

// Get activity logs with pagination
router.get('/activity-logs', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, tenantId, userId, action, level, startDate, endDate } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select({
      id: activityLogs.id,
      tenantId: activityLogs.tenantId,
      userId: activityLogs.userId,
      action: activityLogs.action,
      resource: activityLogs.resource,
      resourceId: activityLogs.resourceId,
      details: activityLogs.details,
      ipAddress: activityLogs.ipAddress,
      userAgent: activityLogs.userAgent,
      level: activityLogs.level,
      createdAt: activityLogs.createdAt,
      tenant: {
        name: tenants.name
      },
      user: {
        username: users.username,
        email: users.email
      }
    })
    .from(activityLogs)
    .leftJoin(tenants, eq(activityLogs.tenantId, tenants.id))
    .leftJoin(users, eq(activityLogs.userId, users.id));

    // Apply filters
    const conditions = [];
    if (tenantId) {
      conditions.push(eq(activityLogs.tenantId, Number(tenantId)));
    }
    if (userId) {
      conditions.push(eq(activityLogs.userId, userId as string));
    }
    if (action) {
      conditions.push(eq(activityLogs.action, action as string));
    }
    if (level) {
      conditions.push(eq(activityLogs.level, level as any));
    }
    if (startDate) {
      conditions.push(gte(activityLogs.createdAt, new Date(startDate as string)));
    }
    if (endDate) {
      conditions.push(lte(activityLogs.createdAt, new Date(endDate as string)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(activityLogs.createdAt));

    const data = await query.limit(Number(limit)).offset(offset);

    // Get total count
    let countQuery = db.select({ count: count() }).from(activityLogs);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const [{ count: totalCount }] = await countQuery;

    res.json({
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit))
      }
    });

  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===================== DELETED DOCUMENTS ROUTES =====================

// Get deleted documents with pagination
router.get('/deleted-documents', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, tenantId, deletedBy } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select({
      id: documents.id,
      tenantId: documents.tenantId,
      userId: documents.userId,
      filename: documents.filename,
      originalName: documents.originalName,
      fileSize: documents.fileSize,
      mimeType: documents.mimeType,
      status: documents.status,
      deletedAt: documents.deletedAt,
      deletedBy: documents.deletedBy,
      createdAt: documents.createdAt,
      tenant: {
        name: tenants.name
      },
      user: {
        username: users.username,
        email: users.email
      },
      deletedByUser: {
        username: sql<string>`deleted_by_user.username`,
        email: sql<string>`deleted_by_user.email`
      }
    })
    .from(documents)
    .leftJoin(tenants, eq(documents.tenantId, tenants.id))
    .leftJoin(users, eq(documents.userId, users.id))
    .leftJoin(sql`${users} as deleted_by_user`, eq(documents.deletedBy, sql`deleted_by_user.id`))
    .where(eq(documents.status, 'deleted'));

    // Apply filters
    const conditions = [eq(documents.status, 'deleted')];
    if (tenantId) {
      conditions.push(eq(documents.tenantId, Number(tenantId)));
    }
    if (deletedBy) {
      conditions.push(eq(documents.deletedBy, deletedBy as string));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(documents.deletedAt));

    const data = await query.limit(Number(limit)).offset(offset);

    // Get total count
    let countQuery = db.select({ count: count() }).from(documents);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const [{ count: totalCount }] = await countQuery;

    res.json({
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit))
      }
    });

  } catch (error) {
    console.error('Get deleted documents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Restore deleted document
router.post('/deleted-documents/:id/restore', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const documentId = req.params.id;

    const restoredDocument = await db.update(documents)
      .set({
        status: 'active',
        deletedAt: null,
        deletedBy: null,
        updatedAt: new Date()
      })
      .where(eq(documents.id, documentId))
      .returning();

    if (restoredDocument.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Log activity
    await db.insert(activityLogs).values({
      userId: req.user.id,
      action: 'restore',
      resource: 'document',
      resourceId: documentId,
      details: { filename: restoredDocument[0].filename },
      level: 'info'
    });

    res.json({ message: 'Document restored successfully' });

  } catch (error) {
    console.error('Restore document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===================== SYSTEM CONFIGURATION ROUTES =====================

// Get system configuration
router.get('/system-config', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const configs = await db.select().from(systemConfig).where(eq(systemConfig.isActive, true));
    res.json(configs);
  } catch (error) {
    console.error('Get system config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update system configuration
router.put('/system-config/:key', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const configKey = req.params.key;
    const { value, description } = req.body;

    const updatedConfig = await db.update(systemConfig)
      .set({
        value,
        description,
        updatedAt: new Date()
      })
      .where(eq(systemConfig.key, configKey))
      .returning();

    if (updatedConfig.length === 0) {
      // Create new config if it doesn't exist
      const newConfig = await db.insert(systemConfig).values({
        key: configKey,
        value,
        description,
        category: 'system'
      }).returning();

      return res.json(newConfig[0]);
    }

    // Log activity
    await db.insert(activityLogs).values({
      userId: req.user.id,
      action: 'update',
      resource: 'system-config',
      resourceId: configKey,
      details: { key: configKey, newValue: value },
      level: 'info'
    });

    res.json(updatedConfig[0]);

  } catch (error) {
    console.error('Update system config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===================== ANALYTICS ROUTES =====================

// Get system metrics
router.get('/system-metrics', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    // Get various system metrics
    const [
      totalTenants,
      activeTenants,
      totalUsers,
      activeUsers,
      totalDocuments,
      recentDocuments,
      totalPayments,
      recentPayments,
      errorCount
    ] = await Promise.all([
      // Total tenants
      db.select({ count: count() }).from(tenants),
      // Active tenants
      db.select({ count: count() }).from(tenants).where(eq(tenants.status, 'active')),
      // Total users
      db.select({ count: count() }).from(users),
      // Active users (logged in last 30 days)
      db.select({ count: count() }).from(users).where(gte(users.lastLoginAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))),
      // Total documents
      db.select({ count: count() }).from(documents).where(eq(documents.status, 'active')),
      // Recent documents (last 7 days)
      db.select({ count: count() }).from(documents).where(
        and(
          eq(documents.status, 'active'),
          gte(documents.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        )
      ),
      // Total payments
      db.select({ 
        count: count(),
        sum: sql<string>`COALESCE(SUM(${payments.amount}), 0)`
      }).from(payments),
      // Recent payments (last 30 days)
      db.select({ 
        count: count(),
        sum: sql<string>`COALESCE(SUM(${payments.amount}), 0)`
      }).from(payments).where(gte(payments.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))),
      // Error logs count (last 24 hours)
      db.select({ count: count() }).from(activityLogs).where(
        and(
          eq(activityLogs.level, 'error'),
          gte(activityLogs.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000))
        )
      )
    ]);

    const metrics = {
      tenants: {
        total: totalTenants[0].count,
        active: activeTenants[0].count,
        growth: Math.round(((activeTenants[0].count / Math.max(totalTenants[0].count - activeTenants[0].count, 1)) - 1) * 100)
      },
      users: {
        total: totalUsers[0].count,
        active: activeUsers[0].count,
        growth: Math.round(((activeUsers[0].count / Math.max(totalUsers[0].count - activeUsers[0].count, 1)) - 1) * 100)
      },
      documents: {
        total: totalDocuments[0].count,
        recent: recentDocuments[0].count,
        growth: Math.round(((recentDocuments[0].count / Math.max(totalDocuments[0].count - recentDocuments[0].count, 1)) - 1) * 100)
      },
      payments: {
        total: {
          count: totalPayments[0].count,
          amount: totalPayments[0].sum
        },
        recent: {
          count: recentPayments[0].count,
          amount: recentPayments[0].sum
        }
      },
      system: {
        uptime: process.uptime(),
        errorRate: errorCount[0].count,
        status: 'healthy'
      }
    };

    res.json(metrics);

  } catch (error) {
    console.error('Get system metrics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get analytics data with date ranges
router.get('/analytics', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, metric } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    let data = {};

    switch (metric) {
      case 'user-growth':
        data = await db.select({
          date: sql<string>`DATE(${users.createdAt})`,
          count: count()
        })
        .from(users)
        .where(and(gte(users.createdAt, start), lte(users.createdAt, end)))
        .groupBy(sql`DATE(${users.createdAt})`)
        .orderBy(sql`DATE(${users.createdAt})`);
        break;

      case 'document-uploads':
        data = await db.select({
          date: sql<string>`DATE(${documents.createdAt})`,
          count: count()
        })
        .from(documents)
        .where(and(gte(documents.createdAt, start), lte(documents.createdAt, end)))
        .groupBy(sql`DATE(${documents.createdAt})`)
        .orderBy(sql`DATE(${documents.createdAt})`);
        break;

      case 'revenue':
        data = await db.select({
          date: sql<string>`DATE(${payments.paymentDate})`,
          amount: sql<string>`SUM(${payments.amount})`
        })
        .from(payments)
        .where(and(
          eq(payments.status, 'completed'),
          gte(payments.paymentDate, start), 
          lte(payments.paymentDate, end)
        ))
        .groupBy(sql`DATE(${payments.paymentDate})`)
        .orderBy(sql`DATE(${payments.paymentDate})`);
        break;

      default:
        // Return general analytics
        data = {
          userGrowth: await db.select({
            date: sql<string>`DATE(${users.createdAt})`,
            count: count()
          })
          .from(users)
          .where(and(gte(users.createdAt, start), lte(users.createdAt, end)))
          .groupBy(sql`DATE(${users.createdAt})`)
          .orderBy(sql`DATE(${users.createdAt})`),

          documentUploads: await db.select({
            date: sql<string>`DATE(${documents.createdAt})`,
            count: count()
          })
          .from(documents)
          .where(and(gte(documents.createdAt, start), lte(documents.createdAt, end)))
          .groupBy(sql`DATE(${documents.createdAt})`)
          .orderBy(sql`DATE(${documents.createdAt})`),

          revenue: await db.select({
            date: sql<string>`DATE(${payments.paymentDate})`,
            amount: sql<string>`SUM(${payments.amount})`
          })
          .from(payments)
          .where(and(
            eq(payments.status, 'completed'),
            gte(payments.paymentDate, start), 
            lte(payments.paymentDate, end)
          ))
          .groupBy(sql`DATE(${payments.paymentDate})`)
          .orderBy(sql`DATE(${payments.paymentDate})`)
        };
    }

    res.json(data);

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
