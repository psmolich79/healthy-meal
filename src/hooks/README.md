# Custom Hooks

Ten katalog zawiera custom hooki React używane w aplikacji HealthyMeal. Hooki zostały zaprojektowane do zarządzania stanem aplikacji, integracji z API i obsługi logiki biznesowej.

## Struktura Hooków

```
hooks/
├── useAIUsageStats.ts       # Zarządzanie statystykami AI
├── useAuthForm.ts           # Zarządzanie formularzami uwierzytelniania
├── useLocalStorage.ts       # Zarządzanie localStorage
├── useProfileForm.ts        # Zarządzanie formularzem profilu
├── useRecipeDetails.ts      # Zarządzanie szczegółami przepisu
├── useRecipeGenerator.ts    # Zarządzanie generowaniem przepisów
├── useRecipeList.ts         # Zarządzanie listą przepisów
├── useToast.ts              # Zarządzanie toast notifications
└── index.ts                 # Eksport wszystkich hooków
```

## Hooki

### useAIUsageStats

Hook do zarządzania statystykami użycia AI.

**Parametry:**
- `period: PeriodType` - okres analizy (day, week, month, year, custom)
- `startDate?: string` - niestandardowa data początkowa
- `endDate?: string` - niestandardowa data końcowa

**Zwraca:**
- `stats` - statystyki AI
- `isLoading` - stan ładowania
- `error` - błędy
- `refetch` - funkcja ponownego pobierania

**Użycie:**
```tsx
import { useAIUsageStats } from '@/hooks/useAIUsageStats';

function AnalyticsPage() {
  const { stats, isLoading, error, refetch } = useAIUsageStats('month');
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <h1>AI Usage Statistics</h1>
      <p>Total Generations: {stats.total_generations}</p>
      <p>Total Cost: ${stats.total_cost}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### useAuthForm

Hook do zarządzania formularzami uwierzytelniania (logowanie, rejestracja, reset hasła).

**Parametry:**
- `formType: AuthFormType` - typ formularza ('login' | 'register' | 'reset-password')

**Zwraca:**
- `formData` - dane formularza
- `errors` - błędy walidacji
- `isLoading` - stan ładowania
- `updateField` - funkcja aktualizacji pola
- `handleSubmit` - funkcja submit
- `resetForm` - funkcja resetowania
- `setDefaultEmail` - funkcja ustawienia domyślnego emaila
- `validateField` - funkcja walidacji pola
- `validateForm` - funkcja walidacji całego formularza

**Użycie:**
```tsx
import { useAuthForm } from '@/hooks/useAuthForm';

function LoginForm() {
  const { 
    formData, 
    errors, 
    isLoading, 
    updateField, 
    handleSubmit 
  } = useAuthForm('login');
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => updateField('email', e.target.value)}
        placeholder="Email"
      />
      {errors.email && <span className="error">{errors.email}</span>}
      
      <input
        type="password"
        value={formData.password || ''}
        onChange={(e) => updateField('password', e.target.value)}
        placeholder="Password"
      />
      {errors.password && <span className="error">{errors.password}</span>}
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### useLocalStorage

Hook do zarządzania danymi w localStorage z obsługą błędów i fallback.

**Parametry:**
- `key: string` - klucz w localStorage
- `initialValue: T` - wartość początkowa
- `serializer?: Serializer<T>` - opcjonalny serializer
- `deserializer?: Deserializer<T>` - opcjonalny deserializer

**Zwraca:**
- `value` - aktualna wartość
- `setValue` - funkcja ustawienia wartości
- `removeValue` - funkcja usunięcia wartości
- `isLoading` - stan ładowania

**Użycie:**
```tsx
import { useLocalStorage } from '@/hooks/useLocalStorage';

function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

### useProfileForm

Hook do zarządzania formularzem profilu użytkownika.

**Zwraca:**
- `preferences` - preferencje użytkownika
- `accordionState` - stan akordeonu
- `isLoading` - stan ładowania
- `hasChanges` - czy są niezapisane zmiany
- `updatePreferences` - funkcja aktualizacji preferencji
- `toggleAccordion` - funkcja przełączania sekcji
- `expandAll` - funkcja rozwijania wszystkich sekcji
- `collapseAll` - funkcja zwijania wszystkich sekcji
- `saveProfile` - funkcja zapisu profilu
- `loadProfile` - funkcja ładowania profilu

**Użycie:**
```tsx
import { useProfileForm } from '@/hooks/useProfileForm';

function ProfileForm() {
  const {
    preferences,
    accordionState,
    isLoading,
    hasChanges,
    updatePreferences,
    toggleAccordion,
    saveProfile
  } = useProfileForm();
  
  const handleSave = async () => {
    await saveProfile();
  };
  
  return (
    <div>
      <PreferencesAccordion
        preferences={preferences}
        onPreferencesChange={updatePreferences}
        accordionState={accordionState}
        onToggle={toggleAccordion}
      />
      
      <button 
        onClick={handleSave} 
        disabled={!hasChanges || isLoading}
      >
        {isLoading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}
```

### useRecipeDetails

Hook do zarządzania szczegółami przepisu.

**Parametry:**
- `recipeId: string` - ID przepisu

**Zwraca:**
- `recipe` - dane przepisu
- `isLoading` - stan ładowania
- `error` - błędy
- `refetch` - funkcja ponownego pobierania
- `updateVisibility` - funkcja aktualizacji widoczności
- `rateRecipe` - funkcja oceniania przepisu
- `saveRecipe` - funkcja zapisywania przepisu
- `regenerateRecipe` - funkcja regeneracji przepisu

**Użycie:**
```tsx
import { useRecipeDetails } from '@/hooks/useRecipeDetails';

function RecipeDetails({ recipeId }: { recipeId: string }) {
  const {
    recipe,
    isLoading,
    error,
    updateVisibility,
    rateRecipe,
    saveRecipe
  } = useRecipeDetails(recipeId);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <h1>{recipe.title}</h1>
      <button onClick={() => rateRecipe('up')}>👍</button>
      <button onClick={() => rateRecipe('down')}>👎</button>
      <button onClick={() => saveRecipe()}>Save</button>
      <button onClick={() => updateVisibility(!recipe.is_visible)}>
        {recipe.is_visible ? 'Make Private' : 'Make Public'}
      </button>
    </div>
  );
}
```

### useRecipeGenerator

Hook do zarządzania generowaniem przepisów.

**Zwraca:**
- `query` - aktualne zapytanie
- `isLoading` - stan ładowania
- `error` - błędy
- `canGenerate` - czy można generować
- `generateRecipe` - funkcja generowania przepisu
- `updateQuery` - funkcja aktualizacji zapytania
- `clearError` - funkcja czyszczenia błędów
- `isQueryValid` - czy zapytanie jest poprawne
- `characterCount` - liczba znaków
- `validateQuery` - funkcja walidacji zapytania

**Użycie:**
```tsx
import { useRecipeGenerator } from '@/hooks/useRecipeGenerator';

function RecipeGenerator() {
  const {
    query,
    isLoading,
    error,
    canGenerate,
    generateRecipe,
    updateQuery,
    clearError,
    characterCount
  } = useRecipeGenerator();
  
  const handleSubmit = async () => {
    const result = await generateRecipe(query);
    if (result) {
      // Navigate to recipe details
      window.location.href = `/recipes/${result.id}`;
    }
  };
  
  return (
    <div>
      <textarea
        value={query}
        onChange={(e) => updateQuery(e.target.value)}
        placeholder="Describe the recipe you want..."
      />
      <span>{characterCount}/500</span>
      
      {error && (
        <div className="error">
          {error}
          <button onClick={clearError}>×</button>
        </div>
      )}
      
      <button 
        onClick={handleSubmit} 
        disabled={!canGenerate || isLoading}
      >
        {isLoading ? 'Generating...' : 'Generate Recipe'}
      </button>
    </div>
  );
}
```

### useRecipeList

Hook do zarządzania listą przepisów z paginacją i filtrowaniem.

**Parametry:**
- `initialFilters?: RecipeFilters` - początkowe filtry
- `initialSort?: RecipeSort` - początkowe sortowanie

**Zwraca:**
- `recipes` - lista przepisów
- `isLoading` - stan ładowania
- `error` - błędy
- `filters` - aktualne filtry
- `sort` - aktualne sortowanie
- `pagination` - informacje o paginacji
- `updateFilters` - funkcja aktualizacji filtrów
- `updateSort` - funkcja aktualizacji sortowania
- `loadPage` - funkcja ładowania strony
- `refresh` - funkcja odświeżenia listy

**Użycie:**
```tsx
import { useRecipeList } from '@/hooks/useRecipeList';

function RecipeList() {
  const {
    recipes,
    isLoading,
    error,
    filters,
    pagination,
    updateFilters,
    loadPage,
    refresh
  } = useRecipeList();
  
  const handleFilterChange = (newFilters: RecipeFilters) => {
    updateFilters(newFilters);
  };
  
  const handlePageChange = (page: number) => {
    loadPage(page);
  };
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <RecipeFilters 
        filters={filters} 
        onChange={handleFilterChange} 
      />
      
      <RecipeGrid recipes={recipes} />
      
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
      
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

### useToast

Hook do zarządzania toast notifications.

**Zwraca:**
- `toast` - funkcja generyczna
- `success` - funkcja dla sukcesu
- `error` - funkcja dla błędów
- `info` - funkcja dla informacji
- `warning` - funkcja dla ostrzeżeń

**Użycie:**
```tsx
import { useToast } from '@/hooks/useToast';

function ProfileForm() {
  const { success, error } = useToast();
  
  const handleSave = async () => {
    try {
      await saveProfile();
      success('Profile updated successfully!');
    } catch (err) {
      error('Failed to update profile');
    }
  };
  
  return (
    <button onClick={handleSave}>
      Save Profile
    </button>
  );
}
```

## Typy

### AuthFormType
```typescript
type AuthFormType = 'login' | 'register' | 'reset-password';
```

### AuthFormData
```typescript
interface AuthFormData {
  email: string;
  password?: string;
  confirmPassword?: string;
  rememberMe?: boolean;
  acceptTerms?: boolean;
}
```

### RecipeFilters
```typescript
interface RecipeFilters {
  search?: string;
  preferences?: string[];
  visibility?: 'all' | 'public' | 'private';
  rating?: 'all' | 'liked' | 'disliked';
}
```

### RecipeSort
```typescript
type RecipeSort = 'created_at_desc' | 'created_at_asc' | 'title_asc' | 'title_desc';
```

### PeriodType
```typescript
type PeriodType = "day" | "week" | "month" | "year" | "custom";
```

## Walidacja

### Email
- Wymagany
- Poprawny format emaila

### Hasło
- Minimum 8 znaków
- Dla rejestracji: wielka litera, mała litera, cyfra

### Potwierdzenie hasła (rejestracja)
- Identyczne z hasłem

### Terms (rejestracja)
- Musi być zaakceptowane

### Zapytanie przepisu
- Minimum 3 znaki
- Maksimum 500 znaków

## Integracja z API

Hooki integrują się z różnymi serwisami API:

- **AuthService** - uwierzytelnianie
- **ProfileService** - zarządzanie profilem
- **RecipeService** - zarządzanie przepisami
- **AiService** - generowanie przepisów
- **RatingService** - ocenianie przepisów

## Obsługa błędów

Wszystkie hooki implementują:

- Obsługę błędów API
- Komunikaty błędów użytkownika
- Retry logic
- Fallback values
- Error boundaries

## Performance

### Optymalizacje
- React.memo dla komponentów
- useCallback dla funkcji
- useMemo dla obliczeń
- Lazy loading
- Debounced updates

### Caching
- React Query dla danych API
- LocalStorage dla preferencji
- Memoization dla obliczeń
- Background refetching

## Testowanie

### Test Files
- `useAuthForm.test.ts` - testy useAuthForm
- `useLocalStorage.test.ts` - testy useLocalStorage

### Testing Utilities
- React Testing Library
- Vitest
- Custom test helpers
- Mock implementations

## Użycie

```tsx
import { 
  useAuthForm, 
  useProfileForm, 
  useRecipeGenerator,
  useToast 
} from '@/hooks';

function App() {
  const { success } = useToast();
  
  // Use hooks in components
  return (
    <div>
      <AuthForm />
      <ProfileForm />
      <RecipeGenerator />
    </div>
  );
}
```

## Zależności

### Core
- React 19
- TypeScript 5

### State Management
- React Query (tanstack/react-query)
- LocalStorage API
- Custom state logic

### Validation
- Zod schemas
- Custom validation rules

## Wymagania

- React 19+
- TypeScript 5+
- Browser localStorage support
- Fetch API support

## Wsparcie

W przypadku problemów z hookami:
1. Sprawdź testy jednostkowe
2. Sprawdź implementację hooka
3. Sprawdź integrację z API
4. Otwórz issue w repozytorium
