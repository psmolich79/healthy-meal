import { useState, useCallback, useEffect } from 'react';
import { supabaseClient } from '@/db/supabase.client';
import type { RecipeDetailsDto, UpsertRatingCommand, RatingType, RegeneratedRecipeDto } from '@/types';

interface RecipeDetailsState {
  recipe: RecipeDetailsDto | null;
  isLoading: boolean;
  isSaving: boolean;
  isRating: boolean;
  isRegenerating: boolean;
  error: string | null;
  saveStatus: 'unsaved' | 'saving' | 'saved' | 'error';
}

export const useRecipeDetails = (recipeId: string) => {
  const [state, setState] = useState<RecipeDetailsState>({
    recipe: null,
    isLoading: false,
    isSaving: false,
    isRating: false,
    isRegenerating: false,
    error: null,
    saveStatus: 'unsaved'
  });

  // Fetch recipe details
  const fetchRecipe = useCallback(async () => {
    if (!recipeId) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Musisz być zalogowany, aby wyświetlić przepis');
      }

      const response = await fetch(`/api/recipes/${recipeId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        let errorMessage = 'Błąd podczas ładowania przepisu';

        switch (response.status) {
          case 401:
            errorMessage = 'Musisz być zalogowany, aby wyświetlić przepis';
            break;
          case 403:
            errorMessage = 'Nie masz uprawnień do przeglądania tego przepisu';
            break;
          case 404:
            errorMessage = 'Przepis nie został znaleziony';
            break;
          case 500:
            errorMessage = 'Błąd serwera. Spróbuj ponownie później';
            break;
        }

        throw new Error(errorMessage);
      }

      const recipe: RecipeDetailsDto = await response.json();

      setState(prev => ({
        ...prev,
        isLoading: false,
        recipe,
        saveStatus: recipe.is_saved ? 'saved' : 'unsaved'
      }));
    } catch (error) {
      console.error('Error fetching recipe:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Błąd podczas ładowania przepisu'
      }));
    }
  }, [recipeId]);

  // Save recipe (toggle saved state)
  const saveRecipe = useCallback(async () => {
    if (!state.recipe) return false;

    try {
      setState(prev => ({ ...prev, isSaving: true, error: null, saveStatus: 'saving' }));

      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Musisz być zalogowany, aby zapisać przepis');
      }

      // Determine if we're saving or unsaving based on current state
      const isCurrentlySaved = state.recipe.is_saved;
      const endpoint = `/api/recipes/${recipeId}/save`;
      const method = isCurrentlySaved ? 'DELETE' : 'POST';

      console.log(`Saving recipe: ${isCurrentlySaved ? 'DELETE' : 'POST'} ${endpoint}`);

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Save response error:', response.status, errorData);
        throw new Error('Błąd podczas zapisywania przepisu');
      }

      // Toggle the saved state
      const newSavedState = !isCurrentlySaved;
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        saveStatus: newSavedState ? 'saved' : 'unsaved',
        recipe: prev.recipe ? { ...prev.recipe, is_saved: newSavedState } : null
      }));

      console.log(`Recipe ${isCurrentlySaved ? 'unsaved' : 'saved'} successfully`);

      return true;
    } catch (error) {
      console.error('Error saving recipe:', error);
      setState(prev => ({
        ...prev,
        isSaving: false,
        saveStatus: 'error',
        error: error instanceof Error ? error.message : 'Błąd podczas zapisywania'
      }));
      return false;
    }
  }, [state.recipe, recipeId]);

  // Rate recipe
  const rateRecipe = useCallback(async (rating: RatingType) => {
    if (!state.recipe) return false;

    try {
      setState(prev => ({ ...prev, isRating: true, error: null }));

      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Musisz być zalogowany, aby ocenić przepis');
      }

      const command: UpsertRatingCommand = { rating };

      const response = await fetch(`/api/recipes/${recipeId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(command)
      });

      if (!response.ok) {
        let errorMessage = 'Błąd podczas oceniania przepisu';

        switch (response.status) {
          case 401:
            errorMessage = 'Musisz być zalogowany, aby ocenić przepis';
            break;
          case 403:
            errorMessage = 'Nie możesz ocenić tego przepisu';
            break;
          case 500:
            errorMessage = 'Błąd serwera. Spróbuj ponownie później';
            break;
        }

        throw new Error(errorMessage);
      }

      setState(prev => ({
        ...prev,
        isRating: false,
        recipe: prev.recipe ? { ...prev.recipe, user_rating: rating } : null
      }));

      return true;
    } catch (error) {
      console.error('Error rating recipe:', error);
      setState(prev => ({
        ...prev,
        isRating: false,
        error: error instanceof Error ? error.message : 'Błąd podczas oceniania'
      }));
      return false;
    }
  }, [state.recipe, recipeId]);

  // Regenerate recipe
  const regenerateRecipe = useCallback(async () => {
    if (!state.recipe) return null;

    try {
      setState(prev => ({ ...prev, isRegenerating: true, error: null }));

      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Musisz być zalogowany, aby wygenerować ponownie przepis');
      }

      const response = await fetch(`/api/recipes/${recipeId}/regenerate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        let errorMessage = 'Błąd podczas regeneracji przepisu';

        switch (response.status) {
          case 401:
            errorMessage = 'Musisz być zalogowany, aby wygenerować ponownie przepis';
            break;
          case 403:
            errorMessage = 'Nie możesz regenerować tego przepisu';
            break;
          case 429:
            errorMessage = 'Przekroczyłeś limit regeneracji. Spróbuj ponownie za chwilę';
            break;
          case 500:
            errorMessage = 'Błąd serwera. Spróbuj ponownie później';
            break;
        }

        throw new Error(errorMessage);
      }

      const regeneratedRecipe: RegeneratedRecipeDto = await response.json();

      setState(prev => ({ ...prev, isRegenerating: false }));

      // Navigate to new recipe
      window.location.href = `/recipes/${regeneratedRecipe.id}`;

      return regeneratedRecipe;
    } catch (error) {
      console.error('Error regenerating recipe:', error);
      setState(prev => ({
        ...prev,
        isRegenerating: false,
        error: error instanceof Error ? error.message : 'Błąd podczas regeneracji'
      }));
      return null;
    }
  }, [state.recipe, recipeId]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (recipeId) {
      fetchRecipe();
    }
  }, [recipeId, fetchRecipe]);

  // Computed values
  const canRegenerate = state.recipe?.user_rating === 'down';
  const isSaved = state.recipe?.is_saved || state.saveStatus === 'saved';

  return {
    // State
    ...state,
    
    // Computed values
    canRegenerate,
    isSaved,
    
    // Actions
    fetchRecipe,
    saveRecipe,
    rateRecipe,
    regenerateRecipe,
    clearError
  };
};