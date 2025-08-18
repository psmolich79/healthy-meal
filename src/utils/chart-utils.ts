import type { DailyUsageDto } from "@/types";

export const formatGenerationsData = (daily: DailyUsageDto[]) => daily.map((d) => ({ x: d.date, y: d.generations }));

export const formatTokensData = (daily: DailyUsageDto[]) => daily.map((d) => ({ x: d.date, y: d.generations })); // Replace with actual token data if available

export const formatCostData = (daily: DailyUsageDto[]) => daily.map((d) => ({ x: d.date, y: d.cost ?? 0 }));
