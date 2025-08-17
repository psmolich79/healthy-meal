import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AuthContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}

/**
 * Responsive container for authentication forms.
 * Provides consistent styling and layout across all auth screens.
 */
export const AuthContainer: React.FC<AuthContainerProps> = ({ 
  children, 
  className,
  maxWidth = "max-w-md"
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Card className={cn(
        "w-full shadow-xl border-0",
        maxWidth,
        "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm",
        className
      )}>
        <CardContent className="p-8">
          {children}
        </CardContent>
      </Card>
    </div>
  );
};
