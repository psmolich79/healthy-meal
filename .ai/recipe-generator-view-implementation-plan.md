# Plan implementacji widoku Generowanie Przepisów

## 1. Przegląd
Widok generowania przepisów to główny ekran aplikacji HealthyMeal, który umożliwia użytkownikom wprowadzanie zapytań w języku naturalnym i otrzymywanie spersonalizowanych przepisów kulinarnych wygenerowanych przez AI. Widok automatycznie uwzględnia preferencje żywieniowe użytkownika i wyświetla aktywne filtry podczas generowania.

## 2. Routing widoku
- **Główna ścieżka**: `/recipes/generate` (lub `/` jako domyślna)
- **Alternatywne ścieżki**: `/generate`, `/recipes/new`
- **Metoda routingu**: Astro dynamic routing z React component

## 3. Struktura komponentów
```
RecipeGeneratorView
├── RecipeGenerator
│   ├── SearchInput
│   ├── ActiveFilters
│   ├── GenerateButton
│   └── LoadingSpinner
├── RecipeCarousel
│   └── RecipeCard[]
└── ErrorBoundary
```

## 4. Szczegóły komponentów

### RecipeGeneratorView
- **Opis komponentu**: Główny kontener widoku generowania przepisów, zarządza stanem i koordynuje interakcje między komponentami
- **Główne elementy**: Container div z flexbox layout, header z tytułem, główna sekcja generowania
- **Komponenty Shadcn/ui**: `Card`, `CardHeader`, `CardContent`
- **Obsługiwane interakcje**: Inicjalizacja widoku, zarządzanie stanem globalnym, obsługa błędów
- **Obsługiwana walidacja**: Sprawdzenie uwierzytelnienia użytkownika, weryfikacja istnienia profilu
- **Typy**: `RecipeGeneratorViewProps`, `RecipeGeneratorState`
- **Propsy**: `initialPreferences?: string[]`, `className?: string`

### RecipeGenerator
- **Opis komponentu**: Główny komponent formularza generowania przepisów z polem wyszukiwania i przyciskiem generowania
- **Główne elementy**: Form element, SearchInput, ActiveFilters, GenerateButton, LoadingSpinner
- **Komponenty Shadcn/ui**: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`
- **Obsługiwane interakcje**: Submit formularza, walidacja inputu, wyświetlanie stanu ładowania
- **Obsługiwana walidacja**: 
  - Query nie może być puste
  - Query maksymalnie 500 znaków
  - Użytkownik musi być zalogowany
  - Profil użytkownika musi istnieć
- **Typy**: `RecipeGeneratorProps`, `GenerateRecipeCommand`, `GeneratedRecipeDto`
- **Propsy**: `onRecipeGenerated: (recipe: GeneratedRecipeDto) => void`, `isLoading: boolean`, `userPreferences: string[]`

### SearchInput
- **Opis komponentu**: Pole tekstowe do wprowadzania zapytań w języku naturalnym z walidacją real-time
- **Główne elementy**: Input element, label, error message, character counter
- **Komponenty Shadcn/ui**: `Input`, `Label`, `FormMessage`
- **Obsługiwane interakcje**: Wpisywanie tekstu, walidacja w czasie rzeczywistym, focus/blur
- **Obsługiwana walidacja**:
  - Pole nie może być puste
  - Maksymalnie 500 znaków
  - Minimum 3 znaki dla sensownego zapytania
- **Typy**: `SearchInputProps`, `SearchInputState`
- **Propsy**: `value: string`, `onChange: (value: string) => void`, `onSubmit: () => void`, `placeholder?: string`, `disabled?: boolean`

### ActiveFilters
- **Opis komponentu**: Wyświetla aktywne filtry/preferencje użytkownika, które będą zastosowane podczas generowania
- **Główne elementy**: Container div, lista tagów preferencji, ikony dla każdego typu preferencji
- **Komponenty Shadcn/ui**: `Badge`, `ScrollArea`
- **Obsługiwane interakcje**: Wyświetlanie preferencji, link do edycji profilu
- **Obsługiwana walidacja**: Sprawdzenie czy użytkownik ma zdefiniowane preferencje
- **Typy**: `ActiveFiltersProps`, `Profile["preferences"]`
- **Propsy**: `preferences: string[]`, `onEditProfile: () => void`, `className?: string`

### GenerateButton
- **Opis komponentu**: Przycisk do inicjowania generowania przepisu z różnymi stanami (disabled, loading, success)
- **Główne elementy**: Button element, ikona, tekst, loading spinner
- **Komponenty Shadcn/ui**: `Button`, `ButtonLoading`
- **Obsługiwane interakcje**: Kliknięcie, stan disabled, stan loading
- **Obsługiwana walidacja**: 
  - Query musi być wypełnione
  - Użytkownik musi być zalogowany
  - Nie może być w trakcie generowania
- **Typy**: `GenerateButtonProps`
- **Propsy**: `onClick: () => void`, `disabled: boolean`, `isLoading: boolean`, `children: React.ReactNode`

### LoadingSpinner
- **Opis komponentu**: Wskaźnik ładowania wyświetlany podczas generowania przepisu przez AI
- **Główne elementy**: Spinner animation, tekst statusu, progress bar (opcjonalnie)
- **Komponenty Shadcn/ui**: `Spinner` (custom), `Progress`
- **Obsługiwane interakcje**: Animacja, aktualizacja statusu
- **Obsługiwana walidacja**: Sprawdzenie czy generowanie jest w toku
- **Typy**: `LoadingSpinnerProps`
- **Propsy**: `isVisible: boolean`, `status?: string`, `progress?: number`

### RecipeCarousel
- **Opis komponentu**: Karuzela wyświetlająca ostatnie 3 wygenerowane przepisy użytkownika
- **Główne elementy**: Container div, lista RecipeCard, nawigacja (opcjonalnie)
- **Komponenty Shadcn/ui**: `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselNext`, `CarouselPrevious`
- **Obsługiwane interakcje**: Przewijanie przepisów, kliknięcie w przepis
- **Obsługiwana walidacja**: Sprawdzenie czy istnieją przepisy do wyświetlenia
- **Typy**: `RecipeCarouselProps`, `RecipeListItemDto[]`
- **Propsy**: `recipes: RecipeListItemDto[]`, `onRecipeClick: (recipeId: string) => void`, `maxVisible?: number`

### RecipeCard
- **Opis komponentu**: Karta pojedynczego przepisu w karuzeli z podstawowymi informacjami
- **Główne elementy**: Card container, tytuł, data utworzenia, ikona oceny, hover effects
- **Komponenty Shadcn/ui**: `Card`, `CardHeader`, `CardContent`, `CardFooter`
- **Obsługiwane interakcje**: Hover, kliknięcie, wyświetlanie oceny
- **Obsługiwana walidacja**: Sprawdzenie czy przepis ma wymagane pola
- **Typy**: `RecipeCardProps`, `RecipeListItemDto`
- **Propsy**: `recipe: RecipeListItemDto`, `onClick: (recipeId: string) => void`, `className?: string`

## 5. Komponenty Shadcn/ui

### Komponenty formularzy
- **Form**: Główny kontener formularza z walidacją
- **FormField**: Pole formularza z walidacją
- **FormItem**: Kontener elementu formularza
- **FormLabel**: Etykieta pola formularza
- **FormControl**: Kontrolka formularza (Input, Textarea)
- **FormMessage**: Komunikat błędu/walidacji

### Komponenty layoutu
- **Card**: Karty dla przepisów i sekcji
- **CardHeader**: Nagłówek karty
- **CardContent**: Zawartość karty
- **CardFooter**: Stopka karty

### Komponenty nawigacji
- **Carousel**: Karuzela dla przepisów
- **CarouselContent**: Zawartość karuzeli
- **CarouselItem**: Pojedynczy element karuzeli
- **CarouselNext/Previous**: Przyciski nawigacji

### Komponenty interaktywne
- **Button**: Przyciski akcji
- **Input**: Pola tekstowe
- **Label**: Etykiety
- **Badge**: Tagi preferencji
- **ScrollArea**: Obszary przewijania

### Komponenty pomocnicze
- **Progress**: Pasek postępu (opcjonalnie)
- **Spinner**: Wskaźnik ładowania (custom)

## 6. Typy

### Typy komponentów
```typescript
interface RecipeGeneratorViewProps {
  initialPreferences?: string[];
  className?: string;
}

interface RecipeGeneratorProps {
  onRecipeGenerated: (recipe: GeneratedRecipeDto) => void;
  isLoading: boolean;
  userPreferences: string[];
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

interface ActiveFiltersProps {
  preferences: string[];
  onEditProfile: () => void;
  className?: string;
}

interface GenerateButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

interface LoadingSpinnerProps {
  isVisible: boolean;
  status?: string;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
}

interface RecipeCarouselProps {
  recipes: RecipeListItemDto[];
  onRecipeClick: (recipeId: string) => void;
  maxVisible?: number;
  className?: string;
}

interface RecipeCardProps {
  recipe: RecipeListItemDto;
  onClick: (recipeId: string) => void;
  className?: string;
}
```

### Typy stanu
```typescript
interface RecipeGeneratorState {
  query: string;
  isLoading: boolean;
  error: string | null;
  lastGeneratedRecipe: GeneratedRecipeDto | null;
}

interface SearchInputState {
  value: string;
  error: string | null;
  isFocused: boolean;
  characterCount: number;
}
```

### Typy walidacji
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface QueryValidation {
  isEmpty: boolean;
  isTooShort: boolean;
  isTooLong: boolean;
  hasSpecialChars: boolean;
}
```

## 7. Zarządzanie stanem

### Stan lokalny komponentu
- `query` - aktualne zapytanie użytkownika
- `isLoading` - stan ładowania podczas generowania
- `error` - błędy walidacji lub API
- `lastGeneratedRecipe` - ostatnio wygenerowany przepis

### Custom Hook: useRecipeGenerator
```typescript
const useRecipeGenerator = () => {
  const [state, setState] = useState<RecipeGeneratorState>({
    query: '',
    isLoading: false,
    error: null,
    lastGeneratedRecipe: null
  });

  const generateRecipe = useCallback(async (query: string) => {
    // Logika generowania przepisu
  }, []);

  const validateQuery = useCallback((query: string): ValidationResult => {
    // Logika walidacji
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    generateRecipe,
    validateQuery,
    clearError
  };
};
```

### Stan globalny (Context)
- `userProfile` - profil użytkownika z preferencjami
- `authState` - stan uwierzytelnienia
- `theme` - motyw aplikacji

## 8. Integracja API

### Endpoint: POST /api/recipes/generate
- **Typ żądania**: `GenerateRecipeCommand`
- **Typ odpowiedzi**: `GeneratedRecipeDto`
- **Autoryzacja**: Wymagany Bearer token
- **Walidacja**: Query niepuste, maksymalnie 500 znaków

### Implementacja wywołania API
```typescript
const generateRecipe = async (query: string): Promise<GeneratedRecipeDto> => {
  const response = await fetch('/api/recipes/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabase.auth.getSession()}`
    },
    body: JSON.stringify({ query, model: 'gpt-4o' })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
```

### Obsługa odpowiedzi
- **Sukces (201)**: Aktualizacja stanu, przekierowanie do szczegółów przepisu
- **Błąd (400)**: Walidacja nieudana, wyświetlenie błędu
- **Błąd (401)**: Brak autoryzacji, przekierowanie do logowania
- **Błąd (429)**: Przekroczenie limitu, wyświetlenie komunikatu o rate limiting
- **Błąd (500)**: Błąd serwera, wyświetlenie komunikatu o błędzie

## 9. Interakcje użytkownika

### Wprowadzanie zapytania
1. Użytkownik wpisuje tekst w pole SearchInput
2. Walidacja real-time sprawdza długość i zawartość
3. Character counter aktualizuje się na bieżąco
4. Error message wyświetla się przy błędach walidacji

### Generowanie przepisu
1. Użytkownik klika GenerateButton
2. Formularz jest walidowany
3. LoadingSpinner się wyświetla
4. Zapytanie jest wysyłane do API
5. Użytkownik jest przekierowany do szczegółów przepisu

### Edycja preferencji
1. Użytkownik klika link "Edytuj profil" w ActiveFilters
2. Przekierowanie do `/profile`
3. Po zapisaniu preferencji powrót do generowania

### Przeglądanie ostatnich przepisów
1. RecipeCarousel wyświetla ostatnie 3 przepisy
2. Użytkownik może kliknąć w RecipeCard
3. Przekierowanie do szczegółów przepisu

## 10. Warunki i walidacja

### Warunki wymagane przez API
- **Uwierzytelnienie**: Użytkownik musi być zalogowany (Bearer token)
- **Profil**: Użytkownik musi mieć zdefiniowany profil
- **Query**: Zapytanie nie może być puste i nie może przekraczać 500 znaków
- **Rate limiting**: Maksymalnie 10 generowań na minutę

### Walidacja na poziomie komponentów
- **SearchInput**: 
  - Sprawdzenie długości (3-500 znaków)
  - Sprawdzenie czy nie jest puste
  - Sprawdzenie znaków specjalnych
- **GenerateButton**: 
  - Sprawdzenie czy query jest wypełnione
  - Sprawdzenie czy nie ma błędów walidacji
  - Sprawdzenie czy nie jest w trakcie generowania
- **RecipeGenerator**: 
  - Sprawdzenie uwierzytelnienia użytkownika
  - Sprawdzenie istnienia profilu
  - Sprawdzenie poprawności zapytania

### Wpływ na stan interfejsu
- **Błędy walidacji**: Wyświetlenie komunikatów błędów, dezaktywacja przycisku
- **Stan ładowania**: Wyświetlenie spinnera, dezaktywacja formularza
- **Brak uwierzytelnienia**: Przekierowanie do logowania
- **Brak profilu**: Przekierowanie do tworzenia profilu

## 11. Obsługa błędów

### Typy błędów
1. **Błędy walidacji (400)**: Nieprawidłowe dane wejściowe
2. **Błędy autoryzacji (401)**: Brak lub nieprawidłowy token
3. **Błędy autoryzacji (403)**: Brak uprawnień
4. **Błędy rate limiting (429)**: Przekroczenie limitu żądań
5. **Błędy serwera (500)**: Wewnętrzne błędy serwera
6. **Błędy sieci**: Problemy z połączeniem

### Strategie obsługi błędów
- **Toast notifications**: Krótkie komunikaty o błędach
- **Inline errors**: Błędy wyświetlane w formularzu
- **Error boundaries**: Obsługa nieoczekiwanych błędów
- **Retry logic**: Automatyczne ponowienie dla błędów sieci
- **Fallback UI**: Alternatywny interfejs przy błędach

### Komunikaty błędów
- **Walidacja**: "Zapytanie musi mieć od 3 do 500 znaków"
- **Autoryzacja**: "Musisz być zalogowany, aby generować przepisy"
- **Rate limiting**: "Przekroczyłeś limit generowań. Spróbuj ponownie za chwilę"
- **Serwer**: "Wystąpił błąd serwera. Spróbuj ponownie później"
- **Sieć**: "Problem z połączeniem. Sprawdź swoje połączenie internetowe"

## 12. Kroki implementacji

### 1. Przygotowanie struktury plików
```
src/
├── pages/
│   └── recipes/
│       └── generate.astro
├── components/
│   └── recipes/
│       ├── RecipeGeneratorView.tsx
│       ├── RecipeGenerator.tsx
│       ├── SearchInput.tsx
│       ├── ActiveFilters.tsx
│       ├── GenerateButton.tsx
│       ├── LoadingSpinner.tsx
│       ├── RecipeCarousel.tsx
│       └── RecipeCard.tsx
└── hooks/
    └── useRecipeGenerator.ts
```

### 2. Implementacja typów i interfejsów
- Stworzenie wszystkich typów komponentów
- Definicja typów stanu
- Implementacja typów walidacji

### 3. Implementacja custom hooka
- Stworzenie `useRecipeGenerator`
- Implementacja logiki generowania
- Obsługa stanu i błędów

### 4. Implementacja komponentów UI
- Stworzenie podstawowych komponentów
- Implementacja logiki walidacji
- Dodanie obsługi zdarzeń

### 5. Integracja z API
- Implementacja wywołania `/api/recipes/generate`
- Obsługa odpowiedzi i błędów
- Dodanie autoryzacji

### 6. Implementacja walidacji
- Walidacja real-time w SearchInput
- Walidacja formularza przed wysłaniem
- Obsługa błędów walidacji

### 7. Implementacja stanu ładowania
- LoadingSpinner komponent
- Zarządzanie stanem isLoading
- Dezaktywacja formularza podczas ładowania

### 8. Implementacja obsługi błędów
- Error boundaries
- Toast notifications
- Inline error messages

### 9. Implementacja RecipeCarousel
- Pobieranie ostatnich przepisów
- Wyświetlanie w karuzeli
- Obsługa kliknięć

### 10. Testowanie i optymalizacja
- Testy jednostkowe komponentów
- Testy integracyjne
- Optymalizacja wydajności
- Responsive design

### 11. Integracja z routingiem
- Stworzenie pliku `generate.astro`
- Integracja z layoutem aplikacji
- Dodanie meta tagów i SEO

### 12. Finalizacja
- Code review
- Dokumentacja komponentów
- Testy end-to-end
- Deployment
