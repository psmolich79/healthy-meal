# Komponenty Widoku Generowania Przepisów

Ten katalog zawiera komponenty React implementujące widok generowania przepisów w aplikacji HealthyMeal.

## Struktura Komponentów

```
RecipeGeneratorView (główny kontener)
├── RecipeGenerator (formularz generowania)
│   ├── SearchInput (pole wyszukiwania)
│   ├── ActiveFilters (aktywne filtry)
│   ├── GenerateButton (przycisk generowania)
│   └── LoadingSpinner (wskaźnik ładowania)
├── RecipeCarousel (karuzela przepisów)
│   └── RecipeCard (karta pojedynczego przepisu)
└── ErrorBoundary (obsługa błędów)
```

## Komponenty

### RecipeGeneratorView
Główny kontener widoku generowania przepisów. Zarządza stanem całego widoku, integruje wszystkie komponenty i obsługuje komunikację z API.

**Props:**
- `initialPreferences?: string[]` - początkowe preferencje użytkownika
- `className?: string` - dodatkowe klasy CSS

**Funkcjonalności:**
- Pobieranie preferencji użytkownika z API
- Pobieranie ostatnich przepisów
- Obsługa błędów z toast notifications
- Integracja z ErrorBoundary

### RecipeGenerator
Główny komponent formularza generowania przepisów. Integruje wszystkie elementy formularza i zarządza walidacją.

**Props:**
- `onRecipeGenerated: (recipe: GeneratedRecipeDto) => void` - callback po wygenerowaniu przepisu
- `isLoading: boolean` - stan ładowania
- `userPreferences: string[]` - preferencje użytkownika

**Funkcjonalności:**
- Walidacja formularza w czasie rzeczywistym
- Obsługa błędów walidacji
- Przekierowanie do szczegółów przepisu
- Wyświetlanie wskazówek dla użytkownika

### SearchInput
Pole tekstowe do wprowadzania zapytań w języku naturalnym z walidacją real-time.

**Props:**
- `value: string` - aktualna wartość pola
- `onChange: (value: string) => void` - callback zmiany wartości
- `onSubmit: () => void` - callback wysłania formularza
- `placeholder?: string` - placeholder tekstu
- `disabled?: boolean` - czy pole jest wyłączone
- `maxLength?: number` - maksymalna długość tekstu

**Funkcjonalności:**
- Walidacja w czasie rzeczywistym (3-500 znaków)
- Licznik znaków
- Obsługa klawisza Enter
- Stylowanie w zależności od stanu (focus, error, normalny)
- Animacje i przejścia

### ActiveFilters
Wyświetla aktywne filtry/preferencje użytkownika, które będą zastosowane podczas generowania.

**Props:**
- `preferences: string[]` - lista preferencji użytkownika
- `onEditProfile: () => void` - callback edycji profilu
- `className?: string` - dodatkowe klasy CSS

**Funkcjonalności:**
- Wyświetlanie preferencji jako tagi
- Link do edycji profilu
- Obsługa pustego stanu (brak preferencji)
- ScrollArea dla dużej liczby preferencji

### GenerateButton
Przycisk do inicjowania generowania przepisu z różnymi stanami.

**Props:**
- `onClick: () => void` - callback kliknięcia
- `disabled: boolean` - czy przycisk jest wyłączony
- `isLoading: boolean` - stan ładowania
- `children: React.ReactNode` - zawartość przycisku
- `variant?: 'primary' | 'secondary'` - wariant stylu

**Funkcjonalności:**
- Gradient tła dla wariantu primary
- Animowany spinner podczas ładowania
- Różne stany (normalny, disabled, loading)
- Hover effects i przejścia

### LoadingSpinner
Wskaźnik ładowania wyświetlany podczas generowania przepisu przez AI.

**Props:**
- `isVisible: boolean` - czy spinner jest widoczny
- `status?: string` - tekst statusu
- `progress?: number` - postęp (0-100)
- `size?: 'sm' | 'md' | 'lg'` - rozmiar spinnera

**Funkcjonalności:**
- Modal overlay z backdrop blur
- Animowany spinner
- Krokowy status procesu
- Progress bar (opcjonalnie)
- Informacje o AI

### RecipeCarousel
Karuzela wyświetlająca ostatnie przepisy użytkownika.

**Props:**
- `recipes: RecipeListItemDto[]` - lista przepisów
- `onRecipeClick: (recipeId: string) => void` - callback kliknięcia w przepis
- `maxVisible?: number` - maksymalna liczba widocznych przepisów
- `className?: string` - dodatkowe klasy CSS

**Funkcjonalności:**
- Paginacja z nawigacją
- Responsywny grid layout
- Obsługa pustego stanu
- Indikatory strony

### RecipeCard
Karta pojedynczego przepisu w karuzeli.

**Props:**
- `recipe: RecipeListItemDto` - dane przepisu
- `onClick: (recipeId: string) => void` - callback kliknięcia
- `className?: string` - dodatkowe klasy CSS

**Funkcjonalności:**
- Formatowanie daty (dziś, wczoraj, X dni temu)
- Ikony ocen użytkownika
- Status widoczności (publiczny/prywatny)
- Hover effects i animacje
- Responsywny design

### ErrorBoundary
Komponent do obsługi nieoczekiwanych błędów w widoku.

**Props:**
- `children: ReactNode` - komponenty potomne
- `fallback?: ReactNode` - niestandardowy fallback UI

**Funkcjonalności:**
- Przechwytywanie błędów JavaScript
- Fallback UI z opcjami retry i powrotu do strony głównej
- Szczegóły błędu w trybie deweloperskim
- Logowanie błędów

## Optymalizacje Wydajności

### React.memo
Komponenty `SearchInput` i `RecipeCard` używają `React.memo` dla zapobiegania niepotrzebnym re-renderom.

### useCallback
Funkcje obsługi zdarzeń są opakowane w `useCallback` dla stabilności referencji.

### useMemo
- Klasy CSS są obliczane z `useMemo` w `SearchInput` i `RecipeCard`
- Formatowanie daty i ikony ocen są memoizowane w `RecipeCard`

## Integracja z API

### Endpointy
- `GET /api/profiles/me` - pobieranie preferencji użytkownika
- `GET /api/recipes?limit=6` - pobieranie ostatnich przepisów
- `POST /api/recipes/generate` - generowanie nowego przepisu

### Obsługa Błędów
- Błędy API są wyświetlane jako toast notifications
- Error boundaries obsługują nieoczekiwane błędy
- Walidacja po stronie klienta przed wysłaniem do API

## Stylowanie

### Tailwind CSS
Wszystkie komponenty używają Tailwind CSS z custom klasami dla:
- Responsywności
- Animacji i przejść
- Stanów hover/focus
- Motywów kolorów

### Shadcn/ui
Komponenty bazowe z Shadcn/ui:
- `Card`, `CardHeader`, `CardContent`
- `Button`, `Input`, `Label`
- `Badge`, `ScrollArea`, `Progress`

## Testowanie

### Testy Jednostkowe
- `SearchInput.test.tsx` - testy komponentu SearchInput
- `useRecipeGenerator.test.ts` - testy custom hooka

### Narzędzia Testowe
- Vitest jako test runner
- React Testing Library dla testów komponentów
- Mock fetch API dla testów integracyjnych

## Użycie

```tsx
import { RecipeGeneratorView } from '@/components/recipes';

function App() {
  return (
    <RecipeGeneratorView 
      initialPreferences={['vegetarian', 'gluten-free']}
    />
  );
}
```

## Zależności

- React 19
- TypeScript 5
- Tailwind CSS 4
- Shadcn/ui komponenty
- Lucide React (ikony)
- Custom hooks i typy
