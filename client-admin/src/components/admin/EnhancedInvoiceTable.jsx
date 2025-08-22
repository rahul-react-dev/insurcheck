import React from 'react';
import { 
  EyeIcon, 
  CreditCardIcon, 
  DownloadIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CalendarIcon,
  DollarSignIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon
} from 'lucide-react';
import Button from '../ui/Button';

// Skeleton component for loading state
const InvoiceTableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <tr>
              {Array.from({ length: 7 }).map((_, i) => (
                <th key={i} className="px-6 py-4 text-left">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                {Array.from({ length: 7 }).map((_, j) => (
                  <td key={j} className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full max-w-[100px]"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const EnhancedInvoiceTable = ({
  invoices = [],
  isLoading = false,
  onViewInvoice,
  onProcessPayment,
  onDownloadReceipt,
  pagination = { page: 1, limit: 10, total: 0, totalPages: 1 },
  onPageChange,
  onPageSizeChange,
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      paid: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: CheckCircleIcon,
        iconColor: 'text-emerald-500'
      },
      unpaid: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: ClockIcon,
        iconColor: 'text-amber-500'
      },
      overdue: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: AlertCircleIcon,
        iconColor: 'text-red-500'
      },
      pending: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: ClockIcon,
        iconColor: 'text-blue-500'
      }
    };
    return configs[status.toLowerCase()] || configs.pending;
  };

  const StatusBadge = ({ status }) => {
    const config = getStatusConfig(status);
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${config.bg} ${config.text} ${config.border} border`}>
        <Icon className={`w-3.5 h-3.5 ${config.iconColor}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const isOverdue = (dueDate, status) => {
    return status.toLowerCase() !== 'paid' && new Date(dueDate) < new Date();
  };

  const calculateTotalPages = () => {
    return Math.ceil(pagination.total / pagination.limit);
  };

  const getPageNumbers = () => {
    const totalPages = calculateTotalPages();
    const current = pagination.page;
    const pages = [];
    
    // Always show first page
    if (totalPages > 0) pages.push(1);
    
    // Show pages around current page
    for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
      if (i > 1) pages.push(i);
    }
    
    // Always show last page if more than 1 page
    if (totalPages > 1 && !pages.includes(totalPages)) {
      if (totalPages > pages[pages.length - 1] + 1) pages.push('...');
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (isLoading) {
    return <InvoiceTableSkeleton rows={pagination.limit} />;
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Invoice Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Dates
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <DollarSignIcon className="w-4 h-4" />
                    Amount
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Payment Info
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <DollarSignIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">No invoices found</p>
                        <p className="text-sm">Try adjusting your search or filter criteria</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr 
                    key={invoice.id} 
                    className={`hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30 transition-all duration-200 ${
                      isOverdue(invoice.dueDate, invoice.status) ? 'bg-red-50/30' : ''
                    }`}
                  >
                    {/* Invoice Details */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900">
                          {invoice.invoiceNumber}
                        </div>
                        <div className="text-sm text-gray-600">
                          ID: {invoice.id.slice(0, 8)}...
                        </div>
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm">
                        <div className="text-gray-900">
                          <span className="text-gray-500">Issue:</span> {formatDate(invoice.invoiceDate)}
                        </div>
                        <div className={`${isOverdue(invoice.dueDate, invoice.status) ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                          <span className="text-gray-500">Due:</span> {formatDate(invoice.dueDate)}
                        </div>
                        {invoice.paidDate && (
                          <div className="text-emerald-600">
                            <span className="text-gray-500">Paid:</span> {formatDate(invoice.paidDate)}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-semibold text-lg text-gray-900">
                          {formatCurrency(invoice.totalAmount)}
                        </div>
                        {invoice.amount !== invoice.totalAmount && (
                          <div className="text-xs text-gray-500">
                            Base: {formatCurrency(invoice.amount)}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <StatusBadge status={invoice.status} />
                      {isOverdue(invoice.dueDate, invoice.status) && (
                        <div className="mt-1 text-xs text-red-600 font-medium">
                          Overdue
                        </div>
                      )}
                    </td>

                    {/* Payment Info */}
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-1">
                        {invoice.paymentMethod && (
                          <div className="text-gray-600">
                            Method: {invoice.paymentMethod.replace('_', ' ')}
                          </div>
                        )}
                        {invoice.transactionId && (
                          <div className="text-gray-500 text-xs font-mono">
                            {invoice.transactionId}
                          </div>
                        )}
                        {!invoice.paymentMethod && !invoice.transactionId && (
                          <div className="text-gray-400">-</div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewInvoice(invoice)}
                          className="flex items-center gap-1.5 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all"
                        >
                          <EyeIcon className="w-4 h-4" />
                          View
                        </Button>
                        
                        {(invoice.status === 'unpaid' || invoice.status === 'overdue') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onProcessPayment(invoice)}
                            className="flex items-center gap-1.5 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all"
                          >
                            <CreditCardIcon className="w-4 h-4" />
                            Pay
                          </Button>
                        )}
                        
                        {invoice.status === 'paid' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDownloadReceipt(invoice)}
                            className="flex items-center gap-1.5 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all"
                          >
                            <DownloadIcon className="w-4 h-4" />
                            Receipt
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Pagination */}
      {pagination.total > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Results Info */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing{' '}
                <span className="font-semibold text-gray-900">
                  {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-gray-900">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-gray-900">
                  {pagination.total}
                </span>{' '}
                results
              </div>
              
              {/* Page Size Selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Per page:</label>
                <select
                  value={pagination.limit}
                  onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="flex items-center gap-1"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1 mx-2">
                {getPageNumbers().map((pageNum, index) => (
                  <React.Fragment key={index}>
                    {pageNum === '...' ? (
                      <span className="px-2 text-gray-400">...</span>
                    ) : (
                      <Button
                        variant={pageNum === pagination.page ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => onPageChange(pageNum)}
                        className={`min-w-[2.5rem] ${
                          pageNum === pagination.page 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'hover:bg-blue-50 hover:border-blue-300'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= calculateTotalPages()}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedInvoiceTable;