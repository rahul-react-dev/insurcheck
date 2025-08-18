
import React from 'react';
import Button from '../ui/Button';

const InvoiceFilters = ({ 
  filters, 
  onFilterChange, 
  tenants = [], 
  onExportAll 
}) => {
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

  const handleClearFilters = () => {
    const clearedFilters = {
      tenantName: '',
      status: '',
      dateRange: {
        start: '',
        end: ''
      }
    };
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = filters.tenantName || filters.status || filters.dateRange.start || filters.dateRange.end;

  return (
    <div className="bg-gray-50 p-4 sm:p-6 border-b border-gray-200">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tenant Name Filter */}
          <div>
            <label htmlFor="tenantFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Tenant Name
            </label>
            <input
              id="tenantFilter"
              type="text"
              placeholder="Search by tenant..."
              value={filters.tenantName}
              onChange={(e) => handleFilterUpdate('tenantName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="statusFilter"
              value={filters.status}
              onChange={(e) => handleFilterUpdate('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Date Range - Start */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => handleDateRangeUpdate('start', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Date Range - End */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => handleDateRangeUpdate('end', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 lg:ml-6">
          {hasActiveFilters && (
            <Button
              onClick={handleClearFilters}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 text-sm"
            >
              <i className="fas fa-times mr-2"></i>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          {filters.tenantName && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Tenant: {filters.tenantName}
              <button
                onClick={() => handleFilterUpdate('tenantName', '')}
                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Status: {filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
              <button
                onClick={() => handleFilterUpdate('status', '')}
                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-600"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </span>
          )}
          {filters.dateRange.start && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              From: {filters.dateRange.start}
              <button
                onClick={() => handleDateRangeUpdate('start', '')}
                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-600"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </span>
          )}
          {filters.dateRange.end && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              To: {filters.dateRange.end}
              <button
                onClick={() => handleDateRangeUpdate('end', '')}
                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-red-400 hover:bg-red-200 hover:text-red-600"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default InvoiceFilters;
