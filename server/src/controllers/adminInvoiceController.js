import { db } from '../../db.js';
import { invoices, tenants, users, complianceRuleAuditLogs, subscriptionPlans, subscriptions } from '../../../shared/schema.js';
import { eq, and, like, desc, asc, count, sql, or } from 'drizzle-orm';

// Get invoices for tenant admin with enhanced filtering and statistics
export const getAdminInvoices = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      sortBy = 'invoiceDate', 
      sortOrder = 'desc',
      status = '',
      startDate = '',
      endDate = ''
    } = req.query;

    const skip = (page - 1) * limit;

    console.log(`📋 Admin fetching invoices for tenant ${tenantId}`);

    // Build base query for invoices with subscription plan information for "My Invoices" context
    let query = db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        amount: invoices.amount,
        taxAmount: invoices.taxAmount,
        totalAmount: invoices.totalAmount,
        status: invoices.status,
        paidDate: invoices.paidDate,
        paymentMethod: invoices.paymentMethod,
        transactionId: invoices.transactionId,
        billingPeriodStart: invoices.billingPeriodStart,
        billingPeriodEnd: invoices.billingPeriodEnd,
        items: invoices.items,
        billingDetails: invoices.billingDetails,
        createdAt: invoices.createdAt,
        updatedAt: invoices.updatedAt,
        tenantId: invoices.tenantId,
        // Include subscription plan information for context
        planName: subscriptionPlans.name,
        planDescription: subscriptionPlans.description,
        planPrice: subscriptionPlans.price
      })
      .from(invoices)
      .leftJoin(subscriptions, eq(invoices.tenantId, subscriptions.tenantId))
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id));

    // Apply filters
    let whereConditions = [eq(invoices.tenantId, tenantId)];

    if (search) {
      whereConditions.push(
        or(
          like(invoices.invoiceNumber, `%${search}%`),
          like(invoices.status, `%${search}%`)
        )
      );
    }

    if (status) {
      whereConditions.push(eq(invoices.status, status));
    }

    if (startDate) {
      whereConditions.push(sql`DATE(${invoices.issueDate}) >= ${startDate}`);
    }

    if (endDate) {
      whereConditions.push(sql`DATE(${invoices.issueDate}) <= ${endDate}`);
    }

    query = query.where(and(...whereConditions));

    // Apply sorting with valid field mapping for "My Invoices" (subscription payment history)
    const validSortFields = {
      'invoiceNumber': invoices.invoiceNumber,
      'issueDate': invoices.issueDate,
      'dueDate': invoices.dueDate,
      'paidDate': invoices.paidDate, // Added paidDate for subscription payment history
      'totalAmount': invoices.totalAmount,
      'amount': invoices.amount,
      'status': invoices.status,
      'createdAt': invoices.createdAt
    };
    
    const sortColumn = validSortFields[sortBy] || invoices.paidDate; // Default to paidDate for payment history
    query = sortOrder === 'asc' 
      ? query.orderBy(asc(sortColumn))
      : query.orderBy(desc(sortColumn));

    // Get total count
    const totalCountQuery = db
      .select({ count: count() })
      .from(invoices)
      .where(and(...whereConditions));

    const [invoicesData, totalCount] = await Promise.all([
      query.limit(limit).offset(skip),
      totalCountQuery
    ]);

    console.log(`✅ Admin ${req.user.email}: Found ${invoicesData.length} invoices (${totalCount[0].count} total)`);

    res.json({
      success: true,
      invoices: invoicesData,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount[0].count,
        totalPages: Math.ceil(totalCount[0].count / limit)
      }
    });

  } catch (error) {
    console.error('Get admin invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices'
    });
  }
};

// Get invoice statistics for tenant admin
export const getAdminInvoiceStats = async (req, res) => {
  try {
    const { tenantId } = req.user;

    console.log(`📊 Admin fetching "My Invoices" payment history stats for tenant ${tenantId}`);

    // Enhanced stats query for subscription payment history
    console.log(`🔍 Using tenant ID: ${tenantId} for payment history stats`);

    const result = await db.execute(sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'paid') as total_paid,
        COALESCE(SUM(total_amount) FILTER (WHERE status = 'paid'), 0) as total_paid_amount,
        MIN(paid_date) FILTER (WHERE status = 'paid') as first_payment_date,
        MAX(paid_date) FILTER (WHERE status = 'paid') as last_payment_date,
        COUNT(DISTINCT DATE_TRUNC('year', paid_date)) FILTER (WHERE status = 'paid') as payment_years,
        COUNT(DISTINCT DATE_TRUNC('month', paid_date)) FILTER (WHERE status = 'paid') as payment_months
      FROM invoices 
      WHERE tenant_id = ${tenantId}
    `);
    const stats = result.rows[0];

    console.log(`✅ Admin "My Invoices" payment history stats retrieved for tenant ${tenantId}`);

    res.json({
      success: true,
      data: {
        // Payment history focused stats
        totalPaid: parseInt(stats.total_paid || 0),
        totalPaidAmount: parseFloat(stats.total_paid_amount || 0),
        firstPaymentDate: stats.first_payment_date,
        lastPaymentDate: stats.last_payment_date,
        paymentYears: parseInt(stats.payment_years || 0),
        paymentMonths: parseInt(stats.payment_months || 0),
        // Legacy fields for compatibility 
        total: parseInt(stats.total_paid || 0),
        totalAmount: parseFloat(stats.total_paid_amount || 0),
        paid: parseInt(stats.total_paid || 0),
        paidAmount: parseFloat(stats.total_paid_amount || 0),
        unpaid: 0, // Not relevant for payment history
        unpaidAmount: 0,
        overdue: 0,
        overdueAmount: 0
      }
    });

  } catch (error) {
    console.error('❌ Get admin invoice stats error:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Stack trace:', error.stack);
    
    // Don't let this error crash the server or block other requests
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get single invoice details for tenant admin
export const getAdminInvoiceDetails = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const { id } = req.params;

    console.log(`👀 Admin fetching invoice details: ${id} for tenant ${tenantId}`);

    // Use raw SQL query to avoid Drizzle ORM issues
    const result = await db.execute(sql`
      SELECT 
        i.*,
        t.name as tenant_name
      FROM invoices i
      LEFT JOIN tenants t ON i.tenant_id = t.id
      WHERE i.id = ${id} AND i.tenant_id = ${tenantId}
    `);

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found or access denied'
      });
    }

    const invoice = result.rows[0];

    console.log(`✅ Admin invoice details retrieved: ${invoice.invoice_number}`);

    // Transform snake_case to camelCase for frontend compatibility
    const transformedInvoice = {
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      invoiceDate: invoice.issue_date,
      dueDate: invoice.due_date,
      amount: invoice.amount,
      taxAmount: invoice.tax_amount,
      totalAmount: invoice.total_amount,
      status: invoice.status,
      paidDate: invoice.paid_date,
      billingPeriodStart: invoice.billing_period_start,
      billingPeriodEnd: invoice.billing_period_end,
      items: invoice.items,
      billingDetails: invoice.billing_details || {
        adminName: "Admin User",
        companyName: "Sample Company",
        address: "123 Business St, Suite 100, Business City, BC 12345"
      },
      createdAt: invoice.created_at,
      updatedAt: invoice.updated_at,
      tenantName: invoice.tenant_name
    };

    res.json({
      success: true,
      data: transformedInvoice
    });

  } catch (error) {
    console.error('Get admin invoice details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice details'
    });
  }
};

// Process payment for invoice (tenant admin)
export const processAdminPayment = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const { 
      invoiceId, 
      paymentMethod, 
      cardNumber, 
      cardHolder, 
      expiryMonth, 
      expiryYear, 
      cvv,
      bankAccount,
      routingNumber 
    } = req.body;

    console.log(`💳 Admin processing payment for invoice: ${invoiceId}`);

    // Verify invoice belongs to tenant and is payable
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(and(
        eq(invoices.id, invoiceId),
        eq(invoices.tenantId, tenantId),
        or(
          eq(invoices.status, 'unpaid'),
          eq(invoices.status, 'overdue')
        )
      ));

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found or not payable'
      });
    }

    // Simulate payment processing (in real implementation, integrate with payment gateway)
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const paidDate = new Date();

    // Update invoice status
    const [updatedInvoice] = await db
      .update(invoices)
      .set({
        status: 'paid',
        paidDate: paidDate,
        paymentMethod: paymentMethod,
        transactionId: transactionId,
        updatedAt: new Date()
      })
      .where(eq(invoices.id, invoiceId))
      .returning();

    // Create audit log entry for compliance
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    console.log(`📝 Audit: Payment processed - Invoice: ${invoice.invoiceNumber}, Amount: ${invoice.totalAmount}, Method: ${paymentMethod}, Transaction: ${transactionId}`);

    console.log(`✅ Payment processed successfully for invoice: ${invoice.invoiceNumber}`);

    res.json({
      success: true,
      message: 'Payment successful. Receipt available for download.',
      data: {
        invoiceId: invoiceId,
        transactionId: transactionId,
        paidDate: paidDate,
        amount: invoice.totalAmount
      }
    });

  } catch (error) {
    console.error('Process admin payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment failed. Please try again.'
    });
  }
};

// Download receipt for paid invoice (tenant admin)
export const downloadAdminReceipt = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;

    console.log(`📄 Admin downloading receipt for invoice: ${id}`);

    // Get invoice details for receipt using raw SQL 
    const result = await db.execute(sql.raw(`
      SELECT 
        id,
        invoice_number,
        total_amount,
        status,
        paid_date,
        payment_method,
        transaction_id,
        billing_details
      FROM invoices 
      WHERE id = '${id}' 
      AND tenant_id = ${tenantId} 
      AND status = 'paid'
      LIMIT 1
    `));
    
    const invoice = result.rows[0];

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Paid invoice not found or access denied'
      });
    }

    // Generate receipt data (in real implementation, generate PDF)
    const receiptData = {
      receiptNumber: `RCP-${invoice.invoice_number}`,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoice_number,
      paymentDate: invoice.paid_date,
      amount: invoice.total_amount,
      paymentMethod: invoice.payment_method || 'credit_card',
      transactionId: invoice.transaction_id || `TXN-${invoice.id.slice(0, 8)}`,
      billingDetails: invoice.billing_details,
      generatedAt: new Date()
    };

    console.log(`✅ Receipt data generated for invoice: ${invoice.invoice_number}`);

    // For now, return receipt data as JSON (PDF generation can be added later)
    res.json({
      success: true,
      message: 'Receipt downloaded successfully',
      data: receiptData,
      filename: `Receipt_${invoice.invoice_number}.pdf`
    });

  } catch (error) {
    console.error('Download admin receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download receipt. Please try again.'
    });
  }
};

// Export invoices for tenant admin
export const exportAdminInvoices = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { format } = req.params;
    const { 
      search = '', 
      status = '',
      startDate = '',
      endDate = ''
    } = req.query;

    console.log(`📊 Admin exporting invoices in ${format.toUpperCase()} format for tenant ${tenantId}`);

    // Use raw SQL query for export to avoid Drizzle ORM issues
    let whereClause = `WHERE tenant_id = ${tenantId}`;
    const params = [];

    if (search) {
      whereClause += ` AND (invoice_number ILIKE '%${search}%' OR status ILIKE '%${search}%')`;
    }

    if (status) {
      whereClause += ` AND status = '${status}'`;
    }

    if (startDate) {
      whereClause += ` AND DATE(issue_date) >= '${startDate}'`;
    }

    if (endDate) {
      whereClause += ` AND DATE(issue_date) <= '${endDate}'`;
    }

    const result = await db.execute(sql.raw(`
      SELECT 
        invoice_number,
        issue_date as invoice_date,
        due_date,
        total_amount as amount,
        status,
        paid_date,
        created_at,
        updated_at
      FROM invoices 
      ${whereClause}
      ORDER BY issue_date DESC
    `));

    const exportData = result.rows;

    // Generate export based on format
    let exportContent = '';
    let contentType = '';
    let filename = '';

    const timestamp = new Date().toISOString().split('T')[0];

    if (format === 'csv') {
      contentType = 'text/csv';
      filename = `Invoices_${timestamp}.csv`;
      
      // CSV headers
      const headers = ['Invoice Number', 'Invoice Date', 'Due Date', 'Amount', 'Status', 'Paid Date', 'Payment Method', 'Transaction ID'];
      exportContent = headers.join(',') + '\n';
      
      // CSV data
      exportData.forEach(invoice => {
        const row = [
          invoice.invoice_number,
          invoice.invoice_date,
          invoice.due_date,
          invoice.amount,
          invoice.status,
          invoice.paid_date || '',
          '', // payment_method (not in current query)
          '' // transaction_id (not in current query)
        ];
        exportContent += row.join(',') + '\n';
      });
    } else if (format === 'pdf') {
      contentType = 'application/pdf';
      filename = `Invoices_${timestamp}.pdf`;
      // For now, return JSON (PDF generation can be added later)
      exportContent = JSON.stringify(exportData, null, 2);
    } else if (format === 'excel') {
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      filename = `Invoices_${timestamp}.xlsx`;
      // For now, return JSON (Excel generation can be added later)
      exportContent = JSON.stringify(exportData, null, 2);
    }

    console.log(`✅ Exported ${exportData.length} invoices in ${format.toUpperCase()} format`);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(exportContent);

  } catch (error) {
    console.error('Export admin invoices error:', error);
    res.status(500).json({
      success: false,
      message: `Failed to export data. Please try again.`
    });
  }
};