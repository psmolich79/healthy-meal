/**
 * Configuration constants for profile components
 */

export const PROFILE_CONFIG = {
  // Maximum number of preferences a user can have
  MAX_PREFERENCES: 20,

  // Maximum preferences per category (recommended)
  MAX_PREFERENCES_PER_CATEGORY: {
    diet: 4,
    cuisine: 6,
    allergies: 10,
  },

  // Auto-save delay in milliseconds
  AUTO_SAVE_DELAY: 2000,

  // Session refresh buffer time in minutes
  SESSION_REFRESH_BUFFER: 5,

  // Success message display time in milliseconds
  SUCCESS_MESSAGE_DISPLAY_TIME: 3000,

  // Error message display time in milliseconds
  ERROR_MESSAGE_DISPLAY_TIME: 5000,

  // Validation warning thresholds
  VALIDATION_THRESHOLDS: {
    tooManyDiets: 4,
    tooManyCuisines: 6,
    tooManyAllergies: 8,
  },

  // API endpoints
  API_ENDPOINTS: {
    profile: "/api/profiles/me",
    preferences: "/api/profiles/me/preferences",
  },

  // Default accordion state
  DEFAULT_ACCORDION_STATE: {
    diet: true,
    cuisine: false,
    allergies: false,
  },

  // Local storage keys
  STORAGE_KEYS: {
    userPreferences: "healthy-meal-user-preferences",
    accordionState: "healthy-meal-accordion-state",
    lastSaved: "healthy-meal-last-saved",
  },
} as const;

export const PREFERENCE_CATEGORIES = {
  DIET: "diet",
  CUISINE: "cuisine",
  ALLERGY: "allergy",
} as const;

export const ALLERGY_SEVERITY_LEVELS = {
  MILD: "mild",
  MODERATE: "moderate",
  SEVERE: "severe",
} as const;

export const PROFILE_STATUSES = {
  ACTIVE: "active",
  PENDING_DELETION: "pending_deletion",
  DELETED: "deleted",
} as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Musisz być zalogowany, aby edytować profil",
  PROFILE_NOT_FOUND: "Twój profil nie został znaleziony",
  SESSION_EXPIRED: "Sesja wygasła. Zaloguj się ponownie.",
  VALIDATION_ERROR: "Błąd walidacji preferencji",
  NETWORK_ERROR: "Problem z połączeniem. Sprawdź swoje połączenie internetowe.",
  SERVER_ERROR: "Wystąpił błąd serwera. Spróbuj ponownie później.",
  UNKNOWN_ERROR: "Wystąpił nieoczekiwany błąd",
} as const;

export const SUCCESS_MESSAGES = {
  PREFERENCES_SAVED: "Preferencje zostały pomyślnie zapisane!",
  PROFILE_LOADED: "Profil został załadowany",
  CHANGES_DISCARDED: "Zmiany zostały odrzucone",
} as const;

export const VALIDATION_MESSAGES = {
  MAX_PREFERENCES: "Maksymalnie 20 preferencji",
  CONFLICTING_DIETS: "Dieta wegetariańska może kolidować z dietą paleo/keto",
  CONFLICTING_VEGAN: "Dieta wegańska może kolidować z dietą paleo/keto",
  GLUTEN_ALLERGY_WARNING: "Alergia na gluten - rozważ dietę bezglutenową",
  LACTOSE_ALLERGY_WARNING: "Nietolerancja laktozy - rozważ dietę beznabiałową",
  SEVERE_ALLERGY_WARNING: "Uwaga: Masz {count} ciężką alergię pokarmową. Zawsze konsultuj się z lekarzem.",
  MISSING_DIET_PREFERENCES: "Nie wybrano żadnych preferencji dietetycznych",
  MISSING_CUISINE_PREFERENCES: "Nie wybrano żadnych preferencji kulinarnych",
  TOO_MANY_DIETS: "Wybrano wiele diet - niektóre mogą się wykluczać",
  TOO_MANY_CUISINES: "Wybrano wiele kuchni - przepisy mogą być bardzo różnorodne",
} as const;
