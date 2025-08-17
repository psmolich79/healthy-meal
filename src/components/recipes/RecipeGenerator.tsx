import React, { useCallback } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { SearchInput } from '@/components/ui/SearchInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { GenerateButton } from './GenerateButton';
import { ActiveFilters } from './ActiveFilters';
import { useRecipeGenerator } from '@/hooks/useRecipeGenerator';
import type { RecipeGeneratorProps } from './types';

export const RecipeGenerator: React.FC<RecipeGeneratorProps> = ({
  onRecipeGenerated,
  isLoading: externalLoading = false,
  userPreferences = []
}) => {
  const {
    query,
    isLoading: hookLoading,
    error,
    canGenerate,
    characterCount,
    generateRecipe,
    updateQuery,
    clearError
  } = useRecipeGenerator();

  const isLoading = externalLoading || hookLoading;

  const handleGenerateClick = useCallback(async () => {
    if (!canGenerate || isLoading) return;

    const result = await generateRecipe(query);
    if (result) {
      onRecipeGenerated(result);
      // Navigate to the generated recipe details
      window.location.href = `/recipes/${result.id}`;
    }
  }, [canGenerate, isLoading, generateRecipe, query, onRecipeGenerated]);

  const handleEditProfile = useCallback(() => {
    window.location.href = '/profile';
  }, []);

  const handleSubmit = useCallback(() => {
    handleGenerateClick();
  }, [handleGenerateClick]);

  return (
    <div className="space-y-6">
      {/* Main Generator Card */}
      <Card>
        <CardHeader>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Wygeneruj Przepis</h1>
            <p className="text-muted-foreground">
              Opisz jaki przepis chcesz otrzymać, a AI stworzy dla Ciebie unikalny przepis po polsku
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Alert */}
          {error && (
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
          )}

          {/* Loading State */}
          {isLoading ? (
            <LoadingSpinner
              isVisible={true}
              status="Generowanie przepisu..."
              size="lg"
            />
          ) : (
            <>
              {/* Search Input */}
              <div className="space-y-4">
                <SearchInput
                  value={query}
                  onChange={updateQuery}
                  onSubmit={handleSubmit}
                  placeholder="Np. 'zdrowa kolacja z kurczakiem i warzywami' lub 'deser bez cukru'"
                  disabled={isLoading}
                  maxLength={500}
                  label="Opisz przepis, który chcesz wygenerować"
                  helpText="Minimum 3 znaki. Opisz składniki, typ kuchni lub specjalne wymagania."
                />

                {/* Generate Button */}
                <div className="flex justify-center">
                  <GenerateButton
                    onClick={handleGenerateClick}
                    disabled={!canGenerate}
                    isLoading={isLoading}
                    variant="primary"
                  >
                    Wygeneruj Przepis
                  </GenerateButton>
                </div>
              </div>

              {/* Active Filters */}
              <div className="border-t pt-6">
                <ActiveFilters
                  preferences={userPreferences}
                  onEditProfile={handleEditProfile}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      {!isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <h3 className="font-medium text-sm">Jak napisać dobre zapytanie?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
                <div className="space-y-1">
                  <p className="font-medium">🥘 Składniki</p>
                  <p>"kurczak, brokuły, ryż"</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">🌍 Typ kuchni</p>
                  <p>"włoska pasta", "azjatyckie curry"</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">⚡ Czas/Trudność</p>
                  <p>"szybka kolacja", "łatwy deser"</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};