
import React from 'react';
import Input from '../ui/Input';

const InvoiceFilters = ({ filters, onFilterChange, tenants = [] }) => {
  const handleFilterUpdate = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    onFilterChange(newFilters);
  };

  const handleDateRangeUpdate = (key, value) => {
    const newFilters = {
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [key]: value
      }
    };
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      tenantName: '',
      status: '',
      dateRange: { start: '', end: '' }
    };
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = filters.tenantName || filters.status || filters.dateRange.start || filters.dateRange.end;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-medium text-gray-900 mb-2 sm:mb-0">Filter Invoices</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <i className="fas fa-times"></i>
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tenant Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tenant
          </label>
          <select
            value={filters.tenantName}
            onChange={(e) => handleFilterUpdate('tenantName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Tenants</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.name}>
                {tenant.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterUpdate('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        {/* Date Range Start */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <Input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => handleDateRangeUpdate('start', e.target.value)}
            className="w-full text-sm"
          />
        </div>

        {/* Date Range End */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <Input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) => handleDateRangeUpdate('end', e.target.value)}
            className="w-full text-sm"
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2">
          {filters.tenantName && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Tenant: {filters.tenantName}
              <button
                onClick={() => handleFilterUpdate('tenantName', '')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Status: {filters.status}
              <button
                onClick={() => handleFilterUpdate('status', '')}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.dateRange.start && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              From: {filters.dateRange.start}
              <button
                onClick={() => handleDateRangeUpdate('start', '')}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.dateRange.end && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              To: {filters.dateRange.end}
              <button
                onClick={() => handleDateRangeUpdate('end', '')}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default InvoiceFilters;
