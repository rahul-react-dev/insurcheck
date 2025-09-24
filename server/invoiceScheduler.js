import cron from 'node-cron';
import { DateTime } from 'luxon';
import { db } from './db';
import { invoiceGenerationConfigs, tenants, invoiceGenerationLogs } from '../shared/schema.js';
import { eq, and, lte, isNotNull } from 'drizzle-orm';

// Import the existing invoice generation function from routes.js
// This function is already well-tested and handles all the invoice creation logic
let generateInvoiceForTenant;

/**
 * Calculate the next generation date based on frequency with proper timezone handling
 * @param {Date} currentDate - Current generation date
 * @param {string} frequency - 'monthly', 'quarterly', or 'yearly'
 * @param {string} timezone - Tenant's timezone
 * @returns {Date} Next generation date
 */
function calculateNextGenerationDate(currentDate, frequency, timezone = 'UTC') {
  const currentDateTime = DateTime.fromJSDate(currentDate, { zone: timezone });
  
  let nextDateTime;
  switch (frequency) {
    case 'monthly':
      nextDateTime = currentDateTime.plus({ months: 1 });
      break;
    case 'quarterly':
      nextDateTime = currentDateTime.plus({ months: 3 });
      break;
    case 'yearly':
      nextDateTime = currentDateTime.plus({ years: 1 });
      break;
    default:
      nextDateTime = currentDateTime.plus({ months: 1 }); // Default to monthly
  }
  
  return nextDateTime.toJSDate();
}

/**
 * Check if generation should be skipped for weekends using tenant timezone
 * @param {Date} date - Date to check
 * @param {boolean} generateOnWeekend - Configuration setting
 * @param {string} timezone - Tenant's timezone
 * @returns {boolean} True if should skip
 */
function shouldSkipWeekend(date, generateOnWeekend, timezone = 'UTC') {
  if (generateOnWeekend) return false;
  
  const dateTime = DateTime.fromJSDate(date, { zone: timezone });
  const dayOfWeek = dateTime.weekday; // 1 = Monday, 7 = Sunday
  return dayOfWeek === 6 || dayOfWeek === 7; // Saturday or Sunday
}

/**
 * Get the next business day if weekend generation is disabled using tenant timezone
 * @param {Date} date - Original date
 * @param {string} timezone - Tenant's timezone
 * @returns {Date} Next business day
 */
function getNextBusinessDay(date, timezone = 'UTC') {
  const dateTime = DateTime.fromJSDate(date, { zone: timezone });
  const dayOfWeek = dateTime.weekday; // 1 = Monday, 7 = Sunday
  
  let nextDateTime;
  if (dayOfWeek === 7) { // Sunday
    nextDateTime = dateTime.plus({ days: 1 }); // Move to Monday
  } else if (dayOfWeek === 6) { // Saturday
    nextDateTime = dateTime.plus({ days: 2 }); // Move to Monday
  } else {
    nextDateTime = dateTime; // Already a weekday
  }
  
  return nextDateTime.toJSDate();
}

/**
 * Main function to check and generate due invoices
 */
async function checkAndGenerateDueInvoices() {
  try {
    console.log('🕐 Invoice Scheduler: Checking for due invoices...');
    
    // Query all active configurations for timezone-aware checking
    const activeConfigurations = await db
      .select({
        id: invoiceGenerationConfigs.id,
        tenantId: invoiceGenerationConfigs.tenantId,
        frequency: invoiceGenerationConfigs.frequency,
        nextGenerationDate: invoiceGenerationConfigs.nextGenerationDate,
        timezone: invoiceGenerationConfigs.timezone,
        generateOnWeekend: invoiceGenerationConfigs.generateOnWeekend,
        autoSend: invoiceGenerationConfigs.autoSend,
        billingContactEmail: invoiceGenerationConfigs.billingContactEmail,
        tenantName: tenants.name,
        tenantStatus: tenants.status,
      })
      .from(invoiceGenerationConfigs)
      .leftJoin(tenants, eq(invoiceGenerationConfigs.tenantId, tenants.id))
      .where(
        and(
          eq(invoiceGenerationConfigs.isActive, true),
          eq(tenants.status, 'active'),
          isNotNull(invoiceGenerationConfigs.nextGenerationDate)
        )
      );

    if (activeConfigurations.length === 0) {
      console.log('📋 Invoice Scheduler: No active configurations found');
      return;
    }

    // Filter configurations that are due based on tenant timezone
    const dueConfigurations = [];
    const currentUTC = DateTime.utc();

    for (const config of activeConfigurations) {
      // Convert the next generation date to the tenant's timezone
      const nextGenInTenantTz = DateTime.fromJSDate(config.nextGenerationDate, { zone: config.timezone });
      const currentInTenantTz = currentUTC.setZone(config.timezone);
      
      // Check if it's due (current time >= next generation time in tenant's timezone)
      if (currentInTenantTz >= nextGenInTenantTz) {
        dueConfigurations.push(config);
      }
    }

    if (dueConfigurations.length === 0) {
      console.log('📋 Invoice Scheduler: No invoices due for generation');
      return;
    }

    console.log(`📋 Invoice Scheduler: Found ${dueConfigurations.length} configurations due for generation`);

    // Process each due configuration
    for (const config of dueConfigurations) {
      try {
        // Check if we should skip weekends using tenant's timezone
        const currentInTenantTz = DateTime.utc().setZone(config.timezone);
        
        if (shouldSkipWeekend(currentInTenantTz.toJSDate(), config.generateOnWeekend, config.timezone)) {
          const nextBusinessDay = getNextBusinessDay(currentInTenantTz.toJSDate(), config.timezone);
          console.log(`⏭️ Skipping weekend generation for tenant ${config.tenantName}, rescheduling to ${nextBusinessDay.toISOString()}`);
          
          // Update nextGenerationDate to next business day
          await db
            .update(invoiceGenerationConfigs)
            .set({
              nextGenerationDate: nextBusinessDay,
              updatedAt: new Date(),
            })
            .where(eq(invoiceGenerationConfigs.id, config.id));
          
          continue;
        }

        console.log(`🔄 Generating invoice for tenant: ${config.tenantName} (ID: ${config.tenantId})`);

        // Import and call the existing invoice generation function
        if (!generateInvoiceForTenant) {
          // Dynamic import to avoid circular dependencies
          const routesModule = await import('./routes.js');
          generateInvoiceForTenant = routesModule.generateInvoiceForTenant;
        }

        // Generate the invoice using existing logic
        const generationResult = await generateInvoiceForTenant(config.tenantId, config.tenantName);

        // Calculate next generation date
        const nextGenerationDate = calculateNextGenerationDate(
          config.nextGenerationDate,
          config.frequency,
          config.timezone
        );

        // Update the configuration with the next generation date
        await db
          .update(invoiceGenerationConfigs)
          .set({
            nextGenerationDate: nextGenerationDate,
            updatedAt: new Date(),
          })
          .where(eq(invoiceGenerationConfigs.id, config.id));

        // Log successful automatic generation with completed status
        console.log(`✅ Invoice generated for tenant ${config.tenantName}. Next generation: ${nextGenerationDate.toISOString()}`);

        // Create an audit log entry for automatic generation
        // Note: invoiceId is left null because the actual invoice is created asynchronously
        // The generationResult.logId refers to the processing log, not the final invoice
        await db.insert(invoiceGenerationLogs).values({
          tenantId: config.tenantId,
          tenantName: config.tenantName,
          configId: config.id,
          status: 'completed',  // Fixed: Use 'completed' status for successful automatic generation
          // invoiceId: null, // Invoice ID will be set when the async invoice creation completes
          metadata: {
            generationType: 'automatic',
            scheduledBy: 'system-cron',
            frequency: config.frequency,
            nextScheduled: nextGenerationDate,
            generatedInvoiceLogId: generationResult.logId,
            processedAt: new Date().toISOString(),
          },
          createdAt: new Date(),
        });

      } catch (error) {
        console.error(`❌ Failed to generate invoice for tenant ${config.tenantName}:`, error);

        // Create error log entry
        try {
          await db.insert(invoiceGenerationLogs).values({
            tenantId: config.tenantId,
            tenantName: config.tenantName,
            configId: config.id,
            status: 'failed',
            errorMessage: error.message,
            metadata: {
              generationType: 'automatic',
              scheduledBy: 'system-cron',
              frequency: config.frequency,
              errorDetails: error.stack,
            },
            createdAt: new Date(),
          });
        } catch (logError) {
          console.error('❌ Failed to create error log:', logError);
        }

        // Still update next generation date to avoid getting stuck
        const nextGenerationDate = calculateNextGenerationDate(
          config.nextGenerationDate,
          config.frequency,
          config.timezone
        );

        await db
          .update(invoiceGenerationConfigs)
          .set({
            nextGenerationDate: nextGenerationDate,
            updatedAt: new Date(),
          })
          .where(eq(invoiceGenerationConfigs.id, config.id));
      }
    }

    console.log(`✅ Invoice Scheduler: Completed processing ${dueConfigurations.length} configurations`);

  } catch (error) {
    console.error('❌ Invoice Scheduler Error:', error);
  }
}

/**
 * Initialize the invoice generation scheduler
 */
export function initializeInvoiceScheduler() {
  console.log('🚀 Initializing Invoice Generation Scheduler...');

  // Run every hour at minute 0
  // This checks for invoices due every hour on the hour
  const cronExpression = '0 * * * *'; // "At minute 0 past every hour"

  cron.schedule(cronExpression, async () => {
    console.log('⏰ Invoice Scheduler: Running scheduled check...');
    await checkAndGenerateDueInvoices();
  }, {
    timezone: 'UTC', // Run in UTC, handle tenant timezones in the logic
    scheduled: true
  });

  console.log('✅ Invoice Generation Scheduler initialized');
  console.log('📅 Schedule: Every hour at minute 0');
  console.log('🌍 Timezone: UTC (tenant timezones handled individually)');

  // Run an initial check on startup (after a short delay)
  setTimeout(async () => {
    console.log('🔄 Running initial invoice generation check...');
    await checkAndGenerateDueInvoices();
  }, 5000); // 5 second delay to allow server to fully start
}

/**
 * Manually trigger invoice generation check (for testing)
 */
export async function triggerManualCheck() {
  console.log('🔧 Manual trigger: Checking for due invoices...');
  await checkAndGenerateDueInvoices();
}

export default {
  initializeInvoiceScheduler,
  triggerManualCheck,
  checkAndGenerateDueInvoices,
  calculateNextGenerationDate,
};