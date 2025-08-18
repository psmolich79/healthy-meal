import { useState, useCallback, useEffect } from 'react';
import { supabaseClient } from '@/db/supabase.client';
import type { AiUsageDto } from '@/types';
import type { AIUsageStatsState, DateRange, ChartData, UsageSummaryData } from '@/components/ai-usage/types';

/**
 * Custom hook for managing AI usage statistics state and API calls
 */
export const useAIUsageStats = (initialPeriod: string = 'month') => {
  const [state, setState] = useState<AIUsageStatsState>({
    usageData: null,
    isLoading: false,
    error: null,
    selectedPeriod: initialPeriod,
    dateRange: {
      startDate: '',
      endDate: ''
    },
    chartData: null
  });

  /**
   * Fetch AI usage statistics from the API
   */
  const fetchUsageStats = useCallback(async (period: string, dateRange?: DateRange) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Get current session from Supabase
      const {
        data: { session },
        error: sessionError,
      } = await supabaseClient.auth.getSession();

      if (sessionError || !session) {
        throw new Error('Musisz być zalogowany, aby przeglądać statystyki');
      }

      const queryParams = new URLSearchParams();
      
      if (period !== 'custom') {
        queryParams.append('period', period);
      } else if (dateRange) {
        queryParams.append('start_date', dateRange.startDate);
        queryParams.append('end_date', dateRange.endDate);
      }

      const response = await fetch(`/api/ai/usage?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Musisz być zalogowany, aby przeglądać statystyki');
        } else if (response.status === 403) {
          throw new Error('Nie masz uprawnień do przeglądania statystyk');
        } else if (response.status === 400) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || 'Nieprawidłowe parametry żądania';
          throw new Error(errorMessage);
        } else {
          throw new Error(`Błąd serwera: ${response.status}`);
        }
      }

      const data: AiUsageDto = await response.json();
      
      // Transform data for charts
      const chartData: ChartData = {
        daily: data.daily_breakdown,
        models: data.models_used,
        summary: {
          totalGenerations: data.total_generations,
          totalInputTokens: data.total_input_tokens,
          totalOutputTokens: data.total_output_tokens,
          totalCost: data.total_cost || 0,
          trend: {
            generations: 0, // TODO: Calculate trend from previous period
            tokens: 0,
            cost: 0
          }
        }
      };

      setState(prev => ({
        ...prev,
        usageData: data,
        chartData,
        isLoading: false,
        error: null
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Wystąpił nieoczekiwany błąd';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  }, []);

  /**
   * Change the selected period and fetch new data
   */
  const changePeriod = useCallback((period: string) => {
    setState(prev => ({
      ...prev,
      selectedPeriod: period,
      dateRange: period === 'custom' ? prev.dateRange : { startDate: '', endDate: '' }
    }));
    
    if (period !== 'custom') {
      fetchUsageStats(period);
    }
  }, [fetchUsageStats]);

  /**
   * Set custom date range and fetch data
   */
  const setCustomDateRange = useCallback((startDate: string, endDate: string) => {
    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      setState(prev => ({
        ...prev,
        error: 'Data początkowa nie może być późniejsza niż końcowa'
      }));
      return;
    }

    // Check if range is not more than 1 year
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 365) {
      setState(prev => ({
        ...prev,
        error: 'Maksymalny zakres to 1 rok'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      dateRange: { startDate, endDate },
      selectedPeriod: 'custom',
      error: null
    }));

    fetchUsageStats('custom', { startDate, endDate });
  }, [fetchUsageStats]);

  /**
   * Clear any error messages
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Refresh current data
   */
  const refreshData = useCallback(() => {
    if (state.selectedPeriod === 'custom') {
      fetchUsageStats('custom', state.dateRange);
    } else {
      fetchUsageStats(state.selectedPeriod);
    }
  }, [fetchUsageStats, state.selectedPeriod, state.dateRange]);

  /**
   * Initialize data on mount
   */
  useEffect(() => {
    fetchUsageStats(initialPeriod);
  }, [fetchUsageStats, initialPeriod]);

  return {
    ...state,
    fetchUsageStats,
    changePeriod,
    setCustomDateRange,
    clearError,
    refreshData
  };
};
