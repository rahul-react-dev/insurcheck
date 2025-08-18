
import React from "react";
import Input from "../ui/Input";

const TenantStateFilters = ({ filters, onFilterChange }) => {
  const handleInputChange = (field, value) => {
    const newFilters = { ...filters };
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      newFilters[parent] = { ...newFilters[parent], [child]: value };
    } else {
      newFilters[field] = value;
    }
    
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    onFilterChange({
      tenantName: "",
      status: "",
      subscriptionStatus: "",
      trialStatus: "",
      dateRange: {
        start: "",
        end: "",
      },
    });
  };

  const hasActiveFilters = 
    filters.tenantName || 
    filters.status || 
    filters.subscriptionStatus ||
    filters.trialStatus ||
    filters.dateRange?.start || 
    filters.dateRange?.end;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h3 className="text-lg font-semibold text-gray-900">Filter Tenant States</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <i className="fas fa-times mr-1"></i>
            Clear All Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Tenant Name Filter */}
        <div>
          <Input
            label="Tenant Name"
            value={filters.tenantName || ""}
            onChange={(e) => handleInputChange("tenantName", e.target.value)}
            placeholder="Search by tenant name"
            icon="fas fa-search"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tenant Status
          </label>
          <select
            value={filters.status || ""}
            onChange={(e) => handleInputChange("status", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="trial">On Trial</option>
            <option value="trial_expired">Trial Expired</option>
            <option value="deactivated">Deactivated</option>
            <option value="suspended">Suspended</option>
            <option value="subscription_cancelled">Subscription Cancelled</option>
          </select>
        </div>

        {/* Subscription Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subscription Status
          </label>
          <select
            value={filters.subscriptionStatus || ""}
            onChange={(e) => handleInputChange("subscriptionStatus", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Subscription Status</option>
            <option value="trial">Trial</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Trial Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trial Status
          </label>
          <select
            value={filters.trialStatus || ""}
            onChange={(e) => handleInputChange("trialStatus", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Trial Status</option>
            <option value="active">Active Trial</option>
            <option value="completed">Trial Completed</option>
            <option value="expired">Trial Expired</option>
            <option value="ended">Trial Ended</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Created Date Range
          </label>
          <div className="flex space-x-1">
            <input
              type="date"
              value={filters.dateRange?.start || ""}
              onChange={(e) => handleInputChange("dateRange.start", e.target.value)}
              className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              placeholder="Start date"
            />
            <input
              type="date"
              value={filters.dateRange?.end || ""}
              onChange={(e) => handleInputChange("dateRange.end", e.target.value)}
              className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              placeholder="End date"
            />
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          {filters.tenantName && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Name: {filters.tenantName}
              <button
                onClick={() => handleInputChange("tenantName", "")}
                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
              >
                ×
              </button>
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Status: {filters.status}
              <button
                onClick={() => handleInputChange("status", "")}
                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
              >
                ×
              </button>
            </span>
          )}
          {filters.subscriptionStatus && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Subscription: {filters.subscriptionStatus}
              <button
                onClick={() => handleInputChange("subscriptionStatus", "")}
                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
              >
                ×
              </button>
            </span>
          )}
          {filters.trialStatus && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Trial: {filters.trialStatus}
              <button
                onClick={() => handleInputChange("trialStatus", "")}
                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
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

export default TenantStateFilters;
