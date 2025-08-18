
import React, { useState } from 'react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';

const ErrorLogsTable = ({ logs, isLoading, error, onFilterChange, filters, pagination, onPageChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateRangeChange = (key, value) => {
    const newFilters = {
      ...localFilters,
      dateRange: {
        ...localFilters.dateRange,
        [key]: value
      }
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      tenantName: '',
      errorType: '',
      dateRange: { start: '', end: '' }
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">
          <i className="fas fa-exclamation-triangle text-4xl mb-2"></i>
          <p className="text-lg font-semibold">Error Loading Logs</p>
          <p className="text-sm">{error}</p>
        </div>
        <Button
          onClick={() => onFilterChange(filters)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filters Section */}
      <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tenant Name</label>
            <Input
              type="text"
              placeholder="Filter by tenant..."
              value={localFilters.tenantName}
              onChange={(e) => handleFilterChange('tenantName', e.target.value)}
              className="text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Error Type</label>
            <select
              value={localFilters.errorType}
              onChange={(e) => handleFilterChange('errorType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Types</option>
              <option value="authentication">Authentication</option>
              <option value="database">Database</option>
              <option value="api">API</option>
              <option value="upload">Upload</option>
              <option value="processing">Processing</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <Input
              type="date"
              value={localFilters.dateRange.start}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              className="text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <Input
              type="date"
              value={localFilters.dateRange.end}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              className="text-sm"
            />
          </div>
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            onClick={clearFilters}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 text-sm"
          >
            <i className="fas fa-times mr-2"></i>
            Clear Filters
          </Button>
          <div className="text-sm text-gray-600 flex items-center">
            <i className="fas fa-info-circle mr-2"></i>
            {logs ? `${logs.length} logs found` : 'No logs available'}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-8 text-center">
          <div className="inline-flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading error logs...</span>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!isLoading && (!logs || logs.length === 0) && (
        <div className="p-8 text-center">
          <div className="max-w-md mx-auto">
            <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Error Logs Found</h3>
            <p className="text-gray-500">
              {Object.values(localFilters).some(v => v !== '' && (!v.start && !v.end))
                ? 'Try adjusting your filters to see more results.'
                : 'No system errors have been logged yet.'}
            </p>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      {!isLoading && logs && logs.length > 0 && (
        <>
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Error ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {log?.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        log.errorType === 'critical' || log.action?.includes('CRITICAL') ? 'bg-red-100 text-red-800' :
                        log.errorType === 'warning' || log.action?.includes('WARNING') ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {log.errorType || log.action || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {log.message || log.details || log.description || 'No description available'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.affectedTenant || log.tenantName || log.tenant || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.userEmail || log.user || 'System'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4 p-4">
            {logs.map((log) => (
              <Card key={log.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-mono text-gray-600 truncate">
                          {log.id}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          log.errorType === 'critical' || log.action?.includes('CRITICAL') ? 'bg-red-100 text-red-800' :
                          log.errorType === 'warning' || log.action?.includes('WARNING') ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {log.errorType || log.action || 'Unknown'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-900 break-words">
                      {log.message || log.details || log.description || 'No description available'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Tenant</p>
                      <p className="text-sm text-gray-900 truncate">{log.affectedTenant || log.tenantName || log.tenant || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">User</p>
                      <p className="text-sm text-gray-900 truncate">{log.userEmail || log.user || 'System'}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 bg-gray-50 border-t">
              <div className="text-sm text-gray-700">
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total logs)
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => onPageChange && onPageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </Button>
                <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded">
                  {pagination.page}
                </span>
                <Button
                  onClick={() => onPageChange && onPageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ErrorLogsTable;
