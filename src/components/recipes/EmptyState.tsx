import React from 'react';
import { ChefHat, Plus, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  isSearchResult?: boolean;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  actionLabel,
  onAction,
  isSearchResult = false,
  className = ''
}) => {
  const handleGenerateClick = () => {
    window.location.href = '/recipes/generate';
  };

  const getIcon = () => {
    if (isSearchResult) {
      return <Search className="h-12 w-12 text-muted-foreground" />;
    }
    return <ChefHat className="h-12 w-12 text-muted-foreground" />;
  };

  const getDefaultAction = () => {
    if (isSearchResult) {
      return {
        label: 'Wyczyść wyszukiwanie',
        action: onAction
      };
    }
    return {
      label: 'Wygeneruj pierwszy przepis',
      action: handleGenerateClick
    };
  };

  const defaultAction = getDefaultAction();
  const finalActionLabel = actionLabel || defaultAction.label;
  const finalAction = onAction || defaultAction.action;

  return (
    <Card className={className}>
      <CardContent className="p-12 text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="space-y-4 max-w-md mx-auto">
          <h3 className="text-xl font-semibold">
            {isSearchResult ? 'Nie znaleziono przepisów' : 'Brak przepisów'}
          </h3>
          
          <p className="text-muted-foreground leading-relaxed">
            {message}
          </p>

          {/* Action Button */}
          {finalAction && (
            <Button onClick={finalAction} className="mt-6">
              {!isSearchResult && <Plus className="h-4 w-4 mr-2" />}
              {finalActionLabel}
            </Button>
          )}
        </div>

        {/* Additional Help */}
        {!isSearchResult && (
          <div className="pt-6 border-t max-w-lg mx-auto">
            <h4 className="font-medium text-sm mb-3">Jak zacząć?</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
              <div className="space-y-1">
                <p className="font-medium">1. 🎯 Ustaw preferencje</p>
                <p>Wybierz dietę i alergie w profilu</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">2. ✨ Wygeneruj przepis</p>
                <p>Opisz co chcesz ugotować</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">3. 💾 Zapisz ulubione</p>
                <p>Oceń i zapisuj najlepsze przepisy</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                💡 Wszystkie przepisy są generowane przez AI na podstawie Twoich preferencji
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};