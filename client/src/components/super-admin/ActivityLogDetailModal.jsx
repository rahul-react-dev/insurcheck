
import React from 'react';
import Button from '../ui/Button';

const ActivityLogDetailModal = ({ log, isOpen, onClose }) => {
  if (!isOpen || !log) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  const getStatusColor = (status) => {
    const statusConfig = {
      success: 'text-green-600',
      failed: 'text-red-600',
      warning: 'text-yellow-600',
      pending: 'text-blue-600'
    };
    return statusConfig[status.toLowerCase()] || statusConfig.pending;
  };

  const getSeverityColor = (severity) => {
    const severityConfig = {
      low: 'text-gray-600',
      medium: 'text-yellow-600',
      high: 'text-red-600',
      critical: 'text-red-800'
    };
    return severityConfig[severity?.toLowerCase()] || severityConfig.low;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <i className="fas fa-clipboard-list text-2xl text-blue-500"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Activity Log Details
                  </h3>
                  <p className="text-sm text-gray-600">
                    Log ID: <span className="font-mono font-medium text-blue-600">{log.logId}</span>
                  </p>
                </div>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Basic Information
                </h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-500">Log ID:</span>
                    <span className="text-sm font-mono text-blue-600">{log.logId}</span>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-500">Tenant:</span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{log.tenantName}</div>
                      <div className="text-xs text-gray-500">{log.tenantId}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-500">User:</span>
                    <div className="text-right">
                      <div className="text-sm text-gray-900">{log.userEmail}</div>
                      <div className="text-xs text-gray-500">Type: {log.userType}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-500">Timestamp:</span>
                    <span className="text-sm text-gray-900">{formatDate(log.timestamp)}</span>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <span className={`text-sm font-semibold ${getStatusColor(log.status)}`}>
                      {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-500">Severity:</span>
                    <span className={`text-sm font-semibold ${getSeverityColor(log.severity)}`}>
                      {log.severity?.charAt(0).toUpperCase() + log.severity?.slice(1) || 'Low'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Technical Details
                </h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-500">IP Address:</span>
                    <span className="text-sm font-mono text-gray-900">{log.ipAddress}</span>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-500">Session ID:</span>
                    <span className="text-sm font-mono text-gray-900">{log.sessionId}</span>
                  </div>
                  
                  {log.resourceAffected && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-500">Resource:</span>
                      <span className="text-sm text-gray-900 max-w-xs text-right break-words">
                        {log.resourceAffected}
                      </span>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-500">User Agent:</span>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs text-gray-700 font-mono break-all">
                        {log.userAgent}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Details */}
            <div className="mt-6 space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Action Details
              </h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-500">Action Performed:</span>
                  <span className="text-sm font-semibold text-gray-900">{log.actionPerformed}</span>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-500">Description:</span>
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm text-gray-900">{log.actionDetails}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Metadata */}
            {(log.metadata || log.additionalInfo) && (
              <div className="mt-6 space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Additional Information
                </h4>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-xs text-gray-700 font-mono overflow-x-auto">
                    {JSON.stringify(log.metadata || log.additionalInfo || {}, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
            <div className="text-sm text-gray-500">
              <i className="fas fa-info-circle mr-1"></i>
              Log captured on {formatDate(log.timestamp)}
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(log, null, 2));
                  // You could add a toast notification here
                }}
                variant="secondary"
                className="text-sm"
              >
                <i className="fas fa-copy mr-2"></i>
                Copy JSON
              </Button>
              <Button
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
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

export default ActivityLogDetailModal;
