import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, pgEnum, boolean, decimal, jsonb, uuid, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Role enum for type safety
export const roleEnum = pgEnum('role', ['super-admin', 'tenant-admin', 'user']);

// Subscription plan status enum
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'inactive', 'suspended', 'expired']);

// Tenant status enum
export const tenantStatusEnum = pgEnum('tenant_status', ['active', 'inactive', 'suspended', 'pending']);

// Document status enum
export const documentStatusEnum = pgEnum('document_status', ['active', 'deleted', 'archived']);

// Payment status enum
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded']);

// Invoice status enum
export const invoiceStatusEnum = pgEnum('invoice_status', ['draft', 'sent', 'paid', 'overdue', 'cancelled']);

// Activity log level enum
export const logLevelEnum = pgEnum('log_level', ['info', 'warning', 'error', 'critical']);

// Tenants table - shared across the application  
export const tenants = pgTable("tenants", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).unique(), // Email field that exists in database
  domain: text("domain").unique(),
  status: varchar("status", { length: 20 }).notNull().default('active'), // Status field that exists in database
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subscription Plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  billingCycle: text("billing_cycle").notNull(), // monthly, yearly
  features: jsonb("features").notNull(),
  maxUsers: integer("max_users").notNull(),
  storageLimit: integer("storage_limit_gb").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  planId: integer("plan_id").references(() => subscriptionPlans.id).notNull(),
  status: varchar("status", { length: 20 }).notNull().default('active'),
  startedAt: timestamp("started_at").defaultNow(),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced users table with multi-tenant support
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('user'),
  tenantId: integer('tenant_id').references(() => tenants.id),
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at'),
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  accountLockedUntil: timestamp('account_locked_until'),
  passwordResetToken: varchar('password_reset_token', { length: 255 }),
  passwordResetExpires: timestamp('password_reset_expires'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Documents table
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  status: documentStatusEnum("status").notNull().default('active'),
  deletedAt: timestamp("deleted_at"),
  deletedBy: varchar("deleted_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payments table
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  subscriptionId: integer("subscription_id").references(() => subscriptions.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default('USD'),
  status: paymentStatusEnum("status").notNull().default('pending'),
  paymentMethod: text("payment_method"),
  transactionId: text("transaction_id"),
  paymentDate: timestamp("payment_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: text("invoice_number").unique().notNull(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  subscriptionId: integer("subscription_id").references(() => subscriptions.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default('0'),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: invoiceStatusEnum("status").notNull().default('draft'),
  issueDate: timestamp("issue_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  billingPeriodStart: timestamp("billing_period_start").notNull(),
  billingPeriodEnd: timestamp("billing_period_end").notNull(),
  items: jsonb("items").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activity Logs table
export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: integer("tenant_id").references(() => tenants.id),
  userId: varchar("user_id").references(() => users.id),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: text("resource_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  level: logLevelEnum("level").notNull().default('info'),
  createdAt: timestamp("created_at").defaultNow(),
});

// System Configuration table
export const systemConfig = pgTable("system_config", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  key: text("key").unique().notNull(),
  value: jsonb("value").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// System Metrics table
export const systemMetrics = pgTable("system_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  metricName: text("metric_name").notNull(),
  metricValue: decimal("metric_value", { precision: 15, scale: 2 }).notNull(),
  metricType: text("metric_type").notNull(), // counter, gauge, histogram
  tags: jsonb("tags"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Define relations
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  documents: many(documents),
  subscriptions: many(subscriptions), // Changed to many-to-many relation via subscriptions.tenantId
  payments: many(payments),
  invoices: many(invoices),
  activityLogs: many(activityLogs),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  documents: many(documents),
  activityLogs: many(activityLogs),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [subscriptions.tenantId],
    references: [tenants.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [subscriptions.planId],
    references: [subscriptionPlans.id],
  }),
  payments: many(payments),
  invoices: many(invoices),
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  tenant: one(tenants, {
    fields: [documents.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  deletedBy: one(users, {
    fields: [documents.deletedBy],
    references: [users.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  tenant: one(tenants, {
    fields: [payments.tenantId],
    references: [tenants.id],
  }),
  subscription: one(subscriptions, {
    fields: [payments.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  tenant: one(tenants, {
    fields: [invoices.tenantId],
    references: [tenants.id],
  }),
  subscription: one(subscriptions, {
    fields: [invoices.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [activityLogs.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertTenantSchema = createInsertSchema(tenants).pick({
  name: true,
  domain: true,
  maxUsers: true,
  storageLimit: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  role: true,
  tenantId: true,
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).pick({
  name: true,
  description: true,
  price: true,
  billingCycle: true,
  features: true,
  maxUsers: true,
  storageLimit: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  tenantId: true,
  planId: true,
  startDate: true,
  endDate: true,
  autoRenew: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  tenantId: true,
  userId: true,
  filename: true,
  originalName: true,
  fileSize: true,
  mimeType: true,
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  tenantId: true,
  subscriptionId: true,
  amount: true,
  currency: true,
  paymentMethod: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).pick({
  tenantId: true,
  subscriptionId: true,
  amount: true,
  taxAmount: true,
  totalAmount: true,
  issueDate: true,
  dueDate: true,
  billingPeriodStart: true,
  billingPeriodEnd: true,
  items: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).pick({
  tenantId: true,
  userId: true,
  action: true,
  resource: true,
  resourceId: true,
  details: true,
  ipAddress: true,
  userAgent: true,
  level: true,
});

export const insertSystemConfigSchema = createInsertSchema(systemConfig).pick({
  key: true,
  value: true,
  description: true,
  category: true,
});

// TypeScript types
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type InsertSystemConfig = z.infer<typeof insertSystemConfigSchema>;

export type Tenant = typeof tenants.$inferSelect;
export type User = typeof users.$inferSelect;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type SystemConfig = typeof systemConfig.$inferSelect;
export type SystemMetric = typeof systemMetrics.$inferSelect;