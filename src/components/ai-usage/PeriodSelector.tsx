import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import type { PeriodSelectorProps, PeriodOption } from './types';
import { PERIOD_OPTIONS } from './types';

/**
 * Period selector component for AI usage statistics
 */
export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  currentPeriod,
  onPeriodChange,
  onDateRangeChange,
  disabled = false
}) => {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();

  const handlePeriodChange = (period: string) => {
    if (period === 'custom') {
      setIsCustomOpen(true);
    } else {
      onPeriodChange(period);
    }
  };

  const handleCustomDateSubmit = () => {
    if (customStartDate && customEndDate) {
      const startDateStr = format(customStartDate, 'yyyy-MM-dd');
      const endDateStr = format(customEndDate, 'yyyy-MM-dd');
      onDateRangeChange(startDateStr, endDateStr);
      setIsCustomOpen(false);
    }
  };

  const handleCustomDateCancel = () => {
    setIsCustomOpen(false);
    setCustomStartDate(undefined);
    setCustomEndDate(undefined);
  };

  const getCurrentPeriodLabel = () => {
    const option = PERIOD_OPTIONS.find(opt => opt.value === currentPeriod);
    return option ? option.label : 'Niestandardowy';
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Okres analizy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Select
              value={currentPeriod}
              onValueChange={handlePeriodChange}
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Wybierz okres" />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-sm text-gray-500">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentPeriod === 'custom' && (
            <div className="flex gap-2">
              <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'justify-start text-left font-normal',
                      !customStartDate && 'text-muted-foreground'
                    )}
                    disabled={disabled}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customStartDate ? format(customStartDate, 'PPP', { locale: pl }) : 'Data początkowa'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customStartDate}
                    onSelect={setCustomStartDate}
                    initialFocus
                    locale={pl}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'justify-start text-left font-normal',
                      !customEndDate && 'text-muted-foreground'
                    )}
                    disabled={disabled}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customEndDate ? format(customEndDate, 'PPP', { locale: pl }) : 'Data końcowa'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customEndDate}
                    onSelect={setCustomEndDate}
                    initialFocus
                    locale={pl}
                  />
                </PopoverContent>
              </Popover>

              <Button
                onClick={handleCustomDateSubmit}
                disabled={!customStartDate || !customEndDate || disabled}
                size="sm"
              >
                Zastosuj
              </Button>
              <Button
                variant="outline"
                onClick={handleCustomDateCancel}
                disabled={disabled}
                size="sm"
              >
                Anuluj
              </Button>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600">
          <strong>Wybrany okres:</strong> {getCurrentPeriodLabel()}
          {currentPeriod === 'custom' && customStartDate && customEndDate && (
            <span className="ml-2">
              ({format(customStartDate, 'dd.MM.yyyy', { locale: pl })} - {format(customEndDate, 'dd.MM.yyyy', { locale: pl })})
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
