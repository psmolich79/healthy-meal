import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabaseClient } from '@/db/supabase.client';
import type { RecipeListItemDto, PaginatedRecipesDto, SortOption, FilterOption } from '@/types';



interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalRecipes: number;
  recipesPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface RecipeListState {
  recipes: RecipeListItemDto[];
  filteredRecipes: RecipeListItemDto[];
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  searchQuery: string;
  currentSort: SortOption;
  currentFilter: FilterOption;
  pagination: PaginationState;
}

const SORT_OPTIONS: SortOption[] = [
  {
    value: 'created_at_desc',
    label: 'Najnowsze',
    description: 'Od najnowszego'
  },
  {
    value: 'created_at_asc',
    label: 'Najstarsze',
    description: 'Od najstarszego'
  },
  {
    value: 'title_asc',
    label: 'Nazwa A-Z',
    description: 'Alfabetycznie rosnąco'
  },
  {
    value: 'title_desc',
    label: 'Nazwa Z-A',
    description: 'Alfabetycznie malejąco'
  },
  {
    value: 'rating_desc',
    label: 'Najlepiej ocenione',
    description: 'Według ocen'
  }
];

const FILTER_OPTIONS: FilterOption[] = [
  {
    value: 'all',
    label: 'Wszystkie',
    description: 'Pokaż wszystkie przepisy'
  },
  {
    value: 'visible',
    label: 'Publiczne',
    description: 'Tylko publiczne przepisy'
  },
  {
    value: 'hidden',
    label: 'Prywatne',
    description: 'Tylko prywatne przepisy'
  },
  {
    value: 'rated',
    label: 'Ocenione',
    description: 'Tylko ocenione przepisy'
  },
  {
    value: 'unrated',
    label: 'Nieocenione',
    description: 'Tylko nieocenione przepisy'
  }
];

const RECIPES_PER_PAGE = 20;

export const useRecipeList = () => {
  const [state, setState] = useState<RecipeListState>({
    recipes: [],
    filteredRecipes: [],
    isLoading: false,
    isSearching: false,
    error: null,
    searchQuery: '',
    currentSort: SORT_OPTIONS[0], // Default to newest first
    currentFilter: FILTER_OPTIONS[0], // Default to all
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalRecipes: 0,
      recipesPerPage: RECIPES_PER_PAGE,
      hasNext: false,
      hasPrevious: false
    }
  });

  // Fetch recipes from API
  const fetchRecipes = useCallback(async (
    page: number = 1,
    search?: string,
    sort?: string,
    filter?: string
  ) => {
    try {
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null,
        isSearching: !!search 
      }));

      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Musisz być zalogowany, aby przeglądać przepisy');
      }

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: RECIPES_PER_PAGE.toString()
      });

      if (sort) {
        queryParams.append('sort', sort);
      }

      // Handle filter parameter
      if (filter && filter !== 'all') {
        switch (filter) {
          case 'visible':
            queryParams.append('visible_only', 'true');
            break;
          case 'hidden':
            queryParams.append('visible_only', 'false');
            break;
          // rated/unrated would need additional API support
        }
      }

      const response = await fetch(`/api/recipes?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        let errorMessage = 'Błąd podczas ładowania przepisów';

        switch (response.status) {
          case 401:
            errorMessage = 'Musisz być zalogowany, aby przeglądać przepisy';
            break;
          case 403:
            errorMessage = 'Nie masz uprawnień do przeglądania przepisów';
            break;
          case 500:
            errorMessage = 'Błąd serwera. Spróbuj ponownie później';
            break;
        }

        throw new Error(errorMessage);
      }

      const data: PaginatedRecipesDto = await response.json();

      // Filter recipes based on search query (client-side)
      let filteredRecipes = data.recipes;
      if (search && search.trim()) {
        const searchLower = search.toLowerCase();
        filteredRecipes = data.recipes.filter(recipe =>
          recipe.title.toLowerCase().includes(searchLower)
        );
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        isSearching: false,
        recipes: data.recipes,
        filteredRecipes,
        searchQuery: search || '',
        pagination: {
          currentPage: data.pagination.page,
          totalPages: data.pagination.total_pages,
          totalRecipes: data.pagination.total,
          recipesPerPage: data.pagination.limit,
          hasNext: data.pagination.has_next,
          hasPrevious: data.pagination.has_previous
        }
      }));
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        isSearching: false,
        error: error instanceof Error ? error.message : 'Błąd podczas ładowania przepisów'
      }));
    }
  }, []);

  // Search recipes (with debounce)
  const searchRecipes = useCallback(async (query: string) => {
    // For now, we'll do client-side filtering
    // In a real app, this might be a separate API call
    const searchLower = query.toLowerCase();
    const filtered = state.recipes.filter(recipe =>
      recipe.title.toLowerCase().includes(searchLower)
    );

    setState(prev => ({
      ...prev,
      searchQuery: query,
      filteredRecipes: filtered
    }));
  }, [state.recipes]);

  // Sort recipes
  const sortRecipes = useCallback((sort: SortOption) => {
    setState(prev => ({ ...prev, currentSort: sort }));
    fetchRecipes(1, state.searchQuery, sort.value, state.currentFilter.value);
  }, [fetchRecipes, state.searchQuery, state.currentFilter.value]);

  // Filter recipes
  const filterRecipes = useCallback((filter: FilterOption) => {
    setState(prev => ({ ...prev, currentFilter: filter }));
    fetchRecipes(1, state.searchQuery, state.currentSort.value, filter.value);
  }, [fetchRecipes, state.searchQuery, state.currentSort.value]);

  // Change page
  const changePage = useCallback((page: number) => {
    if (page < 1 || page > state.pagination.totalPages) return;
    fetchRecipes(page, state.searchQuery, state.currentSort.value, state.currentFilter.value);
  }, [fetchRecipes, state.searchQuery, state.currentSort.value, state.currentFilter.value, state.pagination.totalPages]);

  // Delete recipe
  const deleteRecipe = useCallback(async (recipeId: string) => {
    try {
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Musisz być zalogowany, aby usunąć przepis');
      }

      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Błąd podczas usuwania przepisu');
      }

      // Remove recipe from local state
      setState(prev => ({
        ...prev,
        recipes: prev.recipes.filter(r => r.id !== recipeId),
        filteredRecipes: prev.filteredRecipes.filter(r => r.id !== recipeId),
        pagination: {
          ...prev.pagination,
          totalRecipes: prev.pagination.totalRecipes - 1
        }
      }));

      return true;
    } catch (error) {
      console.error('Error deleting recipe:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Błąd podczas usuwania przepisu'
      }));
      return false;
    }
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      searchQuery: '',
      filteredRecipes: prev.recipes
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Initialize on mount
  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Computed values
  const hasRecipes = state.recipes.length > 0;
  const hasFilteredRecipes = state.filteredRecipes.length > 0;
  const isSearchActive = state.searchQuery.trim().length > 0;

  return {
    // State
    ...state,
    
    // Computed values
    hasRecipes,
    hasFilteredRecipes,
    isSearchActive,
    sortOptions: SORT_OPTIONS,
    filterOptions: FILTER_OPTIONS,
    
    // Actions
    fetchRecipes,
    searchRecipes,
    sortRecipes,
    filterRecipes,
    changePage,
    deleteRecipe,
    clearSearch,
    clearError
  };
};