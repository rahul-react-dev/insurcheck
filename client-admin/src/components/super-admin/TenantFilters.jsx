
import React from "react";
import Input from "../ui/Input";

const TenantFilters = ({ filters, onFilterChange, subscriptionPlans = [] }) => {
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
      subscriptionPlan: "",
      dateRange: {
        start: "",
        end: "",
      },
    });
  };

  const hasActiveFilters = 
    filters.tenantName || 
    filters.status || 
    filters.subscriptionPlan ||
    filters.dateRange?.start || 
    filters.dateRange?.end;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h3 className="text-lg font-semibold text-gray-900">Filter Tenants</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            <i className="fas fa-times mr-1"></i>
            Clear Filters
          </button>
        )}
      </div>

      {/* First row - Main filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
        {/* Tenant Name Filter */}
        <div className="md:col-span-1">
          <Input
            label="Tenant Name"
            value={filters.tenantName || ""}
            onChange={(e) => handleInputChange("tenantName", e.target.value)}
            placeholder="Search by tenant name"
            icon="fas fa-search"
          />
        </div>

        {/* Status Filter */}
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status || ""}
            onChange={(e) => handleInputChange("status", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="unverified">Unverified</option>
            <option value="locked">Locked</option>
            <option value="deactivated">Deactivated</option>
          </select>
        </div>

        {/* Subscription Plan Filter */}
        <div className="md:col-span-2 xl:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subscription Plan
          </label>
          <select
            value={filters.subscriptionPlan || ""}
            onChange={(e) => handleInputChange("subscriptionPlan", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Plans</option>
            {subscriptionPlans.map((plan) => (
              <option key={plan.id} value={plan.name}>
                {plan.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Second row - Date Range Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Created Date Range
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <input
                type="date"
                value={filters.dateRange?.start || ""}
                onChange={(e) => handleInputChange("dateRange.start", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                placeholder="Start date"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <input
                type="date"
                value={filters.dateRange?.end || ""}
                onChange={(e) => handleInputChange("dateRange.end", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                placeholder="End date"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          {filters.tenantName && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Name: {filters.tenantName}
              <button
                onClick={() => handleInputChange("tenantName", "")}
                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-purple-200"
              >
                ×
              </button>
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Status: {filters.status}
              <button
                onClick={() => handleInputChange("status", "")}
                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-purple-200"
              >
                ×
              </button>
            </span>
          )}
          {filters.subscriptionPlan && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Plan: {filters.subscriptionPlan}
              <button
                onClick={() => handleInputChange("subscriptionPlan", "")}
                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-purple-200"
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

export default TenantFilters;
