import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSystemConfigRequest, updateFilters, clearFilters } from '../../store/super-admin/systemConfigSlice';
import Input from '../ui/Input';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

const SystemConfigurationFilters = () => {
  const dispatch = useDispatch();
  const { filters, isLoading } = useSelector(state => state.systemConfig);
  
  const [localFilters, setLocalFilters] = useState({
    search: '',
    category: '',
    isActive: '',
    sortBy: 'category',
    sortOrder: 'asc'
  });

  // Initialize local filters from Redux state
  useEffect(() => {
    setLocalFilters(prev => ({ ...prev, ...filters }));
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    dispatch(updateFilters(localFilters));
    dispatch(fetchSystemConfigRequest(localFilters));
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      category: '',
      isActive: '',
      sortBy: 'category',
      sortOrder: 'asc'
    };
    setLocalFilters(clearedFilters);
    dispatch(clearFilters());
    dispatch(fetchSystemConfigRequest(clearedFilters));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApplyFilters();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <i className="fas fa-filter text-blue-600 mr-2"></i>
          Filter System Configurations
        </h3>
        <div className="text-sm text-gray-500">
          {filters.availableCategories?.length > 0 && (
            <span>{filters.availableCategories.length} categories available</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <Input
            type="text"
            placeholder="Search configurations..."
            value={localFilters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full"
          />
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={localFilters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {filters.availableCategories?.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
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
            value={localFilters.isActive}
            onChange={(e) => handleFilterChange('isActive', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Sort Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <div className="flex space-x-2">
            <select
              value={localFilters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="category">Category</option>
              <option value="key">Name</option>
              <option value="updatedAt">Updated</option>
              <option value="createdAt">Created</option>
            </select>
            <button
              onClick={() => handleFilterChange('sortOrder', localFilters.sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title={`Sort ${localFilters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              <i className={`fas fa-sort-${localFilters.sortOrder === 'asc' ? 'up' : 'down'} text-gray-600`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex space-x-3">
          <Button
            onClick={handleApplyFilters}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <i className="fas fa-search mr-2"></i>
            )}
            Apply Filters
          </Button>
          <Button
            onClick={handleClearFilters}
            disabled={isLoading}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <i className="fas fa-times mr-2"></i>
            Clear All
          </Button>
        </div>

        <div className="text-sm text-gray-500">
          {Object.values(localFilters).some(v => v !== '' && v !== 'category' && v !== 'asc') && (
            <span className="text-blue-600">Filters applied</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemConfigurationFilters;