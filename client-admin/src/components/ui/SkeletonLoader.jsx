import React from 'react';

export const TableSkeleton = ({ rows = 5, columns = 6 }) => {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="grid grid-cols-6 gap-4">
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="h-4 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
      
      {/* Rows skeleton */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton = ({ count = 1 }) => {
  return (
    <div className="animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow mb-4">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gray-300 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const FilterSkeleton = () => {
  return (
    <div className="animate-pulse space-y-4">
      {/* Search bar skeleton */}
      <div className="flex gap-4">
        <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
        <div className="h-10 w-24 bg-gray-300 rounded-lg"></div>
      </div>
      
      {/* Filters skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default {
  TableSkeleton,
  CardSkeleton,
  FilterSkeleton
};