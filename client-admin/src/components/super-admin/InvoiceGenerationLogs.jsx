import React, { useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";

const InvoiceGenerationLogs = ({
  logs = [],
  isLoading,
  filters,
  pagination,
  onFilterChange,
  onPageChange,
  onPageSizeChange,
  onRetryGeneration,
  onViewDetails,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterSubmit = () => {
    onFilterChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      tenantName: "",
      status: "",
      dateRange: { start: "", end: "" },
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <i className="fas fa-check-circle text-green-500"></i>;
      case "failed":
        return <i className="fas fa-exclamation-circle text-red-500"></i>;
      case "pending":
        return <i className="fas fa-clock text-yellow-500"></i>;
      case "sent":
        return <i className="fas fa-paper-plane text-blue-500"></i>;
      default:
        return <i className="fas fa-circle text-gray-500"></i>;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Add loading states for retry operations
  const [retryingIds, setRetryingIds] = useState({});

  const handleRetryWithSpinner = async (invoiceId) => {
    setRetryingIds(prev => ({ ...prev, [invoiceId]: true }));
    try {
      await onRetryGeneration(invoiceId);
    } finally {
      setRetryingIds(prev => ({ ...prev, [invoiceId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="p-6 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-6 w-16 bg-gray-200 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <Input
              label="Tenant Name"
              placeholder="Search by tenant..."
              value={localFilters.tenantName}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  tenantName: e.target.value,
                }))
              }
              leftIcon={<i className="fas fa-search"></i>}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={localFilters.status}
              onChange={(e) =>
                setLocalFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
            </select>
          </div>

          <div>
            <Input
              label="Start Date"
              type="date"
              value={localFilters.dateRange.start}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, start: e.target.value },
                }))
              }
            />
          </div>

          <div>
            <Input
              label="End Date"
              type="date"
              value={localFilters.dateRange.end}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, end: e.target.value },
                }))
              }
            />
          </div>

          <div className="flex items-end space-x-2">
            <Button
              onClick={handleFilterSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
            >
              <i className="fas fa-filter mr-2"></i>
              Filter
            </Button>
            <Button
              onClick={handleClearFilters}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 text-sm"
            >
              <i className="fas fa-times mr-2"></i>
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* Logs List */}
      <div className="space-y-4">
        {logs.length === 0 ? (
          <Card className="p-8 text-center">
            <i className="fas fa-file-invoice text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No invoice logs found
            </h3>
            <p className="text-gray-500">
              Invoice generation logs will appear here
            </p>
          </Card>
        ) : (
          logs.map((log) => (
            <Card key={log.id} className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-file-invoice text-gray-600"></i>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {log.invoiceId}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}
                        >
                          {getStatusIcon(log.status)}
                          <span className="ml-1 capitalize">{log.status}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Tenant:</span>
                          <span className="ml-1 font-medium">
                            {log.tenantName}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Amount:</span>
                          <span className="ml-1 font-medium">
                            {formatCurrency(log.amount)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Generated:</span>
                          <span className="ml-1 font-medium">
                            {formatDateTime(log.generationDate)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Method:</span>
                          <span className="ml-1 font-medium capitalize">
                            {log.generationType}
                          </span>
                        </div>
                      </div>

                      {log.sentDate && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-500">Sent:</span>
                          <span className="ml-1 font-medium">
                            {formatDateTime(log.sentDate)}
                          </span>
                          <span className="text-gray-500 ml-4">To:</span>
                          <span className="ml-1 font-medium">
                            {log.sentToEmail}
                          </span>
                        </div>
                      )}

                      {log.errorMessage && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center">
                            <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                            <span className="text-sm text-red-700 font-medium">
                              Error:
                            </span>
                          </div>
                          <p className="text-sm text-red-600 mt-1">
                            {log.errorMessage}
                          </p>
                        </div>
                      )}

                      {log.notes && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center">
                            <i className="fas fa-info-circle text-blue-500 mr-2"></i>
                            <span className="text-sm text-blue-700 font-medium">
                              Notes:
                            </span>
                          </div>
                          <p className="text-sm text-blue-600 mt-1">
                            {log.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0">
                    {log.status === "failed" && (
                      <Button
                        onClick={() => handleRetryWithSpinner(log.id)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 text-sm"
                        disabled={retryingIds[log.id]}
                      >
                        {retryingIds[log.id] ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-1"></i>
                            Retrying...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-redo mr-1"></i>
                            Retry
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      onClick={() => onViewDetails && onViewDetails(log)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 text-sm"
                    >
                      <i className="fas fa-eye mr-1"></i>
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {logs.length > 0 && (
        <Card className="mt-6">
          <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Items per page selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Show:</span>
              <select
                value={pagination.limit}
                onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>

            {/* Page navigation */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => onPageChange(1)}
                disabled={pagination.page === 1}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white px-3 py-2 text-sm"
              >
                <i className="fas fa-angle-double-left"></i>
              </Button>

              <Button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white px-3 py-2 text-sm"
              >
                <i className="fas fa-chevron-left"></i>
              </Button>

              <div className="flex items-center space-x-1">
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, Math.ceil(pagination.total / pagination.limit)) }, (_, i) => {
                  const totalPages = Math.ceil(pagination.total / pagination.limit);
                  let pageNumber;

                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else {
                    const start = Math.max(1, pagination.page - 2);
                    const end = Math.min(totalPages, start + 4);
                    pageNumber = start + i;

                    if (pageNumber > end) return null;
                  }

                  return (
                    <Button
                      key={pageNumber}
                      onClick={() => onPageChange(pageNumber)}
                      className={`px-3 py-2 text-sm ${
                        pagination.page === pageNumber
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>

              <Button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white px-3 py-2 text-sm"
              >
                <i className="fas fa-chevron-right"></i>
              </Button>

              <Button
                onClick={() => onPageChange(Math.ceil(pagination.total / pagination.limit))}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white px-3 py-2 text-sm"
              >
                <i className="fas fa-angle-double-right"></i>
              </Button>
            </div>

            {/* Results info */}
            <div className="text-sm text-gray-700">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} entries
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default InvoiceGenerationLogs;