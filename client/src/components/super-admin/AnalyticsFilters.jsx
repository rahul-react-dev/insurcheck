
import React from 'react';
import Button from '../ui/Button';

const AnalyticsFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters,
  className = '',
  isLoading = false 
}) => {
  const handleDateRangeChange = (field, value) => {
    onFilterChange({
      dateRange: {
        ...filters.dateRange,
        [field]: value
      }
    });
  };

  const handleInputChange = (field, value) => {
    onFilterChange({
      [field]: value
    });
  };

  const viewTypeOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' }
  ];

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i className="fas fa-filter text-blue-500 mr-2"></i>
            Analytics Filters
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range Start */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.dateRange?.start || ''}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* Date Range End */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.dateRange?.end || ''}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* Tenant Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tenant Name
              </label>
              <input
                type="text"
                placeholder="Search by tenant name..."
                value={filters.tenantName || ''}
                onChange={(e) => handleInputChange('tenantName', e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* View Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                View Type
              </label>
              <select
                value={filters.viewType || 'monthly'}
                onChange={(e) => handleInputChange('viewType', e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-50 disabled:text-gray-500"
              >
                {viewTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Button
            onClick={onClearFilters}
            disabled={isLoading}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 text-sm"
          >
            <i className="fas fa-times mr-2"></i>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.dateRange?.start || filters.dateRange?.end || filters.tenantName) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.dateRange?.start && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                From: {filters.dateRange.start}
                <button
                  onClick={() => handleDateRangeChange('start', '')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <i className="fas fa-times"></i>
                </button>
              </span>
            )}
            {filters.dateRange?.end && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                To: {filters.dateRange.end}
                <button
                  onClick={() => handleDateRangeChange('end', '')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <i className="fas fa-times"></i>
                </button>
              </span>
            )}
            {filters.tenantName && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Tenant: {filters.tenantName}
                <button
                  onClick={() => handleInputChange('tenantName', '')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <i className="fas fa-times"></i>
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsFilters;
