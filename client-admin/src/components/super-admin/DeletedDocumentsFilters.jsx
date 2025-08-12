
import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const DeletedDocumentsFilters = ({ filters, onSearch, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');
  const [localFilters, setLocalFilters] = useState({
    deletedBy: filters.deletedBy || '',
    originalOwner: filters.originalOwner || '',
    dateRange: filters.dateRange || '',
    documentType: filters.documentType || ''
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setLocalFilters({
      deletedBy: '',
      originalOwner: '',
      dateRange: '',
      documentType: ''
    });
    onSearch('');
    onFilterChange({
      deletedBy: '',
      originalOwner: '',
      dateRange: '',
      documentType: ''
    });
  };

  const hasActiveFilters = searchTerm || Object.values(localFilters).some(filter => filter);

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by document name or original owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            <i className="fas fa-search mr-2"></i>
            Search
          </Button>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              onClick={handleClearFilters}
              className="text-gray-600"
            >
              <i className="fas fa-times mr-2"></i>
              Clear
            </Button>
          )}
        </div>
      </form>

      {/* Advanced Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deleted By
          </label>
          <select
            value={localFilters.deletedBy}
            onChange={(e) => handleFilterChange('deletedBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Admins</option>
            <option value="admin1@tenant1.com">admin1@tenant1.com</option>
            <option value="admin2@tenant2.com">admin2@tenant2.com</option>
            <option value="admin3@tenant1.com">admin3@tenant1.com</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Original Owner
          </label>
          <select
            value={localFilters.originalOwner}
            onChange={(e) => handleFilterChange('originalOwner', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Users</option>
            <option value="user1@tenant1.com">user1@tenant1.com</option>
            <option value="user2@tenant2.com">user2@tenant2.com</option>
            <option value="user3@tenant1.com">user3@tenant1.com</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <select
            value={localFilters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Type
          </label>
          <select
            value={localFilters.documentType}
            onChange={(e) => handleFilterChange('documentType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Types</option>
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="xlsx">XLSX</option>
            <option value="pptx">PPTX</option>
            <option value="txt">TXT</option>
            <option value="image">Images</option>
          </select>
        </div>
      </div>

      {/* Filter Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
          <span className="text-sm text-gray-500">Active filters:</span>
          {searchTerm && (
            <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs">
              Search: "{searchTerm}"
              <button
                onClick={() => {
                  setSearchTerm('');
                  onSearch('');
                }}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </span>
          )}
          {Object.entries(localFilters).map(([key, value]) => 
            value ? (
              <span key={key} className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs">
                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}: {value}
                <button
                  onClick={() => handleFilterChange(key, '')}
                  className="ml-1 text-gray-600 hover:text-gray-800"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              </span>
            ) : null
          )}
        </div>
      )}
    </div>
  );
};
