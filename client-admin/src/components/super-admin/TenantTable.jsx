
import React from "react";
import Button from "../ui/Button";
import Pagination from "../ui/Pagination";

const TenantTable = ({
  tenants = [],
  isLoading = false,
  onEditTenant,
  onSuspendTenant,
  onDeleteTenant,
  onViewUsers,
  pagination = { page: 1, limit: 10, total: 0 },
  totalTenants = 0,
  onPageChange,
  onPageSizeChange,
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        color: "bg-green-100 text-green-800",
        icon: "fas fa-check-circle",
      },
      suspended: {
        color: "bg-red-100 text-red-800",
        icon: "fas fa-pause-circle",
      },
      unverified: {
        color: "bg-yellow-100 text-yellow-800",
        icon: "fas fa-exclamation-triangle",
      },
      locked: {
        color: "bg-orange-100 text-orange-800",
        icon: "fas fa-lock",
      },
      deactivated: {
        color: "bg-gray-100 text-gray-800",
        icon: "fas fa-ban",
      },
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.unverified;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <i className={`${config.icon} mr-1`}></i>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPlanBadge = (planName) => {
    const planConfig = {
      basic: "bg-blue-100 text-blue-800",
      professional: "bg-purple-100 text-purple-800",
      enterprise: "bg-green-100 text-green-800",
    };

    const color = planConfig[planName?.toLowerCase()] || "bg-gray-100 text-gray-800";

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${color}`}>
        {planName || "No Plan"}
      </span>
    );
  };

  // Show loading skeleton only when actually loading
  if (isLoading && (!tenants || tenants.length === 0)) {
    return (
      <div className="overflow-hidden">
        {/* Mobile Loading Skeleton */}
        <div className="block lg:hidden">
          <div className="p-4 space-y-4">
            {Array.from({ length: pagination?.limit || 10 }).map((_, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 animate-pulse"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Loading Skeleton */}
        <div className="hidden lg:block">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[
                  "Tenant ID",
                  "Tenant Name",
                  "Primary Contact",
                  "Status",
                  "Created Date",
                  "Subscription Plan",
                  "Users",
                  "Actions",
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
              {Array.from({ length: pagination?.limit || 10 }).map(
                (_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-40"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-48"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                      </div>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!tenants || tenants.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16">
        <div className="max-w-md mx-auto px-4">
          <i className="fas fa-building text-4xl sm:text-6xl text-gray-300 mb-4 sm:mb-6"></i>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            No Tenants Found
          </h3>
          <p className="text-gray-500 text-sm sm:text-base">
            No tenants match your current filters. Try adjusting your search
            criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Mobile Card View */}
      <div className="block lg:hidden">
        <div className="p-4 space-y-4">
          {tenants.map((tenant) => (
            <div
              key={tenant.id}
              className="bg-gray-50 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    #{tenant.tenantId}
                  </span>
                </div>
                {getStatusBadge(tenant.status)}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Name:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {tenant.tenantName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Contact:</span>
                  <span className="text-sm text-gray-900">
                    {tenant.primaryContactEmail}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Plan:</span>
                  {getPlanBadge(tenant.subscriptionPlan)}
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Created:</span>
                  <span className="text-sm text-gray-900">
                    {formatDate(tenant.createdDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Users:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                      {tenant.userCount || 0}
                    </span>
                    {tenant.userCount > 0 && (
                      <Button
                        onClick={() => onViewUsers(tenant)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                      >
                        View
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                  <Button
                    onClick={() => onEditTenant(tenant)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2"
                  >
                    <i className="fas fa-edit mr-1"></i>
                    Edit
                  </Button>
                  <Button
                    onClick={() => onSuspendTenant(tenant.id, tenant.status)}
                    className={`flex-1 text-white text-xs py-2 ${
                      tenant.status === "active"
                        ? "bg-orange-600 hover:bg-orange-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    <i className={`${tenant.status === "active" ? "fas fa-pause" : "fas fa-play"} mr-1`}></i>
                    {tenant.status === "active" ? "Suspend" : "Activate"}
                  </Button>
                </div>
                <Button
                  onClick={() => onDeleteTenant(tenant)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white text-xs py-2"
                >
                  <i className="fas fa-trash mr-1"></i>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tenant ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tenant Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Primary Contact Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subscription Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Users
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tenants.map((tenant) => (
              <tr
                key={tenant.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    #{tenant.tenantId}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-medium">
                    {tenant.tenantName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {tenant.description || "No description"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {tenant.primaryContactEmail}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(tenant.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(tenant.createdDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPlanBadge(tenant.subscriptionPlan)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-md min-w-[50px] text-center">
                      {tenant.userCount || 0}
                    </span>
                    {tenant.userCount > 0 && (
                      <Button
                        onClick={() => onViewUsers(tenant)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md font-medium"
                      >
                        View
                      </Button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      onClick={() => onEditTenant(tenant)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                    >
                      <i className="fas fa-edit mr-1"></i>
                      Edit
                    </Button>
                    <Button
                      onClick={() => onSuspendTenant(tenant.id, tenant.status)}
                      className={`text-white text-xs px-3 py-1 ${
                        tenant.status === "active"
                          ? "bg-orange-600 hover:bg-orange-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      <i className={`${tenant.status === "active" ? "fas fa-pause" : "fas fa-play"} mr-1`}></i>
                      {tenant.status === "active" ? "Suspend" : "Activate"}
                    </Button>
                    <Button
                      onClick={() => onDeleteTenant(tenant)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1"
                    >
                      <i className="fas fa-trash mr-1"></i>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={Math.ceil(totalTenants / pagination.limit)}
        totalItems={totalTenants}
        itemsPerPage={pagination.limit}
        onPageChange={onPageChange}
        onItemsPerPageChange={onPageSizeChange}
        showItemsPerPage={true}
        itemsPerPageOptions={[5, 10, 25, 50]}
      />
    </div>
  );
};

export default TenantTable;
