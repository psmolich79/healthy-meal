import React from "react";
import { Utensils } from "lucide-react";
import { AnimatedPreferenceCard } from "./AnimatedPreferenceCard";
import { CUISINE_PREFERENCES, getCategoryLabel, getCategoryDescription } from "@/data/preferences";

interface CuisineSectionProps {
  preferences: string[];
  onChange: (preferences: string[]) => void;
  isExpanded: boolean;
  disabled?: boolean;
}

export const CuisineSection: React.FC<CuisineSectionProps> = ({
  preferences,
  onChange,
  isExpanded,
  disabled = false,
}) => {
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

  const selectedCuisinePreferences = preferences.filter((pref) =>
    CUISINE_PREFERENCES.some((cuisine) => cuisine.id === pref)
  );

  if (!isExpanded) return null;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center space-x-3 pb-2">
        <Utensils className="h-5 w-5 text-secondary" />
        <div className="space-y-1">
          <h3 className="font-semibold">{getCategoryLabel("cuisine")}</h3>
          <p className="text-sm text-muted-foreground">{getCategoryDescription("cuisine")}</p>
        </div>
      </div>

      {/* Selected Count */}
      {selectedCuisinePreferences.length > 0 && (
        <div className="text-sm text-muted-foreground">Wybrano: {selectedCuisinePreferences.length}</div>
      )}

      {/* Preferences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {CUISINE_PREFERENCES.map((preference) => (
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
          🌍 <strong>Wskazówka:</strong> Wybierz kuchnie świata, które najbardziej Ci smakują. Możesz wybrać kilka
          różnych stylów kulinarnych.
        </p>
      </div>
    </div>
  );
};
