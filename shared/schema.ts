import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, pgEnum, boolean, decimal, jsonb, uuid, serial, unique } from "drizzle-orm/pg-core";
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

// Compliance rule type enum
export const ruleTypeEnum = pgEnum('rule_type', ['required', 'format', 'range', 'length', 'custom']);

// Invoice generation status enum
export const invoiceGenerationStatusEnum = pgEnum('generation_status', ['scheduled', 'processing', 'completed', 'failed', 'retrying']);

// Usage event type enum
export const usageEventTypeEnum = pgEnum('usage_event_type', ['document_upload', 'document_download', 'api_call', 'user_creation', 'storage_usage', 'compliance_check']);

// Usage billing status enum
export const usageBillingStatusEnum = pgEnum('usage_billing_status', ['pending', 'calculated', 'billed', 'failed']);

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
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`), // Keep existing UUID format
  username: varchar('username', { length: 255 }),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phoneNumber: varchar('phone_number', { length: 20 }),
  companyName: varchar('company_name', { length: 255 }),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('user'),
  tenantId: integer('tenant_id').references(() => tenants.id),
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at'),
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  accountLockedUntil: timestamp('account_locked_until'),
  passwordResetToken: varchar('password_reset_token', { length: 255 }),
  passwordResetExpires: timestamp('password_reset_expires'),
  // Email verification fields
  emailVerified: boolean('email_verified').default(false),
  emailVerificationToken: varchar('email_verification_token', { length: 255 }),
  emailVerificationExpires: timestamp('email_verification_expires'),
  emailVerificationResendCount: integer('email_verification_resend_count').default(0),
  emailVerificationLastSent: timestamp('email_verification_last_sent'),
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
  // S3 related fields
  s3Key: text("s3_key"), // S3 object key path
  s3Bucket: text("s3_bucket"), // S3 bucket name  
  s3Url: text("s3_url"), // S3 object URL
  downloadCount: integer("download_count").default(0), // Track downloads
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
  paymentMethod: text("payment_method"),
  transactionId: text("transaction_id"),
  billingPeriodStart: timestamp("billing_period_start").notNull(),
  billingPeriodEnd: timestamp("billing_period_end").notNull(),
  items: jsonb("items").notNull(),
  billingDetails: jsonb("billing_details"),
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

// Tenant-specific configuration table
export const tenantConfig = pgTable("tenant_config", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  key: text("key").notNull(),
  value: jsonb("value").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Usage events tracking table for metered billing
export const usageEvents = pgTable("usage_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  eventType: usageEventTypeEnum("event_type").notNull(),
  resourceId: varchar("resource_id"), // ID of related resource (document, user, etc.)
  quantity: integer("quantity").notNull().default(1), // Number of units consumed
  metadata: jsonb("metadata"), // Additional event data
  billingPeriodStart: timestamp("billing_period_start").notNull(),
  billingPeriodEnd: timestamp("billing_period_end").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Usage summaries table for aggregated billing data
export const usageSummaries = pgTable("usage_summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  eventType: usageEventTypeEnum("event_type").notNull(),
  billingPeriodStart: timestamp("billing_period_start").notNull(),
  billingPeriodEnd: timestamp("billing_period_end").notNull(),
  totalQuantity: integer("total_quantity").notNull().default(0),
  unitPrice: decimal("unit_price", { precision: 10, scale: 4 }).notNull().default('0.0000'), // Price per unit
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull().default('0.00'), // Total charge
  status: usageBillingStatusEnum("status").notNull().default('pending'),
  billedAt: timestamp("billed_at"),
  invoiceId: varchar("invoice_id").references(() => invoices.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniqueBillingPeriod: unique().on(table.tenantId, table.eventType, table.billingPeriodStart),
}));

// Usage limits table for plan-based restrictions
export const usageLimits = pgTable("usage_limits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planId: integer("plan_id").references(() => subscriptionPlans.id).notNull(),
  eventType: usageEventTypeEnum("event_type").notNull(),
  limitQuantity: integer("limit_quantity"), // NULL means unlimited
  unitPrice: decimal("unit_price", { precision: 10, scale: 4 }).notNull().default('0.0000'),
  overagePrice: decimal("overage_price", { precision: 10, scale: 4 }), // Price for usage over limit
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniquePlanEventType: unique().on(table.planId, table.eventType),
}));

// System Metrics table
export const systemMetrics = pgTable("system_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  metricName: text("metric_name").notNull(),
  metricValue: decimal("metric_value", { precision: 15, scale: 2 }).notNull(),
  metricType: text("metric_type").notNull(), // counter, gauge, histogram
  tags: jsonb("tags"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Notification Templates table
export const notificationTemplates = pgTable("notification_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  templateType: text("template_type").notNull(), // 'compliance_result', 'audit_log', 'user_notification', 'system_alert'
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  header: text("header"),
  body: text("body").notNull(),
  footer: text("footer"),
  variables: jsonb("variables").default('[]'),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    uniqueTemplatePerTenant: unique().on(table.tenantId, table.templateType, table.name)
  }
});

// Notification Template Audit Logs table
export const notificationTemplateAuditLogs = pgTable("notification_template_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  templateId: varchar("template_id").notNull().references(() => notificationTemplates.id),
  action: text("action").notNull(),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  changedBy: varchar("changed_by").notNull().references(() => users.id),
  changeReason: text("change_reason"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relations
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  documents: many(documents),
  subscriptions: many(subscriptions), // Changed to many-to-many relation via subscriptions.tenantId
  payments: many(payments),
  invoices: many(invoices),
  activityLogs: many(activityLogs),
  tenantConfigs: many(tenantConfig),
  usageEvents: many(usageEvents),
  usageSummaries: many(usageSummaries),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  documents: many(documents),
  activityLogs: many(activityLogs),
  usageEvents: many(usageEvents),
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
  usageLimits: many(usageLimits),
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

export const tenantConfigRelations = relations(tenantConfig, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantConfig.tenantId],
    references: [tenants.id],
  }),
}));

// Invoice generation configurations table
export const invoiceGenerationConfigs = pgTable("invoice_generation_configs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  frequency: text("frequency").notNull().default('monthly'), // monthly, quarterly, yearly
  startDate: timestamp("start_date").notNull(),
  billingContactEmail: varchar("billing_contact_email", { length: 255 }).notNull(),
  timezone: text("timezone").notNull().default('UTC'),
  generateOnWeekend: boolean("generate_on_weekend").default(false),
  autoSend: boolean("auto_send").default(true),
  reminderDays: integer("reminder_days").default(3),
  isActive: boolean("is_active").default(true),
  nextGenerationDate: timestamp("next_generation_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoice generation logs table
export const invoiceGenerationLogs = pgTable("invoice_generation_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  tenantName: text("tenant_name").notNull(),
  configId: integer("config_id").references(() => invoiceGenerationConfigs.id),
  status: invoiceGenerationStatusEnum("status").notNull().default('scheduled'),
  invoiceId: varchar("invoice_id").references(() => invoices.id),
  invoiceNumber: text("invoice_number"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  billingPeriodStart: timestamp("billing_period_start"),
  billingPeriodEnd: timestamp("billing_period_end"),
  generatedAt: timestamp("generated_at"),
  sentAt: timestamp("sent_at"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Compliance Rules table
export const complianceRules = pgTable("compliance_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  ruleId: text("rule_id").notNull(), // User-friendly rule identifier (e.g., "REQ-001")
  fieldName: text("field_name").notNull(), // Field this rule applies to
  ruleType: ruleTypeEnum("rule_type").notNull(), // required, format, range, etc.
  value: text("value").notNull(), // Rule value/pattern (e.g., regex, min/max values)
  description: text("description").notNull(),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Compliance Rule Audit Logs table
export const complianceRuleAuditLogs = pgTable("compliance_rule_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  ruleId: varchar("rule_id").references(() => complianceRules.id).notNull(),
  action: text("action").notNull(), // 'created', 'updated', 'deleted', 'activated', 'deactivated'
  oldValues: jsonb("old_values"), // Previous values before change
  newValues: jsonb("new_values"), // New values after change
  changedBy: varchar("changed_by").references(() => users.id).notNull(),
  changeReason: text("change_reason"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations for new tables
export const invoiceGenerationConfigsRelations = relations(invoiceGenerationConfigs, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [invoiceGenerationConfigs.tenantId],
    references: [tenants.id],
  }),
  logs: many(invoiceGenerationLogs),
}));

export const invoiceGenerationLogsRelations = relations(invoiceGenerationLogs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [invoiceGenerationLogs.tenantId],
    references: [tenants.id],
  }),
  config: one(invoiceGenerationConfigs, {
    fields: [invoiceGenerationLogs.configId],
    references: [invoiceGenerationConfigs.id],
  }),
  invoice: one(invoices, {
    fields: [invoiceGenerationLogs.invoiceId],
    references: [invoices.id],
  }),
}));

export const complianceRulesRelations = relations(complianceRules, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [complianceRules.tenantId],
    references: [tenants.id],
  }),
  createdBy: one(users, {
    fields: [complianceRules.createdBy],
    references: [users.id],
  }),
  updatedBy: one(users, {
    fields: [complianceRules.updatedBy],
    references: [users.id],
  }),
  auditLogs: many(complianceRuleAuditLogs),
}));

export const complianceRuleAuditLogsRelations = relations(complianceRuleAuditLogs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [complianceRuleAuditLogs.tenantId],
    references: [tenants.id],
  }),
  rule: one(complianceRules, {
    fields: [complianceRuleAuditLogs.ruleId],
    references: [complianceRules.id],
  }),
  changedBy: one(users, {
    fields: [complianceRuleAuditLogs.changedBy],
    references: [users.id],
  }),
}));

// Usage Events Relations
export const usageEventsRelations = relations(usageEvents, ({ one }) => ({
  tenant: one(tenants, {
    fields: [usageEvents.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [usageEvents.userId],
    references: [users.id],
  }),
}));

// Usage Summaries Relations
export const usageSummariesRelations = relations(usageSummaries, ({ one }) => ({
  tenant: one(tenants, {
    fields: [usageSummaries.tenantId],
    references: [tenants.id],
  }),
  invoice: one(invoices, {
    fields: [usageSummaries.invoiceId],
    references: [invoices.id],
  }),
}));

// Usage Limits Relations
export const usageLimitsRelations = relations(usageLimits, ({ one }) => ({
  plan: one(subscriptionPlans, {
    fields: [usageLimits.planId],
    references: [subscriptionPlans.id],
  }),
}));

// Zod schemas for validation
export const insertTenantSchema = createInsertSchema(tenants).pick({
  name: true,
  domain: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  role: true,
  tenantId: true,
});

// Email verification schema for signup
export const insertUserSignupSchema = createInsertSchema(users).pick({
  firstName: true,
  lastName: true,
  email: true,
  phoneNumber: true,
  companyName: true,
  password: true,
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
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  tenantId: true,
  userId: true,
  filename: true,
  originalName: true,
  fileSize: true,
  mimeType: true,
  s3Key: true,
  s3Bucket: true,
  s3Url: true,
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

export const insertInvoiceGenerationConfigSchema = createInsertSchema(invoiceGenerationConfigs).pick({
  tenantId: true,
  frequency: true,
  startDate: true,
  billingContactEmail: true,
  timezone: true,
  generateOnWeekend: true,
  autoSend: true,
  reminderDays: true,
  isActive: true,
});

export const insertInvoiceGenerationLogSchema = createInsertSchema(invoiceGenerationLogs).pick({
  tenantId: true,
  tenantName: true,
  configId: true,
  status: true,
  amount: true,
  billingPeriodStart: true,
  billingPeriodEnd: true,
});

export const insertComplianceRuleSchema = createInsertSchema(complianceRules).pick({
  tenantId: true,
  ruleId: true,
  fieldName: true,
  ruleType: true,
  value: true,
  description: true,
  createdBy: true,
});

export const updateComplianceRuleSchema = createInsertSchema(complianceRules).pick({
  fieldName: true,
  ruleType: true,
  value: true,
  description: true,
  isActive: true,
  updatedBy: true,
});

export const insertComplianceRuleAuditLogSchema = createInsertSchema(complianceRuleAuditLogs).pick({
  tenantId: true,
  ruleId: true,
  action: true,
  oldValues: true,
  newValues: true,
  changedBy: true,
  changeReason: true,
  ipAddress: true,
  userAgent: true,
});

export const insertSystemConfigSchema = createInsertSchema(systemConfig).pick({
  key: true,
  value: true,
  description: true,
  category: true,
});

export const insertTenantConfigSchema = createInsertSchema(tenantConfig).pick({
  tenantId: true,
  key: true,
  value: true,
  description: true,
  category: true,
});

export const insertUsageEventSchema = createInsertSchema(usageEvents).pick({
  tenantId: true,
  userId: true,
  eventType: true,
  resourceId: true,
  quantity: true,
  metadata: true,
  billingPeriodStart: true,
  billingPeriodEnd: true,
});

export const insertUsageSummarySchema = createInsertSchema(usageSummaries).pick({
  tenantId: true,
  eventType: true,
  billingPeriodStart: true,
  billingPeriodEnd: true,
  totalQuantity: true,
  unitPrice: true,
  totalAmount: true,
  status: true,
  billedAt: true,
  invoiceId: true,
});

export const insertUsageLimitSchema = createInsertSchema(usageLimits).pick({
  planId: true,
  eventType: true,
  limitQuantity: true,
  unitPrice: true,
  overagePrice: true,
  isActive: true,
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
export type InsertTenantConfig = z.infer<typeof insertTenantConfigSchema>;
export type InsertInvoiceGenerationConfig = z.infer<typeof insertInvoiceGenerationConfigSchema>;
export type InsertInvoiceGenerationLog = z.infer<typeof insertInvoiceGenerationLogSchema>;
export type InsertUsageEvent = z.infer<typeof insertUsageEventSchema>;
export type InsertUsageSummary = z.infer<typeof insertUsageSummarySchema>;
export type InsertUsageLimit = z.infer<typeof insertUsageLimitSchema>;

export type Tenant = typeof tenants.$inferSelect;
export type User = typeof users.$inferSelect;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InvoiceGenerationConfig = typeof invoiceGenerationConfigs.$inferSelect;
export type InvoiceGenerationLog = typeof invoiceGenerationLogs.$inferSelect;
export type SystemConfig = typeof systemConfig.$inferSelect;
export type TenantConfig = typeof tenantConfig.$inferSelect;
export type SystemMetric = typeof systemMetrics.$inferSelect;
export type UsageEvent = typeof usageEvents.$inferSelect;
export type UsageSummary = typeof usageSummaries.$inferSelect;
export type UsageLimit = typeof usageLimits.$inferSelect;