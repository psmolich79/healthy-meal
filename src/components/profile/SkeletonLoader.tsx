import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SkeletonLoaderProps {
  className?: string;
  count?: number;
  height?: 'sm' | 'md' | 'lg';
  width?: 'full' | 'auto' | 'sm' | 'md' | 'lg';
}

export const SkeletonLoader = React.memo<SkeletonLoaderProps>(({
  className,
  count = 1,
  height = 'md',
  width = 'full'
}) => {
  const heightClasses = {
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8'
  };

  const widthClasses = {
    full: 'w-full',
    auto: 'w-auto',
    sm: 'w-16',
    md: 'w-32',
    lg: 'w-48'
  };

  const skeletonItems = Array.from({ length: count }, (_, index) => (
    <motion.div
      key={index}
      className={cn(
        'bg-gray-200 dark:bg-gray-700 rounded animate-pulse',
        heightClasses[height],
        widthClasses[width],
        className
      )}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: index * 0.1
      }}
    />
  ));

  return (
    <div className="space-y-3">
      {skeletonItems}
    </div>
  );
});

export const PreferenceSkeleton = React.memo(() => (
  <div className="space-y-4">
    {/* Header skeleton */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <SkeletonLoader height="lg" width="md" />
        <SkeletonLoader height="sm" width="lg" />
      </div>
      <SkeletonLoader height="sm" width="sm" />
    </div>

    {/* Description skeleton */}
    <SkeletonLoader height="sm" width="full" />

    {/* Preferences grid skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="p-3 border rounded-lg space-y-3">
          <div className="flex items-start space-x-3">
            <SkeletonLoader height="sm" width="sm" />
            <div className="flex-1 space-y-2">
              <SkeletonLoader height="md" width="md" />
              <SkeletonLoader height="sm" width="full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
));

export const ProfileHeaderSkeleton = React.memo(() => (
  <div className="text-center space-y-4">
    <SkeletonLoader height="lg" width="lg" className="mx-auto" />
    <SkeletonLoader height="md" width="full" className="max-w-2xl mx-auto" />
    
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="flex items-center gap-2">
          <SkeletonLoader height="sm" width="sm" />
          <SkeletonLoader height="sm" width="md" />
        </div>
      ))}
    </div>
  </div>
));

export const SaveButtonSkeleton = React.memo(() => (
  <div className="flex items-center gap-3">
    <SkeletonLoader height="md" width="md" />
    <SkeletonLoader height="md" width="lg" />
  </div>
));
