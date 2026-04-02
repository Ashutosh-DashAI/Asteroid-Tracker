import React from 'react';

export const SkeletonLoader: React.FC<{ count?: number; className?: string }> = ({
  count = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 rounded-lg p-4 animate-pulse">
          <div className="flex gap-4">
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-slate-700/50 rounded w-3/4" />
              <div className="h-3 bg-slate-700/50 rounded w-1/2" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-3 bg-slate-700/50 rounded" />
                <div className="h-3 bg-slate-700/50 rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const TableSkeletonLoader: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <table className="w-full">
      <thead>
        <tr>
          {Array.from({ length: columns }).map((_, i) => (
            <th key={i} className="px-4 py-3 text-left">
              <div className="h-4 bg-slate-700/50 rounded w-3/4 animate-pulse" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <tr key={rowIdx} className="border-b border-slate-700/50">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <td key={colIdx} className="px-4 py-3">
                <div className="h-3 bg-slate-700/50 rounded w-2/3 animate-pulse" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SkeletonLoader;
