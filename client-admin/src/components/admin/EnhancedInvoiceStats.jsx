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

  const statsCards = [
    {
      title: 'Total Invoices',
      value: formatNumber(stats.total || 0),
      amount: formatCurrency(stats.totalAmount || 0),
      icon: DollarSignIcon,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Paid Invoices',
      value: formatNumber(stats.paid || 0),
      amount: formatCurrency(stats.paidAmount || 0),
      icon: CheckCircleIcon,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-200'
    },
    {
      title: 'Unpaid Invoices',
      value: formatNumber(stats.unpaid || 0),
      amount: formatCurrency(stats.unpaidAmount || 0),
      icon: ClockIcon,
      color: 'amber',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-200'
    },
    {
      title: 'Overdue Invoices',
      value: formatNumber(stats.overdue || 0),
      amount: formatCurrency(stats.overdueAmount || 0),
      icon: AlertTriangleIcon,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200'
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
        const isPositive = card.title.includes('Paid');
        const isNegative = card.title.includes('Overdue');
        
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
                
                {/* Progress indicator */}
                {stats.total > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        {card.title.includes('Total') ? '100%' : 
                         `${Math.round(((card.value.replace(/,/g, '') / stats.total) * 100) || 0)}%`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          isPositive ? 'bg-emerald-500' :
                          isNegative ? 'bg-red-500' :
                          card.title.includes('Unpaid') ? 'bg-amber-500' :
                          'bg-blue-500'
                        }`}
                        style={{
                          width: card.title.includes('Total') ? '100%' : 
                                 `${Math.min(((card.value.replace(/,/g, '') / stats.total) * 100) || 0, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className={`${card.bgColor} p-3 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>

            {/* Trend indicator */}
            <div className="mt-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                {isPositive && (
                  <>
                    <TrendingUpIcon className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-600 font-medium">Good</span>
                  </>
                )}
                {isNegative && card.value.replace(/,/g, '') > 0 && (
                  <>
                    <AlertTriangleIcon className="w-3 h-3 text-red-500" />
                    <span className="text-red-600 font-medium">Attention needed</span>
                  </>
                )}
                {card.title.includes('Unpaid') && card.value.replace(/,/g, '') > 0 && (
                  <>
                    <ClockIcon className="w-3 h-3 text-amber-500" />
                    <span className="text-amber-600 font-medium">Pending</span>
                  </>
                )}
                {card.title.includes('Total') && (
                  <>
                    <CreditCardIcon className="w-3 h-3 text-blue-500" />
                    <span className="text-blue-600 font-medium">Overview</span>
                  </>
                )}
              </div>
              
              {card.title.includes('Overdue') && card.value.replace(/,/g, '') > 0 && (
                <span className="text-red-600 font-medium text-xs bg-red-50 px-2 py-1 rounded-full">
                  Urgent
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EnhancedInvoiceStats;