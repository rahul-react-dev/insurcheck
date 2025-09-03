import { X, Download, CreditCard, Calendar, DollarSign, Building, User, FileText, Receipt } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

const InvoiceDetailsModal = ({ 
  isOpen, 
  onClose, 
  invoice, 
  isLoading,
  onDownloadReceipt,
  onPayInvoice 
}) => {
  if (!isOpen) return null;

  // Format currency - handle string amounts and invalid numbers
  const formatCurrency = (amount) => {
    // Convert to number if it's a string, default to 0 if invalid
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const validAmount = isNaN(numericAmount) || numericAmount === null || numericAmount === undefined ? 0 : numericAmount;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(validAmount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get status badge
  const getStatusBadge = (status, dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const isOverdue = status !== 'paid' && due < now;

    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Paid' },
      unpaid: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Unpaid' },
      overdue: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Overdue' }
    };

    const finalStatus = isOverdue ? 'overdue' : status;
    const config = statusConfig[finalStatus] || statusConfig.unpaid;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice Details
              </h3>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-5 sm:p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading invoice details...</p>
              </div>
            ) : invoice ? (
              <div className="space-y-6">
                {/* Invoice Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Invoice #{invoice.invoiceNumber || invoice.id}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Issued on {formatDate(invoice.invoiceDate)}
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0">
                    {getStatusBadge(invoice.status, invoice.dueDate)}
                  </div>
                </div>

                {/* Invoice Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Due Date</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatDate(invoice.dueDate)}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Amount</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(invoice.amount)}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Building className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Organization</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {invoice.organizationName || 'Your Organization'}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Billing Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Billing Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Company Name</p>
                        <p className="text-gray-900">{invoice.billingDetails?.billing_name || invoice.organizationName || 'Your Organization'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Contact Email</p>
                        <p className="text-gray-900">{invoice.billingDetails?.billing_email || 'admin@company.com'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Billing Address</p>
                        <p className="text-gray-900">
                          {invoice.billingDetails?.billing_address || '123 Business St, Suite 100, Business City, BC 12345'}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Invoice Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Invoice ID</p>
                        <p className="text-gray-900 font-mono">{invoice.invoiceNumber || invoice.id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Invoice Date</p>
                        <p className="text-gray-900">{formatDate(invoice.invoiceDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Due Date</p>
                        <p className="text-gray-900">{formatDate(invoice.dueDate)}</p>
                      </div>
                      {invoice.paidDate && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Payment Date</p>
                          <p className="text-gray-900">{formatDate(invoice.paidDate)}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Itemized Charges */}
                <Card className="p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Itemized Charges</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rate
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {invoice.items?.length > 0 ? (
                          invoice.items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-4 text-sm text-gray-900">{item.description}</td>
                              <td className="px-4 py-4 text-sm text-gray-600">{item.quantity}</td>
                              <td className="px-4 py-4 text-sm text-gray-600">{formatCurrency(item.rate)}</td>
                              <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-4 py-4 text-sm text-gray-900">Professional Plan - Monthly</td>
                            <td className="px-4 py-4 text-sm text-gray-600">1</td>
                            <td className="px-4 py-4 text-sm text-gray-600">{formatCurrency(parseFloat(invoice.amount || "0"))}</td>
                            <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatCurrency(parseFloat(invoice.amount || "0"))}</td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan="3" className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            Total Amount:
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-900">
                            {formatCurrency(invoice.totalAmount || invoice.amount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </Card>

                {/* Payment Information */}
                {invoice.status === 'paid' && (
                  <Card className="p-4 bg-green-50 border-green-200">
                    <h4 className="text-lg font-medium text-green-900 mb-4 flex items-center gap-2">
                      <Receipt className="h-5 w-5" />
                      Payment Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-green-700">Payment Date</p>
                        <p className="text-green-900">{formatDate(invoice.paidDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-700">Payment Method</p>
                        <p className="text-green-900">{invoice.paymentMethod || 'Credit Card'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-700">Amount Paid</p>
                        <p className="text-green-900 font-semibold">{formatCurrency(invoice.totalAmount || invoice.amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-700">Transaction ID</p>
                        <p className="text-green-900 font-mono">{invoice.transactionId || 'TXN-' + invoice.id?.slice(-8)}</p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Invoice not found</h3>
                <p className="text-gray-600">Unable to load invoice details.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {invoice && (
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3 border-t border-gray-200">
              {invoice.status === 'paid' && (
                <Button
                  onClick={() => onDownloadReceipt(invoice)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Receipt
                </Button>
              )}
              {(invoice.status === 'unpaid' || 
                (invoice.status !== 'paid' && new Date(invoice.dueDate) < new Date())) && (
                <Button
                  onClick={() => onPayInvoice(invoice)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Pay Now
                </Button>
              )}
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailsModal;