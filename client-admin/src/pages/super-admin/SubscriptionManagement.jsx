
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import PlanCard from '../../components/super-admin/PlanCard';
import PlanModal from '../../components/super-admin/PlanModal';
import TenantPlanAssignment from '../../components/super-admin/TenantPlanAssignment';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import {
  fetchPlansRequest,
  fetchTenantsRequest,
  showCreatePlanModal,
  setFilters,
  clearErrors
} from '../../store/super-admin/subscriptionSlice';

const SubscriptionManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    plans,
    tenants,
    isLoadingPlans,
    isLoadingTenants,
    plansError,
    tenantsError,
    filters
  } = useSelector(state => state.subscription);

  const { user } = useSelector(state => state.auth);

  const [activeTab, setActiveTab] = useState('plans');
  const [showSuccessMessage, setShowSuccessMessage] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'super-admin') {
      navigate('/super-admin/login');
      return;
    }

    dispatch(fetchPlansRequest());
    dispatch(fetchTenantsRequest());
  }, [dispatch, navigate, user]);

  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  const handleCreatePlan = () => {
    dispatch(showCreatePlanModal());
  };

  const handleSearchChange = (value) => {
    dispatch(setFilters({ searchTerm: value }));
  };

  const handleStatusFilter = (status) => {
    dispatch(setFilters({ status }));
  };

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         plan.planId.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || 
                         (filters.status === 'active' && plan.isActive) ||
                         (filters.status === 'inactive' && !plan.isActive);

    return matchesSearch && matchesStatus;
  });

  const totalRevenue = plans.reduce((sum, plan) => sum + (plan.price * plan.tenantCount), 0);
  const totalTenants = tenants.length;
  const activePlans = plans.filter(plan => plan.isActive).length;

  if (!user || user.role !== 'super-admin') {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
              <p className="text-indigo-100 text-lg">
                Define, manage, and assign subscription plans for your tenants
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <i className="fas fa-credit-card text-4xl text-white opacity-80"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
            <div className="flex items-center">
              <i className="fas fa-check-circle text-green-400 mr-3"></i>
              <p className="text-green-700">{showSuccessMessage}</p>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {(plansError || tenantsError) && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle text-red-400 mr-3"></i>
                <div>
                  <h3 className="text-red-800 font-medium">Error</h3>
                  <p className="text-red-700 text-sm">{plansError || tenantsError}</p>
                </div>
              </div>
              <button
                onClick={() => dispatch(clearErrors())}
                className="text-red-400 hover:text-red-600 text-xl font-bold"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue (Monthly)</p>
                <p className="text-3xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-dollar-sign text-green-600 text-xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Plans</p>
                <p className="text-3xl font-bold text-blue-600">{activePlans}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-layer-group text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                <p className="text-3xl font-bold text-purple-600">{totalTenants}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-users text-purple-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('plans')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'plans'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-layer-group mr-2"></i>
                Subscription Plans ({plans.length})
              </button>
              <button
                onClick={() => setActiveTab('assignments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'assignments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-users mr-2"></i>
                Tenant Assignments ({tenants.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'plans' && (
              <div className="space-y-6">
                {/* Plans Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="flex-1 max-w-md">
                      <Input
                        placeholder="Search plans..."
                        value={filters.searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleStatusFilter('all')}
                        className={`px-4 py-2 text-sm ${
                          filters.status === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        All Plans
                      </Button>
                      <Button
                        onClick={() => handleStatusFilter('active')}
                        className={`px-4 py-2 text-sm ${
                          filters.status === 'active'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Active
                      </Button>
                      <Button
                        onClick={() => handleStatusFilter('inactive')}
                        className={`px-4 py-2 text-sm ${
                          filters.status === 'inactive'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Inactive
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={handleCreatePlan}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Create New Plan
                  </Button>
                </div>

                {/* Plans Grid */}
                {isLoadingPlans ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredPlans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPlans.map(plan => (
                      <PlanCard key={plan.id} plan={plan} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="max-w-md mx-auto">
                      <i className="fas fa-credit-card text-6xl text-gray-300 mb-6"></i>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Plans Found</h3>
                      <p className="text-gray-500 text-base mb-6">
                        {filters.searchTerm || filters.status !== 'all'
                          ? 'No plans match your current filters.'
                          : 'Create your first subscription plan to get started.'
                        }
                      </p>
                      {!filters.searchTerm && filters.status === 'all' && (
                        <Button
                          onClick={handleCreatePlan}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                        >
                          <i className="fas fa-plus mr-2"></i>
                          Create First Plan
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'assignments' && (
              <TenantPlanAssignment />
            )}
          </div>
        </div>

        {/* Plan Modal */}
        <PlanModal />
      </div>
    </AdminLayout>
  );
};

export default SubscriptionManagement;
