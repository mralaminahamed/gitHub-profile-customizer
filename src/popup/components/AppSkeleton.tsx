import React from 'react';
import clsx from 'clsx';

const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={clsx('animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg', className)} />
);

const TabSkeleton: React.FC = () => (
  <div className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-800/50 p-1">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="w-full py-2 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"
      />
    ))}
  </div>
);

export const AppSkeleton: React.FC<{ isCompact?: boolean }> = ({ isCompact = false }) => {
  return (
    <div className={clsx(
      'w-[400px] min-h-screen',
      'bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800',
      'transition-colors duration-200',
      isCompact ? 'p-4' : 'p-6'
    )}>
      {/* Header Skeleton */}
      <header className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10" />
          <div className="space-y-2">
            <Skeleton className="w-32 h-6" />
            <Skeleton className="w-48 h-4" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
      </header>

      {/* Tab Navigation Skeleton */}
      <TabSkeleton />

      {/* Content Skeleton */}
      <div className="mt-6 space-y-6">
        {/* Section 1 */}
        <div className="space-y-4">
          <Skeleton className="w-1/3 h-5" />
          <div className="space-y-3">
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
          </div>
        </div>

        {/* Section 2 */}
        <div className="space-y-4">
          <Skeleton className="w-1/4 h-5" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="w-full h-32" />
            <Skeleton className="w-full h-32" />
            <Skeleton className="w-full h-32" />
            <Skeleton className="w-full h-32" />
          </div>
        </div>

        {/* Section 3 */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="w-1/3 h-5" />
            <Skeleton className="w-24 h-8 rounded-lg" />
          </div>
          <div className="space-y-3">
            <Skeleton className="w-full h-16" />
            <Skeleton className="w-full h-16" />
            <Skeleton className="w-full h-16" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading States for Individual Tabs
export const ProfileTabSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="flex gap-3">
      <Skeleton className="w-24 h-8 rounded-lg" />
      <Skeleton className="w-24 h-8 rounded-lg" />
    </div>

    <div className="space-y-4">
      <div>
        <Skeleton className="w-32 h-5 mb-2" />
        <Skeleton className="w-48 h-4" />
      </div>
      <div className="space-y-3">
        <Skeleton className="w-full h-16" />
        <Skeleton className="w-full h-16" />
        <Skeleton className="w-full h-16" />
      </div>
    </div>
  </div>
);

export const OrganizationsTabSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <div className="flex items-baseline gap-2">
        <Skeleton className="w-24 h-5" />
        <Skeleton className="w-32 h-4" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
    </div>

    <div className="flex gap-2">
      <Skeleton className="w-24 h-8 rounded-lg" />
      <Skeleton className="w-24 h-8 rounded-lg" />
    </div>

    <div className="space-y-3">
      <Skeleton className="w-full h-10 rounded-lg" />
      <div className="flex gap-2">
        <Skeleton className="w-32 h-8 rounded-lg" />
        <Skeleton className="w-32 h-8 rounded-lg" />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="w-full h-48" />
      ))}
    </div>
  </div>
);

export const ActivityTabSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      <Skeleton className="w-full h-48 rounded-lg" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="w-full h-24" />
        <Skeleton className="w-full h-24" />
        <Skeleton className="w-full h-24" />
      </div>
    </div>

    <div className="space-y-4">
      <Skeleton className="w-32 h-5" />
      <div className="space-y-3">
        <Skeleton className="w-full h-16" />
        <Skeleton className="w-full h-16" />
        <Skeleton className="w-full h-16" />
      </div>
    </div>
  </div>
);

export const SettingsTabSkeleton: React.FC = () => (
  <div className="space-y-6">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="space-y-4">
        <div>
          <Skeleton className="w-32 h-5 mb-2" />
          <Skeleton className="w-48 h-4" />
        </div>
        <div className="space-y-3">
          <Skeleton className="w-full h-16" />
          <Skeleton className="w-full h-16" />
          <Skeleton className="w-full h-16" />
        </div>
      </div>
    ))}
  </div>
);

export default AppSkeleton;