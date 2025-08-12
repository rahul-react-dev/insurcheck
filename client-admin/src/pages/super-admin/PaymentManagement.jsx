import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import InvoiceTable from "../../components/super-admin/InvoiceTable";
import InvoiceModal from "../../components/super-admin/InvoiceModal";
import InvoiceFilters from "../../components/super-admin/InvoiceFilters";
import {
  fetchInvoicesRequest,
  fetchTenantsRequest,
  markInvoicePaidRequest,
  downloadInvoiceRequest,
  clearError,
} from "../../store/super-admin/paymentSlice";

const PaymentManagement = () => {
  const dispatch = useDispatch();
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    tenantName: "",
    status: "",
    dateRange: {
      start: "",
      end: "",
    },
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
  });

  const {
    invoices,
    tenants,
    isLoading,
    error,
    totalInvoices,
    totalPaid,
    totalPending,
    totalOverdue,
    pagination: storePagination,
  } = useSelector((state) => state.payment);

  // Sync pagination with store
  useEffect(() => {
    if (storePagination) {
      setPagination(prev => ({
        ...prev,
        ...storePagination
      }));
    }
  }, [storePagination]);

  // Fetch initial data when component mounts
  useEffect(() => {
    dispatch(
      fetchInvoicesRequest({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      }),
    );
    dispatch(fetchTenantsRequest());
  }, [dispatch]);

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleDownloadInvoice = (invoiceId) => {
    dispatch(downloadInvoiceRequest(invoiceId));
  };

  const handleMarkPaid = (invoiceId) => {
    if (window.confirm("Are you sure you want to mark this invoice as paid?")) {
      dispatch(markInvoicePaidRequest(invoiceId));
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Reset to first page when filters change
    setPagination((prev) => ({ ...prev, page: 1 }));
    // Trigger immediate fetch with new filters
    dispatch(
      fetchInvoicesRequest({ ...newFilters, page: 1, limit: pagination.limit }),
    );
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    // Trigger immediate fetch with new page
    dispatch(
      fetchInvoicesRequest({
        ...filters,
        page: newPage,
        limit: pagination.limit,
      }),
    );
  };

  const handlePageSizeChange = (newLimit) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
    // Trigger immediate fetch with new page size
    dispatch(fetchInvoicesRequest({ ...filters, page: 1, limit: newLimit }));
  };

  const handleRefresh = () => {
    dispatch(fetchInvoicesRequest({ ...filters, ...pagination }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="min-h-full">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl p-4 sm:p-6 lg:p-8 text-white mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
              Payments & Invoices
            </h1>
            <p className="text-green-100 text-sm sm:text-base lg:text-lg">
              Manage tenant payments, invoices, and financial compliance
            </p>
            <div className="flex items-center mt-3 sm:mt-4 text-xs sm:text-sm">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Payment System Online</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block flex-shrink-0">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <i className="fas fa-file-invoice-dollar text-3xl lg:text-4xl text-white opacity-80"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-6">
          <div className="flex items-start justify-between space-x-3">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <i className="fas fa-exclamation-triangle text-red-400 mt-0.5 flex-shrink-0"></i>
              <div className="min-w-0">
                <h3 className="text-red-800 font-medium text-sm sm:text-base">
                  Error
                </h3>
                <p className="text-red-700 text-sm break-words">{error}</p>
              </div>
            </div>
            <button
              onClick={() => dispatch(clearError())}
              className="text-red-400 hover:text-red-600 text-xl font-bold flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-file-invoice text-blue-600 text-xl"></i>
              </div>
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 truncate">
                Total Invoices
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalInvoices || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-green-600 text-xl"></i>
              </div>
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 truncate">Paid</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalPaid || 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-clock text-yellow-600 text-xl"></i>
              </div>
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 truncate">
                Pending
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(totalPending || 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
              </div>
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 truncate">
                Overdue
              </p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totalOverdue || 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="p-4 sm:p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1">
            <InvoiceFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              tenants={tenants}
            />
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Button
              onClick={handleRefresh}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 text-sm"
              disabled={isLoading}
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Refresh
            </Button>
            <Button
              onClick={() => dispatch(downloadInvoiceRequest("all"))}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm"
            >
              <i className="fas fa-download mr-2"></i>
              Export All
            </Button>
          </div>
        </div>
      </Card>

      {/* Invoice Table */}
      <Card className="overflow-hidden">
        <InvoiceTable
          invoices={invoices}
          isLoading={isLoading}
          onViewInvoice={handleViewInvoice}
          onDownloadInvoice={handleDownloadInvoice}
          onMarkPaid={handleMarkPaid}
          pagination={pagination}
          totalInvoices={totalInvoices}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </Card>

      {/* Invoice Modal */}
      {isModalOpen && selectedInvoice && (
        <InvoiceModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedInvoice(null);
          }}
          invoice={selectedInvoice}
          onDownload={handleDownloadInvoice}
          onMarkPaid={handleMarkPaid}
        />
      )}
    </div>
  );
};

export default PaymentManagement;
