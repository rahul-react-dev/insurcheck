import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

const Toast = ({ toast, onDismiss }) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = icons[toast.type] || Info;

  const variants = {
    success: 'bg-green-50 border-green-200 text-green-800 shadow-green-100',
    error: 'bg-red-50 border-red-200 text-red-800 shadow-red-100',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 shadow-yellow-100',
    info: 'bg-blue-50 border-blue-200 text-blue-800 shadow-blue-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={cn(
        'relative w-80 max-w-md p-4 rounded-lg border shadow-lg backdrop-blur-sm',
        variants[toast.type] || variants.info
      )}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="ml-3 flex-1 min-w-0">
          {toast.title && (
            <p className="text-sm font-semibold leading-tight">
              {toast.title}
            </p>
          )}
          {toast.description && (
            <p className="mt-1 text-sm opacity-90 leading-relaxed">
              {toast.description}
            </p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={() => onDismiss(toast.id)}
            className="inline-flex rounded-md p-1.5 hover:bg-black/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const Toaster = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-md">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              toast={toast}
              onDismiss={onDismiss}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;