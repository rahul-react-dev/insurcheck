
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
  showCreatePlanModal,
  showEditPlanModal,
  hidePlanModal,
  clearErrors
} from '../../store/super-admin/subscriptionSlice';

const SubscriptionManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    plans,
    editingPlan,
    showPlanModal,
    isLoadingPlans,
    plansError,
    user
  } = useSelector(state => ({
    plans: state.subscription.plans,
    editingPlan: state.subscription.editingPlan,
    showPlanModal: state.subscription.showPlanModal,
    isLoadingPlans: state.subscription.isLoadingPlans,
    plansError: state.subscription.plansError,
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
    dispatch(showCreatePlanModal());
  };

  const handleEditPlan = (plan) => {
    dispatch(showEditPlanModal(plan));
  };

  const handleDeletePlan = (planId) => {
    if (window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      dispatch(deletePlanRequest(planId));
    }
  };

  const handleCloseModal = () => {
    dispatch(hidePlanModal());
  };

  if (!user || user.role !== 'super-admin') {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Header Section - Responsive */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 truncate">
                  Subscription Management
                </h1>
                <p className="text-purple-100 text-sm sm:text-base lg:text-lg leading-relaxed">
                  Define and manage subscription plans for your tenants
                </p>
                <div className="flex items-center mt-3 sm:mt-4 space-x-2 text-xs sm:text-sm">
                  <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></div>
                  <span>System Active</span>
                </div>
              </div>
              <div className="hidden lg:flex flex-shrink-0">
                <div className="bg-white bg-opacity-10 rounded-lg p-3 lg:p-4 xl:p-6">
                  <i className="fas fa-credit-card text-2xl lg:text-3xl xl:text-4xl text-white opacity-80"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Error Alert - Responsive */}
          {plansError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 sm:p-4 lg:p-5 rounded-lg shadow-sm">
              <div className="flex items-start justify-between space-x-3">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <i className="fas fa-exclamation-triangle text-red-400 mt-0.5 flex-shrink-0 text-sm sm:text-base"></i>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-red-800 font-medium text-sm sm:text-base">Error</h3>
                    <p className="text-red-700 text-xs sm:text-sm break-words mt-1">{plansError}</p>
                  </div>
                </div>
                <button
                  onClick={() => dispatch(clearErrors())}
                  className="text-red-400 hover:text-red-600 text-lg sm:text-xl font-bold flex-shrink-0 p-1"
                  aria-label="Close error"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Tabs Navigation - Responsive with scroll */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 sm:space-x-6 lg:space-x-8 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab('plans')}
                className={`whitespace-nowrap py-2 sm:py-3 px-1 border-b-2 font-medium text-xs sm:text-sm lg:text-base transition-colors duration-200 ${
                  activeTab === 'plans'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-layer-group mr-1 sm:mr-2"></i>
                <span className="hidden xs:inline">Subscription </span>Plans
              </button>
              <button
                onClick={() => setActiveTab('assignments')}
                className={`whitespace-nowrap py-2 sm:py-3 px-1 border-b-2 font-medium text-xs sm:text-sm lg:text-base transition-colors duration-200 ${
                  activeTab === 'assignments'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-users mr-1 sm:mr-2"></i>
                <span className="hidden xs:inline">Tenant </span>Assignments
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'plans' && (
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Action Bar - Responsive */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                    Subscription Plans
                  </h2>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">
                    Create and manage subscription plans with different feature sets
                  </p>
                </div>
                <Button
                  onClick={handleCreatePlan}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm lg:text-base flex-shrink-0 w-full sm:w-auto"
                >
                  <i className="fas fa-plus mr-1 sm:mr-2"></i>
                  <span className="hidden xs:inline">Create </span>New Plan
                </Button>
              </div>

              {/* Plans Grid - Responsive with better breakpoints */}
              {isLoadingPlans ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 animate-pulse">
                      <div className="h-4 sm:h-5 bg-gray-200 rounded w-20 sm:w-24 mb-3 sm:mb-4"></div>
                      <div className="h-6 sm:h-8 bg-gray-200 rounded w-12 sm:w-16 mb-3 sm:mb-4"></div>
                      <div className="space-y-2 mb-4 sm:mb-6">
                        <div className="h-3 sm:h-4 bg-gray-200 rounded"></div>
                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="flex space-x-2">
                        <div className="h-8 sm:h-9 bg-gray-200 rounded flex-1"></div>
                        <div className="h-8 sm:h-9 bg-gray-200 rounded w-12 sm:w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : plans && plans.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {plans.map((plan) => (
                    <div key={plan.id} className="transform transition-all duration-200 hover:scale-[1.02]">
                      <PlanCard
                        plan={plan}
                        onEdit={handleEditPlan}
                        onDelete={handleDeletePlan}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 lg:py-16 xl:py-20 bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm border border-gray-200">
                  <div className="max-w-sm sm:max-w-md lg:max-w-lg mx-auto px-4 sm:px-6">
                    <i className="fas fa-layer-group text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-gray-300 mb-3 sm:mb-4 lg:mb-6"></i>
                    <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
                      No Plans Created
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm lg:text-base mb-4 sm:mb-6 lg:mb-8 leading-relaxed">
                      Create your first subscription plan to get started with tenant management
                    </p>
                    <Button
                      onClick={handleCreatePlan}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 text-xs sm:text-sm lg:text-base w-full sm:w-auto"
                    >
                      <i className="fas fa-plus mr-1 sm:mr-2"></i>
                      Create First Plan
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="mb-4 sm:mb-6 lg:mb-8">
                <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Tenant Plan Assignments
                </h2>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">
                  Assign subscription plans to tenants and manage their access levels
                </p>
              </div>
              <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <TenantPlanAssignment />
              </div>
            </div>
          )}

          {/* Plan Modal */}
          {showPlanModal && (
            <PlanModal
              isOpen={showPlanModal}
              onClose={handleCloseModal}
              plan={editingPlan}
            />
          )}
        </div>
    </AdminLayout>
  );
};

export default SubscriptionManagement;
