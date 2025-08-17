# Plan implementacji widoku Szczegóły Przepisu (RecipeDetails)

## 1. Przegląd
Widok szczegółów przepisu to ekran prezentujący pełne informacje o wygenerowanym przepisie kulinarnym, w tym składniki, listę zakupową, instrukcje przygotowania oraz funkcje interaktywne takie jak ocena, zapisywanie i regeneracja. Widok zawiera disclaimer o AI-generowanych przepisach i umożliwia użytkownikom zarządzanie swoimi przepisami.

## 2. Routing widoku
- **Główna ścieżka**: `/recipes/:id`
- **Parametr**: `id` - unikalny identyfikator przepisu
- **Metoda routingu**: Astro dynamic routing z React component

## 3. Struktura komponentów
```
RecipeDetailsView
├── RecipeHeader
├── RecipeContent
│   ├── IngredientsSection
│   ├── ShoppingListSection
│   └── InstructionsSection
├── RecipeActions
│   ├── SaveButton
│   ├── RatingControls
│   └── RegenerateButton
├── AIDisclaimer
├── LoadingSpinner
└── ErrorBoundary
```

## 4. Szczegóły komponentów

### RecipeDetailsView
- **Opis komponentu**: Główny kontener widoku szczegółów przepisu, zarządza stanem i koordynuje interakcje
- **Główne elementy**: Container div z flexbox layout, header, sekcje treści, akcje
- **Komponenty Shadcn/ui**: `Card`, `CardContent`
- **Obsługiwane interakcje**: Inicjalizacja widoku, zarządzanie stanem przepisu, obsługa błędów
- **Obsługiwana walidacja**: Sprawdzenie uwierzytelnienia użytkownika, weryfikacja istnienia przepisu
- **Typy**: `RecipeDetailsViewProps`, `RecipeDetailsState`
- **Propsy**: `recipeId: string`, `className?: string`

### RecipeHeader
- **Opis komponentu**: Nagłówek przepisu z tytułem, datą utworzenia i podstawowymi metadanymi
- **Główne elementy**: H1 title, creation date, user query, preferences applied
- **Komponenty Shadcn/ui**: `CardHeader`
- **Obsługiwane interakcje**: Wyświetlanie informacji o przepisie
- **Obsługiwana walidacja**: Sprawdzenie czy przepis ma wymagane pola
- **Typy**: `RecipeHeaderProps`
- **Propsy**: `recipe: RecipeDetailsDto`, `className?: string`

### RecipeContent
- **Opis komponentu**: Kontener zawartości przepisu z sekcjami składników, listy zakupowej i instrukcji
- **Główne elementy**: Content container, sekcje treści, responsive layout
- **Komponenty Shadcn/ui**: `CardContent`, `Separator`
- **Obsługiwane interakcje**: Responsive behavior, scroll management
- **Obsługiwana walidacja**: Sprawdzenie czy wszystkie sekcje mają treść
- **Typy**: `RecipeContentProps`
- **Propsy**: `recipe: RecipeDetailsDto`, `className?: string`

### IngredientsSection
- **Opis komponentu**: Sekcja wyświetlająca listę składników potrzebnych do przygotowania przepisu
- **Główne elementy**: Section header, ingredients list, quantities, units
- **Komponenty Shadcn/ui**: `Card`, `CardHeader`, `CardContent`, `List`, `ListItem`
- **Obsługiwane interakcje**: Wyświetlanie składników, hover effects
- **Obsługiwana walidacja**: Sprawdzenie czy składniki istnieją
- **Typy**: `IngredientsSectionProps`
- **Propsy**: `ingredients: string`, `className?: string`

### ShoppingListSection
- **Opis komponentu**: Sekcja wyświetlająca listę zakupową zorganizowaną według kategorii
- **Główne elementy**: Section header, categorized items, checkboxes (opcjonalnie)
- **Komponenty Shadcn/ui**: `Card`, `CardHeader`, `CardContent`, `Checkbox`, `Label`
- **Obsługiwane interakcje**: Wyświetlanie listy zakupowej, organizacja według kategorii
- **Obsługiwana walidacja**: Sprawdzenie czy lista zakupowa istnieje
- **Typy**: `ShoppingListSectionProps`
- **Propsy**: `shoppingList: string`, `className?: string`

### InstructionsSection
- **Opis komponentu**: Sekcja wyświetlająca instrukcje przygotowania przepisu w formie kroków
- **Główne elementy**: Section header, numbered steps, cooking tips
- **Komponenty Shadcn/ui**: `Card`, `CardHeader`, `CardContent`, `List`, `ListItem`
- **Obsługiwane interakcje**: Wyświetlanie instrukcji, numeracja kroków
- **Obsługiwana walidacja**: Sprawdzenie czy instrukcje istnieją
- **Typy**: `InstructionsSectionProps`
- **Propsy**: `instructions: string`, `className?: string`

### RecipeActions
- **Opis komponentu**: Kontener akcji dostępnych dla przepisu (zapisz, ocena, regeneruj)
- **Główne elementy**: Actions container, buttons, spacing
- **Komponenty Shadcn/ui**: `Button`, `ButtonGroup`
- **Obsługiwane interakcje**: Grupowanie akcji, responsive layout
- **Obsługiwana walidacja**: Sprawdzenie uprawnień użytkownika
- **Typy**: `RecipeActionsProps`
- **Propsy**: `recipe: RecipeDetailsDto`, `onSave: () => void`, `onRatingChange: (rating: RatingType) => void`, `onRegenerate: () => void`

### SaveButton
- **Opis komponentu**: Przycisk zapisu przepisu z różnymi stanami (unsaved, saved, loading)
- **Główne elementy**: Button element, ikona, tekst, loading state
- **Komponenty Shadcn/ui**: `Button`
- **Obsługiwane interakcje**: Kliknięcie, toggle saved state, loading
- **Obsługiwana walidacja**: 
  - Sprawdzenie czy użytkownik jest zalogowany
  - Sprawdzenie czy przepis nie jest już zapisany
- **Typy**: `SaveButtonProps`
- **Propsy**: `isSaved: boolean`, `onClick: () => void`, `isLoading: boolean`, `disabled?: boolean`

### RatingControls
- **Opis komponentu**: Kontrolki oceny przepisu (kciuk w górę/dół) z możliwością zmiany
- **Główne elementy**: Thumbs up/down buttons, current rating display, change functionality
- **Komponenty Shadcn/ui**: `Button`, `ButtonGroup`
- **Obsługiwane interakcje**: Kliknięcie w ocenę, zmiana oceny, usuwanie oceny
- **Obsługiwana walidacja**: 
  - Sprawdzenie czy użytkownik może oceniać przepis
  - Sprawdzenie czy przepis należy do użytkownika
- **Typy**: `RatingControlsProps`
- **Propsy**: `currentRating: RatingType | null`, `onRatingChange: (rating: RatingType) => void`, `onRatingRemove: () => void`, `disabled?: boolean`

### RegenerateButton
- **Opis komponentu**: Przycisk regeneracji przepisu dostępny po negatywnej ocenie
- **Główne elementy**: Button element, ikona, tekst, loading state
- **Komponenty Shadcn/ui**: `Button`
- **Obsługiwane interakcje**: Kliknięcie, inicjacja regeneracji, loading
- **Obsługiwana walidacja**: 
  - Sprawdzenie czy przepis ma negatywną ocenę
  - Sprawdzenie czy użytkownik może regenerować przepis
- **Typy**: `RegenerateButtonProps`
- **Propsy**: `isVisible: boolean`, `onClick: () => void`, `isLoading: boolean`, `disabled?: boolean`

### AIDisclaimer
- **Opis komponentu**: Ostrzeżenie informujące, że przepis został wygenerowany przez AI
- **Główne elementy**: Warning container, icon, text, styling
- **Komponenty Shadcn/ui**: `Alert`, `AlertTriangle`
- **Obsługiwane interakcje**: Stałe wyświetlanie, styling
- **Obsługiwana walidacja**: Brak (komponent statyczny)
- **Typy**: `AIDisclaimerProps`
- **Propsy**: `className?: string`

### LoadingSpinner
- **Opis komponentu**: Wskaźnik ładowania wyświetlany podczas ładowania przepisu
- **Główne elementy**: Spinner animation, tekst statusu
- **Komponenty Shadcn/ui**: `Spinner` (custom)
- **Obsługiwane interakcje**: Animacja, aktualizacja statusu
- **Obsługiwana walidacja**: Sprawdzenie czy ładowanie jest w toku
- **Typy**: `LoadingSpinnerProps`
- **Propsy**: `isVisible: boolean`, `status?: string`, `size?: 'sm' | 'md' | 'lg'`

## 5. Komponenty Shadcn/ui

### Komponenty layoutu
- **Card**: Główny kontener szczegółów przepisu
- **CardHeader**: Nagłówek przepisu
- **CardContent**: Zawartość przepisu z sekcjami

### Komponenty sekcji
- **Card**: Kontenery dla poszczególnych sekcji (składniki, lista zakupowa, instrukcje)
- **CardHeader**: Nagłówki sekcji
- **CardContent**: Zawartość sekcji
- **Separator**: Separatory między sekcjami

### Komponenty list
- **List**: Listy składników i instrukcji
- **ListItem**: Pojedyncze elementy listy

### Komponenty formularzy
- **Checkbox**: Checkboxy dla listy zakupowej (opcjonalnie)
- **Label**: Etykiety checkboxów

### Komponenty interaktywne
- **Button**: Przyciski akcji (zapisz, ocena, regeneruj)
- **ButtonGroup**: Grupowanie przycisków oceny

### Komponenty pomocnicze
- **Alert**: Ostrzeżenie o AI-generowanym przepisie
- **AlertTriangle**: Ikona ostrzeżenia
- **Spinner**: Wskaźnik ładowania (custom)

## 6. Typy

### Typy komponentów
```typescript
interface RecipeDetailsViewProps {
  recipeId: string;
  className?: string;
}

interface RecipeHeaderProps {
  recipe: RecipeDetailsDto;
  className?: string;
}

interface RecipeContentProps {
  recipe: RecipeDetailsDto;
  className?: string;
}

interface IngredientsSectionProps {
  ingredients: string;
  className?: string;
}

interface ShoppingListSectionProps {
  shoppingList: string;
  className?: string;
}

interface InstructionsSectionProps {
  instructions: string;
  className?: string;
}

interface RecipeActionsProps {
  recipe: RecipeDetailsDto;
  onSave: () => void;
  onRatingChange: (rating: RatingType) => void;
  onRegenerate: () => void;
}

interface SaveButtonProps {
  isSaved: boolean;
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

interface RatingControlsProps {
  currentRating: RatingType | null;
  onRatingChange: (rating: RatingType) => void;
  onRatingRemove: () => void;
  disabled?: boolean;
}

interface RegenerateButtonProps {
  isVisible: boolean;
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

interface AIDisclaimerProps {
  className?: string;
}

interface LoadingSpinnerProps {
  isVisible: boolean;
  status?: string;
  size?: 'sm' | 'md' | 'lg';
}
```

### Typy stanu
```typescript
interface RecipeDetailsState {
  recipe: RecipeDetailsDto | null;
  isLoading: boolean;
  isSaving: boolean;
  isRating: boolean;
  isRegenerating: boolean;
  error: string | null;
  saveStatus: 'unsaved' | 'saving' | 'saved' | 'error';
}

interface RecipeActionsState {
  canSave: boolean;
  canRate: boolean;
  canRegenerate: boolean;
  currentRating: RatingType | null;
  isSaved: boolean;
}
```

### Typy akcji
```typescript
interface RecipeAction {
  type: 'save' | 'rate' | 'regenerate';
  payload?: any;
  timestamp: Date;
}

interface SaveAction {
  type: 'save';
  recipeId: string;
  userId: string;
}

interface RatingAction {
  type: 'rate';
  recipeId: string;
  userId: string;
  rating: RatingType;
}

interface RegenerateAction {
  type: 'regenerate';
  originalRecipeId: string;
  userId: string;
}
```

## 6. Zarządzanie stanem

### Stan lokalny komponentu
- `recipe` - aktualny przepis
- `isLoading` - stan ładowania przepisu
- `isSaving` - stan zapisywania
- `isRating` - stan oceniania
- `isRegenerating` - stan regeneracji
- `error` - błędy walidacji lub API
- `saveStatus` - status operacji zapisu

### Custom Hook: useRecipeDetails
```typescript
const useRecipeDetails = (recipeId: string) => {
  const [state, setState] = useState<RecipeDetailsState>({
    recipe: null,
    isLoading: false,
    isSaving: false,
    isRating: false,
    isRegenerating: false,
    error: null,
    saveStatus: 'unsaved'
  });

  const fetchRecipe = useCallback(async () => {
    // Logika pobierania przepisu
  }, [recipeId]);

  const saveRecipe = useCallback(async () => {
    // Logika zapisywania przepisu
  }, [state.recipe]);

  const rateRecipe = useCallback(async (rating: RatingType) => {
    // Logika oceniania przepisu
  }, [state.recipe]);

  const regenerateRecipe = useCallback(async () => {
    // Logika regeneracji przepisu
  }, [state.recipe]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetchRecipe,
    saveRecipe,
    rateRecipe,
    regenerateRecipe,
    clearError
  };
};
```

### Stan globalny (Context)
- `userProfile` - profil użytkownika z preferencjami
- `authState` - stan uwierzytelnienia
- `savedRecipes` - lista zapisanych przepisów

## 7. Integracja API

### Endpoint: GET /api/recipes/{id}
- **Typ żądania**: Brak (GET request z parametrem path)
- **Typ odpowiedzi**: `RecipeDetailsDto`
- **Autoryzacja**: Wymagany Bearer token
- **Walidacja**: Użytkownik musi być zalogowany, przepis musi istnieć

### Endpoint: POST /api/recipes/{id}/rating
- **Typ żądania**: `UpsertRatingCommand`
- **Typ odpowiedzi**: `UpsertRatingDto`
- **Autoryzacja**: Wymagany Bearer token
- **Walidacja**: Użytkownik może oceniać tylko swoje przepisy

### Endpoint: POST /api/recipes/{id}/regenerate
- **Typ żądania**: Brak (POST request)
- **Typ odpowiedzi**: `RegeneratedRecipeDto`
- **Autoryzacja**: Wymagany Bearer token
- **Walidacja**: Użytkownik może regenerować tylko swoje przepisy

### Implementacja wywołań API
```typescript
// Pobieranie przepisu
const fetchRecipe = async (id: string): Promise<RecipeDetailsDto> => {
  const response = await fetch(`/api/recipes/${id}`, {
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

// Ocena przepisu
const rateRecipe = async (id: string, rating: RatingType): Promise<UpsertRatingDto> => {
  const response = await fetch(`/api/recipes/${id}/rating`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabase.auth.getSession()}`
    },
    body: JSON.stringify({ rating })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Regeneracja przepisu
const regenerateRecipe = async (id: string): Promise<RegeneratedRecipeDto> => {
  const response = await fetch(`/api/recipes/${id}/regenerate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabase.auth.getSession()}`
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
```

### Obsługa odpowiedzi
- **Sukces (200/201)**: Aktualizacja stanu lokalnego, wyświetlenie komunikatu o sukcesie
- **Błąd (400)**: Walidacja nieudana, wyświetlenie błędu
- **Błąd (401)**: Brak autoryzacji, przekierowanie do logowania
- **Błąd (403)**: Brak uprawnień, wyświetlenie komunikatu o błędzie
- **Błąd (404)**: Przepis nie istnieje, wyświetlenie komunikatu o błędzie
- **Błąd (500)**: Błąd serwera, wyświetlenie komunikatu o błędzie

## 8. Interakcje użytkownika

### Przeglądanie przepisu
1. Użytkownik otwiera szczegóły przepisu
2. Przepis jest ładowany z API
3. Wyświetlane są wszystkie sekcje (składniki, lista zakupowa, instrukcje)
4. Użytkownik może przewijać i czytać treść

### Zapisywanie przepisu
1. Użytkownik klika przycisk "Zapisz"
2. LoadingSpinner się wyświetla
3. Przepis jest zapisywany w bazie danych
4. Przycisk zmienia się na "Zapisano"
5. Toast notification potwierdza zapis

### Ocena przepisu
1. Użytkownik klika kciuk w górę lub w dół
2. Rating jest wysyłany do API
3. Interfejs aktualizuje się z nową oceną
4. Po negatywnej ocenie pojawia się przycisk regeneracji

### Regeneracja przepisu
1. Użytkownik klika "Wygeneruj ponownie"
2. LoadingSpinner się wyświetla
3. Nowy przepis jest generowany przez AI
4. Użytkownik jest przekierowany do nowego przepisu

## 9. Warunki i walidacja

### Warunki wymagane przez API
- **Uwierzytelnienie**: Użytkownik musi być zalogowany (Bearer token)
- **Własność przepisu**: Użytkownik może modyfikować tylko swoje przepisy
- **Istnienie przepisu**: Przepis musi istnieć w bazie danych
- **Uprawnienia**: Użytkownik musi mieć odpowiednie uprawnienia do operacji

### Walidacja na poziomie komponentów
- **RecipeDetailsView**: 
  - Sprawdzenie uwierzytelnienia użytkownika
  - Sprawdzenie istnienia przepisu
  - Sprawdzenie uprawnień do modyfikacji
- **SaveButton**: 
  - Sprawdzenie czy użytkownik jest zalogowany
  - Sprawdzenie czy przepis nie jest już zapisany
- **RatingControls**: 
  - Sprawdzenie czy użytkownik może oceniać przepis
  - Sprawdzenie czy przepis należy do użytkownika
- **RegenerateButton**: 
  - Sprawdzenie czy przepis ma negatywną ocenę
  - Sprawdzenie czy użytkownik może regenerować przepis

### Wpływ na stan interfejsu
- **Błędy walidacji**: Wyświetlenie komunikatów błędów, dezaktywacja przycisków
- **Stan ładowania**: Wyświetlenie spinnera, dezaktywacja interfejsu
- **Brak uwierzytelnienia**: Przekierowanie do logowania
- **Brak uprawnień**: Wyświetlenie komunikatu o braku uprawnień
- **Sukces operacji**: Aktualizacja interfejsu, wyświetlenie komunikatu o sukcesie

## 10. Obsługa błędów

### Typy błędów
1. **Błędy walidacji (400)**: Nieprawidłowe dane wejściowe
2. **Błędy autoryzacji (401)**: Brak lub nieprawidłowy token
3. **Błędy uprawnień (403)**: Brak uprawnień do modyfikacji
4. **Błędy nieistnienia (404)**: Przepis nie istnieje
5. **Błędy serwera (500)**: Wewnętrzne błędy serwera
6. **Błędy sieci**: Problemy z połączeniem

### Strategie obsługi błędów
- **Inline errors**: Błędy wyświetlane w odpowiednich sekcjach
- **Toast notifications**: Krótkie komunikaty o błędach
- **Error boundaries**: Obsługa nieoczekiwanych błędów
- **Retry logic**: Automatyczne ponowienie dla błędów sieci
- **Fallback UI**: Alternatywny interfejs przy błędach

### Komunikaty błędów
- **Walidacja**: "Nieprawidłowe dane wejściowe"
- **Autoryzacja**: "Musisz być zalogowany, aby wyświetlić przepis"
- **Brak uprawnień**: "Nie masz uprawnień do modyfikacji tego przepisu"
- **Przepis nie istnieje**: "Przepis nie został znaleziony"
- **Serwer**: "Wystąpił błąd serwera. Spróbuj ponownie później"
- **Sieć**: "Problem z połączeniem. Sprawdź swoje połączenie internetowe"

## 11. Kroki implementacji

### 1. Przygotowanie struktury plików
```
src/
├── pages/
│   └── recipes/
│       └── [id].astro
├── components/
│   └── recipes/
│       ├── RecipeDetailsView.tsx
│       ├── RecipeHeader.tsx
│       ├── RecipeContent.tsx
│       ├── IngredientsSection.tsx
│       ├── ShoppingListSection.tsx
│       ├── InstructionsSection.tsx
│       ├── RecipeActions.tsx
│       ├── SaveButton.tsx
│       ├── RatingControls.tsx
│       ├── RegenerateButton.tsx
│       ├── AIDisclaimer.tsx
│       └── LoadingSpinner.tsx
└── hooks/
    └── useRecipeDetails.ts
```

### 2. Implementacja typów i interfejsów
- Stworzenie wszystkich typów komponentów
- Definicja typów stanu i akcji
- Implementacja typów walidacji

### 3. Implementacja custom hooka
- Stworzenie `useRecipeDetails`
- Implementacja logiki zarządzania przepisem
- Obsługa stanu i błędów

### 4. Implementacja komponentów UI
- Stworzenie podstawowych komponentów
- Implementacja logiki wyświetlania
- Dodanie obsługi zdarzeń

### 5. Integracja z API
- Implementacja wywołań API
- Obsługa odpowiedzi i błędów
- Dodanie autoryzacji

### 6. Implementacja funkcji interaktywnych
- Zapisywanie przepisów
- System oceniania
- Regeneracja przepisów

### 7. Implementacja walidacji
- Walidacja uprawnień
- Sprawdzanie własności przepisu
- Obsługa błędów walidacji

### 8. Implementacja obsługi błędów
- Error boundaries
- Toast notifications
- Inline error messages

### 9. Implementacja responsywności
- Mobile-first design
- Responsive layout
- Touch-friendly interactions

### 10. Testowanie i optymalizacja
- Testy jednostkowe komponentów
- Testy integracyjne
- Optymalizacja wydajności
- Accessibility testing

### 11. Integracja z routingiem
- Stworzenie pliku `[id].astro`
- Integracja z layoutem aplikacji
- Dodanie meta tagów i SEO

### 12. Finalizacja
- Code review
- Dokumentacja komponentów
- Testy end-to-end
- Deployment
