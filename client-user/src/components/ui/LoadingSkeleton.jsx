import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const Skeleton = ({ className, animated = true, ...props }) => {
  const Component = animated ? motion.div : 'div';
  const motionProps = animated ? {
    animate: {
      opacity: [0.4, 0.8, 0.4],
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {};

  return (
    <Component
      className={cn(
        'bg-gray-200 rounded-md',
        className
      )}
      {...motionProps}
      {...props}
    />
  );
};

const CardSkeleton = () => {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  );
};

const ButtonSkeleton = ({ size = 'md' }) => {
  const sizes = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-28',
    xl: 'h-14 w-32',
  };

  return <Skeleton className={cn('rounded-lg', sizes[size])} />;
};

const TextSkeleton = ({ lines = 3, className }) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            'h-4',
            index === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
};

export { Skeleton, CardSkeleton, ButtonSkeleton, TextSkeleton };
export default Skeleton;