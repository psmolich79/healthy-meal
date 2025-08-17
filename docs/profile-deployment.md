# Deployment Guide - Profile Components

## Przegląd

Ten dokument opisuje proces deploymentu komponentów profilu użytkownika w aplikacji Healthy Meal.

## Wymagania przed deploymentem

### Zależności
- Node.js 18+ 
- npm/yarn/pnpm
- Astro 5
- React 19
- TypeScript 5
- Tailwind CSS 4

### Środowisko
- Supabase project z skonfigurowaną bazą danych
- Skonfigurowane zmienne środowiskowe
- Dostęp do API endpoints

## Zmienne środowiskowe

Upewnij się, że następujące zmienne są skonfigurowane:

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
VITE_API_BASE_URL=your_api_base_url

# Feature Flags
VITE_ENABLE_PROFILE_FEATURES=true
VITE_ENABLE_PREFERENCES_VALIDATION=true
```

## Kroki deploymentu

### 1. Build aplikacji

```bash
# Instalacja zależności
npm install

# Build aplikacji
npm run build

# Sprawdzenie builda
npm run preview
```

### 2. Sprawdzenie jakości kodu

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Testy
npm run test

# Testy z coverage
npm run test:coverage
```

### 3. Deployment

#### Development
```bash
npm run dev
```

#### Staging
```bash
npm run build
npm run preview
```

#### Production
```bash
npm run build
# Deploy do wybranej platformy (Vercel, Netlify, etc.)
```

## Struktura plików po deploymentzie

```
dist/
├── assets/
│   ├── js/
│   ├── css/
│   └── images/
├── profile/
│   └── index.html
├── api/
│   └── profiles/
└── index.html
```

## Konfiguracja serwera

### Headers HTTP

Dodaj następujące nagłówki do konfiguracji serwera:

```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# CORS for API
add_header Access-Control-Allow-Origin "*" always;
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
```

### Routing

Upewnij się, że routing jest skonfigurowany poprawnie:

```javascript
// Astro config
export default defineConfig({
  output: 'hybrid',
  adapter: node({
    mode: 'standalone'
  }),
  routes: {
    '/profile': '/profile/index.html'
  }
});
```

## Monitoring i logi

### Logi aplikacji

Skonfiguruj logowanie dla następujących zdarzeń:

- Ładowanie profilu użytkownika
- Zapisywanie preferencji
- Błędy walidacji
- Błędy API
- Błędy autoryzacji

### Metryki

Śledź następujące metryki:

- Czas ładowania profilu
- Liczba błędów walidacji
- Liczba udanych zapisów
- Liczba błędów API
- Liczba sesji wygasłych

## Testowanie po deploymentzie

### Testy funkcjonalne

1. **Test logowania**
   - Zaloguj się jako użytkownik
   - Sprawdź czy profil się ładuje

2. **Test preferencji**
   - Dodaj preferencje dietetyczne
   - Dodaj preferencje kulinarne
   - Dodaj alergie
   - Zapisz zmiany

3. **Test walidacji**
   - Spróbuj dodać więcej niż 20 preferencji
   - Sprawdź ostrzeżenia o konfliktach
   - Sprawdź komunikaty o alergiach

4. **Test błędów**
   - Sprawdź obsługę wygasłej sesji
   - Sprawdź obsługę błędów API
   - Sprawdź obsługę błędów sieci

### Testy wydajności

```bash
# Lighthouse test
npm run lighthouse

# Bundle analyzer
npm run bundle-analyzer

# Performance test
npm run test:performance
```

## Troubleshooting

### Typowe problemy

1. **Błąd 401 - Unauthorized**
   - Sprawdź konfigurację Supabase
   - Sprawdź tokeny autoryzacji
   - Sprawdź CORS

2. **Błąd 404 - Profile not found**
   - Sprawdź czy profil użytkownika istnieje w bazie
   - Sprawdź uprawnienia użytkownika

3. **Błędy walidacji**
   - Sprawdź logikę walidacji
   - Sprawdź dane preferencji

4. **Problemy z renderowaniem**
   - Sprawdź wersje React i Astro
   - Sprawdź konflikty CSS

### Debugowanie

```bash
# Włącz debug mode
DEBUG=* npm run dev

# Sprawdź logi w konsoli
npm run dev -- --verbose

# Sprawdź bundle
npm run build -- --debug
```

## Rollback

W przypadku problemów:

1. **Przywróć poprzednią wersję**
   ```bash
   git checkout HEAD~1
   npm run build
   npm run deploy
   ```

2. **Wyłącz funkcjonalność**
   ```bash
   VITE_ENABLE_PROFILE_FEATURES=false npm run build
   ```

3. **Przywróć z backupu**
   ```bash
   # Przywróć z backupu bazy danych
   # Przywróć pliki aplikacji
   ```

## Bezpieczeństwo

### Ochrona danych

- Wszystkie dane użytkownika są szyfrowane
- Sesje mają timeout
- Tokeny są refreshowane automatycznie
- Walidacja po stronie serwera

### Uprawnienia

- Użytkownicy mogą edytować tylko swój profil
- API wymaga autoryzacji
- CORS jest skonfigurowany poprawnie

## Wsparcie

W przypadku problemów:

1. Sprawdź logi aplikacji
2. Sprawdź dokumentację
3. Skontaktuj się z zespołem deweloperskim
4. Otwórz issue w repozytorium

## Aktualizacje

### Automatyczne aktualizacje

```bash
# Sprawdź dostępne aktualizacje
npm outdated

# Zaktualizuj zależności
npm update

# Zaktualizuj do najnowszych wersji
npm-check-updates -u
npm install
```

### Ręczne aktualizacje

1. Pobierz najnowszą wersję
2. Przetestuj lokalnie
3. Wdróż na staging
4. Wdróż na production

## Podsumowanie

Ten deployment guide zawiera wszystkie niezbędne informacje do wdrożenia komponentów profilu użytkownika. Upewnij się, że wszystkie kroki zostały wykonane przed wdrożeniem na production.
