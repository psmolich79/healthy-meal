import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAIUsageStats } from '@/hooks/useAIUsageStats';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { UsageHeader } from './UsageHeader';
import { PeriodSelector } from './PeriodSelector';
import { UsageSummary } from './UsageSummary';
import { UsageCharts } from './UsageCharts';
import { ModelBreakdown } from './ModelBreakdown';
import { DailyBreakdown } from './DailyBreakdown';
import type { AIUsageStatsViewProps } from './types';

/**
 * Main container component for AI usage statistics view
 */
export const AIUsageStatsView: React.FC<AIUsageStatsViewProps> = ({
  initialPeriod = 'month',
  className
}) => {
  const {
    usageData,
    chartData,
    isLoading,
    error,
    selectedPeriod,
    dateRange,
    changePeriod,
    setCustomDateRange,
    clearError,
    refreshData
  } = useAIUsageStats(initialPeriod);

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    // TODO: Implement server-side sorting if needed
    console.log(`Sorting by ${column} in ${direction} order`);
  };

  const getLastUpdated = () => {
    if (!usageData) return undefined;
    return usageData.start_date; // Using start_date as last updated for now
  };

  if (isLoading && !usageData) {
    return (
      <div className={cn('min-h-screen flex items-center justify-center', className)}>
        <LoadingSpinner 
          isVisible={true} 
          status="Ładowanie statystyk AI..." 
          size="lg" 
        />
      </div>
    );
  }

  return (
    <div className={cn('max-w-7xl mx-auto p-6 space-y-6', className)}>
      {/* Header */}
      <UsageHeader lastUpdated={getLastUpdated()} />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearError}
              className="ml-4"
            >
              Zamknij
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Period Selector */}
      <PeriodSelector
        currentPeriod={selectedPeriod}
        onPeriodChange={changePeriod}
        onDateRangeChange={setCustomDateRange}
        disabled={isLoading}
      />

      {/* Loading State for Data Refresh */}
      {isLoading && usageData && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner 
            isVisible={true} 
            status="Odświeżanie danych..." 
            size="md" 
          />
        </div>
      )}

      {/* Main Content */}
      {usageData && chartData && (
        <>
          {/* Summary Metrics */}
          <UsageSummary summary={chartData.summary} />

          {/* Charts */}
          <UsageCharts 
            chartData={chartData}
            period={selectedPeriod}
          />

          {/* Model Breakdown */}
          <ModelBreakdown 
            models={chartData.models}
            totalCost={chartData.summary.totalCost}
          />

          {/* Daily Breakdown */}
          <DailyBreakdown 
            data={chartData.daily}
            onSort={handleSort}
          />

          {/* Refresh Button */}
          <div className="flex justify-center pt-6">
            <Button
              onClick={refreshData}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCwIcon className={cn(
                'h-4 w-4',
                isLoading && 'animate-spin'
              )} />
              Odśwież dane
            </Button>
          </div>
        </>
      )}

      {/* No Data State */}
      {!isLoading && !usageData && !error && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Brak danych statystyk
            </h3>
            <p className="text-gray-500">
              Nie znaleziono żadnych danych o użyciu AI w wybranym okresie.
              Spróbuj wybrać inny okres lub skontaktuj się z administratorem.
            </p>
            <Button onClick={refreshData} variant="outline">
              Spróbuj ponownie
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
