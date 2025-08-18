import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TotalTokensProps } from './types';

/**
 * Metric card component for total AI token usage
 */
export const TotalTokens: React.FC<TotalTokensProps> = ({
  inputTokens,
  outputTokens,
  trend,
  className
}) => {
  const totalTokens = inputTokens + outputTokens;

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const getTrendIcon = () => {
    if (!trend) return <MinusIcon className="h-4 w-4" />;
    if (trend > 0) return <TrendingUpIcon className="h-4 w-4 text-green-600" />;
    return <TrendingDownIcon className="h-4 w-4 text-red-600" />;
  };

  const getTrendColor = () => {
    if (!trend) return 'bg-muted text-muted-foreground';
    if (trend > 0) return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
    return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
  };

  const getTrendText = () => {
    if (!trend) return 'Brak zmian';
    const absTrend = Math.abs(trend);
    return `${trend > 0 ? '+' : '-'}${absTrend}%`;
  };

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Zużycie Tokenów
            </p>
            <p className="text-3xl font-bold">
              {formatNumber(totalTokens)}
            </p>
            <div className="text-sm text-muted-foreground mt-1">
              <span className="inline-block mr-3">
                Wejście: {formatNumber(inputTokens)}
              </span>
              <span className="inline-block">
                Wyjście: {formatNumber(outputTokens)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <Badge variant="secondary" className={cn('mb-2', getTrendColor())}>
              <div className="flex items-center gap-1">
                {getTrendIcon()}
                {getTrendText()}
              </div>
            </Badge>
            <div className="text-xs text-muted-foreground">
              vs poprzedni okres
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
