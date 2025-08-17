# Plan implementacji widoku Statystyki Użycia AI (AIUsageStats)

## 1. Przegląd
Widok statystyk użycia AI to ekran prezentujący użytkownikom szczegółowe informacje o ich wykorzystaniu modeli AI, w tym liczbę generowań, zużycie tokenów, koszty oraz analizę dzienną. Widok zawiera interaktywne wykresy, podsumowania okresowe i możliwość wyboru różnych przedziałów czasowych. Dane są prezentowane w sposób przejrzysty i zrozumiały, umożliwiając użytkownikom monitorowanie swoich wydatków na AI.

## 2. Routing widoku
- **Główna ścieżka**: `/ai-usage`
- **Alternatywne ścieżki**: `/usage`, `/ai-stats`, `/analytics`
- **Metoda routingu**: Astro static routing z React component

## 3. Struktura komponentów
```
AIUsageStatsView
├── UsageHeader
├── PeriodSelector
├── UsageSummary
│   ├── TotalGenerations
│   ├── TotalTokens
│   └── TotalCost
├── UsageCharts
│   ├── GenerationsChart
│   ├── TokensChart
│   └── CostChart
├── ModelBreakdown
├── DailyBreakdown
├── LoadingSpinner
└── ErrorBoundary
```

## 4. Szczegóły komponentów

### AIUsageStatsView
- **Opis komponentu**: Główny kontener widoku statystyk AI, zarządza stanem i koordynuje wszystkie operacje
- **Główne elementy**: Container div z flexbox layout, header, sekcje statystyk, wykresy
- **Komponenty Shadcn/ui**: `Card`, `CardContent`
- **Obsługiwane interakcje**: Inicjalizacja widoku, zarządzanie stanem statystyk, obsługa błędów
- **Obsługiwana walidacja**: Sprawdzenie uwierzytelnienia użytkownika, weryfikacja istnienia profilu
- **Typy**: `AIUsageStatsViewProps`, `AIUsageStatsState`
- **Propsy**: `initialPeriod?: string`, `className?: string`

### UsageHeader
- **Opis komponentu**: Nagłówek widoku statystyk z tytułem, opisem i podstawowymi informacjami
- **Główne elementy**: H1 title, description text, last updated info
- **Komponenty Shadcn/ui**: `CardHeader`
- **Obsługiwane interakcje**: Wyświetlanie informacji o statystykach
- **Obsługiwana walidacja**: Sprawdzenie czy statystyki są załadowane
- **Typy**: `UsageHeaderProps`
- **Propsy**: `lastUpdated?: string`, `className?: string`

### PeriodSelector
- **Opis komponentu**: Selektor okresu dla statystyk (dzień, tydzień, miesiąc, rok, niestandardowy)
- **Główne elementy**: Select container, period options, custom date range picker
- **Komponenty Shadcn/ui**: `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue`, `Calendar`, `Popover`, `PopoverTrigger`, `PopoverContent`
- **Obsługiwane interakcje**: Zmiana okresu, wybór niestandardowego zakresu dat
- **Obsługiwana walidacja**: 
  - Sprawdzenie poprawności zakresu dat
  - Maksymalny zakres 1 rok
  - Data początkowa nie może być późniejsza niż końcowa
- **Typy**: `PeriodSelectorProps`
- **Propsy**: `currentPeriod: string`, `onPeriodChange: (period: string) => void`, `onDateRangeChange: (startDate: string, endDate: string) => void`, `disabled?: boolean`

### UsageSummary
- **Opis komponentu**: Kontener podsumowania głównych statystyk (generowania, tokeny, koszty)
- **Główne elementy**: Summary container, metric cards, responsive layout
- **Komponenty Shadcn/ui**: `Card`, `CardContent`
- **Obsługiwane interakcje**: Wyświetlanie podsumowania, hover effects
- **Obsługiwana walidacja**: Sprawdzenie czy dane są dostępne
- **Typy**: `UsageSummaryProps`
- **Propsy**: `summary: UsageSummaryData`, `className?: string`

### TotalGenerations
- **Opis komponentu**: Karta metryki z całkowitą liczbą generowań
- **Główne elementy**: Metric card, number display, trend indicator, icon
- **Komponenty Shadcn/ui**: `Card`, `CardContent`, `Badge`
- **Obsługiwane interakcje**: Wyświetlanie metryki, trend comparison
- **Obsługiwana walidacja**: Sprawdzenie czy liczba jest poprawna
- **Typy**: `TotalGenerationsProps`
- **Propsy**: `count: number`, `trend?: number`, `className?: string`

### TotalTokens
- **Opis komponentu**: Karta metryki z całkowitym zużyciem tokenów
- **Główne elementy**: Metric card, number display, trend indicator, icon
- **Komponenty Shadcn/ui**: `Card`, `CardContent`, `Badge`
- **Obsługiwane interakcje**: Wyświetlanie metryki, trend comparison
- **Obsługiwana walidacja**: Sprawdzenie czy liczba jest poprawna
- **Typy**: `TotalTokensProps`
- **Propsy**: `inputTokens: number`, `outputTokens: number`, `trend?: number`, `className?: string`

### TotalCost
- **Opis komponentu**: Karta metryki z całkowitym kosztem
- **Główne elementy**: Metric card, cost display, currency, trend indicator
- **Komponenty Shadcn/ui**: `Card`, `CardContent`, `Badge`
- **Obsługiwane interakcje**: Wyświetlanie metryki, trend comparison
- **Obsługiwana walidacja**: Sprawdzenie czy koszt jest poprawny
- **Typy**: `TotalCostProps`
- **Propsy**: `cost: number`, `currency: string`, `trend?: number`, `className?: string`

### UsageCharts
- **Opis komponentu**: Kontener wykresów z różnymi typami wizualizacji danych
- **Główne elementy**: Charts container, chart components, responsive layout
- **Komponenty Shadcn/ui**: `Card`, `CardContent`, `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`
- **Obsługiwane interakcje**: Interaktywne wykresy, zoom, hover tooltips
- **Obsługiwana walidacja**: Sprawdzenie czy dane wykresów są dostępne
- **Typy**: `UsageChartsProps`
- **Propsy**: `chartData: ChartData`, `period: string`, `className?: string`

### GenerationsChart
- **Opis komponentu**: Wykres słupkowy pokazujący liczbę generowań w czasie
- **Główne elementy**: Bar chart, x-axis (dates), y-axis (counts), tooltips
- **Komponenty Shadcn/ui**: `Card`, `CardContent` + biblioteka wykresów (Recharts/Chart.js)
- **Obsługiwane interakcje**: Hover tooltips, zoom, pan
- **Obsługiwana walidacja**: Sprawdzenie czy dane wykresu są dostępne
- **Typy**: `GenerationsChartProps`
- **Propsy**: `data: DailyUsageDto[]`, `period: string`, `className?: string`

### TokensChart
- **Opis komponentu**: Wykres liniowy pokazujący zużycie tokenów w czasie
- **Główne elementy**: Line chart, x-axis (dates), y-axis (tokens), tooltips
- **Komponenty Shadcn/ui**: `Card`, `CardContent` + biblioteka wykresów (Recharts/Chart.js)
- **Obsługiwane interakcje**: Hover tooltips, zoom, pan
- **Obsługiwana walidacja**: Sprawdzenie czy dane wykresu są dostępne
- **Typy**: `TokensChartProps`
- **Propsy**: `data: DailyUsageDto[]`, `period: string`, `className?: string`

### CostChart
- **Opis komponentu**: Wykres obszarowy pokazujący koszty w czasie
- **Główne elementy**: Area chart, x-axis (dates), y-axis (costs), tooltips
- **Komponenty Shadcn/ui**: `Card`, `CardContent` + biblioteka wykresów (Recharts/Chart.js)
- **Obsługiwane interakcje**: Hover tooltips, zoom, pan
- **Obsługiwana walidacja**: Sprawdzenie czy dane wykresu są dostępne
- **Typy**: `CostChartProps`
- **Propsy**: `data: DailyUsageDto[]`, `period: string`, `currency: string`, `className?: string`

### ModelBreakdown
- **Opis komponentu**: Podział użycia według modeli AI z procentami i kosztami
- **Główne elementy**: Breakdown container, model cards, percentages, costs
- **Komponenty Shadcn/ui**: `Card`, `CardContent`, `Progress`
- **Obsługiwane interakcje**: Wyświetlanie breakdown, hover effects
- **Obsługiwana walidacja**: Sprawdzenie czy dane breakdown są dostępne
- **Typy**: `ModelBreakdownProps`
- **Propsy**: `models: Record<string, ModelUsageDto>`, `totalCost: number`, `className?: string`

### DailyBreakdown
- **Opis komponentu**: Tabela dziennego podziału z możliwością sortowania
- **Główne elementy**: Table container, sortable columns, pagination
- **Komponenty Shadcn/ui**: `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`
- **Obsługiwane interakcje**: Sortowanie kolumn, paginacja, export
- **Obsługiwana walidacja**: Sprawdzenie czy dane tabeli są dostępne
- **Typy**: `DailyBreakdownProps`
- **Propsy**: `data: DailyUsageDto[]`, `onSort: (column: string, direction: 'asc' | 'desc') => void`, `className?: string`

### LoadingSpinner
- **Opis komponentu**: Wskaźnik ładowania wyświetlany podczas ładowania statystyk
- **Główne elementy**: Spinner animation, tekst statusu
- **Komponenty Shadcn/ui**: `Spinner` (custom)
- **Obsługiwane interakcje**: Animacja, aktualizacja statusu
- **Obsługiwana walidacja**: Sprawdzenie czy ładowanie jest w toku
- **Typy**: `LoadingSpinnerProps`
- **Propsy**: `isVisible: boolean`, `status?: string`, `size?: 'sm' | 'md' | 'lg'`

## 5. Komponenty Shadcn/ui

### Komponenty layoutu
- **Card**: Główny kontener statystyk AI
- **CardHeader**: Nagłówek statystyk
- **CardContent**: Zawartość statystyk z wykresami

### Komponenty selektora okresu
- **Select**: Selektor okresu (dzień, tydzień, miesiąc, rok)
- **SelectTrigger**: Przycisk otwierający select
- **SelectContent**: Zawartość selecta
- **SelectItem**: Pojedyncza opcja okresu
- **SelectValue**: Wyświetlana wartość okresu
- **Calendar**: Kalendarz do wyboru niestandardowego zakresu dat
- **Popover**: Popover z kalendarzem

### Komponenty metryk
- **Card**: Karty metryk (generowania, tokeny, koszty)
- **CardContent**: Zawartość kart metryk
- **Badge**: Wskaźniki trendów

### Komponenty wykresów
- **Card**: Kontenery wykresów
- **CardContent**: Zawartość wykresów
- **Tabs**: Przełączniki między typami wykresów
- **TabsContent**: Zawartość zakładek
- **TabsList**: Lista zakładek
- **TabsTrigger**: Przyciski zakładek

### Komponenty tabeli
- **Table**: Tabela dziennego podziału
- **TableHeader**: Nagłówek tabeli
- **TableBody**: Zawartość tabeli
- **TableRow**: Wiersze tabeli
- **TableHead**: Komórki nagłówka
- **TableCell**: Komórki danych

### Komponenty pomocnicze
- **Progress**: Paski postępu dla breakdown modeli
- **Spinner**: Wskaźnik ładowania (custom)

## 6. Typy

### Typy komponentów
```typescript
interface AIUsageStatsViewProps {
  initialPeriod?: string;
  className?: string;
}

interface UsageHeaderProps {
  lastUpdated?: string;
  className?: string;
}

interface PeriodSelectorProps {
  currentPeriod: string;
  onPeriodChange: (period: string) => void;
  onDateRangeChange: (startDate: string, endDate: string) => void;
  disabled?: boolean;
}

interface UsageSummaryProps {
  summary: UsageSummaryData;
  className?: string;
}

interface TotalGenerationsProps {
  count: number;
  trend?: number;
  className?: string;
}

interface TotalTokensProps {
  inputTokens: number;
  outputTokens: number;
  trend?: number;
  className?: string;
}

interface TotalCostProps {
  cost: number;
  currency: string;
  trend?: number;
  className?: string;
}

interface UsageChartsProps {
  chartData: ChartData;
  period: string;
  className?: string;
}

interface GenerationsChartProps {
  data: DailyUsageDto[];
  period: string;
  className?: string;
}

interface TokensChartProps {
  data: DailyUsageDto[];
  period: string;
  className?: string;
}

interface CostChartProps {
  data: DailyUsageDto[];
  period: string;
  currency: string;
  className?: string;
}

interface ModelBreakdownProps {
  models: Record<string, ModelUsageDto>;
  totalCost: number;
  className?: string;
}

interface DailyBreakdownProps {
  data: DailyUsageDto[];
  onSort: (column: string, direction: 'asc' | 'desc') => void;
  className?: string;
}

interface LoadingSpinnerProps {
  isVisible: boolean;
  status?: string;
  size?: 'sm' | 'md' | 'lg';
}
```

### Typy danych
```typescript
interface UsageSummaryData {
  totalGenerations: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  trend: {
    generations: number;
    tokens: number;
    cost: number;
  };
}

interface ChartData {
  daily: DailyUsageDto[];
  models: Record<string, ModelUsageDto>;
  summary: UsageSummaryData;
}

interface PeriodOption {
  value: string;
  label: string;
  description: string;
  days: number;
}

interface DateRange {
  startDate: string;
  endDate: string;
}
```

### Typy stanu
```typescript
interface AIUsageStatsState {
  usageData: AiUsageDto | null;
  isLoading: boolean;
  error: string | null;
  selectedPeriod: string;
  dateRange: DateRange;
  chartData: ChartData | null;
}

interface ChartState {
  isLoading: boolean;
  data: ChartData | null;
  error: string | null;
}

interface PeriodState {
  currentPeriod: string;
  customDateRange: DateRange | null;
  isCustom: boolean;
}
```

### Typy akcji
```typescript
interface UsageAction {
  type: 'set_usage_data' | 'set_period' | 'set_date_range' | 'set_loading' | 'set_error';
  payload: any;
}

interface PeriodAction {
  type: 'change_period' | 'set_custom_range' | 'reset_period';
  payload: any;
}

interface ChartAction {
  type: 'update_chart_data' | 'set_chart_loading' | 'set_chart_error';
  payload: any;
}
```

## 6. Zarządzanie stanem

### Stan lokalny komponentu
- `usageData` - dane statystyk AI
- `isLoading` - stan ładowania statystyk
- `error` - błędy walidacji lub API
- `selectedPeriod` - wybrany okres
- `dateRange` - niestandardowy zakres dat
- `chartData` - dane wykresów

### Custom Hook: useAIUsageStats
```typescript
const useAIUsageStats = () => {
  const [state, setState] = useState<AIUsageStatsState>({
    usageData: null,
    isLoading: false,
    error: null,
    selectedPeriod: 'month',
    dateRange: {
      startDate: '',
      endDate: ''
    },
    chartData: null
  });

  const fetchUsageStats = useCallback(async (period: string, dateRange?: DateRange) => {
    // Logika pobierania statystyk
  }, []);

  const changePeriod = useCallback((period: string) => {
    setState(prev => ({
      ...prev,
      selectedPeriod: period
    }));
    fetchUsageStats(period);
  }, [fetchUsageStats]);

  const setCustomDateRange = useCallback((startDate: string, endDate: string) => {
    setState(prev => ({
      ...prev,
      dateRange: { startDate, endDate },
      selectedPeriod: 'custom'
    }));
    fetchUsageStats('custom', { startDate, endDate });
  }, [fetchUsageStats]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetchUsageStats,
    changePeriod,
    setCustomDateRange,
    clearError
  };
};
```

### Stan globalny (Context)
- `userProfile` - profil użytkownika z preferencjami
- `authState` - stan uwierzytelnienia
- `aiUsage` - globalne statystyki użycia AI

## 7. Integracja API

### Endpoint: GET /api/ai/usage
- **Typ żądania**: Query parameters (period, start_date, end_date)
- **Typ odpowiedzi**: `AiUsageDto`
- **Autoryzacja**: Wymagany Bearer token
- **Walidacja**: Użytkownik musi być zalogowany

### Implementacja wywołania API
```typescript
const fetchUsageStats = async (params: {
  period?: string;
  start_date?: string;
  end_date?: string;
}): Promise<AiUsageDto> => {
  const queryParams = new URLSearchParams();
  
  if (params.period) {
    queryParams.append('period', params.period);
  }
  
  if (params.start_date) {
    queryParams.append('start_date', params.start_date);
  }
  
  if (params.end_date) {
    queryParams.append('end_date', params.end_date);
  }

  const response = await fetch(`/api/ai/usage?${queryParams}`, {
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
```

### Obsługa odpowiedzi
- **Sukces (200)**: Aktualizacja stanu lokalnego, wyświetlenie statystyk
- **Błąd (400)**: Walidacja nieudana, wyświetlenie błędu
- **Błąd (401)**: Brak autoryzacji, przekierowanie do logowania
- **Błąd (500)**: Błąd serwera, wyświetlenie komunikatu o błędzie

## 8. Interakcje użytkownika

### Wybór okresu
1. Użytkownik wybiera okres z dropdown (dzień, tydzień, miesiąc, rok)
2. Statystyki są automatycznie odświeżane
3. Wykresy są aktualizowane z nowymi danymi
4. Podsumowanie jest przeliczane

### Niestandardowy zakres dat
1. Użytkownik klika "Niestandardowy" w selektorze okresu
2. Pojawiają się pola wyboru dat
3. Użytkownik wybiera zakres dat
4. Statystyki są pobierane dla wybranego zakresu

### Interakcja z wykresami
1. Użytkownik hoveruje nad elementami wykresu
2. Tooltips wyświetlają szczegółowe informacje
3. Użytkownik może zoomować i przesuwać wykresy
4. Wykresy są responsywne na różne rozmiary ekranu

### Sortowanie tabeli dziennej
1. Użytkownik klika nagłówek kolumny
2. Dane są sortowane według wybranej kolumny
3. Kierunek sortowania się zmienia (asc/desc)
4. Paginacja jest zachowywana

### Eksport danych
1. Użytkownik klika przycisk eksportu
2. Dane są eksportowane w formacie CSV/JSON
3. Plik jest pobierany na urządzenie użytkownika
4. Eksport zawiera wszystkie widoczne dane

## 9. Warunki i walidacja

### Warunki wymagane przez API
- **Uwierzytelnienie**: Użytkownik musi być zalogowany (Bearer token)
- **Parametry dat**: Poprawne formaty dat (ISO 8601)
- **Zakres dat**: Maksymalny zakres 1 rok
- **Parametry okresu**: Poprawne wartości period

### Walidacja na poziomie komponentów
- **PeriodSelector**: 
  - Sprawdzenie poprawności zakresu dat
  - Maksymalny zakres 1 rok
  - Data początkowa nie może być późniejsza niż końcowa
- **UsageCharts**: 
  - Sprawdzenie czy dane wykresów są dostępne
  - Walidacja formatu danych
- **DailyBreakdown**: 
  - Sprawdzenie czy dane tabeli są dostępne
  - Walidacja kolumn sortowania

### Wpływ na stan interfejsu
- **Błędy walidacji**: Wyświetlenie komunikatów błędów, dezaktywacja kontroli
- **Stan ładowania**: Wyświetlenie spinnera, dezaktywacja interfejsu
- **Brak uwierzytelnienia**: Przekierowanie do logowania
- **Brak danych**: Wyświetlenie komunikatu o braku danych
- **Sukces**: Aktualizacja wszystkich komponentów z nowymi danymi

## 10. Obsługa błędów

### Typy błędów
1. **Błędy walidacji (400)**: Nieprawidłowe parametry dat
2. **Błędy autoryzacji (401)**: Brak lub nieprawidłowy token
3. **Błędy uprawnień (403)**: Brak uprawnień do przeglądania statystyk
4. **Błędy serwera (500)**: Wewnętrzne błędy serwera
5. **Błędy sieci**: Problemy z połączeniem

### Strategie obsługi błędów
- **Inline errors**: Błędy wyświetlane w odpowiednich sekcjach
- **Toast notifications**: Krótkie komunikaty o błędach
- **Error boundaries**: Obsługa nieoczekiwanych błędów
- **Retry logic**: Automatyczne ponowienie dla błędów sieci
- **Fallback UI**: Alternatywny interfejs przy błędach

### Komunikaty błędów
- **Walidacja dat**: "Nieprawidłowy zakres dat"
- **Autoryzacja**: "Musisz być zalogowany, aby przeglądać statystyki"
- **Brak uprawnień**: "Nie masz uprawnień do przeglądania statystyk"
- **Serwer**: "Wystąpił błąd serwera. Spróbuj ponownie później"
- **Sieć**: "Problem z połączeniem. Sprawdź swoje połączenie internetowe"

## 11. Kroki implementacji

### 1. Przygotowanie struktury plików
```
src/
├── pages/
│   └── ai-usage.astro
├── components/
│   └── ai-usage/
│       ├── AIUsageStatsView.tsx
│       ├── UsageHeader.tsx
│       ├── PeriodSelector.tsx
│       ├── UsageSummary.tsx
│       ├── TotalGenerations.tsx
│       ├── TotalTokens.tsx
│       ├── TotalCost.tsx
│       ├── UsageCharts.tsx
│       ├── GenerationsChart.tsx
│       ├── TokensChart.tsx
│       ├── CostChart.tsx
│       ├── ModelBreakdown.tsx
│       ├── DailyBreakdown.tsx
│       └── LoadingSpinner.tsx
├── hooks/
│   └── useAIUsageStats.ts
└── utils/
    ├── chart-utils.ts
    └── date-utils.ts
```

### 2. Implementacja typów i interfejsów
- Stworzenie wszystkich typów komponentów
- Definicja typów danych i stanu
- Implementacja typów akcji

### 3. Implementacja custom hooka
- Stworzenie `useAIUsageStats`
- Implementacja logiki zarządzania statystykami
- Obsługa stanu i błędów

### 4. Implementacja komponentów UI
- Stworzenie podstawowych komponentów
- Implementacja logiki wyświetlania
- Dodanie obsługi zdarzeń

### 5. Integracja z API
- Implementacja wywołania `/api/ai/usage`
- Obsługa odpowiedzi i błędów
- Dodanie autoryzacji

### 6. Implementacja wykresów
- Integracja z biblioteką wykresów (Chart.js/Recharts)
- Responsywne wykresy
- Interaktywne tooltips

### 7. Implementacja selektora okresu
- Dropdown z opcjami okresu
- Niestandardowy wybór dat
- Walidacja zakresu dat

### 8. Implementacja sortowania i paginacji
- Sortowanie kolumn tabeli
- Paginacja wyników
- Eksport danych

### 9. Implementacja responsywności
- Mobile-first design
- Responsive charts
- Touch-friendly interactions

### 10. Testowanie i optymalizacja
- Testy jednostkowe komponentów
- Testy integracyjne
- Optymalizacja wydajności
- Accessibility testing

### 11. Integracja z routingiem
- Stworzenie pliku `ai-usage.astro`
- Integracja z layoutem aplikacji
- Dodanie meta tagów i SEO

### 12. Finalizacja
- Code review
- Dokumentacja komponentów
- Testy end-to-end
- Deployment
