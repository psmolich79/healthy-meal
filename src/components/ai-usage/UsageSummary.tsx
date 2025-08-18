import React from 'react';
import { TotalGenerations } from './TotalGenerations';
import { TotalTokens } from './TotalTokens';
import { TotalCost } from './TotalCost';
import { CURRENCY } from './types';
import type { UsageSummaryProps } from './types';

/**
 * Container component for AI usage summary metrics
 */
export const UsageSummary: React.FC<UsageSummaryProps> = ({ 
  summary, 
  className 
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 ${className}`}>
      <TotalGenerations 
        count={summary.totalGenerations}
        trend={summary.trend.generations}
      />
      <TotalTokens 
        inputTokens={summary.totalInputTokens}
        outputTokens={summary.totalOutputTokens}
        trend={summary.trend.tokens}
      />
      <TotalCost 
        cost={summary.totalCost}
        currency={CURRENCY}
        trend={summary.trend.cost}
      />
    </div>
  );
};
