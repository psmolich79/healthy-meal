import type { RecipeListItemDto, GeneratedRecipeDto } from "@/types";

// #region Component Props Types

export interface RecipeListViewProps {
  initialRecipes?: RecipeListItemDto[];
  className?: string;
}

export interface RecipeListHeaderProps {
  totalRecipes: number;
  filteredCount: number;
  className?: string;
}

export interface RecipeListControlsProps {
  onSearch: (query: string) => void;
  onSort: (sort: SortOption) => void;
  onFilter: (filter: FilterOption) => void;
  currentSort: SortOption;
  currentFilter: FilterOption;
}

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  disabled?: boolean;
  maxLength?: number;
}

export interface SortToggleProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  options: SortOption[];
  disabled?: boolean;
}

export interface FilterToggleProps {
  currentFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  options: FilterOption[];
  disabled?: boolean;
}

export interface RecipeGridProps {
  recipes: RecipeListItemDto[];
  onRecipeClick: (recipeId: string) => void;
  onRecipeDelete: (recipeId: string) => void;
  className?: string;
}

export interface RecipeCardProps {
  recipe: RecipeListItemDto;
  onClick: (recipeId: string) => void;
  onDelete: (recipeId: string) => void;
  className?: string;
}

export interface RecipeCarouselProps {
  recipes: RecipeListItemDto[];
  onRecipeClick: (recipeId: string) => void;
  maxVisible?: number;
  className?: string;
}

export interface RecipeGeneratorProps {
  onRecipeGenerated: (recipe: GeneratedRecipeDto) => void;
  isLoading: boolean;
  userPreferences: string[];
}

export interface RecipeGeneratorViewProps {
  initialPreferences?: string[];
  className?: string;
}

export interface RecipeGeneratorState {
  query: string;
  isLoading: boolean;
  error: string | null;
  lastGeneratedRecipe: GeneratedRecipeDto | null;
}

export interface SearchInputState {
  value: string;
  error: string | null;
  isFocused: boolean;
  characterCount: number;
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface QueryValidation {
  isEmpty: boolean;
  isTooShort: boolean;
  isTooLong: boolean;
  hasSpecialChars: boolean;
}

export interface ActiveFiltersProps {
  preferences: string[];
  onEditProfile: () => void;
  className?: string;
}

export interface GenerateButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export interface RecipeListState {
  recipes: RecipeListItemDto[];
  filteredRecipes: RecipeListItemDto[];
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  searchQuery: string;
  currentSort: SortOption;
  currentFilter: FilterOption;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecipes: number;
    recipesPerPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

// LoadingSpinnerProps moved to @/components/ui/LoadingSpinner

// #endregion

// #region Sort and Filter Types

export interface SortOption {
  value: string;
  label: string;
  description: string;
}

export interface FilterOption {
  value: string;
  label: string;
  description: string;
}

export type SortType = "created_at_desc" | "created_at_asc" | "title_asc" | "title_desc" | "rating_desc";

export type FilterType = "all" | "visible" | "hidden" | "rated" | "unrated";

// #endregion

// #region State Types

export interface SearchState {
  query: string;
  isSearching: boolean;
  results: RecipeListItemDto[];
  hasResults: boolean;
}

// #endregion

// #region Action Types

export interface RecipeListAction {
  type: "set_recipes" | "set_search" | "set_sort" | "set_filter" | "set_page" | "delete_recipe";
  payload: RecipeListItemDto[] | string | SortOption | FilterOption | number;
}

export interface SearchAction {
  type: "search_start" | "search_success" | "search_error" | "search_clear";
  payload?: RecipeListItemDto[] | string;
}

export interface SortAction {
  type: "sort_change";
  payload: SortOption;
}

export interface FilterAction {
  type: "filter_change";
  payload: FilterOption;
}

// #endregion

// #region API Types

export interface FetchRecipesParams {
  page: number;
  limit: number;
  visible_only?: boolean;
  sort?: string;
}

export interface DeleteRecipeResponse {
  message: string;
  success: boolean;
}

// #endregion
