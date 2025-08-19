import React from 'react';

const SkeletonLoader = ({ 
  className = '', 
  type = 'rectangle', 
  width = '100%', 
  height = '20px',
  count = 1,
  animate = true 
}) => {
  const baseClasses = `
    ${animate ? 'animate-pulse' : ''} 
    bg-gray-200 dark:bg-gray-700 
    ${type === 'circle' ? 'rounded-full' : 'rounded-md'}
    ${className}
  `;

  const skeletonStyle = {
    width,
    height: type === 'circle' ? width : height,
  };

  if (count === 1) {
    return <div className={baseClasses} style={skeletonStyle} />;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={baseClasses} style={skeletonStyle} />
      ))}
    </div>
  );
};

// Preset skeleton components for common use cases
export const TableRowSkeleton = ({ columns = 4 }) => (
  <tr className="border-b border-gray-200 dark:border-gray-700">
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index} className="px-6 py-4">
        <SkeletonLoader height="16px" />
      </td>
    ))}
  </tr>
);

export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="animate-pulse">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-700">
        <tr>
          {Array.from({ length: columns }).map((_, index) => (
            <th key={index} className="px-6 py-3">
              <SkeletonLoader height="16px" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRowSkeleton key={rowIndex} columns={columns} />
        ))}
      </tbody>
    </table>
  </div>
);

export const CardSkeleton = ({ className = '' }) => (
  <div className={`p-6 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4 ${className}`}>
    <SkeletonLoader height="24px" width="60%" />
    <SkeletonLoader height="16px" count={3} />
    <div className="flex space-x-2">
      <SkeletonLoader height="32px" width="80px" />
      <SkeletonLoader height="32px" width="80px" />
    </div>
  </div>
);

export const SystemConfigSkeleton = () => (
  <div className="space-y-6">
    {/* Header skeleton */}
    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6">
      <SkeletonLoader height="32px" width="250px" className="mb-2" />
      <SkeletonLoader height="16px" width="400px" />
    </div>

    {/* Configuration sections skeleton */}
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <SkeletonLoader height="24px" width="200px" className="mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, configIndex) => (
            <div key={configIndex} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="space-y-2 flex-1">
                <SkeletonLoader height="16px" width="150px" />
                <SkeletonLoader height="14px" width="250px" />
              </div>
              <SkeletonLoader height="24px" width="60px" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default SkeletonLoader;