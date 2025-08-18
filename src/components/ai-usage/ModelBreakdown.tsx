import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CpuIcon, TrendingUpIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModelBreakdownProps } from './types';

/**
 * Component for displaying AI model usage breakdown
 */
export const ModelBreakdown: React.FC<ModelBreakdownProps> = ({
  models,
  totalCost,
  className
}) => {
  if (!models || Object.keys(models).length === 0) {
    return (
      <Card className={cn('mb-8', className)}>
        <CardContent className="flex items-center justify-center h-40">
          <p className="text-muted-foreground">Brak danych o modelach AI</p>
        </CardContent>
      </Card>
    );
  }

  const totalGenerations = Object.values(models).reduce((sum, model) => sum + model.generations, 0);
  const sortedModels = Object.entries(models).sort((a, b) => b[1].generations - a[1].generations);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    }).format(amount);
  };

  const getModelColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <Card className={cn('mb-8', className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <CpuIcon className="h-5 w-5" />
          Podział według modeli AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Całkowite generowania</p>
            <p className="text-2xl font-bold">{totalGenerations.toLocaleString()}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Całkowity koszt</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalCost)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {sortedModels.map(([modelName, modelData], index) => {
            const percentage = totalGenerations > 0 ? (modelData.generations / totalGenerations) * 100 : 0;
            const costPercentage = totalCost > 0 && modelData.cost ? (modelData.cost / totalCost) * 100 : 0;
            
            return (
              <div key={modelName} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-3 h-3 rounded-full',
                      getModelColor(index)
                    )} />
                    <div>
                      <p className="font-medium">{modelName}</p>
                      <p className="text-sm text-muted-foreground">
                        {modelData.generations.toLocaleString()} generowań
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="mb-1">
                      {percentage.toFixed(1)}%
                    </Badge>
                    {modelData.cost && (
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(modelData.cost)}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Generowania</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  
                  {modelData.cost && costPercentage > 0 && (
                    <>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Koszt</span>
                        <span>{costPercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={costPercentage} className="h-2 bg-muted" />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            Wykorzystanie modeli AI w wybranym okresie
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
