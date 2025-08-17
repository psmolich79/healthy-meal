import React from 'react';
import { Calendar, User, Clock, ChefHat } from 'lucide-react';
import { CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RecipeDetailsDto } from '@/types';

interface RecipeHeaderProps {
  recipe: RecipeDetailsDto;
  className?: string;
}

export const RecipeHeader: React.FC<RecipeHeaderProps> = ({
  recipe,
  className = ''
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingBadge = (rating: string | null) => {
    if (!rating) return null;
    
    return (
      <Badge variant={rating === 'up' ? 'default' : 'secondary'}>
        {rating === 'up' ? '👍 Polubiony' : '👎 Niepolubiony'}
      </Badge>
    );
  };

  const getVisibilityBadge = (isVisible: boolean) => {
    return (
      <Badge variant={isVisible ? 'outline' : 'secondary'}>
        {isVisible ? '🌐 Publiczny' : '🔒 Prywatny'}
      </Badge>
    );
  };

  return (
    <CardHeader className={className}>
      <div className="space-y-4">
        {/* Main Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold leading-tight">{recipe.title}</h1>
          
          {/* Original Query */}
          {recipe.query && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <div>
                <span className="font-medium">Twoje zapytanie:</span>
                <p className="italic">"{recipe.query}"</p>
              </div>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {/* Creation Date */}
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>Utworzono {formatDate(recipe.created_at)}</span>
          </div>

          {/* AI Generated */}
          <div className="flex items-center space-x-1">
            <ChefHat className="h-4 w-4" />
            <span>Wygenerowane przez AI</span>
          </div>

          {/* Updated Date (if different) */}
          {recipe.updated_at !== recipe.created_at && (
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Zaktualizowano {formatDate(recipe.updated_at)}</span>
            </div>
          )}
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {getRatingBadge(recipe.user_rating)}
          {getVisibilityBadge(recipe.is_visible)}
          
          {recipe.is_saved && (
            <Badge variant="outline">
              ⭐ Zapisany
            </Badge>
          )}

          {recipe.regenerated_from_recipe_id && (
            <Badge variant="secondary">
              🔄 Wygenerowany ponownie
            </Badge>
          )}
        </div>

        {/* Regeneration Info */}
        {recipe.regenerated_from_recipe_id && (
          <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
            <p>
              Ten przepis został wygenerowany ponownie na podstawie poprzedniej wersji. 
              Składniki i instrukcje mogą się różnić.
            </p>
          </div>
        )}
      </div>
    </CardHeader>
  );
};