import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { AnimatedPreferenceCard } from './AnimatedPreferenceCard';
import { ALLERGY_PREFERENCES, getCategoryLabel, getCategoryDescription } from '@/data/preferences';

interface AllergiesSectionProps {
  preferences: string[];
  onChange: (preferences: string[]) => void;
  isExpanded: boolean;
  disabled?: boolean;
}

export const AllergiesSection: React.FC<AllergiesSectionProps> = ({
  preferences,
  onChange,
  isExpanded,
  disabled = false
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

  const selectedAllergyPreferences = preferences.filter(pref => 
    ALLERGY_PREFERENCES.some(allergy => allergy.id === pref)
  );

  if (!isExpanded) return null;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center space-x-3 pb-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <div className="space-y-1">
          <h3 className="font-semibold">{getCategoryLabel('allergy')}</h3>
          <p className="text-sm text-muted-foreground">
            {getCategoryDescription('allergy')}
          </p>
        </div>
      </div>

      {/* Selected Count */}
      {selectedAllergyPreferences.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Wybrano: {selectedAllergyPreferences.length} ograniczeń
        </div>
      )}

      {/* Preferences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {ALLERGY_PREFERENCES.map((preference) => (
          <AnimatedPreferenceCard
            key={preference.id}
            preference={preference}
            isSelected={preferences.includes(preference.id)}
            onToggle={handleToggle}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Important Notice */}
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-medium text-destructive">Ważne informacje o alergiach</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                • AI stara się unikać wybranych składników, ale <strong>nie może zagwarantować</strong> całkowitego braku alergenów
              </p>
              <p>
                • Zawsze sprawdzaj składniki przed przygotowaniem posiłku
              </p>
              <p>
                • W przypadku poważnych alergii skonsultuj się z lekarzem przed wprowadzeniem nowych produktów
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};