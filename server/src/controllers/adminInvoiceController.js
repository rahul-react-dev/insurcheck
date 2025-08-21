import { db } from '../../db.js';
import { invoices, tenants, users, complianceRuleAuditLogs } from '../../../shared/schema.js';
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

    // Build base query for invoices
    let query = db
      .select()
      .from(invoices);

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

    // Apply sorting
    const sortColumn = invoices[sortBy] || invoices.issueDate;
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

    console.log(`📊 Admin fetching invoice stats for tenant ${tenantId}`);

    const statsQuery = db
      .select({
        total: count(),
        totalAmount: sql`coalesce(sum(${invoices.totalAmount}), 0)`,
        paidCount: sql`count(*) filter (where ${invoices.status} = 'paid')`,
        paidAmount: sql`coalesce(sum(${invoices.totalAmount}) filter (where ${invoices.status} = 'paid'), 0)`,
        unpaidCount: sql`count(*) filter (where ${invoices.status} = 'unpaid')`,
        unpaidAmount: sql`coalesce(sum(${invoices.totalAmount}) filter (where ${invoices.status} = 'unpaid'), 0)`,
        overdueCount: sql`count(*) filter (where ${invoices.status} = 'overdue')`,
        overdueAmount: sql`coalesce(sum(${invoices.totalAmount}) filter (where ${invoices.status} = 'overdue'), 0)`
      })
      .from(invoices)
      .where(eq(invoices.tenantId, tenantId));

    const stats = await statsQuery;

    console.log(`✅ Admin invoice stats retrieved for tenant ${tenantId}`);

    res.json({
      success: true,
      data: {
        total: parseInt(stats[0].total),
        totalAmount: parseFloat(stats[0].totalAmount),
        paid: parseInt(stats[0].paidCount),
        paidAmount: parseFloat(stats[0].paidAmount),
        unpaid: parseInt(stats[0].unpaidCount),
        unpaidAmount: parseFloat(stats[0].unpaidAmount),
        overdue: parseInt(stats[0].overdueCount),
        overdueAmount: parseFloat(stats[0].overdueAmount)
      }
    });

  } catch (error) {
    console.error('Get admin invoice stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice statistics'
    });
  }
};

// Get single invoice details for tenant admin
export const getAdminInvoiceDetails = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const { id } = req.params;

    console.log(`👀 Admin fetching invoice details: ${id} for tenant ${tenantId}`);

    const [invoice] = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        invoiceDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        amount: invoices.amount,
        taxAmount: invoices.taxAmount,
        totalAmount: invoices.totalAmount,
        status: invoices.status,
        paidDate: invoices.paidDate,
        paymentMethod: invoices.paymentMethod,
        transactionId: invoices.transactionId,
        billingDetails: invoices.billingDetails,
        itemizedCharges: invoices.itemizedCharges,
        notes: invoices.notes,
        createdAt: invoices.createdAt,
        updatedAt: invoices.updatedAt,
        tenantName: tenants.name
      })
      .from(invoices)
      .leftJoin(tenants, eq(invoices.tenantId, tenants.id))
      .where(and(
        eq(invoices.id, id),
        eq(invoices.tenantId, tenantId)
      ));

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found or access denied'
      });
    }

    console.log(`✅ Admin invoice details retrieved: ${invoice.invoiceNumber}`);

    res.json({
      success: true,
      data: invoice
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

    const [invoice] = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        totalAmount: invoices.totalAmount,
        status: invoices.status,
        paidDate: invoices.paidDate,
        paymentMethod: invoices.paymentMethod,
        transactionId: invoices.transactionId,
        billingDetails: invoices.billingDetails
      })
      .from(invoices)
      .where(and(
        eq(invoices.id, id),
        eq(invoices.tenantId, tenantId),
        eq(invoices.status, 'paid')
      ));

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Paid invoice not found or access denied'
      });
    }

    // Generate receipt data (in real implementation, generate PDF)
    const receiptData = {
      receiptNumber: `RCP-${invoice.invoiceNumber}`,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      paymentDate: invoice.paidDate,
      amount: invoice.totalAmount,
      paymentMethod: invoice.paymentMethod,
      transactionId: invoice.transactionId,
      billingDetails: invoice.billingDetails,
      generatedAt: new Date()
    };

    console.log(`✅ Receipt data generated for invoice: ${invoice.invoiceNumber}`);

    // For now, return receipt data as JSON (PDF generation can be added later)
    res.json({
      success: true,
      message: 'Receipt downloaded successfully',
      data: receiptData,
      filename: `Receipt_${invoice.invoiceNumber}.pdf`
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
    const { 
      format = 'csv', 
      search = '', 
      status = '',
      startDate = '',
      endDate = ''
    } = req.query;

    console.log(`📊 Admin exporting invoices in ${format.toUpperCase()} format for tenant ${tenantId}`);

    // Build query for export data
    let query = db
      .select({
        invoiceNumber: invoices.invoiceNumber,
        invoiceDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        amount: invoices.totalAmount,
        status: invoices.status,
        paidDate: invoices.paidDate,
        paymentMethod: invoices.paymentMethod,
        transactionId: invoices.transactionId
      })
      .from(invoices);

    // Apply same filters as main list
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
    query = query.orderBy(desc(invoices.issueDate));

    const exportData = await query;

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
          invoice.invoiceNumber,
          invoice.invoiceDate,
          invoice.dueDate,
          invoice.amount,
          invoice.status,
          invoice.paidDate || '',
          invoice.paymentMethod || '',
          invoice.transactionId || ''
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
      message: `Failed to export ${format.toUpperCase()}. Please try again.`
    });
  }
};