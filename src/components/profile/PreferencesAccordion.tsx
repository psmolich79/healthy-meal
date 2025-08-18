import React from "react";
// ChevronDown import removed - not used
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { DietSection } from "./DietSection";
import { CuisineSection } from "./CuisineSection";
import { AllergiesSection } from "./AllergiesSection";
import { ApiKeySection } from "./ApiKeySection";
import { DIET_PREFERENCES, CUISINE_PREFERENCES, ALLERGY_PREFERENCES } from "@/data/preferences";

interface PreferencesAccordionProps {
  preferences: string[];
  onPreferencesChange: (preferences: string[]) => void;
  isLoading: boolean;
  className?: string;
  // API Key props
  apiKey?: string;
  isApiKeyActive?: boolean;
  apiKeyLastUsedAt?: string;
  apiKeyUsageCount?: number;
  onApiKeyUpdate?: (apiKey: string) => Promise<void>;
  onApiKeyDelete?: () => Promise<void>;
}

export const PreferencesAccordion: React.FC<PreferencesAccordionProps> = ({
  preferences,
  onPreferencesChange,
  isLoading,
  className = "",
  apiKey,
  isApiKeyActive,
  apiKeyLastUsedAt,
  apiKeyUsageCount,
  onApiKeyUpdate,
  onApiKeyDelete,
}) => {
  // Count preferences by category
  const dietCount = preferences.filter((pref) => DIET_PREFERENCES.some((diet) => diet.id === pref)).length;

  const cuisineCount = preferences.filter((pref) => CUISINE_PREFERENCES.some((cuisine) => cuisine.id === pref)).length;

  const allergyCount = preferences.filter((pref) => ALLERGY_PREFERENCES.some((allergy) => allergy.id === pref)).length;

  const getTriggerContent = (title: string, count: number, icon: string) => (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-3">
        <span className="text-xl" role="img">
          {icon}
        </span>
        <span className="font-medium">{title}</span>
      </div>
      {count > 0 && (
        <Badge variant="secondary" className="ml-2">
          {count}
        </Badge>
      )}
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Preferencje żywieniowe</h2>
        <p className="text-sm text-muted-foreground">
          Wybierz swoje preferencje, aby otrzymywać spersonalizowane przepisy. Zmiany są automatycznie zapisywane.
        </p>
      </div>

      {/* Progress indicator */}
      {preferences.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Wybrano łącznie: <strong>{preferences.length}</strong> preferencji
        </div>
      )}

      {/* Accordion */}
      <Accordion type="multiple" defaultValue={["diet"]} className="space-y-2">
        {/* Diet Section */}
        <AccordionItem value="diet" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            {getTriggerContent("Dieta", dietCount, "🥬")}
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <DietSection
              preferences={preferences}
              onChange={onPreferencesChange}
              isExpanded={true}
              disabled={isLoading}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Cuisine Section */}
        <AccordionItem value="cuisine" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            {getTriggerContent("Kuchnia", cuisineCount, "🌍")}
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <CuisineSection
              preferences={preferences}
              onChange={onPreferencesChange}
              isExpanded={true}
              disabled={isLoading}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Allergies Section */}
        <AccordionItem value="allergies" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            {getTriggerContent("Alergie i ograniczenia", allergyCount, "⚠️")}
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <AllergiesSection
              preferences={preferences}
              onChange={onPreferencesChange}
              isExpanded={true}
              disabled={isLoading}
            />
          </AccordionContent>
        </AccordionItem>

        {/* API Key Section */}
        <AccordionItem value="api-key" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            {getTriggerContent("Klucz API", apiKey ? 1 : 0, "🔑")}
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <ApiKeySection
              currentApiKey={apiKey}
              isActive={isApiKeyActive}
              lastUsedAt={apiKeyLastUsedAt}
              usageCount={apiKeyUsageCount}
              onApiKeyUpdate={onApiKeyUpdate}
              onApiKeyDelete={onApiKeyDelete}
              isLoading={isLoading}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Help Section */}
      <div className="bg-muted/30 rounded-lg p-4 space-y-2">
        <h3 className="font-medium text-sm">Jak to działa?</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• AI uwzględni Twoje preferencje przy generowaniu przepisów</li>
          <li>• Możesz wybrać maksymalnie 20 preferencji</li>
          <li>• Zmiany są automatycznie zapisywane po 2 sekundach</li>
          <li>• Możesz zawsze wrócić i zmienić swoje preferencje</li>
        </ul>
      </div>
    </div>
  );
};
