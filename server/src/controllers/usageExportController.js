import { db } from '../../db.ts';
import { usageEvents, usageSummaries, tenants, users } from '../schema.ts';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

// Export usage data in various formats
export const exportUsageData = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { 
      format = 'csv',
      startDate,
      endDate,
      eventType = '',
      includeDetails = 'true'
    } = req.query;

    console.log(`📊 Exporting usage data in ${format.toUpperCase()} format for tenant ${tenantId}`);

    // Validate format
    if (!['csv', 'json', 'pdf'].includes(format.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid export format. Supported formats: csv, json, pdf'
      });
    }

    // Set date range (default to current month if not provided)
    let periodStart, periodEnd;
    if (startDate && endDate) {
      periodStart = new Date(startDate);
      periodEnd = new Date(endDate);
    } else {
      const now = new Date();
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    // Build where conditions
    let whereConditions = [
      eq(usageEvents.tenantId, tenantId),
      gte(usageEvents.createdAt, periodStart),
      lte(usageEvents.createdAt, periodEnd)
    ];

    if (eventType) {
      whereConditions.push(eq(usageEvents.eventType, eventType));
    }

    // Get usage data
    let exportData;
    
    if (includeDetails === 'true') {
      // Export detailed usage events
      exportData = await db
        .select({
          id: usageEvents.id,
          eventType: usageEvents.eventType,
          resourceId: usageEvents.resourceId,
          quantity: usageEvents.quantity,
          createdAt: usageEvents.createdAt,
          billingPeriodStart: usageEvents.billingPeriodStart,
          billingPeriodEnd: usageEvents.billingPeriodEnd,
          metadata: usageEvents.metadata,
          userId: usageEvents.userId
        })
        .from(usageEvents)
        .where(and(...whereConditions))
        .orderBy(desc(usageEvents.createdAt));
    } else {
      // Export usage summaries
      exportData = await db
        .select()
        .from(usageSummaries)
        .where(
          and(
            eq(usageSummaries.tenantId, tenantId),
            gte(usageSummaries.billingPeriodStart, periodStart),
            lte(usageSummaries.billingPeriodEnd, periodEnd)
          )
        );
    }

    // Generate export based on format
    const timestamp = new Date().toISOString().split('T')[0];
    let exportContent = '';
    let contentType = '';
    let filename = '';

    if (format === 'csv') {
      const csvResult = generateCSVExport(exportData, includeDetails === 'true');
      exportContent = csvResult.content;
      contentType = 'text/csv';
      filename = `usage-data-${timestamp}.csv`;
    } else if (format === 'json') {
      exportContent = JSON.stringify({
        exportDate: new Date().toISOString(),
        dateRange: {
          start: periodStart,
          end: periodEnd
        },
        tenantId,
        eventType: eventType || 'all',
        includeDetails: includeDetails === 'true',
        data: exportData
      }, null, 2);
      contentType = 'application/json';
      filename = `usage-data-${timestamp}.json`;
    } else if (format === 'pdf') {
      // For now, return JSON (PDF generation can be added later with libraries like puppeteer)
      exportContent = JSON.stringify({
        message: 'PDF export is not yet implemented. Please use CSV or JSON format.',
        data: exportData
      }, null, 2);
      contentType = 'application/json';
      filename = `usage-data-${timestamp}.json`;
    }

    // Set response headers for file download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');

    console.log(`✅ Usage data exported: ${exportData.length} records in ${format} format`);

    res.send(exportContent);

  } catch (error) {
    console.error('❌ Error exporting usage data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export usage data',
      error: error.message
    });
  }
};

// Generate CSV export content
const generateCSVExport = (data, includeDetails) => {
  if (data.length === 0) {
    return {
      content: includeDetails ? 
        'ID,Event Type,Resource ID,Quantity,Created At,Billing Period Start,Billing Period End,User ID,Metadata\n' :
        'ID,Event Type,Billing Period Start,Billing Period End,Total Quantity,Unit Price,Total Amount,Status,Billed At\n'
    };
  }

  let csvContent = '';

  if (includeDetails) {
    // CSV headers for detailed usage events
    csvContent = 'ID,Event Type,Resource ID,Quantity,Created At,Billing Period Start,Billing Period End,User ID,Metadata\n';
    
    // CSV data
    data.forEach(event => {
      const row = [
        `"${event.id || ''}"`,
        `"${event.eventType || ''}"`,
        `"${event.resourceId || ''}"`,
        event.quantity || 0,
        `"${event.createdAt ? new Date(event.createdAt).toISOString() : ''}"`,
        `"${event.billingPeriodStart ? new Date(event.billingPeriodStart).toISOString() : ''}"`,
        `"${event.billingPeriodEnd ? new Date(event.billingPeriodEnd).toISOString() : ''}"`,
        `"${event.userId || ''}"`,
        `"${event.metadata ? JSON.stringify(event.metadata).replace(/"/g, '""') : ''}"`
      ];
      csvContent += row.join(',') + '\n';
    });
  } else {
    // CSV headers for usage summaries
    csvContent = 'ID,Event Type,Billing Period Start,Billing Period End,Total Quantity,Unit Price,Total Amount,Status,Billed At\n';
    
    // CSV data
    data.forEach(summary => {
      const row = [
        `"${summary.id || ''}"`,
        `"${summary.eventType || ''}"`,
        `"${summary.billingPeriodStart ? new Date(summary.billingPeriodStart).toISOString() : ''}"`,
        `"${summary.billingPeriodEnd ? new Date(summary.billingPeriodEnd).toISOString() : ''}"`,
        summary.totalQuantity || 0,
        summary.unitPrice || '0.0000',
        summary.totalAmount || '0.00',
        `"${summary.status || ''}"`,
        `"${summary.billedAt ? new Date(summary.billedAt).toISOString() : ''}"`
      ];
      csvContent += row.join(',') + '\n';
    });
  }

  return { content: csvContent };
};

// Export usage analytics report
export const exportUsageAnalytics = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { 
      format = 'csv',
      startDate,
      endDate 
    } = req.query;

    console.log(`📊 Exporting usage analytics for tenant ${tenantId}`);

    // Set date range
    let periodStart, periodEnd;
    if (startDate && endDate) {
      periodStart = new Date(startDate);
      periodEnd = new Date(endDate);
    } else {
      // Last 3 months
      const now = new Date();
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      periodStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    }

    // Get aggregated analytics data
    const analyticsData = await db.execute(sql`
      SELECT 
        event_type,
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as total_events,
        SUM(quantity) as total_quantity,
        AVG(quantity) as avg_quantity_per_event
      FROM usage_events 
      WHERE tenant_id = ${tenantId}
        AND created_at >= ${periodStart}
        AND created_at <= ${periodEnd}
      GROUP BY event_type, DATE_TRUNC('month', created_at)
      ORDER BY month DESC, event_type
    `);

    const timestamp = new Date().toISOString().split('T')[0];

    if (format === 'csv') {
      // Generate CSV for analytics
      let csvContent = 'Event Type,Month,Total Events,Total Quantity,Average Quantity Per Event\n';
      
      analyticsData.rows.forEach(row => {
        const csvRow = [
          `"${row.event_type}"`,
          `"${new Date(row.month).toISOString().slice(0, 7)}"`, // YYYY-MM format
          row.total_events,
          row.total_quantity,
          Math.round(parseFloat(row.avg_quantity_per_event) * 100) / 100
        ];
        csvContent += csvRow.join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="usage-analytics-${timestamp}.csv"`);
      res.send(csvContent);
    } else {
      // Return JSON
      res.json({
        success: true,
        data: {
          exportDate: new Date().toISOString(),
          dateRange: {
            start: periodStart,
            end: periodEnd
          },
          tenantId,
          analytics: analyticsData.rows
        }
      });
    }

    console.log(`✅ Usage analytics exported: ${analyticsData.rows.length} records`);

  } catch (error) {
    console.error('❌ Error exporting usage analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export usage analytics',
      error: error.message
    });
  }
};