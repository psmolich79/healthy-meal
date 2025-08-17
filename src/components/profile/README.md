# Komponenty Profilu Użytkownika

Ten katalog zawiera komponenty React do zarządzania profilem użytkownika w aplikacji Healthy Meal.

## Struktura komponentów

```
ProfileFormView (główny kontener)
├── ProfileHeader (nagłówek profilu)
├── PreferencesAccordion (akordeon preferencji)
│   ├── DietSection (sekcja preferencji dietetycznych)
│   ├── CuisineSection (sekcja preferencji kulinarnych)
│   └── AllergiesSection (sekcja alergii i ograniczeń)
├── SaveButton (przycisk zapisu)
├── LoadingSpinner (wskaźnik ładowania)
└── ErrorBoundary (obsługa błędów)
```

## Komponenty

### ProfileFormView
Główny komponent widoku profilu, który koordynuje wszystkie inne komponenty i zarządza stanem aplikacji.

**Props:**
- `initialPreferences?: string[]` - początkowe preferencje użytkownika
- `className?: string` - dodatkowe klasy CSS

**Funkcjonalności:**
- Ładowanie profilu użytkownika z API
- Zarządzanie stanem preferencji
- Obsługa błędów i walidacji
- Zapisywanie zmian do API

### ProfileHeader
Nagłówek profilu z informacjami o użytkowniku i statusie profilu.

**Props:**
- `userProfile?: ProfileDto` - profil użytkownika
- `className?: string` - dodatkowe klasy CSS

### PreferencesAccordion
Główny komponent akordeonu zawierający wszystkie sekcje preferencji.

**Props:**
- `preferences: string[]` - aktualne preferencje użytkownika
- `onPreferencesChange: (preferences: string[]) => void` - callback zmiany preferencji
- `isLoading: boolean` - stan ładowania
- `accordionState` - stan rozwinięcia sekcji
- `onAccordionToggle` - callback przełączania sekcji
- `onExpandAll` - callback rozwijania wszystkich sekcji
- `onCollapseAll` - callback zwijania wszystkich sekcji

### DietSection
Sekcja preferencji dietetycznych (wegetarianizm, weganizm, keto, itp.).

**Props:**
- `preferences: string[]` - aktualne preferencje
- `onChange: (preferences: string[]) => void` - callback zmiany preferencji
- `isExpanded: boolean` - czy sekcja jest rozwinięta

### CuisineSection
Sekcja preferencji kulinarnych (kuchnia włoska, azjatycka, meksykańska, itp.).

**Props:**
- `preferences: string[]` - aktualne preferencje
- `onChange: (preferences: string[]) => void` - callback zmiany preferencji
- `isExpanded: boolean` - czy sekcja jest rozwinięta

### AllergiesSection
Sekcja alergii i ograniczeń pokarmowych (gluten, laktoza, orzechy, itp.).

**Props:**
- `preferences: string[]` - aktualne preferencje
- `onChange: (preferences: string[]) => void` - callback zmiany preferencji
- `isExpanded: boolean` - czy sekcja jest rozwinięta

### SaveButton
Przycisk zapisu preferencji z różnymi stanami (disabled, loading, success).

**Props:**
- `onClick: () => void` - callback kliknięcia
- `disabled: boolean` - czy przycisk jest wyłączony
- `isLoading: boolean` - czy trwa zapisywanie
- `hasChanges: boolean` - czy są niezapisane zmiany

### LoadingSpinner
Wskaźnik ładowania wyświetlany podczas operacji asynchronicznych.

**Props:**
- `isVisible: boolean` - czy spinner jest widoczny
- `status?: string` - tekst statusu
- `size?: 'sm' | 'md' | 'lg'` - rozmiar spinnera
- `className?: string` - dodatkowe klasy CSS

### ErrorBoundary
Komponent obsługujący błędy JavaScript w komponentach React.

**Props:**
- `children: ReactNode` - komponenty potomne
- `fallback?: ReactNode` - niestandardowy UI błędu
- `onError?: (error: Error, errorInfo: ErrorInfo) => void` - callback błędu

## Hooki

### useProfileForm
Custom hook do zarządzania stanem formularza profilu.

**Zwraca:**
- Stan formularza (preferencje, ładowanie, błędy)
- Funkcje do zarządzania preferencjami
- Funkcje do zarządzania akordeonem
- Funkcje do zapisywania i ładowania profilu
- Walidację preferencji

## Typy

Wszystkie typy komponentów są eksportowane z pliku `index.ts` i są zgodne z typami zdefiniowanymi w `src/types.ts`.

## Użycie

```tsx
import { ProfileFormView } from '@/components/profile';

function App() {
  return (
    <div>
      <ProfileFormView initialPreferences={['vegetarian', 'italian']} />
    </div>
  );
}
```

## Walidacja

Komponenty implementują zaawansowaną walidację preferencji:

- Maksymalnie 20 preferencji
- Sprawdzanie konfliktów między dietami
- Ostrzeżenia o alergiach pokarmowych
- Sprawdzanie spójności preferencji

## Obsługa błędów

- Error boundaries dla komponentów React
- Obsługa błędów API
- Komunikaty błędów użytkownika
- Możliwość ponowienia operacji

## Responsywność

Wszystkie komponenty są w pełni responsywne i używają Tailwind CSS dla stylowania.

## Dostępność

- ARIA labels dla wszystkich interaktywnych elementów
- Obsługa klawiatury
- Kontrast kolorów zgodny z WCAG
- Semantyczne znaczniki HTML
