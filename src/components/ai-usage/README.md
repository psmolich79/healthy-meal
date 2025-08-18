# Komponenty Analityki Użycia AI

Ten katalog zawiera komponenty React do wyświetlania szczegółowych statystyk i analiz użycia sztucznej inteligencji w aplikacji HealthyMeal.

## Struktura Komponentów

```
AIUsageStatsView (główny kontener)
├── UsageHeader (nagłówek z tytułem i opisem)
├── UsageSummary (podsumowanie statystyk)
│   ├── TotalGenerations (całkowita liczba generowań)
│   ├── TotalTokens (całkowita liczba tokenów)
│   └── TotalCost (całkowity koszt)
├── UsageCharts (wykresy analityczne)
│   ├── GenerationsChart (wykres generowań)
│   ├── TokensChart (wykres tokenów)
│   ├── CostChart (wykres kosztów)
│   ├── ModelBreakdown (podział na modele AI)
│   └── DailyBreakdown (dzienny podział)
├── PeriodSelector (wybór okresu analizy)
└── LoadingSpinner (wskaźnik ładowania)
```

## Komponenty

### AIUsageStatsView
Główny kontener widoku statystyk AI, który koordynuje wszystkie komponenty i zarządza stanem aplikacji.

**Props:**
- `className?: string` - dodatkowe klasy CSS

**Funkcjonalności:**
- Pobieranie statystyk AI z API
- Zarządzanie stanem ładowania i błędów
- Integracja z ErrorBoundary
- Responsywny layout

### UsageHeader
Nagłówek z tytułem i opisem strony statystyk AI.

**Props:**
- `className?: string` - dodatkowe klasy CSS

### UsageSummary
Sekcja z podsumowaniem kluczowych metryk.

**Props:**
- `stats: AiUsageStats` - statystyki AI
- `className?: string` - dodatkowe klasy CSS

#### TotalGenerations
Wyświetla całkowitą liczbę wygenerowanych przepisów.

**Props:**
- `totalGenerations: number` - liczba generowań
- `className?: string` - dodatkowe klasy CSS

#### TotalTokens
Wyświetla całkowitą liczbę użytych tokenów (wejście + wyjście).

**Props:**
- `totalInputTokens: number` - tokeny wejściowe
- `totalOutputTokens: number` - tokeny wyjściowe
- `className?: string` - dodatkowe klasy CSS

#### TotalCost
Wyświetla całkowity koszt użycia AI w USD.

**Props:**
- `totalCost: number` - całkowity koszt
- `className?: string` - dodatkowe klasy CSS

### UsageCharts
Sekcja z wykresami analitycznymi.

**Props:**
- `stats: AiUsageStats` - statystyki AI
- `className?: string` - dodatkowe klasy CSS

#### GenerationsChart
Wykres słupkowy pokazujący liczbę generowań w czasie.

**Props:**
- `dailyBreakdown: DailyBreakdownItem[]` - dzienny podział generowań
- `className?: string` - dodatkowe klasy CSS

#### TokensChart
Wykres liniowy pokazujący użycie tokenów w czasie.

**Props:**
- `dailyBreakdown: DailyBreakdownItem[]` - dzienny podział tokenów
- `className?: string` - dodatkowe klasy CSS

#### CostChart
Wykres liniowy pokazujący koszty w czasie.

**Props:**
- `dailyBreakdown: DailyBreakdownItem[]` - dzienny podział kosztów
- `className?: string` - dodatkowe klasy CSS

#### ModelBreakdown
Wykres kołowy pokazujący podział użycia na modele AI.

**Props:**
- `modelsUsed: Record<string, ModelStats>` - statystyki modeli
- `className?: string` - dodatkowe klasy CSS

#### DailyBreakdown
Tabela z dziennym podziałem wszystkich metryk.

**Props:**
- `dailyBreakdown: DailyBreakdownItem[]` - dzienny podział
- `className?: string` - dodatkowe klasy CSS

### PeriodSelector
Komponent do wyboru okresu analizy (dzień, tydzień, miesiąc, rok, niestandardowy).

**Props:**
- `currentPeriod: PeriodType` - aktualny okres
- `onPeriodChange: (period: PeriodType, startDate?: string, endDate?: string) => void` - callback zmiany okresu
- `className?: string` - dodatkowe klasy CSS

**Funkcjonalności:**
- Wybór predefiniowanych okresów
- Niestandardowy zakres dat
- Walidacja dat
- Responsywny design

### LoadingSpinner
Wskaźnik ładowania wyświetlany podczas pobierania danych.

**Props:**
- `isVisible: boolean` - czy spinner jest widoczny
- `status?: string` - tekst statusu
- `size?: 'sm' | 'md' | 'lg'` - rozmiar spinnera
- `className?: string` - dodatkowe klasy CSS

## Typy

### AiUsageStats
```typescript
interface AiUsageStats {
  period: PeriodType;
  start_date: string;
  end_date: string;
  total_generations: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost: number | null;
  models_used: Record<string, ModelStats>;
  daily_breakdown: DailyBreakdownItem[];
}
```

### PeriodType
```typescript
type PeriodType = "day" | "week" | "month" | "year" | "custom";
```

### DailyBreakdownItem
```typescript
interface DailyBreakdownItem {
  date: string;
  generations: number;
  cost: number | null;
}
```

### ModelStats
```typescript
interface ModelStats {
  generations: number;
  cost: number | null;
}
```

## Hooki

### useAIUsageStats
Custom hook do zarządzania stanem statystyk AI.

**Parametry:**
- `period: PeriodType` - okres analizy
- `startDate?: string` - niestandardowa data początkowa
- `endDate?: string` - niestandardowa data końcowa

**Zwraca:**
- `stats` - statystyki AI
- `isLoading` - stan ładowania
- `error` - błędy
- `refetch` - funkcja ponownego pobierania

**Użycie:**
```tsx
const { stats, isLoading, error, refetch } = useAIUsageStats('month');
```

## Integracja z API

### Endpoint
- `GET /api/ai/usage` - pobieranie statystyk AI

### Parametry Query
- `period` - okres analizy
- `start_date` - data początkowa (opcjonalnie)
- `end_date` - data końcowa (opcjonalnie)

### Przykład Request
```typescript
const response = await fetch('/api/ai/usage?period=month', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

## Stylowanie

### Tailwind CSS
Wszystkie komponenty używają Tailwind CSS z custom klasami dla:
- Responsywności
- Animacji i przejść
- Motywów kolorów
- Spacing i typografii

### Shadcn/ui
Komponenty bazowe z Shadcn/ui:
- `Card`, `CardHeader`, `CardContent`
- `Button`, `Select`, `Label`
- `Badge`, `ScrollArea`

### Recharts
Wykresy używają biblioteki Recharts:
- `BarChart`, `LineChart`, `PieChart`
- Responsywne wykresy
- Interaktywne tooltips
- Customizowalne kolory i style

## Responsywność

Komponenty są w pełni responsywne:
- **Mobile**: Pionowy layout z pełną szerokością
- **Tablet**: Poziomy layout z ograniczoną szerokością
- **Desktop**: Pełny layout z optymalnym wykorzystaniem przestrzeni

## Performance

### Optymalizacje
- Lazy loading komponentów
- Memoizacja wykresów
- Debounced period selection
- Efficient data fetching

### Caching
- Statystyki są cachowane w React Query
- Automatyczne odświeżanie danych
- Background refetching

## Testowanie

### Testy Jednostkowe
- `LoadingSpinner.test.tsx` - testy komponentu LoadingSpinner
- `useAIUsageStats.test.ts` - testy custom hooka

### Narzędzia Testowe
- Vitest jako test runner
- React Testing Library dla testów komponentów
- Mock fetch API dla testów integracyjnych

## Użycie

```tsx
import { AIUsageStatsView } from '@/components/ai-usage';

function AnalyticsPage() {
  return (
    <div>
      <AIUsageStatsView />
    </div>
  );
}
```

## Zależności

- React 19
- TypeScript 5
- Tailwind CSS 4
- Shadcn/ui komponenty
- Recharts (wykresy)
- Lucide React (ikony)
- Custom hooks i typy

## Wymagania

- Zalogowany użytkownik
- Dostęp do API AI usage
- Wsparcie dla wykresów w przeglądarce
- Responsywny design
