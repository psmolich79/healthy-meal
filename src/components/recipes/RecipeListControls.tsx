import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { SearchInput } from "@/components/ui/SearchInput";
import { SortToggle } from "./SortToggle";
import { FilterToggle } from "./FilterToggle";
import type { SortOption, FilterOption } from "@/types";

interface RecipeListControlsProps {
  onSearch: (query: string) => void;
  onSort: (sort: SortOption) => void;
  onFilter: (filter: FilterOption) => void;
  currentSort: SortOption;
  currentFilter: FilterOption;
  searchQuery: string;
  onClearSearch: () => void;
  sortOptions: SortOption[];
  filterOptions: FilterOption[];
  className?: string;
}

export const RecipeListControls: React.FC<RecipeListControlsProps> = React.memo(({
  onSearch,
  onSort,
  onFilter,
  currentSort,
  currentFilter,
  searchQuery,
  onClearSearch,
  sortOptions,
  filterOptions,
  className = "",
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      onSearch(localSearchQuery);
    }, 300); // 300ms debounce

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [localSearchQuery, onSearch]); // Remove searchTimeout from dependencies

  // Sync with external search query changes
  useEffect(() => {
    if (searchQuery !== localSearchQuery) {
      setLocalSearchQuery(searchQuery);
    }
  }, [searchQuery]); // Remove localSearchQuery from dependencies to prevent infinite loop

  const handleClearSearch = useCallback(() => {
    setLocalSearchQuery("");
    onClearSearch();
  }, [onClearSearch]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <SearchInput
          value={localSearchQuery}
          onChange={setLocalSearchQuery}
          placeholder="Szukaj przepisów po nazwie..."
          maxLength={200}
          showCharacterCount={false}
          className="w-full"
        />

        {localSearchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute right-12 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
            aria-label="Wyczyść wyszukiwanie"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Sort and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Sort Toggle */}
          <SortToggle currentSort={currentSort} onSortChange={onSort} options={sortOptions} />

          {/* Filter Toggle */}
          <FilterToggle currentFilter={currentFilter} onFilterChange={onFilter} options={filterOptions} />
        </div>

        {/* Active Filters Summary */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          {localSearchQuery && <span className="bg-muted px-2 py-1 rounded text-xs">Szukaj: "{localSearchQuery}"</span>}

          {currentFilter.value !== "all" && (
            <span className="bg-muted px-2 py-1 rounded text-xs">Filtr: {currentFilter.label}</span>
          )}

          {currentSort.value !== "created_at_desc" && (
            <span className="bg-muted px-2 py-1 rounded text-xs">Sortuj: {currentSort.label}</span>
          )}
        </div>
      </div>
    </div>
  );
});
