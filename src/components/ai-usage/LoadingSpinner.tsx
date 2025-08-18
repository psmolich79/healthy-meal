import React from 'react';
import { cn } from '@/lib/utils';
import type { LoadingSpinnerProps } from './types';

/**
 * Loading spinner component for AI usage statistics
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  isVisible, 
  status = 'Ładowanie statystyk...', 
  size = 'md',
  className 
}) => {
  if (!isVisible) return null;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-4 p-8',
      className
    )}>
      <div className={cn(
        'animate-spin rounded-full border-4 border-gray-200 border-t-blue-600',
        sizeClasses[size]
      )} />
      {status && (
        <p className="text-sm text-gray-600 text-center max-w-xs">
          {status}
        </p>
      )}
    </div>
  );
};
