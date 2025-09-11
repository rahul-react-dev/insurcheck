import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, ArrowRight, X, Clock, Users, HardDrive } from 'lucide-react';
import Button from './Button';
import Card from './Card';

/**
 * Upgrade prompt component for trial expiration or subscription renewal
 */
const UpgradePrompt = ({ 
  isOpen,
  onClose,
  onUpgrade,
  trialEndDate,
  currentPlan = 'trial',
  availablePlans = [],
  isLoading = false
}) => {
  const [selectedPlan, setSelectedPlan] = useState(availablePlans[0]?.id);

  if (!isOpen) return null;

  const defaultPlans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: '$29',
      billing: 'per month',
      features: [
        'Up to 5 users',
        '1GB document storage',
        'Basic document management',
        'Email support',
        'Standard compliance tools'
      ],
      maxUsers: 5,
      storage: '1GB',
      recommended: false
    },
    {
      id: 'professional',
      name: 'Professional Plan',
      price: '$79',
      billing: 'per month',
      features: [
        'Up to 25 users',
        '10GB document storage',
        'Advanced document management',
        'Priority support',
        'Advanced compliance analytics',
        'Custom integrations'
      ],
      maxUsers: 25,
      storage: '10GB',
      recommended: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: '$199',
      billing: 'per month',
      features: [
        'Unlimited users',
        '100GB document storage',
        'Full feature access',
        '24/7 dedicated support',
        'Custom compliance rules',
        'API access',
        'Advanced reporting'
      ],
      maxUsers: 'Unlimited',
      storage: '100GB',
      recommended: false
    }
  ];

  const plans = availablePlans.length > 0 ? availablePlans : defaultPlans;

  const handleUpgrade = () => {
    const plan = plans.find(p => p.id === selectedPlan);
    onUpgrade(plan);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      data-testid="upgrade-prompt-modal"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="p-0 bg-white shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900" data-testid="text-upgrade-title">
                    Upgrade Your Plan
                  </h2>
                  <p className="text-gray-600">
                    {trialEndDate 
                      ? `Your trial ended on ${new Date(trialEndDate).toLocaleDateString()}`
                      : 'Choose a plan that fits your needs'
                    }
                  </p>
                </div>
              </div>
              <Button
                onClick={onClose}
                variant="secondary"
                size="sm"
                className="p-2"
                data-testid="button-close-upgrade"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Plans */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <motion.div
                  key={plan.id}
                  whileHover={{ scale: 1.02 }}
                  className={`relative rounded-xl border-2 transition-all cursor-pointer ${
                    selectedPlan === plan.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${plan.recommended ? 'ring-2 ring-blue-600 ring-opacity-20' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                  data-testid={`plan-card-${plan.id}`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Recommended
                      </span>
                    </div>
                  )}
                  
                  <div className="p-6">
                    {/* Plan Header */}
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900" data-testid={`text-plan-name-${plan.id}`}>
                        {plan.name}
                      </h3>
                      <div className="mt-2">
                        <span className="text-3xl font-bold text-gray-900" data-testid={`text-plan-price-${plan.id}`}>
                          {plan.price}
                        </span>
                        <span className="text-gray-600 ml-1">{plan.billing}</span>
                      </div>
                    </div>

                    {/* Plan Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{plan.maxUsers} users</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{plan.storage}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
              <Button
                onClick={handleUpgrade}
                variant="primary"
                size="lg"
                disabled={!selectedPlan || isLoading}
                loading={isLoading}
                className="w-full sm:w-auto flex items-center justify-center gap-2"
                data-testid="button-confirm-upgrade"
              >
                {isLoading ? 'Processing...' : 'Upgrade Now'}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </Button>
              <Button
                onClick={onClose}
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
                data-testid="button-cancel-upgrade"
              >
                Maybe Later
              </Button>
            </div>

            {/* Trial urgency message */}
            {trialEndDate && (
              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 text-orange-800">
                  <Clock className="w-5 h-5" />
                  <p className="font-medium">Action Required</p>
                </div>
                <p className="text-sm text-orange-700 mt-1">
                  Your trial has expired and access is limited. Upgrade now to restore full functionality.
                </p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default UpgradePrompt;