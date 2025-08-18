import React from "react";
import { useAIUsageStats } from "@/hooks/useAIUsageStats";
import UsageHeader from "./UsageHeader";
import PeriodSelector from "./PeriodSelector";
import UsageSummary from "./UsageSummary";
import UsageCharts from "./UsageCharts";
import ModelBreakdown from "./ModelBreakdown";
import DailyBreakdown from "./DailyBreakdown";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

interface AIUsageStatsViewProps {
  initialPeriod?: string;
  className?: string;
}

const AIUsageStatsView: React.FC<AIUsageStatsViewProps> = ({ initialPeriod = "month", className }) => {
  const { usageData, isLoading, error, selectedPeriod, dateRange, changePeriod, setCustomDateRange } =
    useAIUsageStats(initialPeriod);

  if (isLoading) {
    return <LoadingSpinner isVisible={true} />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!usageData) {
    return <div>Brak danych do wyświetlenia.</div>;
  }

  return (
    <ErrorBoundary>
      <div className={className}>
        <UsageHeader lastUpdated={usageData.end_date} />
        <PeriodSelector
          currentPeriod={selectedPeriod}
          onPeriodChange={changePeriod}
          onDateRangeChange={setCustomDateRange}
        />
        <UsageSummary
          summary={{
            totalGenerations: usageData.total_generations,
            totalInputTokens: usageData.total_input_tokens,
            totalOutputTokens: usageData.total_output_tokens,
            totalCost: usageData.total_cost,
            trend: usageData.trend || { generations: 0, tokens: 0, cost: 0 },
          }}
        />
        <UsageCharts
          chartData={{ daily: usageData.daily_breakdown, models: usageData.models_used, summary: usageData }}
          period={selectedPeriod}
        />
        <ModelBreakdown models={usageData.models_used} totalCost={usageData.total_cost ?? 0} />
        <DailyBreakdown data={usageData.daily_breakdown} onSort={() => {}} />
      </div>
    </ErrorBoundary>
  );
};

export { AIUsageStatsView };
