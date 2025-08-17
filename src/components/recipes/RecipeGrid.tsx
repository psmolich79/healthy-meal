import React from 'react';
import { RecipeCard } from './RecipeCard';
import type { RecipeListItemDto } from '@/types';

interface RecipeGridProps {
  recipes: RecipeListItemDto[];
  onRecipeClick: (recipeId: string) => void;
  onRecipeDelete: (recipeId: string) => void;
  className?: string;
}

export const RecipeGrid: React.FC<RecipeGridProps> = ({
  recipes,
  onRecipeClick,
  onRecipeDelete,
  className = ''
}) => {
  if (recipes.length === 0) {
    return null;
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onClick={() => onRecipeClick(recipe.id)}
          onDelete={() => onRecipeDelete(recipe.id)}
        />
      ))}
    </div>
  );
};