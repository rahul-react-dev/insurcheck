import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchInvoicesRequest,
  fetchInvoiceDetailsRequest,
  processPaymentRequest,
  downloadReceiptRequest,
  exportInvoicesRequest,
  updateFilters,
  clearPaymentState,
  clearReceiptError,
  clearSelectedInvoice,
} from '../../store/admin/invoicesSlice';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../hooks/use-toast';
import InvoiceDetailsModal from '../../components/admin/InvoiceDetailsModal';
import PaymentModal from '../../components/admin/PaymentModal';
import { 
  Search, 
  Download, 
  Eye, 
  CreditCard, 
  Receipt, 
  FileText,
  Calendar,
  DollarSign,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

const Invoices = () => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  
  // Redux selectors
  const {
    invoices,
    invoicesLoading,
    invoicesError,
    invoicesMeta,
    selectedInvoice,
    invoiceDetailsLoading,
    paymentLoading,
    paymentSuccess,
    paymentError,
    receiptDownloading,
    receiptError,
    exportLoading,
    exportError,
    filters
  } = useSelector(state => state.invoices);

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);

  // Fetch invoices on component mount and when filters change
  useEffect(() => {
    dispatch(fetchInvoicesRequest({
      page: currentPage,
      limit: pageSize,
      search: filters.search,
      status: filters.status,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder
    }));
  }, [dispatch, currentPage, pageSize, filters]);

  // Handle success/error states
  useEffect(() => {
    if (paymentSuccess) {
      toast({
        title: 'Payment successful. Receipt available for download.',
        variant: 'default',
      });
      setIsPaymentModalOpen(false);
      setSelectedInvoiceForPayment(null);
      dispatch(clearPaymentState());
      // Refresh invoices list
      dispatch(fetchInvoicesRequest({
        page: currentPage,
        limit: pageSize,
        search: filters.search,
        status: filters.status,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      }));
    }
  }, [paymentSuccess, dispatch, toast, currentPage, pageSize, filters]);

  useEffect(() => {
    if (paymentError) {
      toast({
        title: 'Payment failed. Please try again.',
        description: paymentError,
        variant: 'destructive',
      });
      dispatch(clearPaymentState());
    }
  }, [paymentError, dispatch, toast]);

  useEffect(() => {
    if (receiptError) {
      toast({
        title: 'Failed to download receipt. Please try again.',
        description: receiptError,
        variant: 'destructive',
      });
      dispatch(clearReceiptError());
    }
  }, [receiptError, dispatch, toast]);

  useEffect(() => {
    if (exportError) {
      toast({
        title: 'Export failed',
        description: exportError,
        variant: 'destructive',
      });
    }
  }, [exportError, toast]);

  // Handle search
  const handleSearch = (value) => {
    dispatch(updateFilters({ search: value }));
    setCurrentPage(1);
  };

  // Handle status filter
  const handleStatusFilter = (status) => {
    dispatch(updateFilters({ status }));
    setCurrentPage(1);
  };

  // Handle sorting
  const handleSort = (sortBy) => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    dispatch(updateFilters({ sortBy, sortOrder: newSortOrder }));
  };

  // Handle view invoice
  const handleViewInvoice = (invoice) => {
    dispatch(fetchInvoiceDetailsRequest({ invoiceId: invoice.id }));
    setIsDetailsModalOpen(true);
  };

  // Handle pay invoice
  const handlePayInvoice = (invoice) => {
    setSelectedInvoiceForPayment(invoice);
    setIsPaymentModalOpen(true);
  };

  // Handle download receipt
  const handleDownloadReceipt = (invoice) => {
    dispatch(downloadReceiptRequest({ invoiceId: invoice.id }));
  };

  // Handle export
  const handleExport = (format) => {
    dispatch(exportInvoicesRequest({ 
      format, 
      filters: {
        search: filters.search,
        status: filters.status
      }
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status badge
  const getStatusBadge = (status, dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const isOverdue = status !== 'paid' && due < now;

    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      unpaid: { color: 'bg-yellow-100 text-yellow-800', label: 'Unpaid' },
      overdue: { color: 'bg-red-100 text-red-800', label: 'Overdue' }
    };

    const finalStatus = isOverdue ? 'overdue' : status;
    const config = statusConfig[finalStatus] || statusConfig.unpaid;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (invoicesError) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Invoices</h3>
          <p className="text-gray-600 mb-4">{invoicesError}</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoices and Payments</h1>
        <p className="text-gray-600">
          View, pay invoices, and download receipts for your organization's billing.
        </p>
      </div>

      {/* Filters and Search */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by Invoice ID or Status..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Export buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('pdf')}
              disabled={exportLoading}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              disabled={exportLoading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('xlsx')}
              disabled={exportLoading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>
      </Card>

      {/* Invoices Table */}
      <Card className="overflow-hidden">
        {invoicesLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices available.</h3>
            <p className="text-gray-600">You don't have any invoices at the moment.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      onClick={() => handleSort('invoiceId')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-1">
                        Invoice ID
                        {filters.sortBy === 'invoiceId' && (
                          filters.sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('invoiceDate')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-1">
                        Invoice Date
                        {filters.sortBy === 'invoiceDate' && (
                          filters.sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('dueDate')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-1">
                        Due Date
                        {filters.sortBy === 'dueDate' && (
                          filters.sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('amount')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-1">
                        Amount
                        {filters.sortBy === 'amount' && (
                          filters.sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber || invoice.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(invoice.invoiceDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(invoice.status, invoice.dueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewInvoice(invoice)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          {(invoice.status === 'unpaid' || 
                            (invoice.status !== 'paid' && new Date(invoice.dueDate) < new Date())) && (
                            <Button
                              size="sm"
                              onClick={() => handlePayInvoice(invoice)}
                              disabled={paymentLoading}
                              className="flex items-center gap-1"
                            >
                              <CreditCard className="h-3 w-3" />
                              Pay
                            </Button>
                          )}
                          {invoice.status === 'paid' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadReceipt(invoice)}
                              disabled={receiptDownloading}
                              className="flex items-center gap-1"
                            >
                              <Receipt className="h-3 w-3" />
                              Receipt
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              <div className="divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber || invoice.id}
                      </h3>
                      {getStatusBadge(invoice.status, invoice.dueDate)}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Invoice Date:</span>
                        <span className="text-gray-900">{formatDate(invoice.invoiceDate)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Due Date:</span>
                        <span className="text-gray-900">{formatDate(invoice.dueDate)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Amount:</span>
                        <span className="text-gray-900 font-medium">{formatCurrency(invoice.amount)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewInvoice(invoice)}
                        className="flex-1 flex items-center justify-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      {(invoice.status === 'unpaid' || 
                        (invoice.status !== 'paid' && new Date(invoice.dueDate) < new Date())) && (
                        <Button
                          size="sm"
                          onClick={() => handlePayInvoice(invoice)}
                          disabled={paymentLoading}
                          className="flex-1 flex items-center justify-center gap-1"
                        >
                          <CreditCard className="h-3 w-3" />
                          Pay
                        </Button>
                      )}
                      {invoice.status === 'paid' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReceipt(invoice)}
                          disabled={receiptDownloading}
                          className="flex-1 flex items-center justify-center gap-1"
                        >
                          <Receipt className="h-3 w-3" />
                          Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {invoicesMeta.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Show</span>
                    <select
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className="border border-gray-300 rounded px-2 py-1"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <span>entries per page</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, invoicesMeta.total)} of {invoicesMeta.total} entries
                    </span>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === invoicesMeta.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Invoice Details Modal */}
      <InvoiceDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          dispatch(clearSelectedInvoice());
        }}
        invoice={selectedInvoice}
        isLoading={invoiceDetailsLoading}
        onDownloadReceipt={handleDownloadReceipt}
        onPayInvoice={handlePayInvoice}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedInvoiceForPayment(null);
        }}
        invoice={selectedInvoiceForPayment}
        onProcessPayment={(paymentData) => {
          dispatch(processPaymentRequest({
            invoiceId: selectedInvoiceForPayment.id,
            ...paymentData
          }));
        }}
        isLoading={paymentLoading}
      />
    </div>
  );
};

export default Invoices;