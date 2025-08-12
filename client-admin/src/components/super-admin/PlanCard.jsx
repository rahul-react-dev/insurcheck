import React from 'react';
import Button from '../ui/Button';

const PlanCard = ({ plan, onEdit, onDelete }) => {
  const formatFeatures = (features) => {
    if (typeof features === 'string') {
      try {
        return JSON.parse(features);
      } catch {
        return features.split(',').map(f => f.trim());
      }
    }
    return features || [];
  };

  const featuresList = formatFeatures(plan.features);

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 truncate">
              {plan.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider font-medium">
              ID: {plan.id}
            </p>
          </div>
          <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
            plan.status === 'Active'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {plan.status || 'Active'}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            ${plan.price}
          </span>
          <span className="text-sm sm:text-base text-gray-500 font-medium">
            /{plan.billingCycle?.toLowerCase() || 'monthly'}
          </span>
        </div>
      </div>

      {/* Features */}
      <div className="p-4 sm:p-5 lg:p-6 flex-1">
        <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">
          Features & Limits
        </h4>
        <ul className="space-y-2 sm:space-y-3">
          {featuresList.length > 0 ? (
            featuresList.slice(0, 5).map((feature, index) => (
              <li key={index} className="flex items-start space-x-2">
                <i className="fas fa-check-circle text-green-500 text-xs sm:text-sm mt-0.5 flex-shrink-0"></i>
                <span className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {typeof feature === 'string' ? feature : JSON.stringify(feature)}
                </span>
              </li>
            ))
          ) : (
            <li className="flex items-start space-x-2">
              <i className="fas fa-info-circle text-blue-500 text-xs sm:text-sm mt-0.5 flex-shrink-0"></i>
              <span className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                No features defined
              </span>
            </li>
          )}
          {featuresList.length > 5 && (
            <li className="text-xs sm:text-sm text-gray-500 font-medium">
              +{featuresList.length - 5} more features
            </li>
          )}
        </ul>
      </div>

      {/* Actions */}
      <div className="p-4 sm:p-5 lg:p-6 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            onClick={() => onEdit(plan)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium"
          >
            <i className="fas fa-edit mr-1 sm:mr-2"></i>
            Edit Plan
          </Button>
          <Button
            onClick={() => onDelete(plan.id)}
            className="flex-1 sm:flex-initial bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium"
          >
            <i className="fas fa-trash-alt mr-1 sm:mr-2"></i>
            <span className="hidden sm:inline">Delete</span>
            <span className="sm:hidden">Del</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlanCard;