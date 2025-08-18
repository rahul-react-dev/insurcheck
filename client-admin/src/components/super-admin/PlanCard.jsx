import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { showEditPlanModal, deletePlanRequest } from '../../store/super-admin/subscriptionSlice';
import { useDispatch, useSelector } from 'react-redux';

const PlanCard = ({ plan }) => {
  const dispatch = useDispatch();
  const { isLoading, deletingPlanId } = useSelector(state => state.subscription);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEdit = () => {
    dispatch(showEditPlanModal(plan));
  };

  const handleDelete = () => {
    if (plan.tenantCount > 0) {
      if (window.showNotification) {
        window.showNotification('Cannot delete plan that is currently assigned to tenants.', 'error');
      } else {
        alert('Cannot delete plan that is currently assigned to tenants.');
      }
      return;
    }
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    dispatch(deletePlanRequest(plan.id));
    setShowDeleteModal(false);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const isDeleting = deletingPlanId === plan.id;

  const formatFeatureValue = (value) => {
    if (typeof value === 'string' && value.toLowerCase() === 'unlimited') {
      return (
        <span className="text-green-600 font-semibold flex items-center">
          <i className="fas fa-infinity mr-1"></i>
          Unlimited
        </span>
      );
    }
    return value;
  };

  const getPlanColor = (planId) => {
    if (!planId || typeof planId !== 'string') return 'gray';
    if (planId.includes('BASIC')) return 'blue';
    if (planId.includes('PRO')) return 'purple';
    if (planId.includes('ENT')) return 'gold';
    return 'gray';
  };

  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    purple: 'border-purple-200 bg-purple-50',
    gold: 'border-yellow-200 bg-yellow-50',
    gray: 'border-gray-200 bg-gray-50'
  };

  const color = getPlanColor(plan.planId);

  return (
    <Card className={`p-6 hover:shadow-lg transition-all duration-200 ${colorClasses[color]} border-2 flex flex-col h-full`}>
      <div className="flex items-start justify-between mb-4 flex-shrink-0">
        <div className="flex-1 mr-3">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-xl font-bold text-gray-900 truncate">{plan.name}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              plan.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {plan.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">ID: {plan.id}</p>
          <p className="text-gray-700 leading-relaxed line-clamp-2">
            {plan.description}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-3xl font-bold text-gray-900">
            ${plan.price}
          </div>
          <div className="text-sm text-gray-500">
            /{plan.billingCycle.toLowerCase()}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mb-4 flex-1">
        <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Features & Limits</h4>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Max Users:</span>
            <span className="font-medium">{formatFeatureValue(plan.maxUsers)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Storage Limit:</span>
            <span className="font-medium">{plan.storageLimit}GB</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">API Access:</span>
            <span className="font-medium text-blue-600">
              {plan.features?.api_access ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Analytics:</span>
            <span className="font-medium text-blue-600">
              {plan.features?.advanced_analytics ? 'Advanced' : 'Basic'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Support:</span>
            <span className="font-medium text-blue-600">
              {plan.features?.user_support === 'dedicated' ? 'Dedicated' : 
               plan.features?.user_support === 'phone+email' ? 'Phone + Email' : 'Email'}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <i className="fas fa-users mr-2"></i>
            {plan.tenantCount} tenant{plan.tenantCount !== 1 ? 's' : ''}
          </div>
          <div className="text-sm text-gray-500">
            Created {new Date(plan.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="flex space-x-3 mt-auto flex-shrink-0">
        <Button
          onClick={handleEdit}
          disabled={isLoading || isDeleting}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 text-sm font-medium disabled:opacity-50"
        >
          <i className="fas fa-edit mr-2"></i>
          <span>Edit Plan</span>
        </Button>
        <Button
          onClick={handleDelete}
          disabled={plan.tenantCount > 0 || isLoading || isDeleting}
          className={`flex-1 py-2 text-sm font-medium ${
            plan.tenantCount > 0 || isLoading || isDeleting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isDeleting ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              <span>Deleting...</span>
            </>
          ) : (
            <>
              <i className="fas fa-trash mr-2"></i>
              <span>Delete</span>
            </>
          )}
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-red-600"></i>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Delete Subscription Plan</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete the subscription plan <strong>"{plan.name}"</strong>?
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Deleting...
                  </>
                ) : (
                  'Delete Plan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PlanCard;