import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GenerationsChart } from './GenerationsChart';
import { TokensChart } from './TokensChart';
import { CostChart } from './CostChart';
import { CURRENCY } from './types';
import type { UsageChartsProps } from './types';
import { cn } from '@/lib/utils';

/**
 * Container component for AI usage charts with tabs
 */
export const UsageCharts: React.FC<UsageChartsProps> = ({
  chartData,
  period,
  className
}) => {
  if (!chartData || !chartData.daily || chartData.daily.length === 0) {
    return (
      <Card className={cn('mb-8', className)}>
        <CardContent className="flex items-center justify-center h-80">
          <p className="text-gray-500">Brak danych do wyświetlenia wykresów</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('mb-8', className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Wykresy użycia AI
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="generations" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="generations" className="text-sm">
              Generowania
            </TabsTrigger>
            <TabsTrigger value="tokens" className="text-sm">
              Tokeny
            </TabsTrigger>
            <TabsTrigger value="costs" className="text-sm">
              Koszty
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="generations" className="space-y-4">
            <GenerationsChart 
              data={chartData.daily}
              period={period}
            />
          </TabsContent>
          
          <TabsContent value="tokens" className="space-y-4">
            <TokensChart 
              data={chartData.daily}
              period={period}
            />
          </TabsContent>
          
          <TabsContent value="costs" className="space-y-4">
            <CostChart 
              data={chartData.daily}
              period={period}
              currency={CURRENCY}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
