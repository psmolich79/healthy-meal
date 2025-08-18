import React from "react";
import GenerationsChart from "./GenerationsChart";
import TokensChart from "./TokensChart";
import CostChart from "./CostChart";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface UsageChartsProps {
  chartData: any;
  period: string;
  className?: string;
}

const UsageCharts: React.FC<UsageChartsProps> = ({ chartData, period, className }) => (
  <Tabs defaultValue="generations" className={className}>
    <TabsList>
      <TabsTrigger value="generations">Generacje</TabsTrigger>
      <TabsTrigger value="tokens">Tokeny</TabsTrigger>
      <TabsTrigger value="cost">Koszt</TabsTrigger>
    </TabsList>
    <TabsContent value="generations">
      <GenerationsChart data={chartData.daily} period={period} />
    </TabsContent>
    <TabsContent value="tokens">
      <TokensChart data={chartData.daily} period={period} />
    </TabsContent>
    <TabsContent value="cost">
      <CostChart data={chartData.daily} period={period} />
    </TabsContent>
  </Tabs>
);

export default UsageCharts;
