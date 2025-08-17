import React from 'react';
import { Loader2, ChefHat } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export interface LoadingSpinnerProps {
  isVisible: boolean;
  status?: string;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  isVisible,
  status = "Ładowanie...",
  progress,
  size = 'md',
  className = ''
}) => {
  if (!isVisible) return null;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const containerClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${containerClasses[size]} ${className}`}>
      {/* Main spinner */}
      <div className="relative">
        <ChefHat className={`${sizeClasses[size]} text-muted-foreground animate-pulse`} />
        <Loader2 className={`${sizeClasses[size]} absolute inset-0 animate-spin text-primary`} />
      </div>

      {/* Status text */}
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-foreground">
          {status}
        </p>
        
        {/* Progress bar if provided */}
        {progress !== undefined && (
          <div className="w-64 max-w-full">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(progress)}% ukończone
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
