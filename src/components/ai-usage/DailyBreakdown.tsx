import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDownIcon, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { DailyBreakdownProps } from './types';

type SortColumn = 'date' | 'generations' | 'cost';
type SortDirection = 'asc' | 'desc';

/**
 * Table component for daily AI usage breakdown with sorting
 */
export const DailyBreakdown: React.FC<DailyBreakdownProps> = ({
  data,
  onSort,
  className
}) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (column: SortColumn) => {
    const newDirection = column === sortColumn && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    onSort(column, newDirection);
  };

  const getSortIcon = (column: SortColumn) => {
    if (column !== sortColumn) {
      return <ArrowUpDownIcon className="h-4 w-4" />;
    }
    return sortDirection === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />;
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'EEEE, dd MMMM yyyy', { locale: pl });
  };

  const shortDate = (dateString: string) => {
    return format(new Date(dateString), 'dd.MM.yyyy', { locale: pl });
  };

  if (!data || data.length === 0) {
    return (
      <Card className={cn('mb-8', className)}>
        <CardContent className="flex items-center justify-center h-40">
          <p className="text-muted-foreground">Brak danych dziennych do wyświetlenia</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('mb-8', className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Dzienny podział użycia AI
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('date')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Data
                    {getSortIcon('date')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('generations')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Generowania
                    {getSortIcon('generations')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('cost')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Koszt
                    {getSortIcon('cost')}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={item.date} className={cn(
                  'hover:bg-muted/50 transition-colors',
                  index % 2 === 0 ? 'bg-muted/30' : 'bg-background'
                )}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">
                        {shortDate(item.date)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(item.date)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {item.generations.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      'font-medium',
                      item.cost && item.cost > 0 ? 'text-green-600' : 'text-muted-foreground'
                    )}>
                      {formatCurrency(item.cost)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground text-center">
          <p>Kliknij nagłówek kolumny, aby posortować dane</p>
          <p className="mt-1">
            Pokazano {data.length} dni z wybranego okresu
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
