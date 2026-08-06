import React from 'react';

interface SkeletonCardProps {
  count?: number;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ count = 3, className = '' }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`rounded-2xl p-5 ${className}`}
          style={{
            background: 'var(--bg-deep)',
            border: '1px solid #ffffff08',
          }}
        >
          {/* Title skeleton */}
          <div
            className="h-4 rounded-md mb-4 w-3/4"
            style={{
              background: 'linear-gradient(90deg, var(--bg-surface) 25%, var(--bg-raised) 50%, var(--bg-surface) 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
          {/* Grid skeletons */}
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, j) => (
              <div
                key={j}
                className="rounded-lg p-2.5"
                style={{ background: 'var(--bg-surface)' }}
              >
                <div
                  className="h-2 rounded mb-2 w-1/2"
                  style={{
                    background: 'linear-gradient(90deg, var(--bg-surface) 25%, var(--bg-raised) 50%, var(--bg-surface) 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite',
                  }}
                />
                <div
                  className="h-3 rounded w-2/3"
                  style={{
                    background: 'linear-gradient(90deg, var(--bg-surface) 25%, var(--bg-raised) 50%, var(--bg-surface) 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite',
                    animationDelay: `${j * 100}ms`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

export default SkeletonCard;