import React from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { RecipeHeader } from "./RecipeHeader";
import { IngredientsSection } from "./IngredientsSection";
import { ShoppingListSection } from "./ShoppingListSection";
import { InstructionsSection } from "./InstructionsSection";
import { RecipeActions } from "./RecipeActions";
import { AIDisclaimer } from "./AIDisclaimer";
import { useRecipeDetails } from "@/hooks/useRecipeDetails";
import type { RatingType } from "@/types";

interface RecipeDetailsViewProps {
  recipeId: string;
  className?: string;
}

export const RecipeDetailsView: React.FC<RecipeDetailsViewProps> = ({ recipeId, className = "" }) => {
  const {
    recipe,
    isLoading,
    isSaving,
    isRating,
    isRegenerating,
    error,
    isSaved,
    saveRecipe,
    rateRecipe,
    removeRating,
    changeVisibility,
    regenerateRecipe,
    clearError,
  } = useRecipeDetails(recipeId);

  // Show loading spinner while loading recipe
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner isVisible={true} status="Ładowanie przepisu..." size="lg" />
      </div>
    );
  }

  // Show error if recipe loading failed
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={clearError} className="text-xs underline hover:no-underline">
              Zamknij
            </button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show message if no recipe found
  if (!recipe) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <span className="text-2xl">📄</span>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Przepis nie został znaleziony</h3>
            <p className="text-sm text-muted-foreground">Ten przepis może nie istnieć lub został usunięty.</p>
          </div>
        </div>
      </div>
    );
  }

  // Action handlers
  const handleSave = async () => {
    return await saveRecipe();
  };

  const handleRatingChange = async (rating: RatingType) => {
    return await rateRecipe(rating);
  };

  const handleRatingRemove = async () => {
    return await removeRating();
  };

  const handleVisibilityChange = async (isVisible: boolean) => {
    return await changeVisibility(isVisible);
  };

  const handleRegenerate = async () => {
    await regenerateRecipe();
  };

  const isAnyActionLoading = isSaving || isRating || isRegenerating;

  return (
    <ErrorBoundary>
      <div className={`max-w-6xl mx-auto p-6 space-y-6 ${className}`}>
        {/* AI Disclaimer */}
        <AIDisclaimer />

        {/* Main Recipe Card */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <RecipeHeader recipe={recipe} />

          <div className="p-6 space-y-6">
            {/* Recipe Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <IngredientsSection ingredients={recipe.ingredients} />
                <ShoppingListSection shoppingList={recipe.shopping_list} />
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <InstructionsSection instructions={recipe.instructions} />
              </div>
            </div>
          </div>
        </div>

        {/* Recipe Actions */}
        <RecipeActions
          recipe={recipe}
          isSaved={isSaved}
          onSave={handleSave}
          onRatingChange={handleRatingChange}
          onRatingRemove={handleRatingRemove}
          onVisibilityChange={handleVisibilityChange}
          onRegenerate={handleRegenerate}
          isLoading={isAnyActionLoading}
        />

        {/* Back to Recipes Link */}
        <div className="text-center">
          <button
            onClick={() => (window.location.href = "/recipes")}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            ← Powrót do listy przepisów
          </button>
        </div>
      </div>
    </ErrorBoundary>
  );
};
