import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatTokensData } from "@/utils/chart-utils";
import type { DailyUsageDto } from "@/types";

interface TokensChartProps {
  data: DailyUsageDto[];
  period: string;
  className?: string;
}

const TokensChart: React.FC<TokensChartProps> = ({ data, className }) => {
  const chartData = formatTokensData(data);
  return (
    <ResponsiveContainer width="100%" height={300} className={className}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="y" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TokensChart;
