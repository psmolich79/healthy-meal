import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { RecipeCarouselProps } from './types';
import type { RecipeListItemDto } from '@/types';

const RecipeCard: React.FC<{
  recipe: RecipeListItemDto;
  onClick: () => void;
}> = ({ recipe, onClick }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short'
    });
  };

  const truncateTitle = (title: string, maxLength: number = 50) => {
    return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title;
  };

  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 min-w-[280px] max-w-[280px]"
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <h3 className="font-medium text-sm leading-tight">
            {truncateTitle(recipe.title)}
          </h3>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(recipe.created_at)}</span>
            </div>
            
            {recipe.user_rating && (
              <Badge 
                variant={recipe.user_rating === 'up' ? 'default' : 'secondary'}
                className="text-xs px-1 py-0"
              >
                {recipe.user_rating === 'up' ? '👍' : '👎'}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Badge 
              variant={recipe.is_visible ? 'outline' : 'secondary'}
              className="text-xs"
            >
              {recipe.is_visible ? 'Publiczny' : 'Prywatny'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyCarousel: React.FC<{ onGenerateClick: () => void }> = ({ onGenerateClick }) => (
  <div className="text-center py-12 space-y-4">
    <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
      <Star className="h-8 w-8 text-muted-foreground" />
    </div>
    <div className="space-y-2">
      <h3 className="font-medium">Brak ostatnich przepisów</h3>
      <p className="text-sm text-muted-foreground">
        Wygeneruj swój pierwszy przepis, aby zobaczyć go tutaj
      </p>
    </div>
    <Button onClick={onGenerateClick} variant="outline" size="sm">
      Wygeneruj przepis
    </Button>
  </div>
);

export const RecipeCarousel: React.FC<RecipeCarouselProps> = ({
  recipes,
  onRecipeClick,
  maxVisible = 3,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const hasRecipes = recipes.length > 0;
  const canNavigate = recipes.length > maxVisible;

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || !canNavigate) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % Math.max(1, recipes.length - maxVisible + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, canNavigate, recipes.length, maxVisible]);

  const handlePrevious = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => 
      prev === 0 ? Math.max(0, recipes.length - maxVisible) : prev - 1
    );
  }, [recipes.length, maxVisible]);

  const handleNext = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => 
      prev >= recipes.length - maxVisible ? 0 : prev + 1
    );
  }, [recipes.length, maxVisible]);

  const handleRecipeClick = useCallback((recipeId: string) => {
    onRecipeClick(recipeId);
  }, [onRecipeClick]);

  const handleGenerateClick = useCallback(() => {
    // This will be handled by parent component
    window.location.href = '/recipes/generate';
  }, []);

  const visibleRecipes = recipes.slice(currentIndex, currentIndex + maxVisible);

  if (!hasRecipes) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <EmptyCarousel onGenerateClick={handleGenerateClick} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Ostatnie przepisy</h2>
            {canNavigate && (
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNext}
                  disabled={currentIndex >= recipes.length - maxVisible}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Carousel */}
          <div 
            className="flex space-x-4 overflow-hidden"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {visibleRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => handleRecipeClick(recipe.id)}
              />
            ))}
          </div>

          {/* Dots indicator */}
          {canNavigate && (
            <div className="flex justify-center space-x-1">
              {Array.from({ length: Math.ceil(recipes.length / maxVisible) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrentIndex(index * maxVisible);
                  }}
                  className={`h-2 w-2 rounded-full transition-all ${
                    Math.floor(currentIndex / maxVisible) === index
                      ? 'bg-primary'
                      : 'bg-muted-foreground/30'
                  }`}
                  aria-label={`Przejdź do strony ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/recipes'}
              className="text-xs"
            >
              Zobacz wszystkie przepisy
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};