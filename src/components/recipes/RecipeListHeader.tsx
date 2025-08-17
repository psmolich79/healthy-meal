import React from 'react';
import { ChefHat, Plus } from 'lucide-react';
import { CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RecipeListHeaderProps {
  totalRecipes: number;
  filteredCount: number;
  isSearchActive: boolean;
  className?: string;
}

export const RecipeListHeader: React.FC<RecipeListHeaderProps> = ({
  totalRecipes,
  filteredCount,
  isSearchActive,
  className = ''
}) => {
  const displayCount = isSearchActive ? filteredCount : totalRecipes;
  
  const getCountText = () => {
    if (totalRecipes === 0) {
      return 'Brak przepisów';
    }
    
    if (isSearchActive) {
      return `${filteredCount} z ${totalRecipes} przepisów`;
    }
    
    return `${totalRecipes} ${totalRecipes === 1 ? 'przepis' : totalRecipes < 5 ? 'przepisy' : 'przepisów'}`;
  };

  const handleGenerateClick = () => {
    window.location.href = '/recipes/generate';
  };

  return (
    <CardHeader className={className}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ChefHat className="h-6 w-6 text-primary" />
          </div>
          
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Moje przepisy</h1>
            <p className="text-muted-foreground">
              {getCountText()}
            </p>
          </div>
        </div>

        <Button
          onClick={handleGenerateClick}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Wygeneruj nowy</span>
        </Button>
      </div>

      {isSearchActive && (
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {filteredCount === 0 
              ? 'Nie znaleziono przepisów pasujących do wyszukiwania'
              : `Znaleziono ${filteredCount} ${filteredCount === 1 ? 'przepis' : filteredCount < 5 ? 'przepisy' : 'przepisów'}`
            }
          </p>
        </div>
      )}
    </CardHeader>
  );
};