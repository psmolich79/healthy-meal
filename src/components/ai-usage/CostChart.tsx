import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCostData } from "@/utils/chart-utils";
import type { DailyUsageDto } from "@/types";

interface CostChartProps {
  data: DailyUsageDto[];
  period: string;
  className?: string;
}

const CostChart: React.FC<CostChartProps> = ({ data, className }) => {
  const chartData = formatCostData(data);
  return (
    <ResponsiveContainer width="100%" height={300} className={className}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="y" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CostChart;
