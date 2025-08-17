# Architektura UI dla HealthyMeal

## 1. Przegląd struktury UI
HealthyMeal korzysta z podejścia mobile-first z dwoma głównymi layoutami:
- `<MobileLayout>` (breakpoint <768px) z bottom navigation.
- `<DesktopLayout>` (≥768px) z topbar.
Globalny kontekst React zarządza stanem uwierzytelnienia, preferencji, loadingów i motywu.

## 2. Lista widoków

### 2.1 Ekran powitalny i logowania
- Ścieżki: `/login`, `/register`, `/reset-password`
- Cel: umożliwienie rejestracji/logowania/resetu hasła.
- Komponenty: formularze z React Hook Form + Zod, walidacja realtime, toasty z błędami.

### 2.2 Ekran preferencji
- Ścieżka: `/profile`
- Cel: ustawienie i modyfikacja diet/preferencji.
- Kluczowe informacje: lista kategorii (Dieta, Kuchnia, Alergie).
- Komponenty: `<PreferencesAccordion>`, checkboxy, auto-save.

### 2.3 Główny ekran generowania
- Ścieżka: `/recipes/generate` (lub `/`)
- Cel: wpisanie zapytania i wywołanie AI.
- Kluczowe informacje: pole tekstowe, wskaźnik ładowania, aktywne filtry.
- Komponenty: `<SearchInput>`, `<LoadingSpinner>`, `<RecipeCarousel>` (ostatnie 3).

### 2.4 Ekran przeglądu przepisu
- Ścieżka: `/recipes/:id`
- Cel: prezentacja szczegółów przepisu.
- Kluczowe informacje: Składniki, Lista Zakupowa, Instrukcje, disclaimer.
- Komponenty: `<RecipeDetails>`, przyciski Zapisz, 👍, 👎, `<ModalConfirm>`.

### 2.5 Moje przepisy
- Ścieżka: `/recipes`
- Cel: zarządzanie zapisanymi przepisami.
- Kluczowe informacje: lista kart z tytułem, datą, oceną.
- Komponenty: `<SearchInput>` (200ms debounce), `<SortToggle>`, `<RecipeCard>`, `<ModalConfirm>`.

### 2.6 Statystyki AI
- Ścieżka: `/ai-usage`
- Cel: wyświetlenie zużycia tokenów i kosztów.
- Komponenty: wykresy (bar, line), tabela daily breakdown.

## 3. Mapa podróży użytkownika
1. `/register` → `/profile` → `/recipes/generate`
2. Generowanie → loader → `/recipes/:id`
3. Akcje: Zapisz (toast), 👍/👎 (po 👎 opcja regeneracji)
4. `/recipes` → wyszukiwanie/sortowanie → szczegóły (`/recipes/:id`)
5. Opcjonalnie `/ai-usage`

## 4. Układ i struktura nawigacji
- Mobile: bottom nav z ikonami Generuj, Moje, Profil.
- Desktop: topbar z linkami Generuj, Moje przepisy, Profil, Statystyki, ThemeToggle.
- Breadcrumbs w szczegółach przepisu.

## 5. Kluczowe komponenty
- Layouty: `<MobileLayout>`, `<DesktopLayout>`
- Nawigacja: `<BottomNav>`, `<TopBar>`
- Formularze: React Hook Form + Zod
- Karuzela: `<RecipeCarousel>`
- Accordion preferencji: `<PreferencesAccordion>`
- Przełączniki: `<ThemeToggle>`, `<SortToggle>`
- Wpis: `<SearchInput>` (debounce)
- Karty: `<RecipeCard>`
- Modale: `<ModalConfirm>`
- Błędy i ładowanie: `<ErrorBoundary>`, `<LoadingSpinner>`
- Powiadomienia: toast
