
import React from 'react';
import Button from '../ui/Button';
import Pagination from '../ui/Pagination';

const ActivityLogTable = ({
  logs = [],
  isLoading = false,
  pagination = { page: 1, limit: 10, total: 0 },
  sortBy = 'timestamp',
  sortOrder = 'desc',
  onPageChange,
  onPageSizeChange,
  onSort,
  onLogDetails,
  className = ''
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      success: {
        color: 'bg-green-100 text-green-800',
        icon: 'fas fa-check-circle'
      },
      failed: {
        color: 'bg-red-100 text-red-800',
        icon: 'fas fa-exclamation-circle'
      },
      warning: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: 'fas fa-exclamation-triangle'
      },
      pending: {
        color: 'bg-blue-100 text-blue-800',
        icon: 'fas fa-clock'
      }
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <i className={`${config.icon} mr-1`}></i>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getSeverityBadge = (severity) => {
    const severityConfig = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
      critical: 'bg-red-200 text-red-900'
    };

    const color = severityConfig[severity?.toLowerCase()] || severityConfig.low;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${color}`}>
        {severity || 'Low'}
      </span>
    );
  };

  const getUserTypeBadge = (userType) => {
    const typeConfig = {
      admin: 'bg-purple-100 text-purple-800',
      user: 'bg-blue-100 text-blue-800',
      system: 'bg-gray-100 text-gray-800'
    };

    const color = typeConfig[userType?.toLowerCase()] || typeConfig.user;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${color}`}>
        {userType || 'User'}
      </span>
    );
  };

  const handleSort = (field) => {
    const newSortOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(field, newSortOrder);
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) {
      return <i className="fas fa-sort text-gray-400 ml-1"></i>;
    }
    return sortOrder === 'asc' 
      ? <i className="fas fa-sort-up text-blue-500 ml-1"></i>
      : <i className="fas fa-sort-down text-blue-500 ml-1"></i>;
  };

  // Show loading skeleton
  if (isLoading && (!logs || logs.length === 0)) {
    return (
      <div className={`overflow-hidden ${className}`}>
        {/* Mobile Loading Skeleton */}
        <div className="block xl:hidden">
          <div className="p-4 space-y-4">
            {Array.from({ length: pagination?.limit || 10 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 animate-pulse">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="flex justify-between mt-4">
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Loading Skeleton */}
        <div className="hidden xl:block">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Log ID', 'Tenant Name', 'Admin/User Email', 'Action Performed', 'Timestamp', 'IP Address', 'Status', 'Actions'].map((header) => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: pagination?.limit || 10 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                  <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                  <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-16"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16">
        <div className="max-w-md mx-auto px-4">
          <i className="fas fa-clipboard-list text-4xl sm:text-6xl text-gray-300 mb-4 sm:mb-6"></i>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            No Activity Logs Found
          </h3>
          <p className="text-gray-500 text-sm sm:text-base">
            No tenant activity logs match your current filters. Try adjusting your search criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      {/* Mobile Card View */}
      <div className="block xl:hidden">
        <div className="p-4 space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-mono font-medium text-blue-600">
                    {log.logId}
                  </span>
                  {getUserTypeBadge(log.userType)}
                </div>
                {getStatusBadge(log.status)}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Tenant:</span>
                  <span className="text-sm font-medium text-gray-900">{log.tenantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">User:</span>
                  <span className="text-sm text-gray-900 truncate max-w-48">{log.userEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Action:</span>
                  <span className="text-sm font-medium text-gray-900">{log.actionPerformed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Time:</span>
                  <span className="text-sm text-gray-900">{formatDate(log.timestamp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">IP:</span>
                  <span className="text-sm text-gray-900">{log.ipAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Severity:</span>
                  {getSeverityBadge(log.severity)}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <Button
                  onClick={() => onLogDetails(log)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
                >
                  <i className="fas fa-eye mr-2"></i>
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden xl:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('logId')}
              >
                <div className="flex items-center">
                  Log ID
                  {getSortIcon('logId')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('tenantName')}
              >
                <div className="flex items-center">
                  Tenant Name
                  {getSortIcon('tenantName')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Admin/User Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action Performed
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('timestamp')}
              >
                <div className="flex items-center">
                  Timestamp
                  {getSortIcon('timestamp')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP Address
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
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-mono font-medium text-blue-600">
                    {log.logId}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-medium">{log.tenantName}</div>
                  <div className="text-xs text-gray-500">{log.tenantId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{log.userEmail}</div>
                  <div className="flex items-center mt-1">
                    {getUserTypeBadge(log.userType)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{log.actionPerformed}</div>
                  <div className="text-xs text-gray-500 max-w-xs truncate">{log.actionDetails}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(log.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-mono text-gray-900">{log.ipAddress}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    {getStatusBadge(log.status)}
                    {getSeverityBadge(log.severity)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    onClick={() => onLogDetails(log)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                  >
                    <i className="fas fa-eye mr-1"></i>
                    Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={Math.ceil(pagination.total / pagination.limit)}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit}
        onPageChange={onPageChange}
        onItemsPerPageChange={onPageSizeChange}
        showItemsPerPage={true}
        itemsPerPageOptions={[10, 25, 50, 100]}
      />
    </div>
  );
};

export default ActivityLogTable;
