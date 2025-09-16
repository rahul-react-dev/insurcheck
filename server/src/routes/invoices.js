import express from 'express';
import { db } from '../../db.ts';
import { users, tenants } from '../schema.ts';
import { eq, desc, like, and, sql, count } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth.js';
import { adminRoleMiddleware } from '../middleware/adminRole.js';

const router = express.Router();

// Get invoices with pagination and filtering
router.get('/', authMiddleware, adminRoleMiddleware, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '', 
      sortBy = 'invoiceDate', 
      sortOrder = 'desc' 
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const tenantId = req.user.tenantId;

    console.log(`📋 Admin ${req.user.username} fetching invoices for tenant ${tenantId}`);

    // Generate mock invoice data for demonstration
    // In a real implementation, this would come from a proper invoices table
    const mockInvoices = [
      {
        id: '1',
        invoiceNumber: 'INV-2025-001',
        invoiceDate: '2025-01-15',
        dueDate: '2025-02-15',
        amount: 299.99,
        status: 'unpaid',
        organizationName: 'InsurCheck Platform',
        billingDetails: {
          companyName: 'Sample Insurance Corp',
          adminName: 'John Administrator',
          address: '123 Business St, Suite 100, Business City, BC 12345'
        },
        itemizedCharges: [
          {
            description: 'InsurCheck Platform Subscription - Premium Plan',
            quantity: 1,
            rate: 299.99,
            amount: 299.99
          }
        ]
      },
      {
        id: '2',
        invoiceNumber: 'INV-2024-012',
        invoiceDate: '2024-12-15',
        dueDate: '2025-01-15',
        amount: 199.99,
        status: 'paid',
        paidDate: '2024-12-20',
        paymentMethod: 'Credit Card',
        transactionId: 'TXN-ABC123456',
        organizationName: 'InsurCheck Platform',
        billingDetails: {
          companyName: 'Sample Insurance Corp',
          adminName: 'John Administrator',
          address: '123 Business St, Suite 100, Business City, BC 12345'
        },
        itemizedCharges: [
          {
            description: 'InsurCheck Platform Subscription - Standard Plan',
            quantity: 1,
            rate: 199.99,
            amount: 199.99
          }
        ]
      },
      {
        id: '3',
        invoiceNumber: 'INV-2024-011',
        invoiceDate: '2024-11-15',
        dueDate: '2024-12-15',
        amount: 99.99,
        status: 'paid',
        paidDate: '2024-11-18',
        paymentMethod: 'Bank Transfer',
        transactionId: 'TXN-DEF789012',
        organizationName: 'InsurCheck Platform',
        billingDetails: {
          companyName: 'Sample Insurance Corp',
          adminName: 'John Administrator',
          address: '123 Business St, Suite 100, Business City, BC 12345'
        },
        itemizedCharges: [
          {
            description: 'InsurCheck Platform Subscription - Basic Plan',
            quantity: 1,
            rate: 99.99,
            amount: 99.99
          }
        ]
      }
    ];

    // Apply filtering
    let filteredInvoices = mockInvoices;

    if (search) {
      filteredInvoices = filteredInvoices.filter(invoice => 
        invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        invoice.status.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredInvoices = filteredInvoices.filter(invoice => {
        if (status === 'overdue') {
          return invoice.status !== 'paid' && new Date(invoice.dueDate) < new Date();
        }
        return invoice.status === status;
      });
    }

    // Apply sorting
    filteredInvoices.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'amount') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else if (sortBy.includes('Date')) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    // Apply pagination
    const total = filteredInvoices.length;
    const paginatedInvoices = filteredInvoices.slice(offset, offset + parseInt(limit));

    const response = {
      invoices: paginatedInvoices,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };

    console.log(`✅ Retrieved ${paginatedInvoices.length} invoices for tenant ${tenantId}`);
    res.json(response);

  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Get invoice details by ID
router.get('/:id', authMiddleware, adminRoleMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    console.log(`📄 Admin ${req.user.username} fetching invoice ${id} for tenant ${tenantId}`);

    // Mock invoice detail - in real implementation, fetch from database
    const mockInvoice = {
      id,
      invoiceNumber: `INV-2025-00${id}`,
      invoiceDate: '2025-01-15',
      dueDate: '2025-02-15',
      amount: 299.99,
      status: id === '1' ? 'unpaid' : 'paid',
      paidDate: id === '1' ? null : '2024-12-20',
      paymentMethod: id === '1' ? null : 'Credit Card',
      transactionId: id === '1' ? null : `TXN-ABC12345${id}`,
      organizationName: 'InsurCheck Platform',
      billingDetails: {
        companyName: 'Sample Insurance Corp',
        adminName: 'John Administrator',
        address: '123 Business St, Suite 100, Business City, BC 12345'
      },
      itemizedCharges: [
        {
          description: 'InsurCheck Platform Subscription - Premium Plan',
          quantity: 1,
          rate: 299.99,
          amount: 299.99
        }
      ]
    };

    console.log(`✅ Retrieved invoice details for ${id}`);
    res.json(mockInvoice);

  } catch (error) {
    console.error('Error fetching invoice details:', error);
    res.status(500).json({ error: 'Failed to fetch invoice details' });
  }
});

// Process payment for an invoice
router.post('/pay', authMiddleware, adminRoleMiddleware, async (req, res) => {
  try {
    const { invoiceId, paymentMethod, amount, ...paymentDetails } = req.body;
    const tenantId = req.user.tenantId;

    console.log(`💳 Admin ${req.user.username} processing payment for invoice ${invoiceId}`);

    // Validate payment data
    if (!invoiceId || !paymentMethod || !amount) {
      return res.status(400).json({ error: 'Missing required payment information' });
    }

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time

    // Mock successful payment response
    const paymentResult = {
      success: true,
      transactionId: `TXN-${Date.now()}`,
      amount,
      paymentMethod,
      processedAt: new Date().toISOString(),
      invoice: {
        id: invoiceId,
        status: 'paid',
        paidDate: new Date().toISOString()
      }
    };

    console.log(`✅ Payment processed successfully for invoice ${invoiceId}`);
    res.json(paymentResult);

  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// Download receipt for a paid invoice
router.get('/:id/receipt', authMiddleware, adminRoleMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    console.log(`🧾 Admin ${req.user.username} downloading receipt for invoice ${id}`);

    // In a real implementation, this would generate a PDF receipt
    const receiptData = `
      RECEIPT
      ========
      
      Invoice: INV-2025-00${id}
      Date: ${new Date().toLocaleDateString()}
      Amount: $299.99
      Status: PAID
      
      Thank you for your payment!
    `;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${id}.pdf"`);
    res.send(receiptData);

  } catch (error) {
    console.error('Error downloading receipt:', error);
    res.status(500).json({ error: 'Failed to download receipt' });
  }
});

// Export invoices in various formats
router.get('/export', authMiddleware, adminRoleMiddleware, async (req, res) => {
  try {
    const { format = 'csv', search = '', status = '' } = req.query;
    const tenantId = req.user.tenantId;

    console.log(`📊 Admin ${req.user.username} exporting invoices as ${format}`);

    // Mock export data
    const exportData = `Invoice ID,Date,Due Date,Amount,Status
INV-2025-001,2025-01-15,2025-02-15,$299.99,Unpaid
INV-2024-012,2024-12-15,2025-01-15,$199.99,Paid
INV-2024-011,2024-11-15,2024-12-15,$99.99,Paid`;

    const filename = `invoices-export-${Date.now()}.${format}`;
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
    } else if (format === 'xlsx') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    } else if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
    }
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(exportData);

    console.log(`✅ Invoices exported successfully as ${format}`);

  } catch (error) {
    console.error('Error exporting invoices:', error);
    res.status(500).json({ error: 'Failed to export invoices' });
  }
});

export default router;