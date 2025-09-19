
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from 'pg';
import { eq, and, or, desc, asc, count, sum, gte, lte, like, sql, isNull, isNotNull } from "drizzle-orm";
import bcrypt from "bcrypt";
import * as schema from "../shared/schema";


if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

export const storage = {
  // User management
  async getUserByEmail(email: string) {
    const users = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
    return users[0];
  },

  async getUserById(id: number) {
    const users = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return users[0];
  },

  async createUser(userData: schema.InsertUser) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const users = await db.insert(schema.users).values({
      ...userData,
      password: hashedPassword
    }).returning();
    return users[0];
  },

  async updateUser(id: number, userData: Partial<typeof schema.users.$inferSelect>) {
    const users = await db.update(schema.users).set(userData).where(eq(schema.users.id, id)).returning();
    return users[0];
  },

  async incrementLoginAttempts(userId: number) {
    const user = await this.getUserById(userId);
    const newAttempts = (user?.failedLoginAttempts || 0) + 1;
    const lockUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
    
    await db.update(schema.users).set({
      failedLoginAttempts: newAttempts,
      accountLockedUntil: lockUntil
    }).where(eq(schema.users.id, userId));
  },

  async resetLoginAttempts(userId: number) {
    await db.update(schema.users).set({
      failedLoginAttempts: 0,
      accountLockedUntil: null
    }).where(eq(schema.users.id, userId));
  },

  async updateLastLogin(userId: number) {
    await db.update(schema.users).set({
      lastLoginAt: new Date()
    }).where(eq(schema.users.id, userId));
  },

  // System metrics
  async getSystemMetrics() {
    const [
      tenantCount,
      userCount,
      documentCount,
      errorCount
    ] = await Promise.all([
      db.select({ count: count() }).from(schema.tenants).where(eq(schema.tenants.status, 'active')),
      db.select({ count: count() }).from(schema.users).where(eq(schema.users.isActive, true)),
      db.select({ count: count() }).from(schema.documents).where(eq(schema.documents.status, 'active')),
      db.select({ count: count() }).from(schema.activityLogs).where(eq(schema.activityLogs.level, 'error'))
    ]);

    const uptime = process.uptime();
    const uptimePercentage = 99.9; // Mock uptime percentage

    return [
      {
        id: 1,
        icon: '⏱️',
        value: `${uptimePercentage}%`,
        label: 'System Uptime',
        trend: 'up',
        trendValue: '+0.1%',
        color: 'green'
      },
      {
        id: 2,
        icon: '🏢',
        value: tenantCount[0].count.toString(),
        label: 'Active Tenants',
        trend: 'up',
        trendValue: '+2',
        color: 'blue'
      },
      {
        id: 3,
        icon: '👥',
        value: userCount[0].count.toString(),
        label: 'Active Users',
        trend: 'up',
        trendValue: '+12',
        color: 'purple'
      },
      {
        id: 4,
        icon: '📄',
        value: documentCount[0].count.toString(),
        label: 'Document Uploads',
        trend: 'up',
        trendValue: '+156',
        color: 'orange'
      },
      {
        id: 5,
        icon: '❌',
        value: errorCount[0].count.toString(),
        label: 'Unresolved Errors',
        trend: 'down',
        trendValue: '-5',
        color: 'red'
      }
    ];
  },

  // Error logs (using activity logs with error level)
  async getErrorLogs(filters: any) {
    let query = db.select({
      id: schema.activityLogs.id,
      errorType: schema.activityLogs.action,
      message: sql`${schema.activityLogs.action} || ': ' || COALESCE(${schema.activityLogs.details}->>'message', 'No additional details')`.as('message'),
      affectedTenant: schema.tenants.name,
      timestamp: schema.activityLogs.createdAt,
      severity: schema.activityLogs.level,
      userEmail: schema.users.email
    })
    .from(schema.activityLogs)
    .leftJoin(schema.tenants, eq(schema.activityLogs.tenantId, schema.tenants.id))
    .leftJoin(schema.users, eq(schema.activityLogs.userId, schema.users.id))
    .where(eq(schema.activityLogs.level, 'error'));

    const additionalConditions = [];

    if (filters.tenantName) {
      additionalConditions.push(like(schema.tenants.name, `%${filters.tenantName}%`));
    }

    if (filters.errorType) {
      additionalConditions.push(like(schema.activityLogs.action, `%${filters.errorType}%`));
    }

    if (filters.startDate) {
      additionalConditions.push(gte(schema.activityLogs.createdAt, new Date(filters.startDate)));
    }

    if (filters.endDate) {
      additionalConditions.push(lte(schema.activityLogs.createdAt, new Date(filters.endDate)));
    }

    if (additionalConditions.length > 0) {
      query = query.where(and(eq(schema.activityLogs.level, 'error'), ...additionalConditions));
    }

    const totalQuery = db.select({ count: count() }).from(schema.activityLogs).where(eq(schema.activityLogs.level, 'error'));
    if (additionalConditions.length > 0) {
      totalQuery.where(and(eq(schema.activityLogs.level, 'error'), ...additionalConditions));
    }

    const [data, total] = await Promise.all([
      query
        .orderBy(desc(schema.activityLogs.createdAt))
        .limit(filters.limit || 10)
        .offset(((filters.page || 1) - 1) * (filters.limit || 10)),
      totalQuery
    ]);

    return {
      data,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / filters.limit)
      }
    };
  },

  // Tenant management
  async getTenants(filters: any) {
    let query = db.select({
      id: schema.tenants.id,
      name: schema.tenants.name,
      domain: schema.tenants.domain,
      email: schema.tenants.email,
      phone: schema.tenants.phone,
      isActive: schema.tenants.isActive,
      trialStartDate: schema.tenants.trialStartDate,
      trialEndDate: schema.tenants.trialEndDate,
      createdAt: schema.tenants.createdAt,
      userCount: count(schema.users.id)
    })
    .from(schema.tenants)
    .leftJoin(schema.users, eq(schema.tenants.id, schema.users.tenantId))
    .groupBy(schema.tenants.id);

    const conditions = [];

    if (filters.search) {
      conditions.push(
        or(
          like(schema.tenants.name, `%${filters.search}%`),
          like(schema.tenants.email, `%${filters.search}%`),
          like(schema.tenants.domain, `%${filters.search}%`)
        )
      );
    }

    if (filters.status) {
      conditions.push(eq(schema.tenants.isActive, filters.status === 'active'));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const totalQuery = db.select({ count: count() }).from(schema.tenants);
    if (conditions.length > 0) {
      totalQuery.where(and(...conditions));
    }

    const [data, total] = await Promise.all([
      query
        .orderBy(desc(schema.tenants.createdAt))
        .limit(filters.limit)
        .offset((filters.page - 1) * filters.limit),
      totalQuery
    ]);

    return {
      data,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / filters.limit)
      }
    };
  },

  async createTenant(tenantData: schema.InsertTenant) {
    const tenants = await db.insert(schema.tenants).values(tenantData).returning();
    return tenants[0];
  },

  async updateTenant(id: number, tenantData: Partial<schema.Tenant>) {
    const tenants = await db.update(schema.tenants).set({
      ...tenantData,
      updatedAt: new Date()
    }).where(eq(schema.tenants.id, id)).returning();
    return tenants[0];
  },

  async deleteTenant(id: number) {
    await db.delete(schema.tenants).where(eq(schema.tenants.id, id));
  },

  async getTenantUsers(tenantId: number, filters: any) {
    const query = db.select({
      id: schema.users.id,
      firstName: schema.users.firstName,
      lastName: schema.users.lastName,
      email: schema.users.email,
      phone: schema.users.phone,
      role: schema.users.role,
      isActive: schema.users.isActive,
      lastLoginAt: schema.users.lastLoginAt,
      createdAt: schema.users.createdAt
    })
    .from(schema.users)
    .where(eq(schema.users.tenantId, tenantId));

    const totalQuery = db.select({ count: count() }).from(schema.users).where(eq(schema.users.tenantId, tenantId));

    const [data, total] = await Promise.all([
      query
        .orderBy(desc(schema.users.createdAt))
        .limit(filters.limit)
        .offset((filters.page - 1) * filters.limit),
      totalQuery
    ]);

    return {
      data,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / filters.limit)
      }
    };
  },

  // Subscription plans
  async getSubscriptionPlans(filters: any) {
    const query = db.select().from(schema.subscriptionPlans);
    const totalQuery = db.select({ count: count() }).from(schema.subscriptionPlans);

    const [data, total] = await Promise.all([
      query
        .orderBy(asc(schema.subscriptionPlans.name))
        .limit(filters.limit)
        .offset((filters.page - 1) * filters.limit),
      totalQuery
    ]);

    return {
      data,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / filters.limit)
      }
    };
  },

  async createSubscriptionPlan(planData: schema.InsertSubscriptionPlan) {
    const plans = await db.insert(schema.subscriptionPlans).values(planData).returning();
    return plans[0];
  },

  async updateSubscriptionPlan(id: number, planData: Partial<schema.SubscriptionPlan>) {
    const plans = await db.update(schema.subscriptionPlans).set({
      ...planData,
      updatedAt: new Date()
    }).where(eq(schema.subscriptionPlans.id, id)).returning();
    return plans[0];
  },

  async deleteSubscriptionPlan(id: number) {
    await db.delete(schema.subscriptionPlans).where(eq(schema.subscriptionPlans.id, id));
  },

  // Tenant subscriptions
  async getTenantSubscriptions(filters: any) {
    let query = db.select({
      id: schema.tenantSubscriptions.id,
      tenantId: schema.tenantSubscriptions.tenantId,
      tenantName: schema.tenants.name,
      planId: schema.tenantSubscriptions.planId,
      planName: schema.subscriptionPlans.name,
      planPrice: schema.subscriptionPlans.price,
      status: schema.tenantSubscriptions.status,
      startDate: schema.tenantSubscriptions.startDate,
      endDate: schema.tenantSubscriptions.endDate,
      autoRenew: schema.tenantSubscriptions.autoRenew,
      createdAt: schema.tenantSubscriptions.createdAt
    })
    .from(schema.tenantSubscriptions)
    .leftJoin(schema.tenants, eq(schema.tenantSubscriptions.tenantId, schema.tenants.id))
    .leftJoin(schema.subscriptionPlans, eq(schema.tenantSubscriptions.planId, schema.subscriptionPlans.id));

    const conditions = [];

    if (filters.tenantId) {
      conditions.push(eq(schema.tenantSubscriptions.tenantId, filters.tenantId));
    }

    if (filters.status) {
      conditions.push(eq(schema.tenantSubscriptions.status, filters.status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const totalQuery = db.select({ count: count() }).from(schema.tenantSubscriptions);
    if (conditions.length > 0) {
      totalQuery.where(and(...conditions));
    }

    const [data, total] = await Promise.all([
      query
        .orderBy(desc(schema.tenantSubscriptions.createdAt))
        .limit(filters.limit)
        .offset((filters.page - 1) * filters.limit),
      totalQuery
    ]);

    return {
      data,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / filters.limit)
      }
    };
  },

  async createTenantSubscription(subscriptionData: schema.InsertTenantSubscription) {
    const subscriptions = await db.insert(schema.tenantSubscriptions).values(subscriptionData).returning();
    return subscriptions[0];
  },

  // Payments
  async getPayments(filters: any) {
    let query = db.select({
      id: schema.payments.id,
      tenantId: schema.payments.tenantId,
      tenantName: schema.tenants.name,
      amount: schema.payments.amount,
      currency: schema.payments.currency,
      status: schema.payments.status,
      paymentMethod: schema.payments.paymentMethod,
      transactionId: schema.payments.transactionId,
      paidAt: schema.payments.paidAt,
      createdAt: schema.payments.createdAt
    })
    .from(schema.payments)
    .leftJoin(schema.tenants, eq(schema.payments.tenantId, schema.tenants.id));

    const conditions = [];

    if (filters.tenantId) {
      conditions.push(eq(schema.payments.tenantId, filters.tenantId));
    }

    if (filters.status) {
      conditions.push(eq(schema.payments.status, filters.status));
    }

    if (filters.startDate) {
      conditions.push(gte(schema.payments.createdAt, new Date(filters.startDate)));
    }

    if (filters.endDate) {
      conditions.push(lte(schema.payments.createdAt, new Date(filters.endDate)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const totalQuery = db.select({ count: count() }).from(schema.payments);
    if (conditions.length > 0) {
      totalQuery.where(and(...conditions));
    }

    const [data, total] = await Promise.all([
      query
        .orderBy(desc(schema.payments.createdAt))
        .limit(filters.limit)
        .offset((filters.page - 1) * filters.limit),
      totalQuery
    ]);

    return {
      data,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / filters.limit)
      }
    };
  },

  // Invoices
  async getInvoices(filters: any) {
    let query = db.select({
      id: schema.invoices.id,
      tenantId: schema.invoices.tenantId,
      tenantName: schema.tenants.name,
      invoiceNumber: schema.invoices.invoiceNumber,
      amount: schema.invoices.amount,
      tax: schema.invoices.tax,
      total: schema.invoices.total,
      status: schema.invoices.status,
      dueDate: schema.invoices.dueDate,
      paidAt: schema.invoices.paidAt,
      createdAt: schema.invoices.createdAt
    })
    .from(schema.invoices)
    .leftJoin(schema.tenants, eq(schema.invoices.tenantId, schema.tenants.id));

    const conditions = [];

    if (filters.tenantId) {
      conditions.push(eq(schema.invoices.tenantId, filters.tenantId));
    }

    if (filters.status) {
      conditions.push(eq(schema.invoices.status, filters.status));
    }

    if (filters.startDate) {
      conditions.push(gte(schema.invoices.createdAt, new Date(filters.startDate)));
    }

    if (filters.endDate) {
      conditions.push(lte(schema.invoices.createdAt, new Date(filters.endDate)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const totalQuery = db.select({ count: count() }).from(schema.invoices);
    if (conditions.length > 0) {
      totalQuery.where(and(...conditions));
    }

    const [data, total] = await Promise.all([
      query
        .orderBy(desc(schema.invoices.createdAt))
        .limit(filters.limit)
        .offset((filters.page - 1) * filters.limit),
      totalQuery
    ]);

    return {
      data,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / filters.limit)
      }
    };
  },

  async createInvoice(invoiceData: schema.InsertInvoice) {
    const invoices = await db.insert(schema.invoices).values(invoiceData).returning();
    return invoices[0];
  },

  async updateInvoice(id: number, invoiceData: Partial<schema.Invoice>) {
    const invoices = await db.update(schema.invoices).set({
      ...invoiceData,
      updatedAt: new Date()
    }).where(eq(schema.invoices.id, id)).returning();
    return invoices[0];
  },

  // Activity logs
  async getActivityLogs(filters: any) {
    let query = db.select({
      id: schema.activityLogs.id,
      tenantId: schema.activityLogs.tenantId,
      tenantName: schema.tenants.name,
      userId: schema.activityLogs.userId,
      userEmail: schema.users.email,
      type: schema.activityLogs.type,
      description: schema.activityLogs.description,
      ipAddress: schema.activityLogs.ipAddress,
      createdAt: schema.activityLogs.createdAt
    })
    .from(schema.activityLogs)
    .leftJoin(schema.tenants, eq(schema.activityLogs.tenantId, schema.tenants.id))
    .leftJoin(schema.users, eq(schema.activityLogs.userId, schema.users.id));

    const conditions = [];

    if (filters.tenantId) {
      conditions.push(eq(schema.activityLogs.tenantId, filters.tenantId));
    }

    if (filters.userId) {
      conditions.push(eq(schema.activityLogs.userId, filters.userId));
    }

    if (filters.type) {
      conditions.push(eq(schema.activityLogs.type, filters.type));
    }

    if (filters.startDate) {
      conditions.push(gte(schema.activityLogs.createdAt, new Date(filters.startDate)));
    }

    if (filters.endDate) {
      conditions.push(lte(schema.activityLogs.createdAt, new Date(filters.endDate)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const totalQuery = db.select({ count: count() }).from(schema.activityLogs);
    if (conditions.length > 0) {
      totalQuery.where(and(...conditions));
    }

    const [data, total] = await Promise.all([
      query
        .orderBy(desc(schema.activityLogs.createdAt))
        .limit(filters.limit)
        .offset((filters.page - 1) * filters.limit),
      totalQuery
    ]);

    return {
      data,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / filters.limit)
      }
    };
  },

  // Deleted documents
  async getDeletedDocuments(filters: any) {
    let query = db.select({
      id: schema.documents.id,
      tenantId: schema.documents.tenantId,
      tenantName: schema.tenants.name,
      userId: schema.documents.userId,
      userName: sql<string>`COALESCE(${schema.users.firstName} || ' ' || ${schema.users.lastName}, ${schema.users.email})`.as('user_name'),
      userEmail: schema.users.email,
      filename: schema.documents.filename,
      originalName: schema.documents.originalName,
      mimeType: schema.documents.mimeType,
      fileSize: schema.documents.fileSize,
      deletedAt: schema.documents.deletedAt,
      deletedBy: schema.documents.deletedBy,
      deletedByName: sql<string>`COALESCE(deleter.first_name || ' ' || deleter.last_name, deleter.email)`.as('deleted_by_name'),
      deletedByEmail: sql<string>`deleter.email`.as('deleted_by_email'),
      createdAt: schema.documents.createdAt
    })
    .from(schema.documents)
    .leftJoin(schema.tenants, eq(schema.documents.tenantId, schema.tenants.id))
    .leftJoin(schema.users, eq(schema.documents.userId, schema.users.id))
    .leftJoin({ deleter: schema.users }, eq(schema.documents.deletedBy, sql`deleter.id`))
    .where(eq(schema.documents.status, 'deleted'));

    const conditions = [eq(schema.documents.status, 'deleted')];

    // Add search functionality
    if (filters.searchTerm) {
      conditions.push(
        or(
          ilike(schema.documents.filename, `%${filters.searchTerm}%`),
          ilike(schema.documents.originalName, `%${filters.searchTerm}%`),
          ilike(schema.tenants.name, `%${filters.searchTerm}%`)
        )
      );
    }

    if (filters.tenantId) {
      conditions.push(eq(schema.documents.tenantId, filters.tenantId));
    }

    if (filters.startDate) {
      conditions.push(gte(schema.documents.deletedAt, new Date(filters.startDate)));
    }

    if (filters.endDate) {
      conditions.push(lte(schema.documents.deletedAt, new Date(filters.endDate)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    if (filters.sortBy && filters.sortOrder) {
      const sortField = filters.sortBy === 'tenantName' ? schema.tenants.name :
                       filters.sortBy === 'userName' ? sql`COALESCE(${schema.users.firstName} || ' ' || ${schema.users.lastName}, ${schema.users.email})` :
                       filters.sortBy === 'filename' ? schema.documents.filename :
                       filters.sortBy === 'deletedAt' ? schema.documents.deletedAt :
                       schema.documents.deletedAt; // default

      query = filters.sortOrder === 'asc' ? query.orderBy(asc(sortField)) : query.orderBy(desc(sortField));
    } else {
      query = query.orderBy(desc(schema.documents.deletedAt));
    }

    const totalQuery = db.select({ count: count() }).from(schema.documents).where(and(...conditions));

    const [data, total] = await Promise.all([
      query
        .limit(filters.limit)
        .offset((filters.page - 1) * filters.limit),
      totalQuery
    ]);

    return {
      data,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / filters.limit)
      }
    };
  },

  async restoreDocument(id: string) {
    await db.update(schema.documents).set({
      status: 'active',
      deletedAt: null,
      deletedBy: null,
      updatedAt: new Date()
    }).where(eq(schema.documents.id, id));
  },

  async permanentlyDeleteDocument(id: string) {
    await db.delete(schema.documents).where(eq(schema.documents.id, id));
  },

  // System configuration
  async getSystemConfig() {
    const config = await db.select().from(schema.systemConfig);
    return config.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as any);
  },

  async updateSystemConfig(configData: any, updatedBy: string) {
    const updates = [];
    for (const [key, value] of Object.entries(configData)) {
      updates.push(
        db.insert(schema.systemConfig).values({
          key,
          value: value as any,
          updatedBy,
          updatedAt: new Date()
        }).onConflictDoUpdate({
          target: schema.systemConfig.key,
          set: {
            value: value as any,
            updatedBy,
            updatedAt: new Date()
          }
        })
      );
    }
    await Promise.all(updates);
    return this.getSystemConfig();
  },

  // Analytics
  async getAnalyticsOverview(filters: any) {
    const startDate = filters.startDate ? new Date(filters.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = filters.endDate ? new Date(filters.endDate) : new Date();

    const [
      totalRevenue,
      newTenants,
      activeUsers,
      documentUploads
    ] = await Promise.all([
      db.select({ sum: sum(schema.payments.amount) })
        .from(schema.payments)
        .where(and(
          eq(schema.payments.status, 'completed'),
          gte(schema.payments.createdAt, startDate),
          lte(schema.payments.createdAt, endDate)
        )),
      db.select({ count: count() })
        .from(schema.tenants)
        .where(and(
          gte(schema.tenants.createdAt, startDate),
          lte(schema.tenants.createdAt, endDate)
        )),
      db.select({ count: count() })
        .from(schema.users)
        .where(and(
          eq(schema.users.isActive, true),
          isNotNull(schema.users.lastLoginAt),
          gte(schema.users.lastLoginAt, startDate)
        )),
      db.select({ count: count() })
        .from(schema.documents)
        .where(and(
          gte(schema.documents.createdAt, startDate),
          lte(schema.documents.createdAt, endDate)
        ))
    ]);

    return {
      totalRevenue: totalRevenue[0].sum || 0,
      newTenants: newTenants[0].count,
      activeUsers: activeUsers[0].count,
      documentUploads: documentUploads[0].count
    };
  },

  async getTenantUsageAnalytics(filters: any) {
    let query = db.select({
      tenantId: schema.tenants.id,
      tenantName: schema.tenants.name,
      userCount: count(schema.users.id),
      documentCount: count(schema.documents.id),
      totalRevenue: sum(schema.payments.amount)
    })
    .from(schema.tenants)
    .leftJoin(schema.users, eq(schema.tenants.id, schema.users.tenantId))
    .leftJoin(schema.documents, eq(schema.tenants.id, schema.documents.tenantId))
    .leftJoin(schema.payments, eq(schema.tenants.id, schema.payments.tenantId))
    .groupBy(schema.tenants.id, schema.tenants.name);

    if (filters.startDate && filters.endDate) {
      query = query.where(and(
        gte(schema.tenants.createdAt, new Date(filters.startDate)),
        lte(schema.tenants.createdAt, new Date(filters.endDate))
      ));
    }

    const totalQuery = db.select({ count: count() }).from(schema.tenants);

    const [data, total] = await Promise.all([
      query
        .orderBy(desc(sql`count(${schema.users.id})`))
        .limit(filters.limit)
        .offset((filters.page - 1) * filters.limit),
      totalQuery
    ]);

    return {
      data,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / filters.limit)
      }
    };
  },

  // Tenant dashboard metrics
  async getTenantDashboardMetrics(tenantId: number) {
    const [
      userCount,
      documentCount,
      recentActivity
    ] = await Promise.all([
      db.select({ count: count() })
        .from(schema.users)
        .where(and(
          eq(schema.users.tenantId, tenantId),
          eq(schema.users.isActive, true)
        )),
      db.select({ count: count() })
        .from(schema.documents)
        .where(and(
          eq(schema.documents.tenantId, tenantId),
          eq(schema.documents.status, 'active')
        )),
      db.select({ count: count() })
        .from(schema.activityLogs)
        .where(and(
          eq(schema.activityLogs.tenantId, tenantId),
          gte(schema.activityLogs.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000))
        ))
    ]);

    return {
      totalUsers: userCount[0].count,
      totalDocuments: documentCount[0].count,
      recentActivity: recentActivity[0].count
    };
  }
};
