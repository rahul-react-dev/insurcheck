
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../shared/schema";
import bcrypt from "bcrypt";

const connection = postgres(process.env.DATABASE_URL!);
const db = drizzle(connection, { schema });

async function initFullSchema() {
  try {
    console.log("🚀 Initializing full database schema...");

    // Create sample tenants
    const sampleTenants = [
      {
        name: "SecureLife Insurance",
        domain: "securelife.com",
        email: "admin@securelife.com",
        phone: "+1-555-0101",
        address: {
          street: "123 Insurance Blvd",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "USA"
        },
        isActive: true,
        trialStartDate: new Date(),
        trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        name: "HealthGuard Corp",
        domain: "healthguard.com",
        email: "admin@healthguard.com",
        phone: "+1-555-0102",
        address: {
          street: "456 Health St",
          city: "Los Angeles",
          state: "CA",
          zipCode: "90001",
          country: "USA"
        },
        isActive: true
      },
      {
        name: "AutoProtect Ltd",
        domain: "autoprotect.com",
        email: "admin@autoprotect.com",
        phone: "+1-555-0103",
        address: {
          street: "789 Auto Ave",
          city: "Chicago",
          state: "IL",
          zipCode: "60601",
          country: "USA"
        },
        isActive: true
      }
    ];

    const createdTenants = await db.insert(schema.tenants).values(sampleTenants).returning();
    console.log(`✅ Created ${createdTenants.length} sample tenants`);

    // Create super admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const superAdminUser = await db.insert(schema.users).values({
      username: "superadmin",
      email: "superadmin@insurcheck.com",
      password: hashedPassword,
      firstName: "Super",
      lastName: "Admin",
      role: "super-admin",
      isActive: true
    }).returning();
    console.log("✅ Created super admin user");

    // Create tenant admin users
    const tenantAdmins = [
      {
        username: "admin_securelife",
        email: "admin@securelife.com",
        password: hashedPassword,
        firstName: "John",
        lastName: "Smith",
        role: "tenant-admin" as const,
        tenantId: createdTenants[0].id,
        isActive: true
      },
      {
        username: "admin_healthguard",
        email: "admin@healthguard.com",
        password: hashedPassword,
        firstName: "Jane",
        lastName: "Doe",
        role: "tenant-admin" as const,
        tenantId: createdTenants[1].id,
        isActive: true
      }
    ];

    const createdAdmins = await db.insert(schema.users).values(tenantAdmins).returning();
    console.log(`✅ Created ${createdAdmins.length} tenant admin users`);

    // Create regular users for tenants
    const regularUsers = [
      {
        username: "user1_securelife",
        email: "user1@securelife.com",
        password: hashedPassword,
        firstName: "Alice",
        lastName: "Johnson",
        role: "user" as const,
        tenantId: createdTenants[0].id,
        isActive: true
      },
      {
        username: "user2_securelife",
        email: "user2@securelife.com",
        password: hashedPassword,
        firstName: "Bob",
        lastName: "Wilson",
        role: "user" as const,
        tenantId: createdTenants[0].id,
        isActive: true
      },
      {
        username: "user1_healthguard",
        email: "user1@healthguard.com",
        password: hashedPassword,
        firstName: "Carol",
        lastName: "Brown",
        role: "user" as const,
        tenantId: createdTenants[1].id,
        isActive: true
      }
    ];

    const createdUsers = await db.insert(schema.users).values(regularUsers).returning();
    console.log(`✅ Created ${createdUsers.length} regular users`);

    // Create subscription plans
    const subscriptionPlans = [
      {
        name: "Basic Plan",
        type: "basic" as const,
        price: "29.99",
        billingCycle: "monthly",
        features: {
          maxUsers: 10,
          maxDocuments: 1000,
          storageLimit: 5,
          support: "email",
          apiAccess: false
        },
        maxUsers: 10,
        maxDocuments: 1000,
        storageLimit: 5,
        isActive: true
      },
      {
        name: "Premium Plan",
        type: "premium" as const,
        price: "79.99",
        billingCycle: "monthly",
        features: {
          maxUsers: 50,
          maxDocuments: 10000,
          storageLimit: 50,
          support: "phone_email",
          apiAccess: true
        },
        maxUsers: 50,
        maxDocuments: 10000,
        storageLimit: 50,
        isActive: true
      },
      {
        name: "Enterprise Plan",
        type: "enterprise" as const,
        price: "199.99",
        billingCycle: "monthly",
        features: {
          maxUsers: -1,
          maxDocuments: -1,
          storageLimit: 500,
          support: "dedicated",
          apiAccess: true,
          customIntegrations: true
        },
        maxUsers: null,
        maxDocuments: null,
        storageLimit: 500,
        isActive: true
      }
    ];

    const createdPlans = await db.insert(schema.subscriptionPlans).values(subscriptionPlans).returning();
    console.log(`✅ Created ${createdPlans.length} subscription plans`);

    // Create tenant subscriptions
    const tenantSubscriptions = [
      {
        tenantId: createdTenants[0].id,
        planId: createdPlans[1].id, // Premium plan
        status: "active" as const,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        autoRenew: true
      },
      {
        tenantId: createdTenants[1].id,
        planId: createdPlans[0].id, // Basic plan
        status: "trial" as const,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        autoRenew: false
      }
    ];

    const createdSubscriptions = await db.insert(schema.tenantSubscriptions).values(tenantSubscriptions).returning();
    console.log(`✅ Created ${createdSubscriptions.length} tenant subscriptions`);

    // Create sample payments
    const samplePayments = [
      {
        tenantId: createdTenants[0].id,
        subscriptionId: createdSubscriptions[0].id,
        amount: "79.99",
        currency: "USD",
        status: "completed" as const,
        paymentMethod: "credit_card",
        transactionId: "txn_123456789",
        paidAt: new Date()
      },
      {
        tenantId: createdTenants[1].id,
        subscriptionId: createdSubscriptions[1].id,
        amount: "29.99",
        currency: "USD",
        status: "pending" as const,
        paymentMethod: "credit_card",
        transactionId: "txn_987654321"
      }
    ];

    const createdPayments = await db.insert(schema.payments).values(samplePayments).returning();
    console.log(`✅ Created ${createdPayments.length} sample payments`);

    // Create sample invoices
    const sampleInvoices = [
      {
        tenantId: createdTenants[0].id,
        subscriptionId: createdSubscriptions[0].id,
        invoiceNumber: "INV-2024-001",
        amount: "79.99",
        tax: "6.40",
        total: "86.39",
        status: "paid" as const,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paidAt: new Date(),
        items: [
          {
            description: "Premium Plan - Monthly",
            quantity: 1,
            unitPrice: 79.99,
            total: 79.99
          }
        ]
      }
    ];

    const createdInvoices = await db.insert(schema.invoices).values(sampleInvoices).returning();
    console.log(`✅ Created ${createdInvoices.length} sample invoices`);

    // Create sample activity logs
    const sampleActivityLogs = [
      {
        tenantId: createdTenants[0].id,
        userId: createdUsers[0].id,
        type: "login" as const,
        description: "User logged in successfully",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      {
        tenantId: createdTenants[0].id,
        userId: createdUsers[0].id,
        type: "document_upload" as const,
        description: "Uploaded insurance policy document",
        ipAddress: "192.168.1.100",
        metadata: {
          documentName: "policy_12345.pdf",
          fileSize: 2048576
        }
      }
    ];

    const createdActivityLogs = await db.insert(schema.activityLogs).values(sampleActivityLogs).returning();
    console.log(`✅ Created ${createdActivityLogs.length} sample activity logs`);

    // Create sample error logs
    const sampleErrorLogs = [
      {
        tenantId: createdTenants[0].id,
        userId: createdUsers[0].id,
        type: "validation" as const,
        message: "Invalid file format uploaded",
        endpoint: "/api/documents/upload",
        method: "POST",
        ipAddress: "192.168.1.100",
        resolved: false
      },
      {
        type: "system" as const,
        message: "Database connection timeout",
        endpoint: "/api/tenants",
        method: "GET",
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy: superAdminUser[0].id
      }
    ];

    const createdErrorLogs = await db.insert(schema.errorLogs).values(sampleErrorLogs).returning();
    console.log(`✅ Created ${createdErrorLogs.length} sample error logs`);

    // Create sample system configuration
    const systemConfigs = [
      {
        key: "auto_delete_interval",
        value: { days: 30 },
        description: "Number of days after which deleted documents are permanently removed"
      },
      {
        key: "max_file_size",
        value: { mb: 100 },
        description: "Maximum file size allowed for document uploads"
      },
      {
        key: "allowed_file_types",
        value: { types: ["pdf", "doc", "docx", "jpg", "png"] },
        description: "Allowed file types for document uploads"
      },
      {
        key: "maintenance_mode",
        value: { enabled: false },
        description: "System maintenance mode flag"
      }
    ];

    const createdConfigs = await db.insert(schema.systemConfig).values(systemConfigs).returning();
    console.log(`✅ Created ${createdConfigs.length} system configuration entries`);

    console.log("🎉 Database initialization completed successfully!");
    console.log("📋 Summary:");
    console.log(`   - Tenants: ${createdTenants.length}`);
    console.log(`   - Users: ${1 + createdAdmins.length + createdUsers.length} (1 super admin, ${createdAdmins.length} tenant admins, ${createdUsers.length} regular users)`);
    console.log(`   - Subscription Plans: ${createdPlans.length}`);
    console.log(`   - Tenant Subscriptions: ${createdSubscriptions.length}`);
    console.log(`   - Payments: ${createdPayments.length}`);
    console.log(`   - Invoices: ${createdInvoices.length}`);
    console.log(`   - Activity Logs: ${createdActivityLogs.length}`);
    console.log(`   - Error Logs: ${createdErrorLogs.length}`);
    console.log(`   - System Configs: ${createdConfigs.length}`);
    console.log("\n🔑 Login Credentials:");
    console.log("   Super Admin: superadmin@insurcheck.com / admin123");
    console.log("   Tenant Admin: admin@securelife.com / admin123");
    console.log("   Tenant Admin: admin@healthguard.com / admin123");

  } catch (error) {
    console.error("❌ Error initializing database:", error);
  } finally {
    await connection.end();
  }
}

// Run the initialization
initFullSchema();
