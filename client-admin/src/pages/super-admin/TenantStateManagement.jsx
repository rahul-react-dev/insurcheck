
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import TenantStateTable from "../../components/super-admin/TenantStateTable";
import TenantStateModal from "../../components/super-admin/TenantStateModal";
import TenantTrialModal from "../../components/super-admin/TenantTrialModal";
import TenantSubscriptionModal from "../../components/super-admin/TenantSubscriptionModal";
import TenantStateFilters from "../../components/super-admin/TenantStateFilters";
import ConfirmModal from "../../components/ui/ConfirmModal";
import {
  fetchTenantStatesRequest,
  updateTenantStateRequest,
  updateTrialStatusRequest,
  cancelSubscriptionRequest,
  clearError,
} from "../../store/super-admin/tenantStateSlice";

const TenantStateManagement = () => {
  const dispatch = useDispatch();
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isStateModalOpen, setIsStateModalOpen] = useState(false);
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [filters, setFilters] = useState({
    tenantName: "",
    status: "",
    subscriptionStatus: "",
    trialStatus: "",
    dateRange: {
      start: "",
      end: "",
    },
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
  });

  const {
    tenantStates,
    isLoading,
    error,
    summary,
    pagination: storePagination,
  } = useSelector((state) => state.tenantState);

  // Sync pagination with store
  useEffect(() => {
    if (storePagination) {
      setPagination(prev => ({
        ...prev,
        ...storePagination
      }));
    }
  }, [storePagination]);

  // Fetch initial data
  useEffect(() => {
    const fetchParams = {
      page: 1,
      limit: 5,
      ...filters,
    };
    dispatch(fetchTenantStatesRequest(fetchParams));
  }, [dispatch]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    dispatch(fetchTenantStatesRequest({ ...newFilters, page: 1, limit: pagination.limit }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    dispatch(fetchTenantStatesRequest({ ...filters, page: newPage, limit: pagination.limit }));
  };

  const handlePageSizeChange = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
    dispatch(fetchTenantStatesRequest({ ...filters, page: 1, limit: newLimit }));
  };

  const handleRefresh = () => {
    dispatch(fetchTenantStatesRequest({ ...filters, ...pagination }));
  };

  // State Management Actions
  const handleChangeState = (tenant) => {
    setSelectedTenant(tenant);
    setIsStateModalOpen(true);
  };

  const handleManageTrial = (tenant) => {
    setSelectedTenant(tenant);
    setIsTrialModalOpen(true);
  };

  const handleManageSubscription = (tenant) => {
    setSelectedTenant(tenant);
    setIsSubscriptionModalOpen(true);
  };

  const handleDeactivateTenant = (tenant) => {
    setSelectedTenant(tenant);
    setConfirmAction({
      type: 'deactivate',
      title: 'Deactivate Tenant',
      message: `Are you sure you want to deactivate "${tenant.tenantName}"? This will block all user access and set documents to read-only.`,
      confirmText: 'Deactivate',
      confirmClass: 'bg-red-600 hover:bg-red-700',
    });
    setIsConfirmModalOpen(true);
  };

  const handleQuickAction = (tenant, action) => {
    setSelectedTenant(tenant);
    const actionConfig = {
      activate: {
        type: 'activate',
        title: 'Activate Tenant',
        message: `Are you sure you want to activate "${tenant.tenantName}"?`,
        confirmText: 'Activate',
        confirmClass: 'bg-green-600 hover:bg-green-700',
      },
      suspend: {
        type: 'suspend',
        title: 'Suspend Tenant',
        message: `Are you sure you want to suspend "${tenant.tenantName}"?`,
        confirmText: 'Suspend',
        confirmClass: 'bg-orange-600 hover:bg-orange-700',
      },
      endTrial: {
        type: 'endTrial',
        title: 'End Trial',
        message: `Are you sure you want to end the trial for "${tenant.tenantName}"?`,
        confirmText: 'End Trial',
        confirmClass: 'bg-yellow-600 hover:bg-yellow-700',
      },
    };

    setConfirmAction(actionConfig[action]);
    setIsConfirmModalOpen(true);
  };

  const executeConfirmAction = () => {
    if (!confirmAction || !selectedTenant) return;

    switch (confirmAction.type) {
      case 'deactivate':
        dispatch(updateTenantStateRequest({
          tenantId: selectedTenant.id,
          status: 'deactivated',
          reason: 'Manual deactivation by super admin'
        }));
        break;
      case 'activate':
        dispatch(updateTenantStateRequest({
          tenantId: selectedTenant.id,
          status: 'active',
          reason: 'Manual activation by super admin'
        }));
        break;
      case 'suspend':
        dispatch(updateTenantStateRequest({
          tenantId: selectedTenant.id,
          status: 'suspended',
          reason: 'Manual suspension by super admin'
        }));
        break;
      case 'endTrial':
        dispatch(updateTrialStatusRequest({
          tenantId: selectedTenant.id,
          endTrial: true,
          reason: 'Manual trial termination by super admin'
        }));
        break;
      default:
        break;
    }

    setIsConfirmModalOpen(false);
    setSelectedTenant(null);
    setConfirmAction(null);
  };

  const handleStateModalSubmit = (stateData) => {
    dispatch(updateTenantStateRequest({
      tenantId: selectedTenant.id,
      ...stateData
    }));
  };

  const handleTrialModalSubmit = (trialData) => {
    dispatch(updateTrialStatusRequest({
      tenantId: selectedTenant.id,
      ...trialData
    }));
  };

  const handleSubscriptionModalSubmit = (subscriptionData) => {
    dispatch(cancelSubscriptionRequest({
      tenantId: selectedTenant.id,
      ...subscriptionData
    }));
  };

  return (
    <div className="min-h-full">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-4 sm:p-6 lg:p-8 text-white mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
              Tenant State Management
            </h1>
            <p className="text-blue-100 text-sm sm:text-base lg:text-lg">
              Manage tenant states, trials, and subscription access controls
            </p>
            <div className="flex items-center mt-3 sm:mt-4 text-xs sm:text-sm">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>State Management System Active</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block flex-shrink-0">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <i className="fas fa-cogs text-3xl lg:text-4xl text-white opacity-80"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-6">
          <div className="flex items-start justify-between space-x-3">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <i className="fas fa-exclamation-triangle text-red-400 mt-0.5 flex-shrink-0"></i>
              <div className="min-w-0">
                <h3 className="text-red-800 font-medium text-sm sm:text-base">
                  Error
                </h3>
                <p className="text-red-700 text-sm break-words">{error}</p>
              </div>
            </div>
            <button
              onClick={() => dispatch(clearError())}
              className="text-red-400 hover:text-red-600 text-xl font-bold flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-green-600 text-xl"></i>
              </div>
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 truncate">
                Active Tenants
              </p>
              <p className="text-2xl font-bold text-green-600">
                {summary?.activeTenants || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-clock text-yellow-600 text-xl"></i>
              </div>
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 truncate">On Trial</p>
              <p className="text-2xl font-bold text-yellow-600">
                {summary?.trialTenants || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-ban text-red-600 text-xl"></i>
              </div>
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 truncate">
                Deactivated
              </p>
              <p className="text-2xl font-bold text-red-600">
                {summary?.deactivatedTenants || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-exclamation-circle text-orange-600 text-xl"></i>
              </div>
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 truncate">
                Cancelled
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {summary?.cancelledTenants || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="p-4 sm:p-6 mb-6">
        <div className="space-y-6">
          {/* Filter Section */}
          <div>
            <TenantStateFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>
          
          {/* Actions Section */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
            <Button
              onClick={handleRefresh}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 text-sm"
              disabled={isLoading}
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Tenant State Table */}
      <Card className="overflow-hidden">
        <TenantStateTable
          tenantStates={tenantStates}
          isLoading={isLoading}
          onChangeState={handleChangeState}
          onManageTrial={handleManageTrial}
          onManageSubscription={handleManageSubscription}
          onDeactivate={handleDeactivateTenant}
          onQuickAction={handleQuickAction}
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </Card>

      {/* State Management Modal */}
      {isStateModalOpen && (
        <TenantStateModal
          isOpen={isStateModalOpen}
          onClose={() => {
            setIsStateModalOpen(false);
            setSelectedTenant(null);
          }}
          onSubmit={handleStateModalSubmit}
          tenant={selectedTenant}
          isLoading={isLoading}
        />
      )}

      {/* Trial Management Modal */}
      {isTrialModalOpen && (
        <TenantTrialModal
          isOpen={isTrialModalOpen}
          onClose={() => {
            setIsTrialModalOpen(false);
            setSelectedTenant(null);
          }}
          onSubmit={handleTrialModalSubmit}
          tenant={selectedTenant}
          isLoading={isLoading}
        />
      )}

      {/* Subscription Management Modal */}
      {isSubscriptionModalOpen && (
        <TenantSubscriptionModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => {
            setIsSubscriptionModalOpen(false);
            setSelectedTenant(null);
          }}
          onSubmit={handleSubscriptionModalSubmit}
          tenant={selectedTenant}
          isLoading={isLoading}
        />
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && confirmAction && (
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false);
            setSelectedTenant(null);
            setConfirmAction(null);
          }}
          onConfirm={executeConfirmAction}
          title={confirmAction.title}
          message={confirmAction.message}
          confirmText={confirmAction.confirmText}
          confirmButtonClass={confirmAction.confirmClass}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default TenantStateManagement;
