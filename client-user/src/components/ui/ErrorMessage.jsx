import { motion } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const ErrorMessage = ({ 
  error, 
  onDismiss = null, 
  className = '',
  variant = 'default'
}) => {
  if (!error) return null;

  const variantClasses = {
    default: 'bg-red-50 border-red-200 text-red-700',
    subtle: 'bg-red-50/50 border-red-100 text-red-600',
    inline: 'bg-transparent border-0 text-red-600 p-0'
  };

  const iconVariants = {
    default: 'text-red-500',
    subtle: 'text-red-400',
    inline: 'text-red-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'border rounded-lg p-3 flex items-start space-x-2',
        variantClasses[variant],
        className
      )}
      data-testid="error-message"
    >
      <AlertCircle className={cn('h-4 w-4 mt-0.5 flex-shrink-0', iconVariants[variant])} />
      <div className="flex-1">
        <p className="text-sm">{error}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={cn(
            'p-1 hover:bg-red-100 rounded-md transition-colors',
            iconVariants[variant]
          )}
          data-testid="dismiss-error"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </motion.div>
  );
};

export default ErrorMessage;