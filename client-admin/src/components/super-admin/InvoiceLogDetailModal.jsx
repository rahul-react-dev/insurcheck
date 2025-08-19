
import React from "react";
import Button from "../ui/Button";
import Card from "../ui/Card";

const InvoiceLogDetailModal = ({ isOpen, onClose, log }) => {
  if (!isOpen || !log) return null;

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <i className="fas fa-check-circle text-green-500"></i>;
      case "failed":
        return <i className="fas fa-exclamation-circle text-red-500"></i>;
      case "processing":
        return <i className="fas fa-clock text-yellow-500"></i>;
      case "retrying":
        return <i className="fas fa-redo text-blue-500"></i>;
      default:
        return <i className="fas fa-circle text-gray-500"></i>;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "retrying":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
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
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <i className="fas fa-file-invoice text-2xl text-purple-500"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Invoice Generation Log Details
                  </h3>
                  <p className="text-sm text-gray-600">
                    Invoice ID:{" "}
                    <span className="font-mono font-medium text-purple-600">
                      {log.invoiceNumber || log.invoiceId || `Log #${log.id.substring(0, 8)}`}
                    </span>
                  </p>
                </div>
              </div>
              <Button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 bg-transparent hover:bg-gray-100 p-2"
              >
                <i className="fas fa-times text-xl"></i>
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            <div className="space-y-6">
              {/* Status and Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                    Status Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(log.status)}`}
                      >
                        {getStatusIcon(log.status)}
                        <span className="ml-1 capitalize">{log.status}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Generation Type:</span>
                      <span className="text-sm font-medium capitalize">
                        {log.metadata?.generationType || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Amount:</span>
                      <span className="text-sm font-bold">
                        {formatCurrency(log.amount)}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                    Tenant Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tenant Name:</span>
                      <span className="text-sm font-medium">{log.tenantName}</span>
                    </div>
                    {log.tenantId && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Tenant ID:</span>
                        <span className="text-sm font-mono">{log.tenantId}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Timestamps */}
              <Card className="p-4">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Timeline
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Generated:</span>
                    <p className="text-sm font-medium">
                      {formatDateTime(log.generationDate)}
                    </p>
                  </div>
                  {log.sentDate && (
                    <div>
                      <span className="text-sm text-gray-600">Sent:</span>
                      <p className="text-sm font-medium">
                        {formatDateTime(log.sentDate)}
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Email Information */}
              {log.sentToEmail && (
                <Card className="p-4">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                    Email Delivery
                  </h4>
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-envelope text-blue-500"></i>
                    <span className="text-sm font-medium">{log.sentToEmail}</span>
                  </div>
                </Card>
              )}

              {/* Error Message */}
              {log.errorMessage && (
                <Card className="p-4 border-red-200 bg-red-50">
                  <h4 className="text-sm font-medium text-red-800 uppercase tracking-wide mb-3">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    Error Details
                  </h4>
                  <p className="text-sm text-red-700 break-words">
                    {log.errorMessage}
                  </p>
                </Card>
              )}

              {/* Notes */}
              {log.notes && (
                <Card className="p-4 border-blue-200 bg-blue-50">
                  <h4 className="text-sm font-medium text-blue-800 uppercase tracking-wide mb-3">
                    <i className="fas fa-info-circle mr-2"></i>
                    Notes
                  </h4>
                  <p className="text-sm text-blue-700 break-words">{log.notes}</p>
                </Card>
              )}

              {/* Raw Data (for debugging) */}
              <Card className="p-4 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                  <i className="fas fa-code mr-2"></i>
                  Raw Data
                </h4>
                <pre className="text-xs text-gray-600 bg-white p-3 rounded border overflow-x-auto">
                  {JSON.stringify(log, null, 2)}
                </pre>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
            <div className="text-sm text-gray-500">
              <i className="fas fa-info-circle mr-1"></i>
              Log captured on {formatDateTime(log.generationDate)}
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(log, null, 2));
                  // You could add a toast notification here
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 text-sm"
              >
                <i className="fas fa-copy mr-2"></i>
                Copy JSON
              </Button>
              <Button
                onClick={onClose}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm"
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

export default InvoiceLogDetailModal;
