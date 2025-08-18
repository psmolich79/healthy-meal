import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ProfileHeader } from "./ProfileHeader";
import { PreferencesAccordion } from "./PreferencesAccordion";
import { SaveButton } from "./SaveButton";
import { useProfileForm } from "@/hooks/useProfileForm";
import { ToastProvider } from "@/components/ui/toast";

interface ProfileFormViewProps {
  initialPreferences?: string[];
  className?: string;
}

const ProfileFormViewInner: React.FC<ProfileFormViewProps> = ({ initialPreferences = [], className = "" }) => {
  const {
    preferences,
    profile,
    isLoading,
    isSaving,
    error,
    hasChanges,
    isValid,
    preferencesCount,
    maxPreferences,
    updatePreferences,
    savePreferences,
    clearError,
    // API Key state
    apiKey,
    isApiKeyActive,
    apiKeyLastUsedAt,
    apiKeyUsageCount,
    updateApiKey,
    deleteApiKey,
  } = useProfileForm();

  const handleSaveClick = async () => {
    await savePreferences();
  };

  // Show loading spinner while loading profile
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner isVisible={true} status="Ładowanie profilu..." size="lg" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`max-w-4xl mx-auto p-6 space-y-6 ${className}`}>
        {/* Main Profile Card */}
        <Card>
          <ProfileHeader userProfile={profile} />

          <CardContent className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{error}</span>
                  <button onClick={clearError} className="text-xs underline hover:no-underline">
                    Zamknij
                  </button>
                </AlertDescription>
              </Alert>
            )}

            {/* Success message for auto-save */}
            {!hasChanges && preferences.length > 0 && !error && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Preferencje zostały automatycznie zapisane</AlertDescription>
              </Alert>
            )}

            {/* Preferences limit warning */}
            {preferencesCount > maxPreferences * 0.8 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Zbliżasz się do limitu preferencji ({preferencesCount}/{maxPreferences})
                </AlertDescription>
              </Alert>
            )}

            {/* Preferences Accordion */}
            <PreferencesAccordion
              preferences={preferences}
              onPreferencesChange={updatePreferences}
              isLoading={isSaving}
              apiKey={apiKey}
              isApiKeyActive={isApiKeyActive}
              apiKeyLastUsedAt={apiKeyLastUsedAt}
              apiKeyUsageCount={apiKeyUsageCount}
              onApiKeyUpdate={updateApiKey}
              onApiKeyDelete={deleteApiKey}
            />

            {/* Save Button */}
            <div className="flex justify-center pt-4">
              <SaveButton onClick={handleSaveClick} disabled={!isValid} isLoading={isSaving} hasChanges={hasChanges} />
            </div>

            {/* Footer Info */}
            <div className="text-center space-y-2 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Twoje preferencje są wykorzystywane do personalizacji przepisów
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
                <span>
                  Preferencje: {preferencesCount}/{maxPreferences}
                </span>
                <span>•</span>
                <span>Auto-zapis: {hasChanges ? "Oczekuje..." : "Aktualny"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started Card */}
        {preferences.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Skonfiguruj swoje preferencje</h3>
                <p className="text-sm text-muted-foreground">
                  Wybierz swoje preferencje żywieniowe, aby AI mogło generować spersonalizowane przepisy dopasowane do
                  Twoich potrzeb.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground pt-4">
                <div className="space-y-1">
                  <p className="font-medium">🥬 Dieta</p>
                  <p>Wegetariańska, wegańska, keto...</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">🌍 Kuchnia</p>
                  <p>Włoska, azjatycka, polska...</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">⚠️ Alergie</p>
                  <p>Gluten, laktoza, orzechy...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ErrorBoundary>
  );
};

// Main export component with ToastProvider
export const ProfileFormView: React.FC<ProfileFormViewProps> = (props) => {
  return (
    <ToastProvider>
      <ProfileFormViewInner {...props} />
    </ToastProvider>
  );
};
