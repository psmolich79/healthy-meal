import React from 'react';
import { Settings, ChefHat, Utensils, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ActiveFiltersProps } from './types';

// Helper function to categorize preferences
const categorizePreferences = (preferences: string[]) => {
  const categories = {
    diet: [] as string[],
    cuisine: [] as string[],
    allergies: [] as string[]
  };

  // Simple categorization logic - in a real app this might come from a config
  const dietKeywords = ['wegetariańska', 'wegańska', 'keto', 'paleo', 'bezglutenowa', 'low-carb', 'high-protein'];
  const cuisineKeywords = ['włoska', 'azjatycka', 'meksykańska', 'francuska', 'polska', 'indyjska', 'tajska', 'grecka'];
  const allergyKeywords = ['gluten', 'laktoza', 'orzechy', 'skorupiaki', 'jaja', 'soja', 'ryby'];

  preferences.forEach(preference => {
    const lowerPref = preference.toLowerCase();
    
    if (dietKeywords.some(keyword => lowerPref.includes(keyword))) {
      categories.diet.push(preference);
    } else if (cuisineKeywords.some(keyword => lowerPref.includes(keyword))) {
      categories.cuisine.push(preference);
    } else if (allergyKeywords.some(keyword => lowerPref.includes(keyword))) {
      categories.allergies.push(preference);
    } else {
      // Default to diet if unsure
      categories.diet.push(preference);
    }
  });

  return categories;
};

const getIconForCategory = (category: string) => {
  switch (category) {
    case 'diet':
      return <ChefHat className="h-3 w-3" />;
    case 'cuisine':
      return <Utensils className="h-3 w-3" />;
    case 'allergies':
      return <AlertTriangle className="h-3 w-3" />;
    default:
      return <ChefHat className="h-3 w-3" />;
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'diet':
      return 'Dieta';
    case 'cuisine':
      return 'Kuchnia';
    case 'allergies':
      return 'Alergie';
    default:
      return 'Inne';
  }
};

const getCategoryVariant = (category: string) => {
  switch (category) {
    case 'diet':
      return 'default' as const;
    case 'cuisine':
      return 'secondary' as const;
    case 'allergies':
      return 'destructive' as const;
    default:
      return 'outline' as const;
  }
};

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  preferences,
  onEditProfile,
  className = ''
}) => {
  const categorizedPreferences = categorizePreferences(preferences);
  const hasPreferences = preferences.length > 0;

  if (!hasPreferences) {
    return (
      <div className={`rounded-lg border border-dashed border-muted-foreground/25 p-6 text-center ${className}`}>
        <ChefHat className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
        <h3 className="font-medium text-sm mb-2">Brak aktywnych preferencji</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Ustaw swoje preferencje żywieniowe, aby otrzymywać spersonalizowane przepisy
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onEditProfile}
          className="text-xs"
        >
          <Settings className="h-3 w-3 mr-1" />
          Ustaw preferencje
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Aktywne preferencje</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEditProfile}
          className="text-xs h-auto p-1"
        >
          <Settings className="h-3 w-3 mr-1" />
          Edytuj
        </Button>
      </div>

      <ScrollArea className="w-full">
        <div className="space-y-3">
          {Object.entries(categorizedPreferences).map(([category, items]) => {
            if (items.length === 0) return null;

            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center space-x-2">
                  {getIconForCategory(category)}
                  <span className="text-xs font-medium text-muted-foreground">
                    {getCategoryLabel(category)}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {items.map((preference, index) => (
                    <Badge
                      key={`${category}-${index}`}
                      variant={getCategoryVariant(category)}
                      className="text-xs px-2 py-1"
                    >
                      {preference}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <p className="text-xs text-muted-foreground">
        Te preferencje będą uwzględnione przy generowaniu przepisu
      </p>
    </div>
  );
};