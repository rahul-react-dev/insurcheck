
import React from 'react';
import Pagination from '../ui/Pagination';

const AnalyticsTable = ({
  data = [],
  isLoading = false,
  error = null,
  pagination = null,
  onPageChange,
  className = ''
}) => {
  const getPlanTypeBadge = (planType) => {
    const badges = {
      'Basic': 'bg-gray-100 text-gray-800',
      'Professional': 'bg-blue-100 text-blue-800',
      'Enterprise': 'bg-purple-100 text-purple-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        badges[planType] || 'bg-gray-100 text-gray-800'
      }`}>
        {planType}
      </span>
    );
  };

  const getComplianceRateColor = (rate) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
        {/* Mobile Loading Skeleton */}
        <div className="block xl:hidden p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="animate-pulse bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-3 bg-gray-200 rounded w-28"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Loading Skeleton */}
        <div className="hidden xl:block">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[
                  'Tenant Name',
                  'Plan Type',
                  'Users',
                  'Documents',
                  'Revenue',
                  'Compliance Rate',
                  'Last Activity'
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: pagination?.limit || 10 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-8">
          <i className="fas fa-exclamation-triangle text-red-500 text-3xl mb-3"></i>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-12">
          <i className="fas fa-chart-line text-gray-300 text-4xl mb-4"></i>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data Found</h3>
          <p className="text-gray-500 text-sm">
            No tenant analytics data matches your current filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* Mobile Card View */}
      <div className="block xl:hidden">
        <div className="p-4 space-y-4">
          {data.map((tenant) => (
            <div
              key={tenant.id}
              className="bg-gray-50 rounded-lg p-4 space-y-3 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 truncate">{tenant.tenantName}</h4>
                {getPlanTypeBadge(tenant.planType)}
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Users:</span>
                  <span className="ml-1 font-medium text-gray-900">{tenant.users}</span>
                </div>
                <div>
                  <span className="text-gray-500">Documents:</span>
                  <span className="ml-1 font-medium text-gray-900">{tenant.documents.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Revenue:</span>
                  <span className="ml-1 font-medium text-gray-900">${tenant.revenue}</span>
                </div>
                <div>
                  <span className="text-gray-500">Compliance:</span>
                  <span className={`ml-1 font-medium ${getComplianceRateColor(tenant.complianceRate)}`}>
                    {tenant.complianceRate}%
                  </span>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                Last activity: {new Date(tenant.lastActivity).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden xl:block overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tenant Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Users
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documents
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Compliance Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Activity
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{tenant.tenantName}</div>
                  <div className="text-sm text-gray-500">ID: {tenant.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPlanTypeBadge(tenant.planType)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {tenant.users}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {tenant.documents.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${tenant.revenue}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${getComplianceRateColor(tenant.complianceRate)}`}>
                    {tenant.complianceRate}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(tenant.lastActivity).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="border-t border-gray-200 px-4 py-3 sm:px-6">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default AnalyticsTable;
