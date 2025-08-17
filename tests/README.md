# Testy - Healthy Meal

Ten katalog zawiera wszystkie testy dla aplikacji Healthy Meal, w tym testy jednostkowe, integracyjne i end-to-end.

## Struktura testów

```
tests/
├── e2e/                    # Testy end-to-end (Playwright)
│   └── profile.spec.ts    # Testy profilu użytkownika
├── accessibility/          # Testy accessibility
│   └── profile.spec.ts    # Testy accessibility profilu
├── setup/                 # Setup i teardown testów
│   ├── global-setup.ts    # Global setup
│   └── global-teardown.ts # Global teardown
└── README.md              # Ten plik
```

## Typy testów

### Testy jednostkowe (Unit Tests)

Testy pojedynczych komponentów i funkcji używające Vitest.

```bash
# Uruchom wszystkie testy jednostkowe
npm run test:unit

# Uruchom testy w trybie watch
npm run test:watch

# Uruchom testy z coverage
npm run test:coverage
```

### Testy end-to-end (E2E Tests)

Testy całej aplikacji używające Playwright.

```bash
# Uruchom wszystkie testy E2E
npm run test:e2e

# Uruchom testy z UI
npm run test:e2e:ui

# Uruchom testy w trybie headed
npm run test:e2e:headed

# Uruchom testy w trybie debug
npm run test:e2e:debug
```

### Testy accessibility

Testy dostępności i zgodności z WCAG.

```bash
# Uruchom testy accessibility
npm run test:accessibility
```

## Konfiguracja

### Playwright

Konfiguracja Playwright znajduje się w `playwright.config.ts`:

- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Base URL**: `http://localhost:4321` (lokalny dev server)
- **Timeout**: 30 sekund dla testów, 5 sekund dla assertions
- **Retries**: 2 na CI, 0 lokalnie
- **Parallel**: Tak (z wyjątkiem CI)

### Vitest

Konfiguracja Vitest znajduje się w `vitest.config.ts`:

- **Environment**: jsdom
- **Coverage**: Instanbul
- **Setup**: `tests/setup.ts`

## Uruchamianie testów

### Wymagania

1. **Node.js 18+**
2. **Zainstalowane zależności**: `npm install`
3. **Uruchomiony dev server**: `npm run dev`

### Kroki

1. **Uruchom dev server**:
   ```bash
   npm run dev
   ```

2. **W nowym terminalu, uruchom testy**:
   ```bash
   # Testy jednostkowe
   npm run test:unit
   
   # Testy E2E
   npm run test:e2e
   
   # Testy accessibility
   npm run test:accessibility
   ```

## Debugowanie testów

### Testy jednostkowe

```bash
# Uruchom testy w trybie debug
npm run test:debug

# Uruchom konkretny test
npm run test -- --grep "profile"
```

### Testy E2E

```bash
# Uruchom testy z UI
npm run test:e2e:ui

# Uruchom testy w trybie debug
npm run test:e2e:debug

# Uruchom konkretny test
npm run test:e2e -- --grep "profile"
```

## Coverage

### Generowanie raportu coverage

```bash
npm run test:coverage
```

Raport zostanie wygenerowany w `coverage/` i będzie dostępny w przeglądarce.

### Analiza coverage

- **Statements**: Pokrycie instrukcji
- **Branches**: Pokrycie gałęzi (if/else)
- **Functions**: Pokrycie funkcji
- **Lines**: Pokrycie linii kodu

## CI/CD

### GitHub Actions

Testy są automatycznie uruchamiane w GitHub Actions:

- **Testy jednostkowe**: Przy każdym push
- **Testy E2E**: Przy pull request
- **Testy accessibility**: Przy merge do main

### Konfiguracja CI

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:e2e
      - run: npm run test:accessibility
```

## Troubleshooting

### Typowe problemy

1. **Testy E2E nie mogą połączyć się z aplikacją**
   - Sprawdź czy dev server jest uruchomiony
   - Sprawdź czy port 4321 jest dostępny
   - Sprawdź logi dev server

2. **Testy accessibility nie przechodzą**
   - Sprawdź czy strona jest w pełni załadowana
   - Sprawdź czy nie ma błędów JavaScript
   - Sprawdź czy wszystkie elementy są widoczne

3. **Testy jednostkowe nie przechodzą**
   - Sprawdź czy wszystkie zależności są zainstalowane
   - Sprawdź czy mocks są poprawnie skonfigurowane
   - Sprawdź logi testów

### Debugowanie

1. **Włącz verbose logging**:
   ```bash
   DEBUG=* npm run test:e2e
   ```

2. **Sprawdź screenshots i video**:
   - Screenshots: `test-results/`
   - Video: `test-results/`

3. **Uruchom testy w trybie debug**:
   ```bash
   npm run test:e2e:debug
   ```

## Best Practices

### Pisanie testów

1. **Nazwy testów**: Opisowe i czytelne
2. **Setup**: Używaj `beforeEach` i `afterEach`
3. **Assertions**: Jedna asercja na test
4. **Mocks**: Mockuj zewnętrzne zależności
5. **Cleanup**: Zawsze czyść po testach

### Organizacja testów

1. **Grupowanie**: Używaj `describe` do grupowania
2. **Hierarchia**: Testy powinny mieć logiczną strukturę
3. **Naming**: Używaj konwencji `should_do_something`
4. **Isolation**: Testy nie powinny zależeć od siebie

### Performance

1. **Parallel**: Uruchamiaj testy równolegle
2. **Caching**: Używaj cache dla zależności
3. **Selectors**: Używaj stabilnych selektorów
4. **Timeouts**: Ustaw odpowiednie timeouty

## Wsparcie

W przypadku problemów z testami:

1. Sprawdź logi testów
2. Sprawdź dokumentację Playwright/Vitest
3. Sprawdź issues w repozytorium
4. Skontaktuj się z zespołem deweloperskim
