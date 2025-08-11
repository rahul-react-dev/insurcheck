
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Role enum for type safety
export const roleEnum = pgEnum('role', ['super-admin', 'tenant-admin', 'user']);

// Tenants table - shared across the application
export const tenants = pgTable("tenants", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  domain: text("domain").unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced users table with multi-tenant support
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default('user'),
  tenantId: integer("tenant_id").references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define relations
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
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

// TypeScript types
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Tenant = typeof tenants.$inferSelect;
export type User = typeof users.$inferSelect;
