import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSystemConfigRequest } from '../../store/super-admin/systemConfigSlice';
import SystemConfigTable from '../../components/super-admin/SystemConfigTable';
import { SystemConfigSkeleton } from '../../components/ui/SkeletonLoader';

const SystemConfiguration = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const {
    configuration,
    configsByCategory,
    summary,
    isLoading,
    isUpdating,
    error
  } = useSelector(state => state.systemConfig);

  useEffect(() => {
    dispatch(fetchSystemConfigRequest());
  }, [dispatch]);

  // Extract categories from configurations
  const categories = configuration 
    ? [...new Set(configuration.map(config => config.category))]
    : [];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SystemConfigSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center">
            <i className="fas fa-exclamation-triangle text-red-500 mr-3"></i>
            <div>
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                Error Loading Configuration
              </h3>
              <p className="text-red-600 dark:text-red-300 mt-1">
                {error?.message || error || 'Failed to load system configuration'}
              </p>
            </div>
          </div>
          <button
            onClick={() => dispatch(fetchSystemConfigRequest())}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <i className="fas fa-retry mr-2"></i>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">System Configuration</h1>
        <p className="text-blue-100">
          Manage system-wide settings and configurations for InsurCheck platform
        </p>
        {summary && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">{summary.totalConfigurations || configuration?.length || 0}</div>
              <div className="text-blue-100">Total Configurations</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">{categories.length}</div>
              <div className="text-blue-100">Categories</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">
                {configuration?.filter(c => c.isActive).length || 0}
              </div>
              <div className="text-blue-100">Active Configs</div>
            </div>
          </div>
        )}
      </div>

      {/* Configuration Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <SystemConfigTable
          configurations={configuration || []}
          isLoading={isLoading}
          isUpdating={isUpdating}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
        />
      </div>

      {/* Category Summary */}
      {configsByCategory && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Configuration by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(configsByCategory).map(([category, configs]) => (
              <div
                key={category}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                    {category}
                  </h3>
                  <span className={`
                    inline-flex px-2 py-1 text-xs font-semibold rounded-full
                    ${category === 'security' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      category === 'storage' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      category === 'communication' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      category === 'maintenance' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      category === 'features' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                      category === 'performance' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}
                  `}>
                    {configs.length}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {configs.filter(c => c.isActive).length} active, {configs.filter(c => !c.isActive).length} inactive
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemConfiguration;