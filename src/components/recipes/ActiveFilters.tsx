import React from "react";
import { Settings, ChefHat, Utensils, AlertTriangle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ActiveFiltersProps } from "./types";
import { DIET_PREFERENCES, CUISINE_PREFERENCES, ALLERGY_PREFERENCES } from "@/data/preferences";

// Helper function to categorize preferences using the actual preference data
const categorizePreferences = (preferences: string[]) => {
  const categories = {
    diet: [] as string[],
    cuisine: [] as string[],
    allergies: [] as string[],
  };

  preferences.forEach((preference) => {
    const lowerPref = preference.toLowerCase();
    
    // Check if it's a diet preference
    if (DIET_PREFERENCES.some(diet => diet.id === preference)) {
      categories.diet.push(preference);
    }
    // Check if it's a cuisine preference
    else if (CUISINE_PREFERENCES.some(cuisine => cuisine.id === preference)) {
      categories.cuisine.push(preference);
    }
    // Check if it's an allergy preference
    else if (ALLERGY_PREFERENCES.some(allergy => allergy.id === preference)) {
      categories.allergies.push(preference);
    }
    // Fallback to diet if unsure (for backward compatibility)
    else {
      categories.diet.push(preference);
    }
  });

  return categories;
};

// Helper function to get preference details
const getPreferenceDetails = (preferenceId: string) => {
  const allPreferences = [...DIET_PREFERENCES, ...CUISINE_PREFERENCES, ...ALLERGY_PREFERENCES];
  return allPreferences.find(pref => pref.id === preferenceId);
};

const getIconForCategory = (category: string) => {
  switch (category) {
    case "diet":
      return <ChefHat className="h-3 w-3" />;
    case "cuisine":
      return <Utensils className="h-3 w-3" />;
    case "allergies":
      return <AlertTriangle className="h-3 w-3" />;
    default:
      return <ChefHat className="h-3 w-3" />;
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case "diet":
      return "Dieta";
    case "cuisine":
      return "Kuchnia";
    case "allergies":
      return "Alergie";
    default:
      return "Inne";
  }
};

const getCategoryVariant = (category: string) => {
  switch (category) {
    case "diet":
      return "default" as const;
    case "cuisine":
      return "secondary" as const;
    case "allergies":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
};

// Custom Badge component for allergies with warning icon
const AllergyBadge: React.FC<{ preference: string }> = ({ preference }) => {
  const details = getPreferenceDetails(preference);
  const severity = details?.severity || "moderate";
  
  return (
    <Badge
      variant="outline"
      className="text-xs px-2 py-1 border-2 border-red-400 bg-red-50 text-red-800 hover:bg-red-100 font-medium shadow-sm"
    >
      <XCircle className="h-3 w-3 mr-1 text-red-600" />
      {details?.label || preference}
      {severity === "severe" && (
        <span className="ml-1 text-xs font-bold">⚠️</span>
      )}
    </Badge>
  );
};

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({ preferences, onEditProfile, className = "" }) => {
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
        <Button variant="outline" size="sm" onClick={onEditProfile} className="text-xs">
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
        <Button variant="ghost" size="sm" onClick={onEditProfile} className="text-xs h-auto p-1">
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
                  <span className="text-xs font-medium text-muted-foreground">{getCategoryLabel(category)}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {items.map((preference, index) => {
                    // Use custom badge for allergies
                    if (category === "allergies") {
                      return (
                        <AllergyBadge
                          key={`${category}-${index}`}
                          preference={preference}
                        />
                      );
                    }
                    
                    // Regular badge for diet and cuisine
                    return (
                      <Badge
                        key={`${category}-${index}`}
                        variant={getCategoryVariant(category)}
                        className="text-xs px-2 py-1"
                      >
                        {getPreferenceDetails(preference)?.label || preference}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          Te preferencje będą uwzględnione przy generowaniu przepisu
        </p>
        
        {/* Special note about allergies */}
        {categorizedPreferences.allergies.length > 0 && (
          <div className="text-xs bg-red-50 border border-red-300 rounded-lg p-2 text-red-800">
            <div className="flex items-center space-x-1">
              <AlertTriangle className="h-3 w-3 text-red-600" />
              <span className="font-medium">Uwaga:</span>
            </div>
            <p className="mt-1">
              Alergie są preferencjami wykluczającymi - przepisy będą generowane bez tych składników
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
