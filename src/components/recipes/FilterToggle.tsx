import React from 'react';
import { Filter, Eye, EyeOff, Star, StarOff, Grid } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FilterOption {
  value: string;
  label: string;
  description: string;
}

interface FilterToggleProps {
  currentFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  options: FilterOption[];
  disabled?: boolean;
  className?: string;
}

export const FilterToggle: React.FC<FilterToggleProps> = ({
  currentFilter,
  onFilterChange,
  options,
  disabled = false,
  className = ''
}) => {
  const getFilterIcon = (filterValue: string) => {
    switch (filterValue) {
      case 'all':
        return <Grid className="h-3 w-3" />;
      case 'visible':
        return <Eye className="h-3 w-3" />;
      case 'hidden':
        return <EyeOff className="h-3 w-3" />;
      case 'rated':
        return <Star className="h-3 w-3" />;
      case 'unrated':
        return <StarOff className="h-3 w-3" />;
      default:
        return <Filter className="h-3 w-3" />;
    }
  };

  const handleFilterChange = (value: string) => {
    const selectedOption = options.find(option => option.value === value);
    if (selectedOption && !disabled) {
      onFilterChange(selectedOption);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
        Filtruj:
      </span>
      
      <Select
        value={currentFilter.value}
        onValueChange={handleFilterChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[140px]">
          <div className="flex items-center space-x-2">
            {getFilterIcon(currentFilter.value)}
            <SelectValue />
          </div>
        </SelectTrigger>
        
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center space-x-2">
                {getFilterIcon(option.value)}
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};