
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import TenantTable from "../../components/super-admin/TenantTable";
import TenantModal from "../../components/super-admin/TenantModal";
import TenantFilters from "../../components/super-admin/TenantFilters";
import ConfirmModal from "../../components/ui/ConfirmModal";
import {
  fetchTenantsRequest,
  fetchSubscriptionPlansRequest,
  createTenantRequest,
  updateTenantRequest,
  suspendTenantRequest,
  deleteTenantRequest,
  clearError,
} from "../../store/super-admin/tenantSlice";

const TenantManagement = () => {
  const dispatch = useDispatch();
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState(null);
  const [modalMode, setModalMode] = useState("create"); // create, edit
  const [filters, setFilters] = useState({
    tenantName: "",
    status: "",
    subscriptionPlan: "",
    dateRange: {
      start: "",
      end: "",
    },
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const {
    tenants,
    subscriptionPlans,
    isLoading,
    error,
    totalTenants,
    statusCounts,
    pagination: storePagination,
  } = useSelector((state) => state.tenant);

  // Sync pagination with store
  useEffect(() => {
    if (storePagination) {
      setPagination(prev => ({
        ...prev,
        ...storePagination
      }));
    }
  }, [storePagination]);

  // Fetch initial data when component mounts
  useEffect(() => {
    console.log('🚀 TenantManagement: Component mounted, dispatching fetchTenantsRequest');
    
    const fetchParams = {
      page: 1,
      limit: 10,
      ...filters,
    };
    
    dispatch(fetchTenantsRequest(fetchParams));
    dispatch(fetchSubscriptionPlansRequest());
  }, [dispatch]);

  const handleCreateTenant = () => {
    setModalMode("create");
    setSelectedTenant(null);
    setIsModalOpen(true);
  };

  const handleEditTenant = (tenant) => {
    setModalMode("edit");
    setSelectedTenant(tenant);
    setIsModalOpen(true);
  };

  const handleSuspendTenant = (tenantId, currentStatus) => {
    const action = currentStatus === "active" ? "suspend" : "reactivate";
    if (window.confirm(`Are you sure you want to ${action} this tenant?`)) {
      dispatch(suspendTenantRequest({ tenantId, suspend: currentStatus === "active" }));
    }
  };

  const handleDeleteTenant = (tenant) => {
    setTenantToDelete(tenant);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteTenant = () => {
    if (tenantToDelete) {
      dispatch(deleteTenantRequest(tenantToDelete.id));
      setIsDeleteModalOpen(false);
      setTenantToDelete(null);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Reset to first page when filters change
    setPagination((prev) => ({ ...prev, page: 1 }));
    // Trigger immediate fetch with new filters
    dispatch(
      fetchTenantsRequest({ ...newFilters, page: 1, limit: pagination.limit }),
    );
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    // Trigger immediate fetch with new page
    dispatch(
      fetchTenantsRequest({
        ...filters,
        page: newPage,
        limit: pagination.limit,
      }),
    );
  };

  const handlePageSizeChange = (newLimit) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
    // Trigger immediate fetch with new page size
    dispatch(fetchTenantsRequest({ ...filters, page: 1, limit: newLimit }));
  };

  const handleRefresh = () => {
    dispatch(fetchTenantsRequest({ ...filters, ...pagination }));
    dispatch(fetchSubscriptionPlansRequest());
  };

  const handleModalSubmit = (tenantData) => {
    if (modalMode === "create") {
      dispatch(createTenantRequest(tenantData));
    } else {
      dispatch(updateTenantRequest({ id: selectedTenant.id, ...tenantData }));
    }
  };

  return (
    <div className="min-h-full">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl p-4 sm:p-6 lg:p-8 text-white mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
              Tenant Management
            </h1>
            <p className="text-purple-100 text-sm sm:text-base lg:text-lg">
              Manage tenant accounts, subscriptions, and access controls
            </p>
            <div className="flex items-center mt-3 sm:mt-4 text-xs sm:text-sm">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span>Tenant System Online</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block flex-shrink-0">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <i className="fas fa-building text-3xl lg:text-4xl text-white opacity-80"></i>
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
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-building text-blue-600 text-xl"></i>
              </div>
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 truncate">
                Total Tenants
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalTenants || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-green-600 text-xl"></i>
              </div>
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 truncate">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {statusCounts?.active || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-pause-circle text-red-600 text-xl"></i>
              </div>
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 truncate">
                Suspended
              </p>
              <p className="text-2xl font-bold text-red-600">
                {statusCounts?.suspended || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-yellow-600 text-xl"></i>
              </div>
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 truncate">
                Unverified
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {statusCounts?.unverified || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="p-4 sm:p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1">
            <TenantFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              subscriptionPlans={subscriptionPlans}
            />
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Button
              onClick={handleRefresh}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 text-sm"
              disabled={isLoading}
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Refresh
            </Button>
            <Button
              onClick={handleCreateTenant}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm"
            >
              <i className="fas fa-plus mr-2"></i>
              Create Tenant
            </Button>
          </div>
        </div>
      </Card>

      {/* Tenant Table */}
      <Card className="overflow-hidden">
        <TenantTable
          tenants={tenants}
          isLoading={isLoading}
          onEditTenant={handleEditTenant}
          onSuspendTenant={handleSuspendTenant}
          onDeleteTenant={handleDeleteTenant}
          pagination={pagination}
          totalTenants={totalTenants}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </Card>

      {/* Tenant Modal */}
      {isModalOpen && (
        <TenantModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTenant(null);
          }}
          onSubmit={handleModalSubmit}
          tenant={selectedTenant}
          mode={modalMode}
          subscriptionPlans={subscriptionPlans}
          isLoading={isLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && tenantToDelete && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setTenantToDelete(null);
          }}
          onConfirm={confirmDeleteTenant}
          title="Delete Tenant"
          message={
            <div>
              <p className="mb-4">
                Are you sure you want to delete <strong>{tenantToDelete.tenantName}</strong>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <i className="fas fa-exclamation-triangle text-red-500 mt-0.5 flex-shrink-0"></i>
                  <div>
                    <h4 className="text-red-800 font-medium mb-2">Warning: This action cannot be undone</h4>
                    <ul className="text-red-700 text-sm space-y-1">
                      <li>• All tenant users will be permanently deleted</li>
                      <li>• All tenant documents will be removed</li>
                      <li>• All tenant logs will be deleted</li>
                      <li>• Billing and subscription data will be archived</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          }
          confirmText="Delete Tenant"
          confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default TenantManagement;
