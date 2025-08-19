
import React from 'react';
import Button from '../ui/Button';

const InvoiceModal = ({ 
  isOpen, 
  onClose, 
  invoice, 
  onDownload, 
  onMarkPaid 
}) => {
  if (!isOpen || !invoice) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800 border-green-200', icon: 'fas fa-check-circle' },
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: 'fas fa-clock' },
      overdue: { color: 'bg-red-100 text-red-800 border-red-200', icon: 'fas fa-exclamation-triangle' }
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <i className={`${config.icon} mr-2`}></i>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const isOverdue = (dueDate, status) => {
    return status.toLowerCase() !== 'paid' && new Date(dueDate) < new Date();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Invoice Details - {invoice.invoiceNumber || invoice.invoiceId}
              </h3>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="space-y-6">
              {/* Status Banner */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusBadge(invoice.status)}
                  {isOverdue(invoice.dueDate, invoice.status) && (
                    <span className="text-sm text-red-600 font-medium">
                      <i className="fas fa-exclamation-triangle mr-1"></i>
                      Overdue
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(invoice.total || invoice.totalAmount || invoice.amount)}</p>
                  <p className="text-sm text-gray-500">Total Amount</p>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Invoice Info */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Invoice Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Invoice Number:</span>
                        <span className="text-sm font-medium text-gray-900">{invoice.invoiceNumber || invoice.invoiceId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Amount:</span>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(invoice.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Tax Amount:</span>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(invoice.tax || invoice.taxAmount || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Issue Date:</span>
                        <span className="text-sm font-medium text-gray-900">{formatDate(invoice.issueDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Due Date:</span>
                        <span className="text-sm font-medium text-gray-900">{formatDate(invoice.dueDate)}</span>
                      </div>
                      {invoice.paidDate && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Paid Date:</span>
                          <span className="text-sm font-medium text-green-600">{formatDate(invoice.paidDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Tenant Info */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Tenant Details</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Tenant Name:</span>
                        <span className="text-sm font-medium text-gray-900">{invoice.tenantName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Tenant ID:</span>
                        <span className="text-sm font-medium text-gray-900">{invoice.tenantId || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Created:</span>
                        <span className="text-sm font-medium text-gray-900">{formatDate(invoice.createdAt)}</span>
                      </div>
                      {invoice.tenantAddress && (
                        <div>
                          <span className="text-sm text-gray-500 block mb-1">Address:</span>
                          <span className="text-sm font-medium text-gray-900">{invoice.tenantAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Breakdown Section */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Cost Breakdown</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Base Amount</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(invoice.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tax Amount</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(invoice.tax || invoice.taxAmount || 0)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-base font-semibold text-gray-900">Total</span>
                        <span className="text-base font-bold text-gray-900">{formatCurrency(invoice.total || invoice.totalAmount || invoice.amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              {invoice.paymentHistory && invoice.paymentHistory.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Payment History</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {invoice.paymentHistory.map((payment, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <span className="text-sm font-medium text-gray-900">{payment.type}</span>
                            <span className="text-xs text-gray-500 ml-2">{formatDate(payment.date)}</span>
                          </div>
                          <span className="text-sm font-medium text-green-600">{formatCurrency(payment.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {invoice.notes && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Notes</h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{invoice.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              {invoice.status.toLowerCase() !== 'paid' && (
                <Button
                  onClick={() => {
                    onMarkPaid(invoice.id);
                    onClose();
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm"
                >
                  <i className="fas fa-check mr-2"></i>
                  Mark as Paid
                </Button>
              )}
              <Button
                onClick={() => onDownload(invoice.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
              >
                <i className="fas fa-download mr-2"></i>
                Download PDF
              </Button>
              <Button
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 text-sm"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
