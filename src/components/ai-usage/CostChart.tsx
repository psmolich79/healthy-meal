import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { CostChartProps } from './types';

/**
 * Area chart component for AI usage costs over time
 */
export const CostChart: React.FC<CostChartProps> = ({
  data,
  period,
  currency,
  className
}) => {
  if (!data || data.length === 0) {
    return (
      <Card className={cn('h-80', className)}>
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Brak danych do wyświetlenia</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    date: format(new Date(item.date), 'dd.MM', { locale: pl }),
    cost: item.cost || 0,
    fullDate: item.date
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const cost = payload[0].value;
      return (
        <div className="bg-popover p-3 border border-border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-green-600">
            Koszt: <span className="font-bold">
              {new Intl.NumberFormat('pl-PL', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 4,
                maximumFractionDigits: 4
              }).format(cost)}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (value: number) => {
    if (value >= 1) {
      return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    } else {
      return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 4,
        maximumFractionDigits: 4
      }).format(value);
    }
  };

  return (
    <Card className={cn('h-80', className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Koszty AI w czasie
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="cost" 
              stroke="#10b981" 
              fill="#10b981"
              fillOpacity={0.3}
              strokeWidth={2}
              className="hover:fill-opacity-50 transition-all"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
