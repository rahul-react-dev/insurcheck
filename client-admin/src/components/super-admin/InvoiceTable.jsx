import React, { useState } from "react";
import Button from "../ui/Button";

const InvoiceTable = ({
  invoices = [],
  isLoading = false,
  onViewInvoice,
  onDownloadInvoice,
  onMarkPaid,
  pagination = { page: 1, limit: 10, total: 0 },
  totalInvoices = 0,
  onPageChange,
  onPageSizeChange,
}) => {

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: {
        color: "bg-green-100 text-green-800",
        icon: "fas fa-check-circle",
      },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: "fas fa-clock" },
      overdue: {
        color: "bg-red-100 text-red-800",
        icon: "fas fa-exclamation-triangle",
      },
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <i className={`${config.icon} mr-1`}></i>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const isOverdue = (dueDate, status) => {
    return status.toLowerCase() !== "paid" && new Date(dueDate) < new Date();
  };

  // Backend pagination
  const totalPages = Math.ceil(totalInvoices / pagination.limit);
  const startIndex = (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(pagination.page * pagination.limit, totalInvoices);
  
  const handlePrevPage = () => {
    if (pagination.page > 1) {
      onPageChange(pagination.page - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.page < totalPages) {
      onPageChange(pagination.page + 1);
    }
  };

  const handlePageSizeChange = (event) => {
    const newLimit = parseInt(event.target.value);
    onPageSizeChange(newLimit);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16">
        <div className="max-w-md mx-auto px-4">
          <i className="fas fa-file-invoice text-4xl sm:text-6xl text-gray-300 mb-4 sm:mb-6"></i>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            No Invoices Found
          </h3>
          <p className="text-gray-500 text-sm sm:text-base">
            No invoices match your current filters. Try adjusting your search
            criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Mobile Card View */}
      <div className="block lg:hidden">
        <div className="p-4 space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-gray-50 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    #{invoice.invoiceId}
                  </span>
                  {isOverdue(invoice.dueDate, invoice.status) && (
                    <i className="fas fa-exclamation-triangle text-red-500 text-sm"></i>
                  )}
                </div>
                {getStatusBadge(invoice.status)}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Tenant:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {invoice.tenantName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Amount:</span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(invoice.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Due Date:</span>
                  <span className="text-sm text-gray-900">
                    {formatDate(invoice.dueDate)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                  <Button
                    onClick={() => onViewInvoice(invoice)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2"
                  >
                    <i className="fas fa-eye mr-1"></i>
                    View
                  </Button>
                  <Button
                    onClick={() => onDownloadInvoice(invoice.id)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-xs py-2"
                  >
                    <i className="fas fa-download mr-1"></i>
                    Download
                  </Button>
                </div>
                {invoice.status.toLowerCase() !== "paid" && (
                  <Button
                    onClick={() => onMarkPaid(invoice.id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-2"
                  >
                    <i className="fas fa-check mr-1"></i>
                    Mark Paid
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tenant Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Issue Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr
                key={invoice.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">
                      #{invoice.invoiceId}
                    </span>
                    {isOverdue(invoice.dueDate, invoice.status) && (
                      <i
                        className="fas fa-exclamation-triangle text-red-500 text-sm ml-2"
                        title="Overdue"
                      ></i>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {invoice.tenantName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {invoice.tenantEmail}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">
                    {formatCurrency(invoice.amount)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {invoice.planName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(invoice.issueDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(invoice.dueDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(invoice.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      onClick={() => onViewInvoice(invoice)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                    >
                      <i className="fas fa-eye mr-1"></i>
                      View
                    </Button>
                    <Button
                      onClick={() => onDownloadInvoice(invoice.id)}
                      className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-1"
                    >
                      <i className="fas fa-download mr-1"></i>
                      Download
                    </Button>
                    {invoice.status.toLowerCase() !== "paid" && (
                      <Button
                        onClick={() => onMarkPaid(invoice.id)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                      >
                        <i className="fas fa-check mr-1"></i>
                        Mark Paid
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              onClick={handlePrevPage}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </Button>
            <Button
              onClick={handleNextPage}
              disabled={pagination.page === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex}</span> to{" "}
                <span className="font-medium">{endIndex}</span>{" "}
                of <span className="font-medium">{totalInvoices}</span>{" "}
                results
              </p>
              <div className="flex items-center space-x-2">
                <label htmlFor="pageSize" className="text-sm text-gray-700">
                  Show:
                </label>
                <select
                  id="pageSize"
                  value={pagination.limit}
                  onChange={handlePageSizeChange}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <Button
                  onClick={handlePrevPage}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <i className="fas fa-chevron-left"></i>
                </Button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Page {pagination.page} of {totalPages}
                </span>
                <Button
                  onClick={handleNextPage}
                  disabled={pagination.page === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <i className="fas fa-chevron-right"></i>
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceTable;
