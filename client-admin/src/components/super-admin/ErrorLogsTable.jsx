
import React, { useState } from 'react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';

const ErrorLogsTable = ({ logs = [], isLoading = false, error = null, onFilterChange, filters }) => {
  const [localFilters, setLocalFilters] = useState({
    tenantName: '',
    errorType: '',
    dateRange: {
      start: '',
      end: ''
    }
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleDateRangeChange = (type, value) => {
    const newDateRange = { ...localFilters.dateRange, [type]: value };
    const newFilters = { ...localFilters, dateRange: newDateRange };
    setLocalFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <i className="fas fa-exclamation-triangle text-2xl mb-2"></i>
          <p>Error loading logs: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Tenant Name"
          value={localFilters.tenantName}
          onChange={(e) => handleFilterChange('tenantName', e.target.value)}
          className="w-full"
        />
        <select
          value={localFilters.errorType}
          onChange={(e) => handleFilterChange('errorType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Error Types</option>
          <option value="validation">Validation Error</option>
          <option value="authentication">Authentication Error</option>
          <option value="server">Server Error</option>
          <option value="database">Database Error</option>
        </select>
        <Input
          type="date"
          placeholder="Start Date"
          value={localFilters.dateRange.start}
          onChange={(e) => handleDateRangeChange('start', e.target.value)}
          className="w-full"
        />
        <Input
          type="date"
          placeholder="End Date"
          value={localFilters.dateRange.end}
          onChange={(e) => handleDateRangeChange('end', e.target.value)}
          className="w-full"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500">Loading error logs...</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Error Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <tr key={log.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.timestamp || Date.now()).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.tenantName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        log.errorType === 'critical' ? 'bg-red-100 text-red-800' :
                        log.errorType === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {log.errorType || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {log.message || 'No message available'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        log.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        log.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {log.status || 'Open'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No error logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ErrorLogsTable;
