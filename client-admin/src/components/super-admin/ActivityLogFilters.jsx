
import React, { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const ActivityLogFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  isLoading = false,
  className = ''
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
  };

  const handleDateRangeChange = (field, value) => {
    const newFilters = {
      ...localFilters,
      dateRange: {
        ...localFilters.dateRange,
        [field]: value
      }
    };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      tenantName: '',
      userEmail: '',
      actionPerformed: '',
      dateRange: {
        start: '',
        end: ''
      }
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
  };

  const actionOptions = [
    'Document Upload',
    'Document Access',
    'Document Processing',
    'Login Attempt',
    'Logout',
    'User Management',
    'Data Export',
    'Settings Change',
    'Password Reset',
    'Account Creation',
    'Account Deletion',
    'Permission Change'
  ];

  return (
    <div className={`bg-gray-50 p-4 sm:p-6 border-b border-gray-200 ${className}`}>
      <div className="space-y-4">
        {/* Filter Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <i className="fas fa-filter text-blue-500 mr-2"></i>
            Filter Activity Logs
          </h3>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              onClick={handleApplyFilters}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 text-sm"
            >
              <i className={`fas fa-search mr-2 ${isLoading ? 'animate-spin' : ''}`}></i>
              {isLoading ? 'Applying...' : 'Apply Filters'}
            </Button>
            <Button
              onClick={handleClearFilters}
              disabled={isLoading}
              variant="secondary"
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white px-4 py-2 text-sm"
            >
              <i className={`fas fa-times mr-2 ${isLoading ? 'animate-spin' : ''}`}></i>
              {isLoading ? 'Clearing...' : 'Clear All'}
            </Button>
          </div>
        </div>

        {/* Filter Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tenant Name Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tenant Name
            </label>
            <Input
              type="text"
              placeholder="Search by tenant name..."
              value={localFilters.tenantName}
              onChange={(e) => handleInputChange('tenantName', e.target.value)}
              leftIcon={<i className="fas fa-building"></i>}
              className="text-sm"
            />
          </div>

          {/* User Email Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Admin/User Email
            </label>
            <Input
              type="email"
              placeholder="Search by email..."
              value={localFilters.userEmail}
              onChange={(e) => handleInputChange('userEmail', e.target.value)}
              leftIcon={<i className="fas fa-envelope"></i>}
              className="text-sm"
            />
          </div>

          {/* Action Performed Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Action Performed
            </label>
            <div className="relative">
              <select
                value={localFilters.actionPerformed}
                onChange={(e) => handleInputChange('actionPerformed', e.target.value)}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Actions</option>
                {actionOptions.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 flex items-center justify-center w-10 pointer-events-none">
                <i className="fas fa-tasks text-gray-400"></i>
              </div>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                placeholder="Start date"
                value={localFilters.dateRange?.start || ''}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="text-sm"
              />
              <Input
                type="date"
                placeholder="End date"
                value={localFilters.dateRange?.end || ''}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
        </div>

        {/* Quick Filter Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 font-medium">Quick filters:</span>
          <button
            onClick={() => handleInputChange('actionPerformed', 'Login Attempt')}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs hover:bg-blue-200 transition-colors"
          >
            Login Attempts
          </button>
          <button
            onClick={() => handleInputChange('actionPerformed', 'Document Upload')}
            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs hover:bg-green-200 transition-colors"
          >
            Document Uploads
          </button>
          <button
            onClick={() => handleInputChange('actionPerformed', 'User Management')}
            className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs hover:bg-purple-200 transition-colors"
          >
            User Management
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              handleDateRangeChange('start', yesterday.toISOString().split('T')[0]);
              handleDateRangeChange('end', today.toISOString().split('T')[0]);
            }}
            className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs hover:bg-orange-200 transition-colors"
          >
            Last 24 Hours
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogFilters;
