import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div aria-hidden="true" className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />
);

export const PageSkeleton: React.FC = () => (
  <div
    role="status"
    aria-busy="true"
    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6"
  >
    <span className="sr-only">Loading page content…</span>
    <Skeleton className="h-10 w-2/3" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-40" />
      ))}
    </div>
  </div>
);

export default PageSkeleton;