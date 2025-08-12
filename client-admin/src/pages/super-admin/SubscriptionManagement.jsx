import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import PlanCard from '../../components/super-admin/PlanCard';
import PlanModal from '../../components/super-admin/PlanModal';
import TenantPlanAssignment from '../../components/super-admin/TenantPlanAssignment';
import Button from '../../components/ui/Button';
import {
  fetchPlansRequest,
  deletePlanRequest,
  setSelectedPlan,
  setModalOpen,
  clearErrors
} from '../../store/super-admin/subscriptionSlice';

const SubscriptionManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    plans,
    selectedPlan,
    isModalOpen,
    isLoading,
    error,
    user
  } = useSelector(state => ({
    plans: state.subscription.plans,
    selectedPlan: state.subscription.selectedPlan,
    isModalOpen: state.subscription.isModalOpen,
    isLoading: state.subscription.isLoading,
    error: state.subscription.error,
    user: state.auth.user
  }));

  const [activeTab, setActiveTab] = useState('plans');

  useEffect(() => {
    // Check if user is authenticated and has super-admin role
    if (!user || user.role !== 'super-admin') {
      navigate('/super-admin/login');
      return;
    }

    // Fetch plans
    dispatch(fetchPlansRequest());
  }, [dispatch, navigate, user]);

  const handleCreatePlan = () => {
    dispatch(setSelectedPlan(null));
    dispatch(setModalOpen(true));
  };

  const handleEditPlan = (plan) => {
    dispatch(setSelectedPlan(plan));
    dispatch(setModalOpen(true));
  };

  const handleDeletePlan = (planId) => {
    if (window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      dispatch(deletePlanRequest(planId));
    }
  };

  const handleCloseModal = () => {
    dispatch(setModalOpen(false));
    dispatch(setSelectedPlan(null));
  };

  if (!user || user.role !== 'super-admin') {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-4 sm:p-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Subscription Management</h1>
              <p className="text-purple-100 text-sm sm:text-lg">
                Define and manage subscription plans for your tenants
              </p>
              <div className="flex items-center mt-4 space-x-2 text-xs sm:text-sm">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>System Active</span>
              </div>
            </div>
            <div className="hidden lg:block flex-shrink-0">
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <i className="fas fa-credit-card text-4xl text-white opacity-80"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex items-start justify-between space-x-3">
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <i className="fas fa-exclamation-triangle text-red-400 mt-0.5 flex-shrink-0"></i>
                <div className="min-w-0">
                  <h3 className="text-red-800 font-medium">Error</h3>
                  <p className="text-red-700 text-sm break-words">{error}</p>
                </div>
              </div>
              <button
                onClick={() => dispatch(clearErrors())}
                className="text-red-400 hover:text-red-600 text-xl font-bold flex-shrink-0"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('plans')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'plans'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-layer-group mr-2"></i>
              Subscription Plans
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assignments'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-users mr-2"></i>
              Tenant Assignments
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Subscription Plans</h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Create and manage subscription plans with different feature sets
                </p>
              </div>
              <Button
                onClick={handleCreatePlan}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-3 text-sm sm:text-base"
              >
                <i className="fas fa-plus mr-2"></i>
                Create New Plan
              </Button>
            </div>

            {/* Plans Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-16 mb-4"></div>
                    <div className="space-y-2 mb-6">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-8 bg-gray-200 rounded flex-1"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : plans && plans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onEdit={handleEditPlan}
                    onDelete={handleDeletePlan}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="max-w-md mx-auto px-4">
                  <i className="fas fa-layer-group text-4xl sm:text-6xl text-gray-300 mb-4 sm:mb-6"></i>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Plans Created</h3>
                  <p className="text-gray-500 text-sm sm:text-base mb-4 sm:mb-6">
                    Create your first subscription plan to get started with tenant management
                  </p>
                  <Button
                    onClick={handleCreatePlan}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-3 text-sm sm:text-base"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Create First Plan
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Tenant Plan Assignments</h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Assign subscription plans to tenants and manage their access levels
              </p>
            </div>
            <TenantPlanAssignment />
          </div>
        )}

        {/* Plan Modal */}
        {isModalOpen && (
          <PlanModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            plan={selectedPlan}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default SubscriptionManagement;