import { useState, useEffect, useCallback } from "react";
import type { AiUsageDto } from "@/types";
import { useToast } from "@/hooks/useToast";

interface DateRange {
  startDate: string;
  endDate: string;
}

const useAIUsageStats = (initialPeriod = "month") => {
  const [usageData, setUsageData] = useState<AiUsageDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>(initialPeriod);
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: "", endDate: "" });
  const toast = useToast();

  const fetchUsageStats = useCallback(
    async (period: string, range?: DateRange) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.append("period", period);
        if (range) {
          params.append("start_date", range.startDate);
          params.append("end_date", range.endDate);
        }
        const res = await fetch(`/api/ai/usage?${params.toString()}`);
        if (!res.ok) throw new Error(res.statusText);
        const data: AiUsageDto = await res.json();
        setUsageData(data);
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const changePeriod = useCallback(
    (period: string) => {
      setSelectedPeriod(period);
      fetchUsageStats(period);
    },
    [fetchUsageStats]
  );

  const setCustomDateRange = useCallback(
    (startDate: string, endDate: string) => {
      const range = { startDate, endDate };
      setDateRange(range);
      setSelectedPeriod("custom");
      fetchUsageStats("custom", range);
    },
    [fetchUsageStats]
  );

  useEffect(() => {
    fetchUsageStats(initialPeriod);
  }, [initialPeriod, fetchUsageStats]);

  return { usageData, isLoading, error, selectedPeriod, dateRange, changePeriod, setCustomDateRange };
};

export { useAIUsageStats };
