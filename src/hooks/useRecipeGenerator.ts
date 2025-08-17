import { useState, useCallback, useMemo } from 'react';
import type { 
  RecipeGeneratorState, 
  ValidationResult, 
  QueryValidation 
} from '@/components/recipes/types';
import type { GeneratedRecipeDto, GenerateRecipeCommand } from '@/types';
import { supabaseClient } from '@/db/supabase.client';

const MIN_QUERY_LENGTH = 3;
const MAX_QUERY_LENGTH = 500;

export const useRecipeGenerator = () => {
  const [state, setState] = useState<RecipeGeneratorState>({
    query: '',
    isLoading: false,
    error: null,
    lastGeneratedRecipe: null
  });

  const validateQuery = useCallback((query: string): ValidationResult => {
    const validation: QueryValidation = {
      isEmpty: query.trim().length === 0,
      isTooShort: query.trim().length > 0 && query.trim().length < MIN_QUERY_LENGTH,
      isTooLong: query.length > MAX_QUERY_LENGTH,
      hasSpecialChars: false // For now, we allow all characters
    };

    const errors: string[] = [];

    if (validation.isEmpty) {
      errors.push('Zapytanie nie może być puste');
    } else if (validation.isTooShort) {
      errors.push(`Zapytanie musi mieć co najmniej ${MIN_QUERY_LENGTH} znaki`);
    }

    if (validation.isTooLong) {
      errors.push(`Zapytanie nie może przekraczać ${MAX_QUERY_LENGTH} znaków`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const generateRecipe = useCallback(async (query: string): Promise<GeneratedRecipeDto | null> => {
    // Validate query first
    const validation = validateQuery(query);
    if (!validation.isValid) {
      setState(prev => ({
        ...prev,
        error: validation.errors[0],
        isLoading: false
      }));
      return null;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Musisz być zalogowany, aby generować przepisy');
      }

      // Prepare the command
      const command: GenerateRecipeCommand = {
        query: query.trim(),
        model: 'gpt-4o' // Default model as specified in the plan
      };

      // Make API call
      const response = await fetch('/api/recipes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(command)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Wystąpił błąd podczas generowania przepisu';

        switch (response.status) {
          case 400:
            errorMessage = 'Nieprawidłowe dane wejściowe';
            break;
          case 401:
            errorMessage = 'Musisz być zalogowany, aby generować przepisy';
            break;
          case 429:
            errorMessage = 'Przekroczyłeś limit generowań. Spróbuj ponownie za chwilę';
            break;
          case 500:
            errorMessage = 'Wystąpił błąd serwera. Spróbuj ponownie później';
            break;
          default:
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || errorMessage;
            } catch {
              // Use default message if parsing fails
            }
        }

        throw new Error(errorMessage);
      }

      const generatedRecipe: GeneratedRecipeDto = await response.json();

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
        lastGeneratedRecipe: generatedRecipe
      }));

      return generatedRecipe;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Wystąpił nieoczekiwany błąd';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        lastGeneratedRecipe: null
      }));

      return null;
    }
  }, [validateQuery]);

  const updateQuery = useCallback((newQuery: string) => {
    setState(prev => ({
      ...prev,
      query: newQuery,
      error: null // Clear error when user types
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const resetState = useCallback(() => {
    setState({
      query: '',
      isLoading: false,
      error: null,
      lastGeneratedRecipe: null
    });
  }, []);

  // Computed values
  const isQueryValid = useMemo(() => {
    return validateQuery(state.query).isValid;
  }, [state.query, validateQuery]);

  const characterCount = useMemo(() => {
    return state.query.length;
  }, [state.query]);

  const canGenerate = useMemo(() => {
    return !state.isLoading && isQueryValid && state.query.trim().length > 0;
  }, [state.isLoading, isQueryValid, state.query]);

  return {
    // State
    ...state,
    
    // Computed values
    isQueryValid,
    characterCount,
    canGenerate,
    
    // Actions
    generateRecipe,
    updateQuery,
    validateQuery,
    clearError,
    resetState
  };
};