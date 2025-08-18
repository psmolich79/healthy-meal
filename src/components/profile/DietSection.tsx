import React from "react";
import { ChefHat } from "lucide-react";
import { AnimatedPreferenceCard } from "./AnimatedPreferenceCard";
import { DIET_PREFERENCES, getCategoryLabel, getCategoryDescription } from "@/data/preferences";

interface DietSectionProps {
  preferences: string[];
  onChange: (preferences: string[]) => void;
  isExpanded: boolean;
  disabled?: boolean;
}

export const DietSection: React.FC<DietSectionProps> = ({ preferences, onChange, isExpanded, disabled = false }) => {
  const handleToggle = (preferenceId: string) => {
    if (disabled) return;

    const newPreferences = [...preferences];
    const index = newPreferences.indexOf(preferenceId);

    if (index === -1) {
      newPreferences.push(preferenceId);
    } else {
      newPreferences.splice(index, 1);
    }

    onChange(newPreferences);
  };

  const selectedDietPreferences = preferences.filter((pref) => DIET_PREFERENCES.some((diet) => diet.id === pref));

  if (!isExpanded) return null;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center space-x-3 pb-2">
        <ChefHat className="h-5 w-5 text-primary" />
        <div className="space-y-1">
          <h3 className="font-semibold">{getCategoryLabel("diet")}</h3>
          <p className="text-sm text-muted-foreground">{getCategoryDescription("diet")}</p>
        </div>
      </div>

      {/* Selected Count */}
      {selectedDietPreferences.length > 0 && (
        <div className="text-sm text-muted-foreground">Wybrano: {selectedDietPreferences.length}</div>
      )}

      {/* Preferences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {DIET_PREFERENCES.map((preference) => (
          <AnimatedPreferenceCard
            key={preference.id}
            preference={preference}
            isSelected={preferences.includes(preference.id)}
            onToggle={handleToggle}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Help Text */}
      <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
        <p>
          💡 <strong>Wskazówka:</strong> Wybierz style żywienia, które preferujesz. AI będzie generować przepisy zgodne
          z Twoimi wyborami.
        </p>
      </div>
    </div>
  );
};
