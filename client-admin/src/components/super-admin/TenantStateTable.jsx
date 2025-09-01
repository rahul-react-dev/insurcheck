
import React from "react";
import Button from "../ui/Button";
import Pagination from "../ui/Pagination";

const TenantStateTable = ({
  tenantStates = [],
  isLoading = false,
  onChangeState,
  onManageTrial,
  onManageSubscription,
  onDeactivate,
  onQuickAction,
  pagination = { page: 1, limit: 10, total: 0 },
  onPageChange,
  onPageSizeChange,
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        color: "bg-green-100 text-green-800",
        icon: "fas fa-check-circle",
        label: "Active"
      },
      trial: {
        color: "bg-blue-100 text-blue-800",
        icon: "fas fa-clock",
        label: "On Trial"
      },
      trial_expired: {
        color: "bg-yellow-100 text-yellow-800",
        icon: "fas fa-exclamation-triangle",
        label: "Trial Expired"
      },
      deactivated: {
        color: "bg-red-100 text-red-800",
        icon: "fas fa-ban",
        label: "Deactivated"
      },
      suspended: {
        color: "bg-orange-100 text-orange-800",
        icon: "fas fa-pause-circle",
        label: "Suspended"
      },
      subscription_cancelled: {
        color: "bg-gray-100 text-gray-800",
        icon: "fas fa-times-circle",
        label: "Cancelled"
      }
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.trial_expired;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <i className={`${config.icon} mr-1`}></i>
        {config.label}
      </span>
    );
  };

  const getSubscriptionBadge = (subscriptionStatus) => {
    const statusConfig = {
      trial: "bg-blue-100 text-blue-800",
      active: "bg-green-100 text-green-800",
      suspended: "bg-orange-100 text-orange-800",
      cancelled: "bg-red-100 text-red-800",
      expired: "bg-gray-100 text-gray-800"
    };

    const color = statusConfig[subscriptionStatus?.toLowerCase()] || "bg-gray-100 text-gray-800";
    const label = subscriptionStatus?.charAt(0).toUpperCase() + subscriptionStatus?.slice(1) || 'Unknown';

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${color}`}>
        {label}
      </span>
    );
  };

  const getTrialBadge = (trialStatus) => {
    const statusConfig = {
      active: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      expired: "bg-red-100 text-red-800",
      ended: "bg-gray-100 text-gray-800"
    };

    const color = statusConfig[trialStatus?.toLowerCase()] || "bg-gray-100 text-gray-800";
    const label = trialStatus?.charAt(0).toUpperCase() + trialStatus?.slice(1) || 'N/A';

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${color}`}>
        {label}
      </span>
    );
  };

  const getAccessLevelBadge = (accessLevel) => {
    const levelConfig = {
      full: { color: "bg-green-100 text-green-800", icon: "fas fa-unlock", label: "Full Access" },
      trial: { color: "bg-blue-100 text-blue-800", icon: "fas fa-user-clock", label: "Trial Access" },
      read_only: { color: "bg-yellow-100 text-yellow-800", icon: "fas fa-lock", label: "Read Only" },
      blocked: { color: "bg-red-100 text-red-800", icon: "fas fa-ban", label: "Blocked" }
    };

    const config = levelConfig[accessLevel?.toLowerCase()] || levelConfig.read_only;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.color}`}>
        <i className={`${config.icon} mr-1`}></i>
        {config.label}
      </span>
    );
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Show loading skeleton
  if (isLoading && (!tenantStates || tenantStates.length === 0)) {
    return (
      <div className="overflow-hidden">
        {/* Mobile Loading Skeleton */}
        <div className="block lg:hidden">
          <div className="p-4 space-y-4">
            {Array.from({ length: pagination?.limit || 5 }).map((_, index) => (
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
                  "Tenant Info",
                  "Status",
                  "Subscription",
                  "Trial Info",
                  "Access Level",
                  "Last Change",
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
              {Array.from({ length: pagination?.limit || 5 }).map(
                (_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-40"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
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

  if (!tenantStates || tenantStates.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16">
        <div className="max-w-md mx-auto px-4">
          <i className="fas fa-cogs text-4xl sm:text-6xl text-gray-300 mb-4 sm:mb-6"></i>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            No Tenant States Found
          </h3>
          <p className="text-gray-500 text-sm sm:text-base">
            No tenants match your current filters. Try adjusting your search criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Mobile Card View */}
      <div className="block xl:hidden">
        <div className="p-4 space-y-4">
          {tenantStates.map((tenant) => (
            <div
              key={tenant.id}
              className="bg-gray-50 rounded-lg p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {tenant.tenantName}
                  </h4>
                  <p className="text-xs text-gray-500">#{tenant.tenantId}</p>
                </div>
                {getStatusBadge(tenant.status)}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500">Subscription:</span>
                  <div className="mt-1">{getSubscriptionBadge(tenant.subscriptionStatus)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Trial:</span>
                  <div className="mt-1">{getTrialBadge(tenant.trialStatus)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Access Level:</span>
                  <div className="mt-1">{getAccessLevelBadge(tenant.accessLevel)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Last Change:</span>
                  <p className="text-gray-900 font-medium">{formatDate(tenant.lastStateChange)}</p>
                </div>
              </div>

              {/* Trial Info for active trials */}
              {tenant.trialStatus === 'active' && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-700 font-medium">Trial Progress</span>
                    <span className="text-blue-600">
                      {getDaysRemaining(tenant.trialEndDate)} days left
                    </span>
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Ends: {formatDate(tenant.trialEndDate)}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => onChangeState(tenant)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2"
                >
                  <i className="fas fa-cog mr-1"></i>
                  Manage State
                </Button>
                
                {tenant.trialStatus === 'active' && (
                  <Button
                    onClick={() => onManageTrial(tenant)}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs py-2"
                  >
                    <i className="fas fa-clock mr-1"></i>
                    Manage Trial
                  </Button>
                )}
                
                {(tenant.subscriptionStatus === 'active' || tenant.subscriptionStatus === 'suspended') && (
                  <Button
                    onClick={() => onManageSubscription(tenant)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs py-2"
                  >
                    <i className="fas fa-credit-card mr-1"></i>
                    Subscription
                  </Button>
                )}
                
                {tenant.status !== 'deactivated' && (
                  <Button
                    onClick={() => onDeactivate(tenant)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs py-2"
                  >
                    <i className="fas fa-ban mr-1"></i>
                    Deactivate
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden xl:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tenant Information
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subscription
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trial Information
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Access Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Status Change
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tenantStates.map((tenant) => (
              <tr
                key={tenant.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {tenant.tenantName}
                    </div>
                    <div className="text-sm text-gray-500">
                      #{tenant.tenantId}
                    </div>
                    <div className="text-xs text-gray-400">
                      {tenant.primaryContactEmail}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(tenant.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {getSubscriptionBadge(tenant.subscriptionStatus)}
                    <div className="text-xs text-gray-500">
                      Plan: {tenant.subscriptionPlan}
                    </div>
                    {tenant.subscriptionEndDate && (
                      <div className="text-xs text-gray-400">
                        Ends: {formatDate(tenant.subscriptionEndDate)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {getTrialBadge(tenant.trialStatus)}
                    {tenant.trialStatus === 'active' && (
                      <div className="text-xs">
                        <div className="text-blue-600 font-medium">
                          {getDaysRemaining(tenant.trialEndDate)} days left
                        </div>
                        <div className="text-gray-400">
                          Ends: {formatDate(tenant.trialEndDate)}
                        </div>
                      </div>
                    )}
                    {tenant.trialStatus !== 'active' && tenant.trialEndDate && (
                      <div className="text-xs text-gray-400">
                        Ended: {formatDate(tenant.trialEndDate)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getAccessLevelBadge(tenant.accessLevel)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDateTime(tenant.lastStateChange)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {tenant.stateChangeReason}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      onClick={() => onChangeState(tenant)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                    >
                      <i className="fas fa-cog mr-1"></i>
                      State
                    </Button>
                    
                    {tenant.trialStatus === 'active' && (
                      <Button
                        onClick={() => onQuickAction(tenant, 'endTrial')}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1"
                      >
                        <i className="fas fa-stop mr-1"></i>
                        End Trial
                      </Button>
                    )}
                    
                    {tenant.status === 'suspended' && (
                      <Button
                        onClick={() => onQuickAction(tenant, 'activate')}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                      >
                        <i className="fas fa-play mr-1"></i>
                        Activate
                      </Button>
                    )}
                    
                    {tenant.status === 'active' && (
                      <Button
                        onClick={() => onQuickAction(tenant, 'suspend')}
                        className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3 py-1"
                      >
                        <i className="fas fa-pause mr-1"></i>
                        Suspend
                      </Button>
                    )}
                    
                    {tenant.status !== 'deactivated' && (
                      <Button
                        onClick={() => onDeactivate(tenant)}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1"
                      >
                        <i className="fas fa-ban mr-1"></i>
                        Deactivate
                      </Button>
                    )}
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
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit}
        onPageChange={onPageChange}
        onItemsPerPageChange={onPageSizeChange}
        showItemsPerPage={true}
        itemsPerPageOptions={[5, 10, 25, 50]}
      />
    </div>
  );
};

export default TenantStateTable;
