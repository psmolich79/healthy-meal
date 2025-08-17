import React from 'react';
import TotalGenerations from './TotalGenerations';
import TotalTokens from './TotalTokens';
import TotalCost from './TotalCost';

interface UsageSummaryProps {
  summary: {
    totalGenerations: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCost: number | null;
  };
  className?: string;
}

const UsageSummary: React.FC<UsageSummaryProps> = ({ summary, className }) => (
  <div className={`${className} grid grid-cols-1 sm:grid-cols-3 gap-4`}>
    <TotalGenerations count={summary.totalGenerations} />
    <TotalTokens inputTokens={summary.totalInputTokens} outputTokens={summary.totalOutputTokens} />
    <TotalCost cost={summary.totalCost ?? 0} />
  </div>
);

export default UsageSummary;
