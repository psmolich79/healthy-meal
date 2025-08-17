import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Calendar, Type, Star } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SortOption {
  value: string;
  label: string;
  description: string;
}

interface SortToggleProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  options: SortOption[];
  disabled?: boolean;
  className?: string;
}

export const SortToggle: React.FC<SortToggleProps> = ({
  currentSort,
  onSortChange,
  options,
  disabled = false,
  className = ''
}) => {
  const getSortIcon = (sortValue: string) => {
    switch (sortValue) {
      case 'created_at_desc':
      case 'created_at_asc':
        return <Calendar className="h-3 w-3" />;
      case 'title_asc':
      case 'title_desc':
        return <Type className="h-3 w-3" />;
      case 'rating_desc':
        return <Star className="h-3 w-3" />;
      default:
        return <ArrowUpDown className="h-3 w-3" />;
    }
  };

  const getDirectionIcon = (sortValue: string) => {
    if (sortValue.endsWith('_desc')) {
      return <ArrowDown className="h-3 w-3" />;
    } else if (sortValue.endsWith('_asc')) {
      return <ArrowUp className="h-3 w-3" />;
    }
    return null;
  };

  const handleSortChange = (value: string) => {
    const selectedOption = options.find(option => option.value === value);
    if (selectedOption && !disabled) {
      onSortChange(selectedOption);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
        Sortuj:
      </span>
      
      <Select
        value={currentSort.value}
        onValueChange={handleSortChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[180px]">
          <div className="flex items-center space-x-2">
            {getSortIcon(currentSort.value)}
            <SelectValue />
            {getDirectionIcon(currentSort.value)}
          </div>
        </SelectTrigger>
        
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center space-x-2">
                {getSortIcon(option.value)}
                <span>{option.label}</span>
                {getDirectionIcon(option.value)}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};