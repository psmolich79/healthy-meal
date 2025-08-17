import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRecipeGenerator } from '../../hooks/useRecipeGenerator';

// Mock fetch
global.fetch = vi.fn();

describe('useRecipeGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useRecipeGenerator());

    expect(result.current.query).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.lastGeneratedRecipe).toBe(null);
  });

  it('generates recipe successfully', async () => {
    const mockRecipe = {
      id: 'test-id',
      title: 'Test Recipe',
      ingredients: ['ingredient 1'],
      shopping_list: ['item 1'],
      instructions: ['step 1'],
              query: 'test query',
      is_visible: true,
      created_at: '2024-01-01T00:00:00Z',
      user_preferences_applied: ['vegetarian'],
      ai_generation: {
        model: 'gpt-4o',
        input_tokens: 100,
        output_tokens: 200,
        cost: 0.01
      }
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRecipe
    });

    const { result } = renderHook(() => useRecipeGenerator());

    await act(async () => {
      await result.current.generateRecipe('test query');
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.lastGeneratedRecipe).toEqual(mockRecipe);
  });

  it('handles API error response', async () => {
    const errorMessage = 'API Error';
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: errorMessage })
    });

    const { result } = renderHook(() => useRecipeGenerator());

    await act(async () => {
      try {
        await result.current.generateRecipe('test query');
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  it('handles network error', async () => {
    const networkError = new Error('Network error');
    (global.fetch as any).mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useRecipeGenerator());

    await act(async () => {
      try {
        await result.current.generateRecipe('test query');
      } catch (error) {
        // Expected to throw
      }
    });

    // Sprawdź czy błąd został ustawiony w stanie
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Network error');
    });
  });

  it('validates query correctly', () => {
    const { result } = renderHook(() => useRecipeGenerator());

    // Test empty query
    let validation = result.current.validateQuery('');
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain('Zapytanie nie może być puste');

    // Test too short query
    validation = result.current.validateQuery('ab');
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain('Zapytanie musi mieć minimum 3 znaki');

    // Test too long query
    const longQuery = 'a'.repeat(501);
    validation = result.current.validateQuery(longQuery);
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain('Zapytanie nie może przekraczać 500 znaków');

    // Test valid query
    validation = result.current.validateQuery('Valid query');
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('clears error when clearError is called', () => {
    const { result } = renderHook(() => useRecipeGenerator());

    // Set error first
    act(() => {
      result.current.updateQuery('test');
    });

    // Clear error
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe(null);
  });

  it('updates query when updateQuery is called', () => {
    const { result } = renderHook(() => useRecipeGenerator());

    act(() => {
      result.current.updateQuery('new query');
    });

    expect(result.current.query).toBe('new query');
  });

  it('resets state when resetState is called', () => {
    const { result } = renderHook(() => useRecipeGenerator());

    // Modify state first
    act(() => {
      result.current.updateQuery('test query');
    });

    // Reset state
    act(() => {
      result.current.resetState();
    });

    expect(result.current.query).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.lastGeneratedRecipe).toBe(null);
  });

  it('sets loading state during API call', async () => {
    (global.fetch as any).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    const { result } = renderHook(() => useRecipeGenerator());

    act(() => {
      result.current.generateRecipe('test query');
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('sends correct request to API', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'test' })
    });

    const { result } = renderHook(() => useRecipeGenerator());

    await act(async () => {
      await result.current.generateRecipe('test query');
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/recipes/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: 'test query', model: 'gpt-4o' })
    });
  });
});
