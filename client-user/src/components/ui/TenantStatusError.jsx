import React from 'react';
import { AlertCircle, Lock, Clock, CreditCard, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from './Button';
import Card from './Card';

/**
 * Component to display tenant status errors with appropriate messaging and actions
 */
const TenantStatusError = ({ 
  code, 
  message, 
  tenantStatus, 
  trialEndDate, 
  onUpgrade, 
  onContactSupport,
  onRetry 
}) => {
  const getErrorConfig = () => {
    switch (code) {
      case 'TENANT_DEACTIVATED':
        return {
          icon: Lock,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Account Inactive',
          description: message || 'Your account is inactive. Please contact your administrator.',
          actions: (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={onContactSupport}
                variant="primary"
                className="w-full sm:w-auto"
                data-testid="button-contact-support"
              >
                Contact Administrator
              </Button>
              <Button
                onClick={onRetry}
                variant="secondary"
                className="w-full sm:w-auto"
                data-testid="button-retry-login"
              >
                Try Again
              </Button>
            </div>
          )
        };
      
      case 'TRIAL_EXPIRED':
        return {
          icon: Clock,
          iconColor: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          title: 'Trial Period Ended',
          description: message || 'Your trial period has ended. Please upgrade to continue.',
          actions: (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={onUpgrade}
                variant="primary"
                className="w-full sm:w-auto flex items-center justify-center gap-2"
                data-testid="button-upgrade-subscription"
              >
                Upgrade Now
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                onClick={onContactSupport}
                variant="secondary"
                className="w-full sm:w-auto"
                data-testid="button-contact-support"
              >
                Contact Support
              </Button>
            </div>
          )
        };
      
      case 'SUBSCRIPTION_CANCELLED':
        return {
          icon: CreditCard,
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          title: 'Subscription Inactive',
          description: message || 'Your subscription is inactive. Please renew to regain full access.',
          actions: (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={onUpgrade}
                variant="primary"
                className="w-full sm:w-auto flex items-center justify-center gap-2"
                data-testid="button-renew-subscription"
              >
                Renew Subscription
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                onClick={onContactSupport}
                variant="secondary"
                className="w-full sm:w-auto"
                data-testid="button-contact-support"
              >
                Contact Support
              </Button>
            </div>
          )
        };
      
      default:
        return {
          icon: AlertCircle,
          iconColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: 'Access Error',
          description: message || 'There was an issue with your account access.',
          actions: (
            <Button
              onClick={onRetry}
              variant="primary"
              className="w-full sm:w-auto"
              data-testid="button-retry"
            >
              Try Again
            </Button>
          )
        };
    }
  };

  const config = getErrorConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className={`p-6 ${config.bgColor} ${config.borderColor} border-2`}>
        <div className="text-center">
          {/* Icon */}
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-white mb-4`}>
            <Icon className={`w-8 h-8 ${config.iconColor}`} />
          </div>
          
          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2" data-testid="text-error-title">
            {config.title}
          </h2>
          
          {/* Description */}
          <p className="text-gray-600 mb-6" data-testid="text-error-description">
            {config.description}
          </p>

          {/* Trial end date if available */}
          {trialEndDate && (
            <div className="bg-white/70 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-700">
                Trial ended on: <span className="font-medium">{new Date(trialEndDate).toLocaleDateString()}</span>
              </p>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="space-y-3">
            {config.actions}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default TenantStatusError;