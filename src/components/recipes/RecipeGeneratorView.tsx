import React, { useState, useEffect, useCallback } from 'react';
import { RecipeGenerator } from './RecipeGenerator';
import { RecipeCarousel } from './RecipeCarousel';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { supabaseClient } from '@/db/supabase.client';
import type { RecipeGeneratorViewProps } from './types';
import type { GeneratedRecipeDto, RecipeListItemDto, ProfileDto } from '@/types';

export const RecipeGeneratorView: React.FC<RecipeGeneratorViewProps> = ({
  initialPreferences = [],
  className = ''
}) => {
  const [userProfile, setUserProfile] = useState<ProfileDto | null>(null);
  const [recentRecipes, setRecentRecipes] = useState<RecipeListItemDto[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile and preferences
  const fetchUserProfile = useCallback(async () => {
    try {
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Musisz być zalogowany');
      }

      const response = await fetch('/api/profiles/me', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Profile doesn't exist, redirect to profile creation
          window.location.href = '/profile';
          return;
        }
        throw new Error('Błąd podczas ładowania profilu');
      }

      const profile: ProfileDto = await response.json();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error instanceof Error ? error.message : 'Błąd podczas ładowania profilu');
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  // Fetch recent recipes
  const fetchRecentRecipes = useCallback(async () => {
    try {
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
      
      if (sessionError || !session) {
        return; // Skip if not authenticated
      }

      const response = await fetch('/api/recipes?page=1&limit=3&sort=created_at_desc', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecentRecipes(data.recipes || []);
      }
    } catch (error) {
      console.error('Error fetching recent recipes:', error);
      // Don't show error for recipes, it's not critical
    } finally {
      setIsLoadingRecipes(false);
    }
  }, []);

  // Initialize data on component mount
  useEffect(() => {
    fetchUserProfile();
    fetchRecentRecipes();
  }, [fetchUserProfile, fetchRecentRecipes]);

  const handleRecipeGenerated = useCallback((recipe: GeneratedRecipeDto) => {
    // Add the new recipe to the beginning of recent recipes
    const newRecipeItem: RecipeListItemDto = {
      id: recipe.id,
      title: recipe.title,
      created_at: recipe.created_at,
      is_visible: recipe.is_visible,
      user_rating: null
    };

    setRecentRecipes(prev => [newRecipeItem, ...prev.slice(0, 2)]);
  }, []);

  const handleRecipeClick = useCallback((recipeId: string) => {
    window.location.href = `/recipes/${recipeId}`;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Show loading spinner while loading profile
  if (isLoadingProfile) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner
          isVisible={true}
          status="Ładowanie profilu..."
          size="lg"
        />
      </div>
    );
  }

  // Show error if profile loading failed
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-xs underline hover:no-underline"
            >
              Zamknij
            </button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const userPreferences = userProfile?.preferences || initialPreferences;

  return (
    <div className={`max-w-4xl mx-auto p-6 space-y-8 ${className}`}>
      {/* Language Info */}
      <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 text-sm">
          🌍 <strong>Informacja:</strong> Wszystkie przepisy są generowane w języku polskim przez sztuczną inteligencję.
        </p>
      </div>

      {/* Main Recipe Generator */}
      <RecipeGenerator
        onRecipeGenerated={handleRecipeGenerated}
        isLoading={false}
        userPreferences={userPreferences}
      />

      {/* Recent Recipes Carousel */}
      {!isLoadingRecipes && (
        <div className="space-y-4">
          <RecipeCarousel
            recipes={recentRecipes}
            onRecipeClick={handleRecipeClick}
            maxVisible={3}
          />
        </div>
      )}

      {/* Loading recent recipes */}
      {isLoadingRecipes && (
        <div className="text-center py-8">
          <LoadingSpinner
            isVisible={true}
            status="Ładowanie ostatnich przepisów..."
            size="md"
          />
        </div>
      )}
    </div>
  );
};