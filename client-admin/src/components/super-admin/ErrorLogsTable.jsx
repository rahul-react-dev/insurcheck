
import React, { useState } from 'react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { SUPER_ADMIN_MESSAGES } from '../../constants/superAdmin';

const ErrorLogsTable = ({ logs, isLoading, error, onFilterChange, filters }) => {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleExportCSV = () => {
    const headers = [
      SUPER_ADMIN_MESSAGES.DASHBOARD.ERROR_LOGS.COLUMNS.ERROR_ID,
      SUPER_ADMIN_MESSAGES.DASHBOARD.ERROR_LOGS.COLUMNS.TIMESTAMP,
      SUPER_ADMIN_MESSAGES.DASHBOARD.ERROR_LOGS.COLUMNS.ERROR_TYPE,
      SUPER_ADMIN_MESSAGES.DASHBOARD.ERROR_LOGS.COLUMNS.DESCRIPTION,
      SUPER_ADMIN_MESSAGES.DASHBOARD.ERROR_LOGS.COLUMNS.AFFECTED_TENANT,
      SUPER_ADMIN_MESSAGES.DASHBOARD.ERROR_LOGS.COLUMNS.AFFECTED_USER,
      SUPER_ADMIN_MESSAGES.DASHBOARD.ERROR_LOGS.COLUMNS.AFFECTED_DOCUMENT
    ];

    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        log.id,
        formatTimestamp(log.timestamp),
        log.errorType,
        `"${log.description}"`,
        log.affectedTenant || '',
        log.affectedUser || '',
        log.affectedDocument || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const errorTypes = [...new Set(logs.map(log => log.errorType))];
  const tenantNames = [...new Set(logs.map(log => log.affectedTenant).filter(Boolean))];

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-600">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {SUPER_ADMIN_MESSAGES.DASHBOARD.ERROR_LOGS.TITLE}
        </h2>
        <Button
          onClick={handleExportCSV}
          disabled={logs.length === 0}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          {SUPER_ADMIN_MESSAGES.DASHBOARD.ERROR_LOGS.EXPORT_CSV}
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {SUPER_ADMIN_MESSAGES.DASHBOARD.ERROR_LOGS.FILTER_TENANT}
          </label>
          <select
            value={filters.tenantName || ''}
            onChange={(e) => onFilterChange({ tenantName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Tenants</option>
            {tenantNames.map(tenant => (
              <option key={tenant} value={tenant}>{tenant}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {SUPER_ADMIN_MESSAGES.DASHBOARD.ERROR_LOGS.FILTER_ERROR_TYPE}
          </label>
          <select
            value={filters.errorType || ''}
            onChange={(e) => onFilterChange({ errorType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Error Types</option>
            {errorTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <Button
            onClick={() => onFilterChange({ tenantName: '', errorType: '' })}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 text-sm"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading error logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2v8h12V6H4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-600">{SUPER_ADMIN_MESSAGES.DASHBOARD.ERROR_LOGS.NO_LOGS}</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {SUPER_ADMIN_MESSAGES.DASHBOARD.ERROR_LOGS.COLUMNS.ERROR_ID}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {SUPER_ADMIN_MESSAGES.DASHBOARD.ERROR_LOGS.COLUMNS.TIMESTAMP}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {SUPER_ADMIN_MESSAGES.DASHBOARD.ERROR_LOGS.COLUMNS.ERROR_TYPE}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {SUPER_ADMIN_MESSAGES.DASHBOARD.ERROR_LOGS.COLUMNS.DESCRIPTION}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {SUPER_ADMIN_MESSAGES.DASHBOARD.ERROR_LOGS.COLUMNS.AFFECTED_TENANT}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {SUPER_ADMIN_MESSAGES.DASHBOARD.ERROR_LOGS.COLUMNS.AFFECTED_USER}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {SUPER_ADMIN_MESSAGES.DASHBOARD.ERROR_LOGS.COLUMNS.AFFECTED_DOCUMENT}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {log.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      log.errorType === 'Validation Error' ? 'bg-yellow-100 text-yellow-800' :
                      log.errorType === 'Database Error' ? 'bg-red-100 text-red-800' :
                      log.errorType === 'API Error' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {log.errorType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {log.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.affectedTenant || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.affectedUser || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                    {log.affectedDocument || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
};

export default ErrorLogsTable;
