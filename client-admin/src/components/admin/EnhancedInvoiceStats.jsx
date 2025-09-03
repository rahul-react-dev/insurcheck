import React from 'react';
import { 
  DollarSignIcon, 
  TrendingUpIcon, 
  AlertTriangleIcon, 
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon
} from 'lucide-react';

// Skeleton component for stats loading
const StatsCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
          <div className="h-8 bg-gray-200 rounded animate-pulse w-32"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
};

const EnhancedInvoiceStats = ({ stats = {}, isLoading = false }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  // Payment history focused stats - only showing subscription payment information
  const statsCards = [
    {
      title: 'Total Payments',
      value: formatNumber(stats.totalPaid || stats.paid || 0),
      amount: formatCurrency(stats.totalPaidAmount || stats.paidAmount || 0),
      icon: CheckCircleIcon,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-200'
    },
    {
      title: 'Payment History',
      value: `${stats.paymentYears || 0} Years`,
      amount: `${stats.paymentMonths || 0} Months`,
      icon: TrendingUpIcon,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      title: 'First Payment',
      value: stats.firstPaymentDate ? new Date(stats.firstPaymentDate).getFullYear() : 'N/A',
      amount: stats.firstPaymentDate ? new Date(stats.firstPaymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-',
      icon: CreditCardIcon,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Latest Payment',
      value: stats.lastPaymentDate ? new Date(stats.lastPaymentDate).getFullYear() : 'N/A',
      amount: stats.lastPaymentDate ? new Date(stats.lastPaymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-',
      icon: DollarSignIcon,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      borderColor: 'border-indigo-200'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((card, index) => {
        const Icon = card.icon;
        const isPaymentCard = card.title.includes('Payment');
        
        return (
          <div
            key={index}
            className={`bg-white rounded-xl shadow-sm border ${card.borderColor} p-6 hover:shadow-md transition-all duration-200 hover:scale-[1.02] group`}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
                  {card.title}
                </p>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">
                    {card.value}
                  </p>
                  <p className={`text-sm font-semibold ${card.iconColor}`}>
                    {card.amount}
                  </p>
                </div>
                
                {/* Payment timeline indicator - only for payment cards */}
                {isPaymentCard && stats.totalPaid > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Subscription History</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500 bg-emerald-500"
                        style={{ width: '100%' }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className={`${card.bgColor} p-3 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>

            {/* Payment status indicator */}
            <div className="mt-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                {card.title.includes('Total Payments') && (
                  <>
                    <CheckCircleIcon className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-600 font-medium">Completed</span>
                  </>
                )}
                {card.title.includes('Payment History') && (
                  <>
                    <TrendingUpIcon className="w-3 h-3 text-blue-500" />
                    <span className="text-blue-600 font-medium">Active Subscription</span>
                  </>
                )}
                {card.title.includes('First Payment') && (
                  <>
                    <CreditCardIcon className="w-3 h-3 text-purple-500" />
                    <span className="text-purple-600 font-medium">Start Date</span>
                  </>
                )}
                {card.title.includes('Latest Payment') && (
                  <>
                    <DollarSignIcon className="w-3 h-3 text-indigo-500" />
                    <span className="text-indigo-600 font-medium">Recent</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EnhancedInvoiceStats;