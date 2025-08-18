# Test Plan - Healthy Meal Application

## 1. Wprowadzenie

Ten dokument definiuje strategię testowania aplikacji Healthy Meal, która jest aplikacją webową opartą na Astro 5, React 19, TypeScript 5 i Tailwind CSS 4. Aplikacja zawiera moduły autentykacji, zarządzania profilami użytkowników, generowania przepisów kulinarnych oraz analizy użycia AI.

## 2. Zakres testowania

### 2.1 Moduły objęte testami
- **Autentykacja**: Logowanie, rejestracja, resetowanie hasła
- **Profile użytkowników**: Preferencje dietetyczne, alergie, preferencje kulinarne
- **Przepisy**: Generowanie, wyświetlanie, ocenianie, zapisywanie
- **AI Usage**: Statystyki użycia, koszty, limity
- **API Endpoints**: Wszystkie endpointy REST API

### 2.2 Moduły wykluczone z testów
- **Statyczne komponenty Astro**: Nie wymagają testów jednostkowych
- **Konfiguracja build**: Należy do procesu CI/CD

## 3. Strategia testowania

### 3.1 Testy jednostkowe (Unit Tests)
- **Narzędzie**: Vitest
- **Zakres**: Logika biznesowa, hooki React, serwisy
- **Pokrycie**: Minimum 80% kodu
- **Mockowanie**: Supabase, API calls, global objects

### 3.2 Testy integracyjne (Integration Tests)
- **Narzędzie**: Vitest + React Testing Library
- **Zakres**: Interakcje między komponentami
- **Środowisko**: JSDOM

### 3.3 Testy end-to-end (E2E Tests)
- **Narzędzie**: Playwright
- **Zakres**: Pełne ścieżki użytkownika
- **Środowisko**: Browser automation

### 3.4 Testy accessibility
- **Narzędzie**: Playwright + axe-core
- **Zakres**: Zgodność z WCAG 2.1 AA

## 4. Architektura testów

### 4.1 Struktura katalogów
```
src/test/
├── components/     # Testy komponentów React
├── hooks/         # Testy hooków
├── services/      # Testy serwisów
├── api/           # Testy endpointów API
└── setup.ts       # Konfiguracja globalna
```

### 4.2 Konfiguracja Vitest
- Environment: jsdom
- Setup files: src/test/setup.ts
- CSS support: enabled
- Path aliases: @/* -> src/*

## 5. Scenariusze testowe

### 5.1 Autentykacja
- **TC001**: Poprawne logowanie użytkownika
- **TC002**: Błędne dane logowania
- **TC003**: Rejestracja nowego użytkownika
- **TC004**: Resetowanie hasła
- **TC005**: Walidacja formularzy

### 5.2 Profile użytkowników
- **TC006**: Zapisywanie preferencji dietetycznych
- **TC007**: Walidacja alergii
- **TC008**: Aktualizacja preferencji kulinarnych

### 5.3 Przepisy
- **TC009**: Generowanie przepisu przez AI
- **TC010**: Wyświetlanie listy przepisów
- **TC011**: Ocenianie przepisów
- **TC012**: Zapisywanie przepisów

### 5.4 AI Usage
- **TC013**: Sprawdzanie limitów użycia
- **TC014**: Logowanie generacji AI
- **TC015**: Kalkulacja kosztów

## 6. Mockowanie i test doubles

### 6.1 Supabase Client
- Mockowanie wszystkich metod auth
- Mockowanie operacji na bazie danych
- Symulacja błędów i sukcesów

### 6.2 API Calls
- Mockowanie fetch API
- Symulacja różnych kodów odpowiedzi
- Testowanie obsługi błędów

### 6.3 Global Objects
- ResizeObserver
- Browser APIs
- Local Storage

## 7. Metryki jakości

### 7.1 Pokrycie kodu
- **Cel**: Minimum 80%
- **Miernik**: Vitest coverage
- **Raportowanie**: HTML + Console

### 7.2 Czas wykonania testów
- **Cel**: < 30 sekund dla testów jednostkowych
- **Cel**: < 5 minut dla testów E2E

### 7.3 Stabilność testów
- **Cel**: 100% testów przechodzi w CI/CD
- **Flaky tests**: Maksymalnie 1%

## 8. Automatyzacja

### 8.1 Pre-commit hooks
- Husky + lint-staged
- Uruchamianie testów jednostkowych
- Sprawdzanie formatowania kodu

### 8.2 CI/CD Pipeline
- GitHub Actions
- Uruchamianie wszystkich typów testów
- Raporty pokrycia kodu

## 9. Narzędzia i biblioteki

### 9.1 Testy jednostkowe
- **Vitest**: Framework testowy
- **React Testing Library**: Testowanie komponentów
- **@testing-library/jest-dom**: Matchers dla DOM

### 9.2 Testy E2E
- **Playwright**: Automatyzacja przeglądarki
- **axe-core**: Testy accessibility

### 9.3 Mockowanie
- **vitest**: Built-in mocking
- **jsdom**: Browser environment

## 10. Plan wdrożenia

### 10.1 Faza 1 (Tydzień 1-2)
- Konfiguracja środowiska testowego
- Implementacja podstawowych testów jednostkowych
- Testy dla modułu autentykacji

### 10.2 Faza 2 (Tydzień 3-4)
- Testy dla modułu profili użytkowników
- Testy dla modułu przepisów
- Testy accessibility

### 10.3 Faza 3 (Tydzień 5-6)
- Testy E2E z Playwright
- Testy integracyjne
- Optymalizacja wydajności testów

## 11. Ryzyka i ograniczenia

### 11.1 Ryzyka techniczne
- **Mockowanie złożonych zależności**: Może wymagać dodatkowego czasu
- **Testy E2E**: Mogą być niestabilne w CI/CD
- **Pokrycie kodu**: Trudne do osiągnięcia 100%

### 11.2 Ograniczenia
- **Czas**: Implementacja wszystkich testów może zająć 6-8 tygodni
- **Zasoby**: Wymaga dedykowanego czasu na testowanie
- **Maintenance**: Testy wymagają aktualizacji przy zmianach w kodzie

## 12. Podsumowanie

Ten Test Plan zapewnia systematyczne podejście do zapewnienia jakości kodu w aplikacji Healthy Meal. Implementacja testów jednostkowych z Vitest, integracyjnych z React Testing Library oraz E2E z Playwright pozwoli na wczesne wykrywanie błędów i utrzymanie wysokiej jakości kodu.

Kluczowe elementy sukcesu:
- Regularne uruchamianie testów w CI/CD
- Utrzymanie wysokiego pokrycia kodu
- Refaktoryzacja testów przy zmianach w kodzie
- Wykorzystanie AI do generowania scenariuszy testowych
