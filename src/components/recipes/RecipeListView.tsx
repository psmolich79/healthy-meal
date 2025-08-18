import React, { useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { RecipeListHeader } from "./RecipeListHeader";
import { RecipeListControls } from "./RecipeListControls";
import { RecipeGrid } from "./RecipeGrid";
import { Pagination } from "./Pagination";
import { EmptyState } from "./EmptyState";
import { useRecipeList } from "@/hooks/useRecipeList";

interface RecipeListViewProps {
  className?: string;
}

export const RecipeListView: React.FC<RecipeListViewProps> = React.memo(({ className = "" }) => {
  const {
    recipes,
    filteredRecipes,
    isLoading,
    isSearching,
    error,
    searchQuery,
    currentSort,
    currentFilter,
    pagination,
    hasRecipes,
    hasFilteredRecipes,
    isSearchActive,
    sortOptions,
    filterOptions,
    searchRecipes,
    sortRecipes,
    filterRecipes,
    changePage,
    deleteRecipe,
    clearSearch,
    clearError,
  } = useRecipeList();

  const handleRecipeClick = useCallback((recipeId: string) => {
    window.location.href = `/recipes/${recipeId}`;
  }, []);

  const handleRecipeDelete = useCallback(async (recipeId: string) => {
    await deleteRecipe(recipeId);
  }, [deleteRecipe]);

  const handleGenerateRecipe = useCallback(() => {
    window.location.href = "/recipes/generate";
  }, []);

  // Show loading spinner while loading recipes
  if (isLoading && !hasRecipes) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner isVisible={true} status="Ładowanie przepisów..." size="lg" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`max-w-7xl mx-auto p-6 space-y-6 ${className}`}>
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <button onClick={clearError} className="text-xs underline hover:no-underline">
                Zamknij
              </button>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Card */}
        <Card>
          {/* Header */}
          <RecipeListHeader
            totalRecipes={recipes.length}
            filteredCount={filteredRecipes.length}
            isSearchActive={isSearchActive}
          />

          {/* Controls */}
          <div className="px-6 pb-6">
            <RecipeListControls
              onSearch={searchRecipes}
              onSort={sortRecipes}
              onFilter={filterRecipes}
              currentSort={currentSort}
              currentFilter={currentFilter}
              searchQuery={searchQuery}
              onClearSearch={clearSearch}
              sortOptions={sortOptions}
              filterOptions={filterOptions}
            />
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            {/* Loading State for Search */}
            {isSearching && (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner isVisible={true} status="Wyszukiwanie przepisów..." size="md" />
              </div>
            )}

            {/* Empty States */}
            {!isSearching && !hasRecipes && (
              <EmptyState
                message="Nie masz jeszcze żadnych przepisów. Wygeneruj swój pierwszy przepis, aby rozpocząć budowanie swojej kolekcji kulinarnej."
                actionLabel="Wygeneruj pierwszy przepis"
              />
            )}

            {!isSearching && hasRecipes && !hasFilteredRecipes && isSearchActive && (
              <EmptyState
                message={`Nie znaleziono przepisów pasujących do "${searchQuery}". Spróbuj użyć innych słów kluczowych lub wyczyść wyszukiwanie.`}
                actionLabel="Wyczyść wyszukiwanie"
                onAction={clearSearch}
                isSearchResult={true}
              />
            )}

            {!isSearching && hasRecipes && !hasFilteredRecipes && !isSearchActive && currentFilter.value !== "all" && (
              <EmptyState
                message={`Nie znaleziono przepisów dla filtru "${currentFilter.label}". Spróbuj zmienić filtr lub wygenerować nowe przepisy.`}
                actionLabel="Pokaż wszystkie przepisy"
                onAction={() => filterRecipes(filterOptions[0])}
                isSearchResult={true}
              />
            )}

            {/* Recipe Grid */}
            {!isSearching && hasFilteredRecipes && (
              <div className="space-y-6">
                <RecipeGrid
                  recipes={filteredRecipes}
                  onRecipeClick={handleRecipeClick}
                  onRecipeDelete={handleRecipeDelete}
                />

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center pt-6 border-t">
                    <Pagination
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={changePage}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        {hasRecipes && (
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Chcesz więcej przepisów?</p>
            <button
              onClick={handleGenerateRecipe}
              className="text-sm text-primary hover:underline"
            >
              Wygeneruj nowy przepis →
            </button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
});
