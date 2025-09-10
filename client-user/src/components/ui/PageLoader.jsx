import { motion } from 'framer-motion';
import { Shield, Loader2 } from 'lucide-react';

const PageLoader = ({ message = "Loading page..." }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-6">
        {/* Animated Logo */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Background Circle with Pulse */}
          <motion.div
            className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Main Logo Container */}
          <motion.div
            className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-2xl flex items-center justify-center"
            animate={{ 
              rotateY: [0, 360],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Shield className="w-12 h-12 text-white" />
          </motion.div>
          
          {/* Spinning Ring */}
          <motion.div
            className="absolute -inset-2 border-4 border-transparent border-t-blue-500 border-r-cyan-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </motion.div>

        {/* App Name */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            InsurCheck
          </h1>
          <p className="text-gray-600 text-sm font-medium">
            Professional Insurance Management Platform
          </p>
        </motion.div>

        {/* Loading Message with Dots Animation */}
        <motion.div
          className="flex items-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          <span className="text-gray-700 font-medium">{message}</span>
          <motion.div 
            className="flex space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          className="w-64 h-1 bg-gray-200 rounded-full overflow-hidden"
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 256 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
            animate={{
              x: [-256, 256],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>

      {/* Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Compact inline loader for smaller spaces
export const InlineLoader = ({ size = "md", message = "" }) => {
  const sizes = {
    sm: { container: "w-8 h-8", icon: "w-4 h-4", text: "text-xs" },
    md: { container: "w-12 h-12", icon: "w-6 h-6", text: "text-sm" },
    lg: { container: "w-16 h-16", icon: "w-8 h-8", text: "text-base" }
  };

  const sizeClasses = sizes[size];

  return (
    <div className="flex items-center justify-center space-x-3">
      <div className="relative">
        <motion.div
          className={`${sizeClasses.container} bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center`}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Shield className={`${sizeClasses.icon} text-white`} />
        </motion.div>
        <motion.div
          className={`absolute -inset-1 border-2 border-transparent border-t-blue-500 rounded-xl`}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
      {message && (
        <span className={`${sizeClasses.text} text-gray-600 font-medium`}>
          {message}
        </span>
      )}
    </div>
  );
};

// Button loading state
export const ButtonLoader = ({ size = "sm" }) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  return (
    <motion.div
      className={`${sizes[size]} border-2 border-transparent border-t-current border-r-current rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
};

export default PageLoader;