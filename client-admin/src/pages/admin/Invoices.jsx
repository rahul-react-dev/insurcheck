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
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../../components/ui/table';
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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Users,
  UserCheck,
  UserX
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('invoiceDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [invoiceStats, setInvoiceStats] = useState({
    total: 0,
    paid: 0,
    unpaid: 0,
    overdue: 0
  });

  // Fetch invoices function
  const fetchInvoices = () => {
    dispatch(fetchInvoicesRequest({
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      status: statusFilter,
      sortBy,
      sortOrder
    }));
  };

  // Initial load and when dependencies change
  useEffect(() => {
    fetchInvoices();
  }, [currentPage, pageSize, searchTerm, statusFilter, sortBy, sortOrder]);

  // Calculate stats from invoices
  useEffect(() => {
    if (invoices && invoices.length > 0) {
      const stats = {
        total: invoicesMeta?.total || invoices.length,
        paid: invoices.filter(inv => inv.status === 'paid').length,
        unpaid: invoices.filter(inv => inv.status === 'unpaid').length,
        overdue: invoices.filter(inv => inv.status !== 'paid' && new Date(inv.dueDate) < new Date()).length
      };
      setInvoiceStats(stats);
    }
  }, [invoices, invoicesMeta]);

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
      fetchInvoices();
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
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle status filter
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
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

  // Handlers remain the same - pagination component handles them directly

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Invoices and Payments</h1>
          <p className="mt-2 text-gray-600">
            View, pay invoices, and download receipts for your organization's billing.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Invoices</dt>
                    <dd className="text-lg font-semibold text-gray-900">{invoiceStats.total}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserCheck className="h-8 w-8 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Paid</dt>
                    <dd className="text-lg font-semibold text-green-900">{invoiceStats.paid}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserX className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Unpaid</dt>
                    <dd className="text-lg font-semibold text-yellow-900">{invoiceStats.unpaid}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Overdue</dt>
                    <dd className="text-lg font-semibold text-red-900">{invoiceStats.overdue}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search and filters */}
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by Invoice ID or Status..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={statusFilter}
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
                  onClick={() => handleExport('pdf')}
                  disabled={exportLoading}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExport('csv')}
                  disabled={exportLoading}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExport('xlsx')}
                  disabled={exportLoading}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Excel
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Content */}
        {invoicesError ? (
          <Card>
            <div className="p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Invoices</h3>
              <p className="text-gray-600 mb-4">{invoicesError}</p>
              <Button onClick={fetchInvoices}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </Card>
        ) : (
          <Card>
            {invoicesLoading ? (
              <div className="p-8 text-center">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p className="text-gray-600">Loading invoices...</p>
              </div>
            ) : !invoices || invoices.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices available</h3>
                <p className="text-gray-600">You don't have any invoices at the moment.</p>
              </div>
            ) : (
              <>
              {/* Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        onClick={() => handleSort('invoiceNumber')}
                        className="cursor-pointer hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-1">
                          Invoice ID
                          {sortBy === 'invoiceNumber' && (
                            sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        onClick={() => handleSort('invoiceDate')}
                        className="cursor-pointer hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-1">
                          Invoice Date
                          {sortBy === 'invoiceDate' && (
                            sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        onClick={() => handleSort('dueDate')}
                        className="cursor-pointer hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-1">
                          Due Date
                          {sortBy === 'dueDate' && (
                            sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        onClick={() => handleSort('amount')}
                        className="cursor-pointer hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-1">
                          Amount
                          {sortBy === 'amount' && (
                            sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoiceNumber || invoice.id}
                        </TableCell>
                        <TableCell>
                          {formatDate(invoice.invoiceDate)}
                        </TableCell>
                        <TableCell>
                          {formatDate(invoice.dueDate)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(invoice.amount)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(invoice.status, invoice.dueDate)}
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
              <Pagination
                currentPage={currentPage}
                totalPages={invoicesMeta?.totalPages || 1}
                totalItems={invoicesMeta?.total || 0}
                itemsPerPage={pageSize}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setPageSize}
              />
              </>
            )}
          </Card>
        )}

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
    </div>
  );
};

export default Invoices;