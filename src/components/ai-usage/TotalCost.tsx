import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUpIcon, TrendingDownIcon, MinusIcon, DollarSignIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TotalCostProps } from './types';

/**
 * Metric card component for total AI usage cost
 */
export const TotalCost: React.FC<TotalCostProps> = ({
  cost,
  currency,
  trend,
  className
}) => {
  const formatCurrency = (amount: number, curr: string) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount);
  };

  const getTrendIcon = () => {
    if (!trend) return <MinusIcon className="h-4 w-4" />;
    if (trend > 0) return <TrendingUpIcon className="h-4 w-4 text-red-600" />;
    return <TrendingDownIcon className="h-4 w-4 text-green-600" />;
  };

  const getTrendColor = () => {
    if (!trend) return 'bg-muted text-muted-foreground';
    if (trend > 0) return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
    return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
  };

  const getTrendText = () => {
    if (!trend) return 'Brak zmian';
    const absTrend = Math.abs(trend);
    return `${trend > 0 ? '+' : '-'}${absTrend}%`;
  };

  const getTrendDescription = () => {
    if (!trend) return 'vs poprzedni okres';
    if (trend > 0) return 'wzrost vs poprzedni okres';
    return 'spadek vs poprzedni okres';
  };

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Całkowity Koszt
            </p>
            <div className="flex items-center gap-2">
              <DollarSignIcon className="h-6 w-6 text-green-600" />
              <p className="text-3xl font-bold">
                {formatCurrency(cost, currency)}
              </p>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Waluta: {currency}
            </p>
          </div>
          <div className="text-right">
            <Badge variant="secondary" className={cn('mb-2', getTrendColor())}>
              <div className="flex items-center gap-1">
                {getTrendIcon()}
                {getTrendText()}
              </div>
            </Badge>
            <div className="text-xs text-muted-foreground">
              {getTrendDescription()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
