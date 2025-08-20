import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchInvoicesRequest,
  fetchInvoiceDetailsRequest,
  processPaymentRequest,
  downloadReceiptRequest,
  exportInvoicesRequest,
  clearSelectedInvoice,
  updateFilters
} from '../../store/admin/invoicesSlice';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../hooks/use-toast';
import { 
  Search,
  Download,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  CreditCard,
  Receipt,
  FileText,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock
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
    receiptDownloading,
    exportLoading,
    filters
  } = useSelector(state => state.invoices);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('invoiceDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'credit_card',
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    bankAccount: '',
    routingNumber: ''
  });

  // Invoice statistics (computed from invoices data)
  const invoiceStats = {
    total: invoices?.length || 0,
    paid: invoices?.filter(inv => inv.status === 'paid')?.length || 0,
    unpaid: invoices?.filter(inv => inv.status === 'unpaid')?.length || 0,
    overdue: invoices?.filter(inv => inv.status === 'overdue')?.length || 0
  };

  // Fetch invoices on component mount and when dependencies change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      status: statusFilter,
      sortBy,
      sortOrder
    };
    dispatch(fetchInvoicesRequest(params));
  }, [dispatch, currentPage, pageSize, searchTerm, statusFilter, sortBy, sortOrder]);

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

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Handle view invoice details
  const handleViewInvoice = (invoice) => {
    dispatch(fetchInvoiceDetailsRequest({ invoiceId: invoice.id }));
    setShowDetailsModal(true);
  };

  // Handle pay invoice
  const handlePayInvoice = (invoice) => {
    setSelectedInvoiceForPayment(invoice);
    setShowPaymentModal(true);
  };

  // Handle payment form submission
  const handlePaymentSubmit = () => {
    if (!selectedInvoiceForPayment) return;
    
    dispatch(processPaymentRequest({
      invoiceId: selectedInvoiceForPayment.id,
      ...paymentForm
    }));
    
    setShowPaymentModal(false);
    setSelectedInvoiceForPayment(null);
    setPaymentForm({
      paymentMethod: 'credit_card',
      cardNumber: '',
      cardHolder: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      bankAccount: '',
      routingNumber: ''
    });
  };

  // Handle download receipt
  const handleDownloadReceipt = (invoice) => {
    dispatch(downloadReceiptRequest({ invoiceId: invoice.id }));
  };

  // Handle export
  const handleExport = (format) => {
    const params = {
      format,
      search: searchTerm,
      status: statusFilter,
      sortBy,
      sortOrder
    };
    dispatch(exportInvoicesRequest(params));
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      unpaid: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      overdue: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    };
    
    const config = statusConfig[status] || statusConfig.unpaid;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-blue-600" />
      : <ArrowDown className="h-4 w-4 text-blue-600" />;
  };

  // Pagination controls
  const totalPages = invoicesMeta?.totalPages || 1;
  const totalItems = invoicesMeta?.total || 0;

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm rounded-md transition-colors ${
            currentPage === i
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Invoices & Payments</h1>
            <p className="text-gray-600 mt-1">Manage your invoices, process payments, and download receipts</p>
          </div>
          
          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select 
                onChange={(e) => e.target.value && handleExport(e.target.value)}
                value=""
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={exportLoading}
              >
                <option value="">Export</option>
                <option value="pdf">Export PDF</option>
                <option value="csv">Export CSV</option>
                <option value="excel">Export Excel</option>
              </select>
              <Download className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{invoiceStats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-green-600">{invoiceStats.paid}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unpaid</p>
                <p className="text-2xl font-bold text-yellow-600">{invoiceStats.unpaid}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{invoiceStats.overdue}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                leftIcon={<Search className="h-4 w-4" />}
                placeholder="Search by Invoice ID..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <button
                onClick={() => handleStatusFilter('')}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  statusFilter === '' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleStatusFilter('paid')}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  statusFilter === 'paid' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Paid
              </button>
              <button
                onClick={() => handleStatusFilter('unpaid')}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  statusFilter === 'unpaid' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Unpaid
              </button>
              <button
                onClick={() => handleStatusFilter('overdue')}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  statusFilter === 'overdue' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Overdue
              </button>
            </div>
          </div>
        </Card>

        {/* Invoices Table */}
        <Card className="overflow-hidden">
          {invoicesLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-gray-600">Loading invoices...</span>
            </div>
          ) : invoicesError ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-900 font-medium">Failed to load invoices</p>
                <p className="text-gray-600 mt-1">{invoicesError}</p>
                <Button 
                  onClick={() => dispatch(fetchInvoicesRequest({ page: currentPage, limit: pageSize }))}
                  variant="outline"
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : invoices?.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-900 font-medium">No invoices found</p>
                <p className="text-gray-600 mt-1">
                  {searchTerm || statusFilter 
                    ? "No results match your current filters" 
                    : "No invoices available"}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <button
                          onClick={() => handleSort('invoiceId')}
                          className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                        >
                          Invoice ID
                          {getSortIcon('invoiceId')}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button
                          onClick={() => handleSort('invoiceDate')}
                          className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                        >
                          Invoice Date
                          {getSortIcon('invoiceDate')}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button
                          onClick={() => handleSort('dueDate')}
                          className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                        >
                          Due Date
                          {getSortIcon('dueDate')}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button
                          onClick={() => handleSort('amount')}
                          className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                        >
                          Amount
                          {getSortIcon('amount')}
                        </button>
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
                      <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.invoiceId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(invoice.invoiceDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(invoice.dueDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(invoice.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(invoice.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="small"
                              onClick={() => handleViewInvoice(invoice)}
                              disabled={invoiceDetailsLoading}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {(invoice.status === 'unpaid' || invoice.status === 'overdue') && (
                              <Button
                                variant="outline"
                                size="small"
                                onClick={() => handlePayInvoice(invoice)}
                                disabled={paymentLoading}
                              >
                                <CreditCard className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {invoice.status === 'paid' && (
                              <Button
                                variant="outline"
                                size="small"
                                onClick={() => handleDownloadReceipt(invoice)}
                                disabled={receiptDownloading}
                              >
                                <Receipt className="h-4 w-4" />
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
                      <div className="flex items-center justify-between mb-4">
                        <div className="font-medium text-gray-900">
                          {invoice.invoiceId}
                        </div>
                        {getStatusBadge(invoice.status)}
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Date:</span>
                          <span className="text-gray-900">{formatDate(invoice.invoiceDate)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Due Date:</span>
                          <span className="text-gray-900">{formatDate(invoice.dueDate)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-medium text-gray-900">{formatCurrency(invoice.amount)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => handleViewInvoice(invoice)}
                          disabled={invoiceDetailsLoading}
                          fullWidth
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        {(invoice.status === 'unpaid' || invoice.status === 'overdue') && (
                          <Button
                            variant="primary"
                            size="small"
                            onClick={() => handlePayInvoice(invoice)}
                            disabled={paymentLoading}
                            fullWidth
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Pay
                          </Button>
                        )}
                        
                        {invoice.status === 'paid' && (
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() => handleDownloadReceipt(invoice)}
                            disabled={receiptDownloading}
                            fullWidth
                          >
                            <Receipt className="h-4 w-4 mr-1" />
                            Receipt
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">Show</span>
                      <select
                        value={pageSize}
                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-sm text-gray-700">entries</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      <div className="flex items-center gap-1">
                        {renderPagination()}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-md text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="text-sm text-gray-700">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Invoice Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            dispatch(clearSelectedInvoice());
          }}
          title="Invoice Details"
          size="large"
        >
          {invoiceDetailsLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-gray-600">Loading invoice details...</span>
            </div>
          ) : selectedInvoice ? (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Invoice {selectedInvoice.invoiceId}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Issued on {formatDate(selectedInvoice.invoiceDate)}
                  </p>
                </div>
                {getStatusBadge(selectedInvoice.status)}
              </div>

              {/* Invoice Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Invoice Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Invoice ID:</span>
                        <span className="text-gray-900 font-medium">{selectedInvoice.invoiceId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Due Date:</span>
                        <span className="text-gray-900">{formatDate(selectedInvoice.dueDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="text-gray-900 font-bold">{formatCurrency(selectedInvoice.amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Billing Details</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>{selectedInvoice.billingDetails?.companyName}</p>
                      <p>{selectedInvoice.billingDetails?.address}</p>
                      <p>{selectedInvoice.billingDetails?.city}, {selectedInvoice.billingDetails?.state} {selectedInvoice.billingDetails?.zipCode}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Itemized Charges */}
              {selectedInvoice.items && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Itemized Charges</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Description
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedInvoice.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {item.description}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">
                              {formatCurrency(item.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4">
                {(selectedInvoice.status === 'unpaid' || selectedInvoice.status === 'overdue') && (
                  <Button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handlePayInvoice(selectedInvoice);
                    }}
                    disabled={paymentLoading}
                    className="flex items-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    Pay Now
                  </Button>
                )}
                
                {selectedInvoice.status === 'paid' && (
                  <Button
                    onClick={() => handleDownloadReceipt(selectedInvoice)}
                    disabled={receiptDownloading}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Receipt className="h-4 w-4" />
                    Download Receipt
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </Modal>

        {/* Payment Modal */}
        <Modal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedInvoiceForPayment(null);
          }}
          title="Process Payment"
          size="medium"
        >
          {selectedInvoiceForPayment && (
            <div className="space-y-6">
              {/* Invoice Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Invoice:</span>
                  <span className="font-medium">{selectedInvoiceForPayment.invoiceId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="text-xl font-bold text-gray-900">{formatCurrency(selectedInvoiceForPayment.amount)}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="credit_card"
                      checked={paymentForm.paymentMethod === 'credit_card'}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                      className="mr-2"
                    />
                    <CreditCard className="h-4 w-4 mr-2 text-blue-600" />
                    Credit Card
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="bank_transfer"
                      checked={paymentForm.paymentMethod === 'bank_transfer'}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                      className="mr-2"
                    />
                    <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                    Bank Transfer
                  </label>
                </div>
              </div>

              {/* Payment Form */}
              {paymentForm.paymentMethod === 'credit_card' ? (
                <div className="space-y-4">
                  <Input
                    label="Card Holder Name"
                    value={paymentForm.cardHolder}
                    onChange={(e) => setPaymentForm({ ...paymentForm, cardHolder: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                  <Input
                    label="Card Number"
                    value={paymentForm.cardNumber}
                    onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      label="Month"
                      value={paymentForm.expiryMonth}
                      onChange={(e) => setPaymentForm({ ...paymentForm, expiryMonth: e.target.value })}
                      placeholder="MM"
                      maxLength={2}
                      required
                    />
                    <Input
                      label="Year"
                      value={paymentForm.expiryYear}
                      onChange={(e) => setPaymentForm({ ...paymentForm, expiryYear: e.target.value })}
                      placeholder="YYYY"
                      maxLength={4}
                      required
                    />
                    <Input
                      label="CVV"
                      value={paymentForm.cvv}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value })}
                      placeholder="123"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Input
                    label="Bank Account Number"
                    value={paymentForm.bankAccount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, bankAccount: e.target.value })}
                    placeholder="123456789"
                    required
                  />
                  <Input
                    label="Routing Number"
                    value={paymentForm.routingNumber}
                    onChange={(e) => setPaymentForm({ ...paymentForm, routingNumber: e.target.value })}
                    placeholder="021000021"
                    required
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedInvoiceForPayment(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePaymentSubmit}
                  loading={paymentLoading}
                  className="flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Process Payment
                </Button>
              </div>
            </div>
          )}
        </Modal>

      </div>
    </div>
  );
};

export default Invoices;