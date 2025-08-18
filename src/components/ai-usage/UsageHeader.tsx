import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { UsageHeaderProps } from './types';

/**
 * Header component for AI usage statistics view
 */
export const UsageHeader: React.FC<UsageHeaderProps> = ({ 
  lastUpdated, 
  className 
}) => {
  return (
    <Card className={cn('mb-6', className)}>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold mb-2">
          Statystyki Użycia AI
        </CardTitle>
        <CardDescription className="text-lg max-w-2xl mx-auto">
          Monitoruj swoje wykorzystanie modeli AI, zużycie tokenów i koszty w czasie rzeczywistym
        </CardDescription>
        {lastUpdated && (
          <div className="mt-4 text-sm text-muted-foreground">
            Ostatnia aktualizacja: {new Date(lastUpdated).toLocaleString('pl-PL')}
          </div>
        )}
      </CardHeader>
    </Card>
  );
};
