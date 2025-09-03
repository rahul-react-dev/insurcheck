import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchInvoicesRequest,
  fetchInvoiceStatsRequest,
  fetchInvoiceDetailsRequest,
  processPaymentRequest,
  downloadReceiptRequest,
  exportInvoicesRequest,
} from "../../store/admin/invoicesSlice";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EnhancedInvoiceTable from "../../components/admin/EnhancedInvoiceTable";
import EnhancedInvoiceStats from "../../components/admin/EnhancedInvoiceStats";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  SearchIcon,
  DownloadIcon,
  EyeIcon,
  CreditCardIcon,
  FilterIcon,
  RefreshCwIcon,
  FileTextIcon,
  SortAscIcon,
  SortDescIcon,
  CheckCircleIcon,
} from "lucide-react";

const Invoices = () => {
  const dispatch = useDispatch();

  // Local state for filters and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("paidDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  // Removed statusFilter since we only show paid invoices

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Payment form state
  const [paymentData, setPaymentData] = useState({
    paymentMethod: "credit_card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
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
      overdueAmount: 0,
    },
    selectedInvoice: invoiceDetails = null,
    paymentLoading = false,
    paymentSuccess = false,
    paymentError = null,
    exportLoading = false,
    exportError = null,
  } = useSelector((state) => state.invoices || {});

  // Debug logging for stats
  console.log('🔍 Debug: invoiceStats from Redux:', invoiceStats);
  console.log('🔍 Debug: invoiceStats.total:', invoiceStats.total);
  console.log('🔍 Debug: typeof invoiceStats.total:', typeof invoiceStats.total);

  // Enhanced state for filters
  const [activeFilters, setActiveFilters] = useState({
    dateRange: "",
    startDate: "",
    endDate: "",
  });

  // Fetch data when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: pageSize,
      sortBy,
      sortOrder,
      search: searchTerm,
      status: 'paid', // Only show paid invoices (subscription payment history)
      startDate: activeFilters.startDate,
      endDate: activeFilters.endDate,
    };
    dispatch(fetchInvoicesRequest(params));
    dispatch(fetchInvoiceStatsRequest());
  }, [
    dispatch,
    currentPage,
    pageSize,
    sortBy,
    sortOrder,
    searchTerm,
    activeFilters.startDate,
    activeFilters.endDate,
  ]);

  // Reset to first page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    activeFilters.startDate,
    activeFilters.endDate,
  ]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status badge with proper colors
  const getStatusBadge = (status) => {
    const statusStyles = {
      paid: "bg-green-100 text-green-800 border-green-200",
      unpaid: "bg-yellow-100 text-yellow-800 border-yellow-200",
      overdue: "bg-red-100 text-red-800 border-red-200",
      sent: "bg-blue-100 text-blue-800 border-blue-200",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status] || statusStyles.unpaid}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortBy !== field) {
      return <ChevronUpIcon className="h-4 w-4 text-gray-400" />;
    }
    return sortOrder === "asc" ? (
      <ChevronUpIcon className="h-4 w-4 text-blue-600" />
    ) : (
      <ChevronDownIcon className="h-4 w-4 text-blue-600" />
    );
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
      ...paymentData,
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
      status: 'paid', // Only paid invoices
      sortBy,
      sortOrder,
    };
    dispatch(exportInvoicesRequest(params));
    setShowExportDropdown(false);
  };

  // Handle search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Status filter removed - only showing paid invoices (subscription payment history)

  // Reset payment modal
  const resetPaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedInvoice(null);
    setPaymentData({
      paymentMethod: "credit_card",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
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
        status: 'paid', // Only paid invoices
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
      <div className=" space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              My Invoices
            </h1>
            <p className="text-gray-600 mt-1">
              View your subscription payment history and download invoices
            </p>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <EnhancedInvoiceStats
          stats={invoiceStats}
          isLoading={invoicesLoading && invoices.length === 0}
        />

        {/* Enhanced Filters and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search and Filters Section */}
            <div className="flex-1 space-y-4 lg:space-y-0 lg:space-x-4 lg:flex lg:items-center">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search payment history..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                />
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap gap-3">
                {/* Payment History Filter Info */}
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Paid Invoices Only</span>
                </div>

                {/* Date Range Filter */}
                <div className="flex gap-2">
                  <input
                    type="date"
                    placeholder="Start Date"
                    value={activeFilters.startDate}
                    onChange={(e) =>
                      setActiveFilters((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <input
                    type="date"
                    placeholder="End Date"
                    value={activeFilters.endDate}
                    onChange={(e) =>
                      setActiveFilters((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Clear Filters */}
                {(searchTerm ||
                  false || // No status filter needed
                  activeFilters.startDate ||
                  activeFilters.endDate) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("");
                      setActiveFilters({
                        dateRange: "",
                        startDate: "",
                        endDate: "",
                      });
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                  >
                    <RefreshCwIcon className="h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-3">
              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-");
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="paidDate-desc">Latest Payment</option>
                  <option value="paidDate-asc">Oldest Payment</option>
                  <option value="totalAmount-desc">Highest Amount</option>
                  <option value="totalAmount-asc">Lowest Amount</option>
                  <option value="invoiceNumber-asc">Invoice Number</option>
                  <option value="issueDate-desc">Issue Date</option>
                </select>
              </div>

              {/* Export Dropdown */}
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  disabled={exportLoading}
                  className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                >
                  <DownloadIcon className="h-4 w-4" />
                  Export
                </Button>

                {showExportDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-20 border border-gray-200">
                    <div className="py-2">
                      <button
                        onClick={() => handleExport("csv")}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <FileTextIcon className="h-4 w-4" />
                        Export as CSV
                      </button>
                      <button
                        onClick={() => handleExport("pdf")}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <FileTextIcon className="h-4 w-4" />
                        Export as PDF
                      </button>
                      <button
                        onClick={() => handleExport("excel")}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <FileTextIcon className="h-4 w-4" />
                        Export as Excel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {invoicesError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">
              Error loading invoices: {invoicesError}
            </p>
          </div>
        )}

        {exportError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Failed to export. Please try again.</p>
          </div>
        )}

        {paymentSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-600">
              Payment successful. Receipt available for download.
            </p>
          </div>
        )}

        {/* Enhanced Invoices Table */}
        <EnhancedInvoiceTable
          invoices={invoices}
          isLoading={invoicesLoading}
          onViewInvoice={handleViewInvoice}
          onProcessPayment={handlePayInvoice}
          onDownloadReceipt={handleDownloadReceipt}
          pagination={{
            page: currentPage,
            limit: pageSize,
            total: invoicesMeta.total || 0,
            totalPages: invoicesMeta.totalPages || 1,
          }}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />

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
                      <label className="text-sm font-medium text-gray-600">
                        Invoice ID
                      </label>
                      <p className="text-gray-900">
                        {selectedInvoice.invoiceNumber}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Status
                      </label>
                      <div className="mt-1">
                        {getStatusBadge(selectedInvoice.status)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Invoice Date
                      </label>
                      <p className="text-gray-900">
                        {formatDate(selectedInvoice.issueDate)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Due Date
                      </label>
                      <p className="text-gray-900">
                        {formatDate(selectedInvoice.dueDate)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Amount
                      </label>
                      <p className="text-gray-900 font-semibold">
                        {formatCurrency(selectedInvoice.totalAmount)}
                      </p>
                    </div>
                    {selectedInvoice.paidDate && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Payment Date
                        </label>
                        <p className="text-gray-900">
                          {formatDate(selectedInvoice.paidDate)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Itemized Charges */}
                  {selectedInvoice.items &&
                    selectedInvoice.items.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Itemized Charges
                        </label>
                        <div className="mt-2 bg-gray-50 rounded-lg p-3">
                          {selectedInvoice.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0"
                            >
                              <div>
                                <p className="font-medium">
                                  {item.description}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Qty: {item.quantity} ×{" "}
                                  {formatCurrency(item.unitPrice)}
                                </p>
                              </div>
                              <p className="font-semibold">
                                {formatCurrency(item.total)}
                              </p>
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
                  <p className="text-sm text-gray-600">
                    Invoice: {selectedInvoice.invoiceNumber}
                  </p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(selectedInvoice.totalAmount)}
                  </p>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={paymentData.cardholderName}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          cardholderName: e.target.value,
                        })
                      }
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
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          cardNumber: e.target.value,
                        })
                      }
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
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            expiryDate: e.target.value,
                          })
                        }
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
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            cvv: e.target.value,
                          })
                        }
                        placeholder="123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {paymentError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-600 text-sm">
                        Payment failed. Please try again.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={paymentLoading}
                      className="flex-1"
                    >
                      {paymentLoading
                        ? "Processing..."
                        : `Pay ${formatCurrency(selectedInvoice.totalAmount)}`}
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
