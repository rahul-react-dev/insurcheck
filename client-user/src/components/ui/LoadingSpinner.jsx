import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const LoadingSpinner = ({ 
  size = 'default', 
  className = '', 
  text = null,
  variant = 'default' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const variantClasses = {
    default: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-400',
    primary: 'text-blue-600'
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center space-y-2"
      >
        <Loader2 
          className={cn(
            'animate-spin',
            sizeClasses[size],
            variantClasses[variant]
          )} 
        />
        {text && (
          <p className={cn(
            'text-sm',
            variantClasses[variant]
          )}>
            {text}
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;