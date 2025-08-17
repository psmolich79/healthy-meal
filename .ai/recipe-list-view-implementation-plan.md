# Plan implementacji widoku Lista Przepisów (RecipeList)

## 1. Przegląd
Widok listy przepisów to ekran umożliwiający użytkownikom przeglądanie, wyszukiwanie i zarządzanie wszystkimi zapisanymi przepisami. Widok zawiera funkcje wyszukiwania z debounce, sortowania według różnych kryteriów, paginację oraz możliwość usuwania przepisów z potwierdzeniem. Każdy przepis jest prezentowany w formie karty z podstawowymi informacjami i akcjami.

## 2. Routing widoku
- **Główna ścieżka**: `/recipes`
- **Alternatywne ścieżki**: `/my-recipes`, `/saved-recipes`
- **Metoda routingu**: Astro static routing z React component

## 3. Struktura komponentów
```
RecipeListView
├── RecipeListHeader
├── RecipeListControls
│   ├── SearchInput
│   ├── SortToggle
│   └── FilterToggle
├── RecipeGrid
│   └── RecipeCard[]
├── Pagination
├── EmptyState
├── LoadingSpinner
└── ErrorBoundary
```

## 4. Szczegóły komponentów

### RecipeListView
- **Opis komponentu**: Główny kontener widoku listy przepisów, zarządza stanem i koordynuje wszystkie operacje
- **Główne elementy**: Container div z flexbox layout, header, kontrolki, siatka przepisów
- **Komponenty Shadcn/ui**: `Card`, `CardContent`
- **Obsługiwane interakcje**: Inicjalizacja widoku, zarządzanie stanem listy, obsługa błędów
- **Obsługiwana walidacja**: Sprawdzenie uwierzytelnienia użytkownika, weryfikacja istnienia profilu
- **Typy**: `RecipeListViewProps`, `RecipeListState`
- **Propsy**: `initialRecipes?: RecipeListItemDto[]`, `className?: string`

### RecipeListHeader
- **Opis komponentu**: Nagłówek listy przepisów z tytułem, liczbą przepisów i podstawowymi informacjami
- **Główne elementy**: H1 title, recipe count, description text
- **Komponenty Shadcn/ui**: `CardHeader`
- **Obsługiwane interakcje**: Wyświetlanie informacji o liście
- **Obsługiwana walidacja**: Sprawdzenie czy lista jest załadowana
- **Typy**: `RecipeListHeaderProps`
- **Propsy**: `totalRecipes: number`, `filteredCount: number`, `className?: string`

### RecipeListControls
- **Opis komponentu**: Kontener kontroli do zarządzania listą przepisów (wyszukiwanie, sortowanie, filtry)
- **Główne elementy**: Controls container, search input, sort toggle, filter toggle
- **Komponenty Shadcn/ui**: `CardContent`, `Separator`
- **Obsługiwane interakcje**: Grupowanie kontroli, responsive layout
- **Obsługiwana walidacja**: Sprawdzenie czy kontrolki są aktywne
- **Typy**: `RecipeListControlsProps`
- **Propsy**: `onSearch: (query: string) => void`, `onSort: (sort: SortOption) => void`, `onFilter: (filter: FilterOption) => void`, `currentSort: SortOption`, `currentFilter: FilterOption`

### SearchInput
- **Opis komponentu**: Pole wyszukiwania z debounce dla przepisów
- **Główne elementy**: Input element, search icon, clear button, debounced search
- **Komponenty Shadcn/ui**: `Input`, `Button`, `Search`
- **Obsługiwane interakcje**: Wpisywanie tekstu, wyszukiwanie, czyszczenie
- **Obsługiwana walidacja**: 
  - Pole nie może być puste dla wyszukiwania
  - Maksymalnie 200 znaków
  - Minimum 2 znaki dla wyszukiwania
- **Typy**: `SearchInputProps`
- **Propsy**: `value: string`, `onChange: (value: string) => void`, `onSearch: (query: string) => void`, `placeholder?: string`, `debounceMs?: number`

### SortToggle
- **Opis komponentu**: Przełącznik sortowania przepisów według różnych kryteriów
- **Główne elementy**: Toggle container, sort options, current selection
- **Komponenty Shadcn/ui**: `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue`
- **Obsługiwane interakcje**: Zmiana sortowania, wyświetlanie aktualnego sortowania
- **Obsługiwana walidacja**: Sprawdzenie czy sortowanie jest dostępne
- **Typy**: `SortToggleProps`
- **Propsy**: `currentSort: SortOption`, `onSortChange: (sort: SortOption) => void`, `options: SortOption[]`, `disabled?: boolean`

### FilterToggle
- **Opis komponentu**: Przełącznik filtrów dla przepisów (widoczne/ukryte, oceny)
- **Główne elementy**: Filter container, filter options, current selection
- **Komponenty Shadcn/ui**: `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue`
- **Obsługiwane interakcje**: Zmiana filtrów, wyświetlanie aktualnych filtrów
- **Obsługiwana walidacja**: Sprawdzenie czy filtry są dostępne
- **Typy**: `FilterToggleProps`
- **Propsy**: `currentFilter: FilterOption`, `onFilterChange: (filter: FilterOption) => void`, `options: FilterOption[]`, `disabled?: boolean`

### RecipeGrid
- **Opis komponentu**: Siatka przepisów z responsywnym layoutem
- **Główne elementy**: Grid container, recipe cards, responsive columns
- **Komponenty Shadcn/ui**: `Grid`, `GridItem`
- **Obsługiwane interakcje**: Responsive behavior, grid layout
- **Obsługiwana walidacja**: Sprawdzenie czy przepisy istnieją
- **Typy**: `RecipeGridProps`
- **Propsy**: `recipes: RecipeListItemDto[]`, `onRecipeClick: (recipeId: string) => void`, `onRecipeDelete: (recipeId: string) => void`, `className?: string`

### RecipeCard
- **Opis komponentu**: Karta pojedynczego przepisu z podstawowymi informacjami i akcjami
- **Główne elementy**: Card container, tytuł, data utworzenia, rating, delete button
- **Komponenty Shadcn/ui**: `Card`, `CardHeader`, `CardContent`, `CardFooter`, `Button`, `Badge`
- **Obsługiwane interakcje**: Hover effects, kliknięcie, usuwanie
- **Obsługiwana walidacja**: Sprawdzenie czy przepis ma wymagane pola
- **Typy**: `RecipeCardProps`
- **Propsy**: `recipe: RecipeListItemDto`, `onClick: (recipeId: string) => void`, `onDelete: (recipeId: string) => void`, `className?: string`

### Pagination
- **Opis komponentu**: Kontrolki paginacji dla listy przepisów
- **Główne elementy**: Pagination container, page numbers, prev/next buttons
- **Komponenty Shadcn/ui**: `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationNext`, `PaginationPrevious`
- **Obsługiwane interakcje**: Zmiana strony, nawigacja między stronami
- **Obsługiwana walidacja**: Sprawdzenie czy paginacja jest potrzebna
- **Typy**: `PaginationProps`
- **Propsy**: `currentPage: number`, `totalPages: number`, `onPageChange: (page: number) => void`, `className?: string`

### EmptyState
- **Opis komponentu**: Stan pustej listy przepisów z zachętą do działania
- **Główne elementy**: Empty container, icon, message, call-to-action button
- **Komponenty Shadcn/ui**: `Card`, `CardContent`, `Button`
- **Obsługiwane interakcje**: Wyświetlanie komunikatu, link do generowania
- **Obsługiwana walidacja**: Sprawdzenie czy lista jest pusta
- **Typy**: `EmptyStateProps`
- **Propsy**: `message: string`, `actionLabel?: string`, `onAction?: () => void`, `className?: string`

### LoadingSpinner
- **Opis komponentu**: Wskaźnik ładowania wyświetlany podczas ładowania listy
- **Główne elementy**: Spinner animation, tekst statusu
- **Komponenty Shadcn/ui**: `Spinner` (custom)
- **Obsługiwane interakcje**: Animacja, aktualizacja statusu
- **Obsługiwana walidacja**: Sprawdzenie czy ładowanie jest w toku
- **Typy**: `LoadingSpinnerProps`
- **Propsy**: `isVisible: boolean`, `status?: string`, `size?: 'sm' | 'md' | 'lg'`

## 5. Komponenty Shadcn/ui

### Komponenty layoutu
- **Card**: Główny kontener listy przepisów
- **CardHeader**: Nagłówek listy
- **CardContent**: Zawartość listy z kontrolkami i siatką
- **Grid**: Responsywna siatka przepisów
- **GridItem**: Pojedynczy element siatki

### Komponenty formularzy
- **Input**: Pole wyszukiwania
- **Select**: Selektory sortowania i filtrowania
- **SelectTrigger**: Przycisk otwierający select
- **SelectContent**: Zawartość selecta
- **SelectItem**: Pojedyncza opcja selecta
- **SelectValue**: Wyświetlana wartość selecta

### Komponenty nawigacji
- **Pagination**: Kontrolki paginacji
- **PaginationContent**: Zawartość paginacji
- **PaginationItem**: Pojedynczy element paginacji
- **PaginationLink**: Link do strony
- **PaginationNext/Previous**: Przyciski nawigacji

### Komponenty kart
- **Card**: Karty przepisów
- **CardHeader**: Nagłówek karty
- **CardContent**: Zawartość karty
- **CardFooter**: Stopka karty z akcjami

### Komponenty interaktywne
- **Button**: Przyciski akcji (usuwanie, generowanie)
- **Badge**: Tagi ocen i statusów
- **Search**: Ikona wyszukiwania

### Komponenty pomocnicze
- **Separator**: Separatory między sekcjami
- **Spinner**: Wskaźnik ładowania (custom)

## 6. Typy

### Typy komponentów
```typescript
interface RecipeListViewProps {
  initialRecipes?: RecipeListItemDto[];
  className?: string;
}

interface RecipeListHeaderProps {
  totalRecipes: number;
  filteredCount: number;
  className?: string;
}

interface RecipeListControlsProps {
  onSearch: (query: string) => void;
  onSort: (sort: SortOption) => void;
  onFilter: (filter: FilterOption) => void;
  currentSort: SortOption;
  currentFilter: FilterOption;
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

interface SortToggleProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  options: SortOption[];
  disabled?: boolean;
}

interface FilterToggleProps {
  currentFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  options: FilterOption[];
  disabled?: boolean;
}

interface RecipeGridProps {
  recipes: RecipeListItemDto[];
  onRecipeClick: (recipeId: string) => void;
  onRecipeDelete: (recipeId: string) => void;
  className?: string;
}

interface RecipeCardProps {
  recipe: RecipeListItemDto;
  onClick: (recipeId: string) => void;
  onDelete: (recipeId: string) => void;
  className?: string;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

interface LoadingSpinnerProps {
  isVisible: boolean;
  status?: string;
  size?: 'sm' | 'md' | 'lg';
}
```

### Typy opcji sortowania i filtrowania
```typescript
interface SortOption {
  value: string;
  label: string;
  description: string;
}

interface FilterOption {
  value: string;
  label: string;
  description: string;
}

type SortType = 'created_at_desc' | 'created_at_asc' | 'title_asc' | 'title_desc' | 'rating_desc';

type FilterType = 'all' | 'visible' | 'hidden' | 'rated' | 'unrated';
```

### Typy stanu
```typescript
interface RecipeListState {
  recipes: RecipeListItemDto[];
  filteredRecipes: RecipeListItemDto[];
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  searchQuery: string;
  currentSort: SortOption;
  currentFilter: FilterOption;
  pagination: PaginationState;
}

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalRecipes: number;
  recipesPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface SearchState {
  query: string;
  isSearching: boolean;
  results: RecipeListItemDto[];
  hasResults: boolean;
}
```

### Typy akcji
```typescript
interface RecipeListAction {
  type: 'set_recipes' | 'set_search' | 'set_sort' | 'set_filter' | 'set_page' | 'delete_recipe';
  payload: any;
}

interface SearchAction {
  type: 'search_start' | 'search_success' | 'search_error' | 'search_clear';
  payload?: any;
}

interface SortAction {
  type: 'sort_change';
  payload: SortOption;
}

interface FilterAction {
  type: 'filter_change';
  payload: FilterOption;
}
```

## 6. Zarządzanie stanem

### Stan lokalny komponentu
- `recipes` - lista wszystkich przepisów
- `filteredRecipes` - przefiltrowane przepisy
- `isLoading` - stan ładowania listy
- `isSearching` - stan wyszukiwania
- `error` - błędy walidacji lub API
- `searchQuery` - aktualne zapytanie wyszukiwania
- `currentSort` - aktualne sortowanie
- `currentFilter` - aktualne filtry
- `pagination` - stan paginacji

### Custom Hook: useRecipeList
```typescript
const useRecipeList = () => {
  const [state, setState] = useState<RecipeListState>({
    recipes: [],
    filteredRecipes: [],
    isLoading: false,
    isSearching: false,
    error: null,
    searchQuery: '',
    currentSort: { value: 'created_at_desc', label: 'Najnowsze', description: 'Od najnowszego' },
    currentFilter: { value: 'all', label: 'Wszystkie', description: 'Pokaż wszystkie przepisy' },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalRecipes: 0,
      recipesPerPage: 20,
      hasNext: false,
      hasPrevious: false
    }
  });

  const fetchRecipes = useCallback(async (page: number = 1) => {
    // Logika pobierania przepisów
  }, []);

  const searchRecipes = useCallback(async (query: string) => {
    // Logika wyszukiwania przepisów
  }, []);

  const sortRecipes = useCallback((sort: SortOption) => {
    // Logika sortowania przepisów
  }, []);

  const filterRecipes = useCallback((filter: FilterOption) => {
    // Logika filtrowania przepisów
  }, []);

  const deleteRecipe = useCallback(async (recipeId: string) => {
    // Logika usuwania przepisu
  }, []);

  const clearSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      searchQuery: '',
      filteredRecipes: prev.recipes
    }));
  }, []);

  return {
    ...state,
    fetchRecipes,
    searchRecipes,
    sortRecipes,
    filterRecipes,
    deleteRecipe,
    clearSearch
  };
};
```

### Stan globalny (Context)
- `userProfile` - profil użytkownika z preferencjami
- `authState` - stan uwierzytelnienia
- `savedRecipes` - lista zapisanych przepisów

## 7. Integracja API

### Endpoint: GET /api/recipes
- **Typ żądania**: Query parameters (page, limit, visible_only, sort)
- **Typ odpowiedzi**: `PaginatedRecipesDto`
- **Autoryzacja**: Wymagany Bearer token
- **Walidacja**: Użytkownik musi być zalogowany

### Endpoint: DELETE /api/recipes/{id}
- **Typ żądania**: Brak (DELETE request)
- **Typ odpowiedzi**: Success message
- **Autoryzacja**: Wymagany Bearer token
- **Walidacja**: Użytkownik może usuwać tylko swoje przepisy

### Implementacja wywołań API
```typescript
// Pobieranie listy przepisów
const fetchRecipes = async (params: {
  page: number;
  limit: number;
  visible_only?: boolean;
  sort?: string;
}): Promise<PaginatedRecipesDto> => {
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
    ...(params.visible_only !== undefined && { visible_only: params.visible_only.toString() }),
    ...(params.sort && { sort: params.sort })
  });

  const response = await fetch(`/api/recipes?${queryParams}`, {
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

// Usuwanie przepisu
const deleteRecipe = async (recipeId: string): Promise<void> => {
  const response = await fetch(`/api/recipes/${recipeId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${supabase.auth.getSession()}`
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};
```

### Obsługa odpowiedzi
- **Sukces (200)**: Aktualizacja stanu lokalnego, wyświetlenie listy przepisów
- **Błąd (400)**: Walidacja nieudana, wyświetlenie błędu
- **Błąd (401)**: Brak autoryzacji, przekierowanie do logowania
- **Błąd (500)**: Błąd serwera, wyświetlenie komunikatu o błędzie

## 8. Interakcje użytkownika

### Przeglądanie listy przepisów
1. Użytkownik otwiera listę przepisów
2. Przepisy są ładowane z API z paginacją
3. Lista jest wyświetlana w formie siatki
4. Użytkownik może przewijać i przeglądać przepisy

### Wyszukiwanie przepisów
1. Użytkownik wpisuje tekst w pole wyszukiwania
2. Wyszukiwanie jest inicjowane po 200ms debounce
3. Wyniki są wyświetlane w czasie rzeczywistym
4. Użytkownik może wyczyścić wyszukiwanie

### Sortowanie przepisów
1. Użytkownik wybiera opcję sortowania
2. Lista jest sortowana według wybranego kryterium
3. Paginacja jest resetowana do pierwszej strony
4. Nowe sortowanie jest zapisywane w stanie

### Filtrowanie przepisów
1. Użytkownik wybiera opcję filtrowania
2. Lista jest filtrowana według wybranego kryterium
3. Paginacja jest dostosowywana do przefiltrowanych wyników
4. Nowe filtry są zapisywane w stanie

### Usuwanie przepisu
1. Użytkownik klika przycisk usuwania na karcie przepisu
2. Modal potwierdzenia się wyświetla
3. Po potwierdzeniu przepis jest usuwany z API
4. Lista jest aktualizowana bez usuniętego przepisu

### Nawigacja paginacji
1. Użytkownik klika numer strony lub przyciski prev/next
2. Nowa strona przepisów jest ładowana z API
3. Paginacja jest aktualizowana
4. Użytkownik jest przewijany na górę listy

## 9. Warunki i walidacja

### Warunki wymagane przez API
- **Uwierzytelnienie**: Użytkownik musi być zalogowany (Bearer token)
- **Własność przepisów**: Użytkownik może przeglądać tylko swoje przepisy
- **Parametry paginacji**: Poprawne wartości page i limit
- **Parametry sortowania**: Poprawne wartości sort

### Walidacja na poziomie komponentów
- **RecipeListView**: 
  - Sprawdzenie uwierzytelnienia użytkownika
  - Sprawdzenie istnienia profilu
  - Sprawdzenie uprawnień do przeglądania
- **SearchInput**: 
  - Sprawdzenie długości zapytania (2-200 znaków)
  - Sprawdzenie czy zapytanie nie jest puste
- **SortToggle**: 
  - Sprawdzenie czy sortowanie jest dostępne
  - Sprawdzenie poprawności opcji sortowania
- **FilterToggle**: 
  - Sprawdzenie czy filtry są dostępne
  - Sprawdzenie poprawności opcji filtrowania
- **RecipeCard**: 
  - Sprawdzenie czy przepis ma wymagane pola
  - Sprawdzenie uprawnień do usuwania

### Wpływ na stan interfejsu
- **Błędy walidacji**: Wyświetlenie komunikatów błędów, dezaktywacja kontroli
- **Stan ładowania**: Wyświetlenie spinnera, dezaktywacja interfejsu
- **Brak uwierzytelnienia**: Przekierowanie do logowania
- **Brak uprawnień**: Wyświetlenie komunikatu o braku uprawnień
- **Pusta lista**: Wyświetlenie EmptyState z zachętą do działania
- **Wyniki wyszukiwania**: Aktualizacja listy, aktualizacja paginacji

## 10. Obsługa błędów

### Typy błędów
1. **Błędy walidacji (400)**: Nieprawidłowe parametry zapytania
2. **Błędy autoryzacji (401)**: Brak lub nieprawidłowy token
3. **Błędy uprawnień (403)**: Brak uprawnień do przeglądania
4. **Błędy nieistnienia (404)**: Lista przepisów nie została znaleziona
5. **Błędy serwera (500)**: Wewnętrzne błędy serwera
6. **Błędy sieci**: Problemy z połączeniem

### Strategie obsługi błędów
- **Inline errors**: Błędy wyświetlane w odpowiednich sekcjach
- **Toast notifications**: Krótkie komunikaty o błędach
- **Error boundaries**: Obsługa nieoczekiwanych błędów
- **Retry logic**: Automatyczne ponowienie dla błędów sieci
- **Fallback UI**: Alternatywny interfejs przy błędach

### Komunikaty błędów
- **Walidacja**: "Nieprawidłowe parametry wyszukiwania"
- **Autoryzacja**: "Musisz być zalogowany, aby przeglądać przepisy"
- **Brak uprawnień**: "Nie masz uprawnień do przeglądania tej listy"
- **Lista nie istnieje**: "Lista przepisów nie została znaleziona"
- **Serwer**: "Wystąpił błąd serwera. Spróbuj ponownie później"
- **Sieć**: "Problem z połączeniem. Sprawdź swoje połączenie internetowe"

## 11. Kroki implementacji

### 1. Przygotowanie struktury plików
```
src/
├── pages/
│   └── recipes.astro
├── components/
│   └── recipes/
│       ├── RecipeListView.tsx
│       ├── RecipeListHeader.tsx
│       ├── RecipeListControls.tsx
│       ├── SearchInput.tsx
│       ├── SortToggle.tsx
│       ├── FilterToggle.tsx
│       ├── RecipeGrid.tsx
│       ├── RecipeCard.tsx
│       ├── Pagination.tsx
│       ├── EmptyState.tsx
│       └── LoadingSpinner.tsx
├── hooks/
│   └── useRecipeList.ts
└── utils/
    └── search.ts
```

### 2. Implementacja typów i interfejsów
- Stworzenie wszystkich typów komponentów
- Definicja typów opcji sortowania i filtrowania
- Implementacja typów stanu i akcji

### 3. Implementacja custom hooka
- Stworzenie `useRecipeList`
- Implementacja logiki zarządzania listą
- Obsługa stanu i błędów

### 4. Implementacja komponentów UI
- Stworzenie podstawowych komponentów
- Implementacja logiki wyszukiwania
- Dodanie obsługi zdarzeń

### 5. Integracja z API
- Implementacja wywołań `/api/recipes`
- Obsługa odpowiedzi i błędów
- Dodanie autoryzacji

### 6. Implementacja wyszukiwania
- Debounced search
- Real-time results
- Search highlighting

### 7. Implementacja sortowania i filtrowania
- Sort options
- Filter options
- State management

### 8. Implementacja paginacji
- Page navigation
- Results per page
- URL state management

### 9. Implementacja usuwania przepisów
- Delete confirmation modal
- API integration
- State updates

### 10. Implementacja responsywności
- Mobile-first design
- Responsive grid
- Touch-friendly interactions

### 11. Testowanie i optymalizacja
- Testy jednostkowe komponentów
- Testy integracyjne
- Optymalizacja wydajności
- Accessibility testing

### 12. Integracja z routingiem
- Stworzenie pliku `recipes.astro`
- Integracja z layoutem aplikacji
- Dodanie meta tagów i SEO

### 13. Finalizacja
- Code review
- Dokumentacja komponentów
- Testy end-to-end
- Deployment
