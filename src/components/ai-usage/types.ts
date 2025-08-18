import type { AiUsageDto, DailyUsageDto, ModelUsageDto } from "@/types";

// #region Component Props Types

export interface AIUsageStatsViewProps {
  initialPeriod?: string;
  className?: string;
}

export interface UsageHeaderProps {
  lastUpdated?: string;
  className?: string;
}

export interface PeriodSelectorProps {
  currentPeriod: string;
  onPeriodChange: (period: string) => void;
  onDateRangeChange: (startDate: string, endDate: string) => void;
  disabled?: boolean;
}

export interface UsageSummaryProps {
  summary: UsageSummaryData;
  className?: string;
}

export interface TotalGenerationsProps {
  count: number;
  trend?: number;
  className?: string;
}

export interface TotalTokensProps {
  inputTokens: number;
  outputTokens: number;
  trend?: number;
  className?: string;
}

export interface TotalCostProps {
  cost: number;
  currency: string;
  trend?: number;
  className?: string;
}

export interface UsageChartsProps {
  chartData: ChartData;
  period: string;
  className?: string;
}

export interface GenerationsChartProps {
  data: DailyUsageDto[];
  period: string;
  className?: string;
}

export interface TokensChartProps {
  data: DailyUsageDto[];
  period: string;
  className?: string;
}

export interface CostChartProps {
  data: DailyUsageDto[];
  period: string;
  currency: string;
  className?: string;
}

export interface ModelBreakdownProps {
  models: Record<string, ModelUsageDto>;
  totalCost: number;
  className?: string;
}

export interface DailyBreakdownProps {
  data: DailyUsageDto[];
  onSort: (column: string, direction: 'asc' | 'desc') => void;
  className?: string;
}

export interface LoadingSpinnerProps {
  isVisible: boolean;
  status?: string;
  size?: 'sm' | 'md' | 'lg';
}

// #endregion

// #region Data Types

export interface UsageSummaryData {
  totalGenerations: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  trend: {
    generations: number;
    tokens: number;
    cost: number;
  };
}

export interface ChartData {
  daily: DailyUsageDto[];
  models: Record<string, ModelUsageDto>;
  summary: UsageSummaryData;
}

export interface PeriodOption {
  value: string;
  label: string;
  description: string;
  days: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

// #endregion

// #region State Types

export interface AIUsageStatsState {
  usageData: AiUsageDto | null;
  isLoading: boolean;
  error: string | null;
  selectedPeriod: string;
  dateRange: DateRange;
  chartData: ChartData | null;
}

export interface ChartState {
  isLoading: boolean;
  data: ChartData | null;
  error: string | null;
}

export interface PeriodState {
  currentPeriod: string;
  customDateRange: DateRange | null;
  isCustom: boolean;
}

// #endregion

// #region Action Types

export interface UsageAction {
  type: 'set_usage_data' | 'set_period' | 'set_date_range' | 'set_loading' | 'set_error';
  payload: any;
}

export interface PeriodAction {
  type: 'change_period' | 'set_custom_range' | 'reset_period';
  payload: any;
}

export interface ChartAction {
  type: 'update_chart_data' | 'set_chart_loading' | 'set_chart_error';
  payload: any;
}

// #endregion

// #region Constants

export const PERIOD_OPTIONS: PeriodOption[] = [
  { value: 'day', label: 'Dzień', description: 'Ostatnie 24 godziny', days: 1 },
  { value: 'week', label: 'Tydzień', description: 'Ostatnie 7 dni', days: 7 },
  { value: 'month', label: 'Miesiąc', description: 'Ostatnie 30 dni', days: 30 },
  { value: 'year', label: 'Rok', description: 'Ostatnie 365 dni', days: 365 },
  { value: 'custom', label: 'Niestandardowy', description: 'Własny zakres dat', days: 0 }
];

export const CURRENCY = 'USD';

// #endregion
