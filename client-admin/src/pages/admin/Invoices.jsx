import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchInvoicesRequest,
  fetchInvoiceStatsRequest,
  fetchInvoiceDetailsRequest,
  processPaymentRequest,
  downloadReceiptRequest,
  exportInvoicesRequest
} from '../../store/admin/invoicesSlice';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ChevronUpIcon, ChevronDownIcon, SearchIcon, DownloadIcon, EyeIcon, CreditCardIcon } from 'lucide-react';

const Invoices = () => {
  const dispatch = useDispatch();
  
  // Local state for filters and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('issueDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  
  // Payment form state
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  
  // Redux selectors with safe defaults
  const {
    invoices = [],
    invoicesLoading = false,
    invoicesError = null,
    invoicesMeta = { total: 0, totalPages: 1, page: 1, limit: 10 },
    invoiceStats = {
      total: 0,
      totalAmount: 0,
      paid: 0,
      paidAmount: 0,
      unpaid: 0,
      unpaidAmount: 0,
      overdue: 0,
      overdueAmount: 0
    },
    selectedInvoice: invoiceDetails = null,
    paymentLoading = false,
    paymentSuccess = false,
    paymentError = null,
    exportLoading = false,
    exportError = null
  } = useSelector(state => state.invoices || {});

  // Fetch data when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: pageSize,
      sortBy,
      sortOrder,
      search: searchTerm,
      status: statusFilter
    };
    dispatch(fetchInvoicesRequest(params));
    dispatch(fetchInvoiceStatsRequest());
  }, [dispatch, currentPage, pageSize, sortBy, sortOrder, searchTerm, statusFilter]);

  // Reset to first page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

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

  // Get status badge with proper colors
  const getStatusBadge = (status) => {
    const statusStyles = {
      paid: 'bg-green-100 text-green-800 border-green-200',
      unpaid: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      overdue: 'bg-red-100 text-red-800 border-red-200',
      sent: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status] || statusStyles.unpaid}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortBy !== field) {
      return <ChevronUpIcon className="h-4 w-4 text-gray-400" />;
    }
    return sortOrder === 'asc' 
      ? <ChevronUpIcon className="h-4 w-4 text-blue-600" />
      : <ChevronDownIcon className="h-4 w-4 text-blue-600" />;
  };

  // Handle view invoice details
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    dispatch(fetchInvoiceDetailsRequest({ invoiceId: invoice.id }));
    setShowDetailsModal(true);
  };

  // Handle pay invoice
  const handlePayInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  // Handle payment submission
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    const paymentPayload = {
      invoiceId: selectedInvoice.id,
      ...paymentData
    };

    dispatch(processPaymentRequest(paymentPayload));
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
    setShowExportDropdown(false);
  };

  // Handle search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Reset payment modal
  const resetPaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedInvoice(null);
    setPaymentData({
      paymentMethod: 'credit_card',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    });
  };

  // Close payment modal on success
  useEffect(() => {
    if (paymentSuccess) {
      resetPaymentModal();
      // Refresh invoices to show updated status
      const params = {
        page: currentPage,
        limit: pageSize,
        sortBy,
        sortOrder,
        search: searchTerm,
        status: statusFilter
      };
      dispatch(fetchInvoicesRequest(params));
      dispatch(fetchInvoiceStatsRequest());
    }
  }, [paymentSuccess]);

  if (invoicesLoading && invoices.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
            <span className="ml-2">Loading invoices...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Invoices & Payments</h1>
            <p className="text-gray-600 mt-1">Manage your invoices, process payments, and download receipts</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{invoiceStats.total}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">📄</span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-green-600">{invoiceStats.paid}</p>
                <p className="text-sm text-gray-500">{formatCurrency(invoiceStats.paidAmount)}</p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-lg">✅</span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unpaid</p>
                <p className="text-2xl font-bold text-yellow-600">{invoiceStats.unpaid}</p>
                <p className="text-sm text-gray-500">{formatCurrency(invoiceStats.unpaidAmount)}</p>
              </div>
              <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-lg">⏰</span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{invoiceStats.overdue}</p>
                <p className="text-sm text-gray-500">{formatCurrency(invoiceStats.overdueAmount)}</p>
              </div>
              <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-lg">⚠️</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="p-5">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* Search */}
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Invoice ID..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="overdue">Overdue</option>
              </select>

              {/* Page Size */}
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>

            {/* Export Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                disabled={exportLoading}
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              {showExportDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    <button
                      onClick={() => handleExport('pdf')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as PDF
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleExport('xlsx')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as Excel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Invoices Table */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
              <p className="text-sm text-gray-500">
                Showing {invoices.length} of {invoicesMeta.total} invoices
              </p>
            </div>
          </div>

          {/* Error Display */}
          {invoicesError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600">Error loading invoices: {invoicesError}</p>
            </div>
          )}

          {/* Export Error */}
          {exportError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600">Failed to export. Please try again.</p>
            </div>
          )}

          {/* Payment Success */}
          {paymentSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-600">Payment successful. Receipt available for download.</p>
            </div>
          )}

          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchTerm || statusFilter ? "No results found." : "No invoices available."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('invoiceNumber')}
                    >
                      <div className="flex items-center gap-1">
                        Invoice ID
                        {getSortIcon('invoiceNumber')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('issueDate')}
                    >
                      <div className="flex items-center gap-1">
                        Invoice Date
                        {getSortIcon('issueDate')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('dueDate')}
                    >
                      <div className="flex items-center gap-1">
                        Due Date
                        {getSortIcon('dueDate')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('totalAmount')}
                    >
                      <div className="flex items-center gap-1">
                        Amount
                        {getSortIcon('totalAmount')}
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.invoiceNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(invoice.issueDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(invoice.dueDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(invoice.totalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="small"
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          
                          {(invoice.status === 'unpaid' || invoice.status === 'overdue') && (
                            <Button 
                              variant="primary" 
                              size="small"
                              onClick={() => handlePayInvoice(invoice)}
                            >
                              <CreditCardIcon className="h-4 w-4 mr-1" />
                              Pay
                            </Button>
                          )}
                          
                          {invoice.status === 'paid' && (
                            <Button 
                              variant="secondary" 
                              size="small"
                              onClick={() => handleDownloadReceipt(invoice)}
                            >
                              <DownloadIcon className="h-4 w-4 mr-1" />
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
          )}

          {/* Pagination Controls */}
          {invoicesMeta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Page {invoicesMeta.page} of {invoicesMeta.totalPages} • {invoicesMeta.total} total invoices
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="small"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, invoicesMeta.totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "primary" : "outline"}
                      size="small"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                
                <Button 
                  variant="outline" 
                  size="small"
                  disabled={currentPage >= invoicesMeta.totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Invoice Details Modal */}
        {showDetailsModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Invoice Details</h2>
                  <Button 
                    variant="outline" 
                    size="small"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    Close
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Invoice ID</label>
                      <p className="text-gray-900">{selectedInvoice.invoiceNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Invoice Date</label>
                      <p className="text-gray-900">{formatDate(selectedInvoice.issueDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Due Date</label>
                      <p className="text-gray-900">{formatDate(selectedInvoice.dueDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Amount</label>
                      <p className="text-gray-900 font-semibold">{formatCurrency(selectedInvoice.totalAmount)}</p>
                    </div>
                    {selectedInvoice.paidDate && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Payment Date</label>
                        <p className="text-gray-900">{formatDate(selectedInvoice.paidDate)}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Itemized Charges */}
                  {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Itemized Charges</label>
                      <div className="mt-2 bg-gray-50 rounded-lg p-3">
                        {selectedInvoice.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                            <div>
                              <p className="font-medium">{item.description}</p>
                              <p className="text-sm text-gray-600">Qty: {item.quantity} × {formatCurrency(item.unitPrice)}</p>
                            </div>
                            <p className="font-semibold">{formatCurrency(item.total)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Pay Invoice</h2>
                  <Button 
                    variant="outline" 
                    size="small"
                    onClick={resetPaymentModal}
                  >
                    Close
                  </Button>
                </div>
                
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Invoice: {selectedInvoice.invoiceNumber}</p>
                  <p className="text-lg font-semibold">{formatCurrency(selectedInvoice.totalAmount)}</p>
                </div>
                
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={paymentData.cardholderName}
                      onChange={(e) => setPaymentData({...paymentData, cardholderName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={paymentData.cardNumber}
                      onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={paymentData.expiryDate}
                        onChange={(e) => setPaymentData({...paymentData, expiryDate: e.target.value})}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={paymentData.cvv}
                        onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                        placeholder="123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  {paymentError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-600 text-sm">Payment failed. Please try again.</p>
                    </div>
                  )}
                  
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={paymentLoading}
                      className="flex-1"
                    >
                      {paymentLoading ? 'Processing...' : `Pay ${formatCurrency(selectedInvoice.totalAmount)}`}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetPaymentModal}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoices;