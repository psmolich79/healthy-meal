# Plan implementacji widoku Profil Użytkownika (ProfileForm)

## 1. Przegląd
Widok profilu użytkownika to ekran umożliwiający użytkownikom zarządzanie swoimi preferencjami żywieniowymi, dietami i ograniczeniami pokarmowymi. Widok prezentuje preferencje w formie akordeonu z kategoriami, umożliwia łatwe dodawanie/usuwaanie preferencji i automatycznie zapisuje zmiany. Preferencje te są następnie automatycznie uwzględniane przy generowaniu przepisów przez AI.

## 2. Routing widoku
- **Główna ścieżka**: `/profile`
- **Alternatywne ścieżki**: `/preferences`, `/settings`
- **Metoda routingu**: Astro static routing z React component

## 3. Struktura komponentów
```
ProfileFormView
├── ProfileHeader
├── PreferencesAccordion
│   ├── DietSection
│   ├── CuisineSection
│   └── AllergiesSection
├── SaveButton
├── LoadingSpinner
└── ErrorBoundary
```

## 4. Szczegóły komponentów

### ProfileFormView
- **Opis komponentu**: Główny kontener widoku profilu, zarządza stanem preferencji i koordynuje zapisywanie zmian
- **Główne elementy**: Container div z flexbox layout, header, sekcja preferencji, przycisk zapisu
- **Komponenty Shadcn/ui**: `Card`, `CardHeader`, `CardContent`
- **Obsługiwane interakcje**: Inicjalizacja widoku, zarządzanie stanem preferencji, zapisywanie zmian
- **Obsługiwana walidacja**: Sprawdzenie uwierzytelnienia użytkownika, weryfikacja istnienia profilu
- **Typy**: `ProfileFormViewProps`, `ProfileFormState`
- **Propsy**: `initialPreferences?: string[]`, `className?: string`

### ProfileHeader
- **Opis komponentu**: Nagłówek profilu z tytułem, opisem i podstawowymi informacjami o użytkowniku
- **Główne elementy**: H1 title, description text, user info (opcjonalnie)
- **Komponenty Shadcn/ui**: `CardHeader`
- **Obsługiwane interakcje**: Wyświetlanie informacji o profilu
- **Obsługiwana walidacja**: Sprawdzenie czy profil istnieje
- **Typy**: `ProfileHeaderProps`
- **Propsy**: `userProfile?: ProfileDto`, `className?: string`

### PreferencesAccordion
- **Opis komponentu**: Główny komponent akordeonu zawierający wszystkie kategorie preferencji
- **Główne elementy**: Accordion container, sekcje kategorii, expand/collapse functionality
- **Komponenty Shadcn/ui**: `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`
- **Obsługiwane interakcje**: Rozwijanie/zwijanie sekcji, zarządzanie stanem akordeonu
- **Obsługiwana walidacja**: Sprawdzenie czy preferencje są załadowane
- **Typy**: `PreferencesAccordionProps`, `PreferencesState`
- **Propsy**: `preferences: string[]`, `onPreferencesChange: (preferences: string[]) => void`, `isLoading: boolean`

### DietSection
- **Opis komponentu**: Sekcja preferencji dietetycznych (wegetarianizm, weganizm, keto, itp.)
- **Główne elementy**: Section header, checkbox list, description text
- **Komponenty Shadcn/ui**: `Checkbox`, `Label`, `Badge`
- **Obsługiwane interakcje**: Zaznaczanie/odznaczanie preferencji, hover effects
- **Obsługiwana walidacja**: Sprawdzenie maksymalnej liczby preferencji (20)
- **Typy**: `DietSectionProps`, `DietPreference`
- **Propsy**: `preferences: string[]`, `onChange: (preferences: string[]) => void`, `isExpanded: boolean`

### CuisineSection
- **Opis komponentu**: Sekcja preferencji kulinarnych (kuchnia włoska, azjatycka, meksykańska, itp.)
- **Główne elementy**: Section header, checkbox list, cuisine icons
- **Komponenty Shadcn/ui**: `Checkbox`, `Label`, `Badge`
- **Obsługiwane interakcje**: Zaznaczanie/odznaczanie preferencji, hover effects
- **Obsługiwana walidacja**: Sprawdzenie maksymalnej liczby preferencji (20)
- **Typy**: `CuisineSectionProps`, `CuisinePreference`
- **Propsy**: `preferences: string[]`, `onChange: (preferences: string[]) => void`, `isExpanded: boolean`

### AllergiesSection
- **Opis komponentu**: Sekcja alergii i ograniczeń pokarmowych (gluten, laktoza, orzechy, itp.)
- **Główne elementy**: Section header, checkbox list, warning icons
- **Komponenty Shadcn/ui**: `Checkbox`, `Label`, `Badge`
- **Obsługiwane interakcje**: Zaznaczanie/odznaczanie alergii, hover effects
- **Obsługiwana walidacja**: Sprawdzenie maksymalnej liczby preferencji (20)
- **Typy**: `AllergiesSectionProps`, `AllergyPreference`
- **Propsy**: `preferences: string[]`, `onChange: (preferences: string[]) => void`, `isExpanded: boolean`

### SaveButton
- **Opis komponentu**: Przycisk zapisu preferencji z różnymi stanami (disabled, loading, success)
- **Główne elementy**: Button element, ikona, tekst, loading spinner
- **Komponenty Shadcn/ui**: `Button`
- **Obsługiwane interakcje**: Kliknięcie, stan disabled, stan loading
- **Obsługiwana walidacja**: 
  - Sprawdzenie czy preferencje się zmieniły
  - Sprawdzenie czy nie ma błędów walidacji
  - Sprawdzenie czy nie jest w trakcie zapisywania
- **Typy**: `SaveButtonProps`
- **Propsy**: `onClick: () => void`, `disabled: boolean`, `isLoading: boolean`, `hasChanges: boolean`

### LoadingSpinner
- **Opis komponentu**: Wskaźnik ładowania wyświetlany podczas zapisywania preferencji
- **Główne elementy**: Spinner animation, tekst statusu
- **Komponenty Shadcn/ui**: `Spinner` (custom)
- **Obsługiwane interakcje**: Animacja, aktualizacja statusu
- **Obsługiwana walidacja**: Sprawdzenie czy zapisywanie jest w toku
- **Typy**: `LoadingSpinnerProps`
- **Propsy**: `isVisible: boolean`, `status?: string`, `size?: 'sm' | 'md' | 'lg'`

## 5. Typy

### Typy komponentów
```typescript
interface ProfileFormViewProps {
  initialPreferences?: string[];
  className?: string;
}

interface ProfileHeaderProps {
  userProfile?: ProfileDto;
  className?: string;
}

interface PreferencesAccordionProps {
  preferences: string[];
  onPreferencesChange: (preferences: string[]) => void;
  isLoading: boolean;
}

interface DietSectionProps {
  preferences: string[];
  onChange: (preferences: string[]) => void;
  isExpanded: boolean;
}

interface CuisineSectionProps {
  preferences: string[];
  onChange: (preferences: string[]) => void;
  isExpanded: boolean;
}

interface AllergiesSectionProps {
  preferences: string[];
  onChange: (preferences: string[]) => void;
  isExpanded: boolean;
}

interface SaveButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
  hasChanges: boolean;
}

interface LoadingSpinnerProps {
  isVisible: boolean;
  status?: string;
  size?: 'sm' | 'md' | 'lg';
}
```

### Typy preferencji
```typescript
interface DietPreference {
  id: string;
  label: string;
  description: string;
  category: 'diet';
  icon: string;
}

interface CuisinePreference {
  id: string;
  label: string;
  description: string;
  category: 'cuisine';
  icon: string;
  flag?: string;
}

interface AllergyPreference {
  id: string;
  label: string;
  description: string;
  category: 'allergy';
  icon: string;
  severity: 'mild' | 'moderate' | 'severe';
}

type Preference = DietPreference | CuisinePreference | AllergyPreference;
```

### Typy stanu
```typescript
interface ProfileFormState {
  preferences: string[];
  originalPreferences: string[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  accordionState: AccordionState;
}

interface AccordionState {
  diet: boolean;
  cuisine: boolean;
  allergies: boolean;
}

interface PreferencesState {
  preferences: string[];
  hasChanges: boolean;
  isValid: boolean;
}
```

### Typy walidacji
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface PreferenceValidation {
  maxPreferences: boolean;
  conflictingPreferences: boolean;
  requiredPreferences: boolean;
}
```

## 6. Zarządzanie stanem

### Stan lokalny komponentu
- `preferences` - aktualne preferencje użytkownika
- `originalPreferences` - oryginalne preferencje (do porównania zmian)
- `isLoading` - stan ładowania profilu
- `isSaving` - stan zapisywania zmian
- `error` - błędy walidacji lub API
- `accordionState` - stan rozwinięcia sekcji akordeonu

### Custom Hook: useProfileForm
```typescript
const useProfileForm = () => {
  const [state, setState] = useState<ProfileFormState>({
    preferences: [],
    originalPreferences: [],
    isLoading: false,
    isSaving: false,
    error: null,
    accordionState: {
      diet: true,
      cuisine: false,
      allergies: false
    }
  });

  const updatePreferences = useCallback((newPreferences: string[]) => {
    setState(prev => ({
      ...prev,
      preferences: newPreferences
    }));
  }, []);

  const savePreferences = useCallback(async () => {
    // Logika zapisywania preferencji
  }, [state.preferences]);

  const toggleAccordionSection = useCallback((section: keyof AccordionState) => {
    setState(prev => ({
      ...prev,
      accordionState: {
        ...prev.accordionState,
        [section]: !prev.accordionState[section]
      }
    }));
  }, []);

  const hasChanges = useMemo(() => {
    return JSON.stringify(state.preferences) !== JSON.stringify(state.originalPreferences);
  }, [state.preferences, state.originalPreferences]);

  return {
    ...state,
    updatePreferences,
    savePreferences,
    toggleAccordionSection,
    hasChanges
  };
};
```

### Stan globalny (Context)
- `userProfile` - profil użytkownika z preferencjami
- `authState` - stan uwierzytelnienia

## 7. Integracja API

### Endpoint: GET /api/profiles/me
- **Typ żądania**: Brak (GET request)
- **Typ odpowiedzi**: `ProfileDto`
- **Autoryzacja**: Wymagany Bearer token
- **Walidacja**: Użytkownik musi być zalogowany

### Endpoint: PUT /api/profiles/me
- **Typ żądania**: `UpdateProfileCommand`
- **Typ odpowiedzi**: `UpdatedProfileDto`
- **Autoryzacja**: Wymagany Bearer token
- **Walidacja**: Preferencje maksymalnie 20 elementów

### Implementacja wywołań API
```typescript
// Pobieranie profilu
const fetchProfile = async (): Promise<ProfileDto> => {
  const response = await fetch('/api/profiles/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${supabase.auth.getSession()}`
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Aktualizacja preferencji
const updateProfile = async (preferences: string[]): Promise<UpdatedProfileDto> => {
  const response = await fetch('/api/profiles/me', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabase.auth.getSession()}`
    },
    body: JSON.stringify({ preferences })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
```

### Obsługa odpowiedzi
- **Sukces (200)**: Aktualizacja stanu lokalnego, wyświetlenie komunikatu o sukcesie
- **Błąd (400)**: Walidacja nieudana, wyświetlenie błędu
- **Błąd (401)**: Brak autoryzacji, przekierowanie do logowania
- **Błąd (500)**: Błąd serwera, wyświetlenie komunikatu o błędzie

## 8. Interakcje użytkownika

### Przeglądanie preferencji
1. Użytkownik otwiera ekran profilu
2. Preferencje są ładowane z API
3. Akordeon wyświetla kategorie z aktualnymi preferencjami
4. Użytkownik może rozwinąć/zwijać sekcje

### Edycja preferencji
1. Użytkownik zaznacza/odznacza checkboxy w sekcjach
2. Zmiany są śledzone w stanie lokalnym
3. Przycisk "Zapisz" staje się aktywny
4. Walidacja sprawdza poprawność zmian

### Zapisywanie zmian
1. Użytkownik klika "Zapisz"
2. LoadingSpinner się wyświetla
3. Preferencje są wysyłane do API
4. Po sukcesie wyświetla się komunikat potwierdzenia

### Nawigacja w akordeonie
1. Użytkownik klika nagłówek sekcji
2. Sekcja się rozwija/zwija
3. Stan akordeonu jest aktualizowany
4. Animacja smooth expand/collapse

## 9. Warunki i walidacja

### Warunki wymagane przez API
- **Uwierzytelnienie**: Użytkownik musi być zalogowany (Bearer token)
- **Profil**: Użytkownik musi mieć zdefiniowany profil
- **Preferencje**: Maksymalnie 20 elementów w tablicy

### Walidacja na poziomie komponentów
- **PreferencesAccordion**: 
  - Sprawdzenie czy preferencje są załadowane
  - Sprawdzenie maksymalnej liczby preferencji
- **SaveButton**: 
  - Sprawdzenie czy preferencje się zmieniły
  - Sprawdzenie czy nie ma błędów walidacji
  - Sprawdzenie czy nie jest w trakcie zapisywania
- **ProfileFormView**: 
  - Sprawdzenie uwierzytelnienia użytkownika
  - Sprawdzenie istnienia profilu

### Wpływ na stan interfejsu
- **Błędy walidacji**: Wyświetlenie komunikatów błędów, dezaktywacja przycisku zapisu
- **Stan ładowania**: Wyświetlenie spinnera, dezaktywacja formularza
- **Brak uwierzytelnienia**: Przekierowanie do logowania
- **Brak profilu**: Przekierowanie do tworzenia profilu
- **Zmiany**: Aktywacja przycisku zapisu

## 10. Obsługa błędów

### Typy błędów
1. **Błędy walidacji (400)**: Nieprawidłowe dane wejściowe
2. **Błędy autoryzacji (401)**: Brak lub nieprawidłowy token
3. **Błędy profilu (404)**: Profil użytkownika nie został znaleziony
4. **Błędy serwera (500)**: Wewnętrzne błędy serwera
5. **Błędy sieci**: Problemy z połączeniem

### Strategie obsługi błędów
- **Inline errors**: Błędy wyświetlane w formularzu
- **Toast notifications**: Krótkie komunikaty o błędach
- **Error boundaries**: Obsługa nieoczekiwanych błędów
- **Retry logic**: Automatyczne ponowienie dla błędów sieci
- **Fallback UI**: Alternatywny interfejs przy błędach

### Komunikaty błędów
- **Walidacja**: "Maksymalnie 20 preferencji"
- **Autoryzacja**: "Musisz być zalogowany, aby edytować profil"
- **Profil nie istnieje**: "Twój profil nie został znaleziony"
- **Serwer**: "Wystąpił błąd serwera. Spróbuj ponownie później"
- **Sieć**: "Problem z połączeniem. Sprawdź swoje połączenie internetowe"

## 11. Kroki implementacji

### 1. Przygotowanie struktury plików
```
src/
├── pages/
│   └── profile.astro
├── components/
│   └── profile/
│       ├── ProfileFormView.tsx
│       ├── ProfileHeader.tsx
│       ├── PreferencesAccordion.tsx
│       ├── DietSection.tsx
│       ├── CuisineSection.tsx
│       ├── AllergiesSection.tsx
│       ├── SaveButton.tsx
│       └── LoadingSpinner.tsx
├── hooks/
│   └── useProfileForm.ts
└── data/
    └── preferences.ts
```

### 2. Implementacja typów i interfejsów
- Stworzenie wszystkich typów komponentów
- Definicja typów preferencji
- Implementacja typów stanu i walidacji

### 3. Implementacja custom hooka
- Stworzenie `useProfileForm`
- Implementacja logiki zarządzania preferencjami
- Obsługa stanu i błędów

### 4. Implementacja komponentów UI
- Stworzenie podstawowych komponentów
- Implementacja logiki akordeonu
- Dodanie obsługi zdarzeń

### 5. Integracja z API
- Implementacja wywołań `/api/profiles/me`
- Obsługa odpowiedzi i błędów
- Dodanie autoryzacji

### 6. Implementacja walidacji
- Walidacja preferencji
- Sprawdzanie konfliktów
- Obsługa błędów walidacji

### 7. Implementacja akordeonu
- Logika expand/collapse
- Zarządzanie stanem sekcji
- Animacje

### 8. Implementacja obsługi błędów
- Error boundaries
- Toast notifications
- Inline error messages

### 9. Implementacja auto-save
- Debounced save
- Wskaźnik zmian
- Potwierdzenie zapisu

### 10. Testowanie i optymalizacja
- Testy jednostkowe komponentów
- Testy integracyjne
- Optymalizacja wydajności
- Responsive design

### 11. Integracja z routingiem
- Stworzenie pliku `profile.astro`
- Integracja z layoutem aplikacji
- Dodanie meta tagów i SEO

### 12. Finalizacja
- Code review
- Dokumentacja komponentów
- Testy end-to-end
- Deployment

## 5. Komponenty Shadcn/ui

### Komponenty layoutu
- **Card**: Główny kontener profilu użytkownika
- **CardHeader**: Nagłówek profilu
- **CardContent**: Zawartość profilu z preferencjami

### Komponenty akordeonu
- **Accordion**: Główny kontener akordeonu preferencji
- **AccordionItem**: Pojedyncza sekcja preferencji
- **AccordionTrigger**: Nagłówek sekcji z przyciskiem rozwijania
- **AccordionContent**: Zawartość sekcji preferencji

### Komponenty formularzy
- **Checkbox**: Pola wyboru preferencji
- **Label**: Etykiety preferencji
- **Button**: Przycisk zapisu

### Komponenty pomocnicze
- **Badge**: Tagi preferencji z kolorami
- **Spinner**: Wskaźnik ładowania (custom)
