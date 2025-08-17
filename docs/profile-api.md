# Profile API Documentation

## Przegląd

Ten dokument opisuje API endpoints i integracje używane przez komponenty profilu użytkownika w aplikacji Healthy Meal.

## Endpoints

### GET /api/profiles/me

Pobiera profil aktualnie zalogowanego użytkownika.

**Metoda:** `GET`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "user_id": "uuid",
  "preferences": ["vegetarian", "italian"],
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Musisz być zalogowany, aby edytować profil"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Twój profil nie został znaleziony"
}
```

### PUT /api/profiles/me

Aktualizuje preferencje aktualnie zalogowanego użytkownika.

**Metoda:** `PUT`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "preferences": ["vegetarian", "italian", "gluten-free"]
}
```

**Response (200 OK):**
```json
{
  "user_id": "uuid",
  "preferences": ["vegetarian", "italian", "gluten-free"],
  "status": "active",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Validation error",
  "details": "Maksymalnie 20 preferencji"
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Sesja wygasła. Zaloguj się ponownie."
}
```

## Typy danych

### ProfileDto

```typescript
interface ProfileDto {
  user_id: string;
  preferences: string[];
  status: 'active' | 'pending_deletion' | 'deleted';
  created_at: string;
  updated_at: string;
}
```

### UpdateProfileCommand

```typescript
interface UpdateProfileCommand {
  preferences: string[];
}
```

### UpdatedProfileDto

```typescript
interface UpdatedProfileDto {
  user_id: string;
  preferences: string[];
  status: string;
  updated_at: string;
}
```

## Walidacja

### Reguły walidacji preferencji

1. **Maksymalna liczba preferencji:** 20
2. **Typy preferencji:**
   - Diet: `vegetarian`, `vegan`, `keto`, `paleo`, `mediterranean`, `low-carb`, `gluten-free`, `dairy-free`
   - Kuchnie: `italian`, `asian`, `mexican`, `indian`, `french`, `greek`, `japanese`, `thai`
   - Alergie: `gluten`, `lactose`, `nuts`, `shellfish`, `eggs`, `soy`, `fish`, `sesame`

### Ostrzeżenia walidacji

- Konflikty między dietami (np. wegetariańska + paleo)
- Alergie bez odpowiednich diet (np. gluten bez diety bezglutenowej)
- Brak preferencji w kategoriach
- Zbyt wiele preferencji w jednej kategorii

## Autoryzacja

### Wymagania

- Wszystkie endpointy wymagają autoryzacji
- Token Bearer musi być ważny
- Sesja użytkownika musi być aktywna

### Obsługa sesji

- Automatyczne odświeżanie tokenów
- Buffer time: 5 minut przed wygaśnięciem
- Fallback do logowania przy wygasłej sesji

## Obsługa błędów

### Kody błędów HTTP

- **400 Bad Request:** Błąd walidacji danych
- **401 Unauthorized:** Brak lub nieprawidłowy token
- **404 Not Found:** Profil nie istnieje
- **500 Internal Server Error:** Błąd serwera

### Struktura błędów

```json
{
  "error": "Opis błędu",
  "details": "Szczegóły błędu (opcjonalnie)",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Rate Limiting

- **GET /api/profiles/me:** 100 requestów na minutę
- **PUT /api/profiles/me:** 50 requestów na minutę

## Caching

- **GET requests:** Cache przez 5 minut
- **PUT requests:** Invalidate cache dla danego użytkownika

## Monitoring

### Metryki

- Liczba requestów na endpoint
- Czas odpowiedzi
- Liczba błędów
- Liczba udanych aktualizacji

### Logi

- Wszystkie requesty są logowane
- Błędy są logowane z pełnym kontekstem
- Sesje są monitorowane

## Bezpieczeństwo

### Ochrona danych

- Wszystkie dane są szyfrowane w transporcie (HTTPS)
- Tokeny są przechowywane bezpiecznie
- Walidacja po stronie serwera

### Uprawnienia

- Użytkownicy mogą edytować tylko swój profil
- Sprawdzanie uprawnień na poziomie bazy danych
- Izolacja danych między użytkownikami

## Przykłady użycia

### JavaScript/TypeScript

```typescript
// Pobieranie profilu
const response = await fetch('/api/profiles/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const profile = await response.json();

// Aktualizacja preferencji
const updateResponse = await fetch('/api/profiles/me', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    preferences: ['vegetarian', 'italian']
  })
});

const updatedProfile = await updateResponse.json();
```

### cURL

```bash
# Pobieranie profilu
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  https://your-api.com/api/profiles/me

# Aktualizacja preferencji
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"preferences": ["vegetarian", "italian"]}' \
  https://your-api.com/api/profiles/me
```

## Testowanie

### Testy jednostkowe

```bash
npm run test:unit -- --grep "profile"
```

### Testy integracyjne

```bash
npm run test:integration -- --grep "profile"
```

### Testy API

```bash
npm run test:api -- --grep "profiles"
```

## Wersjonowanie

- **Aktualna wersja:** v1
- **Format:** `/api/v1/profiles/me`
- **Backward compatibility:** Tak
- **Deprecation policy:** 6 miesięcy notice

## Wsparcie

W przypadku problemów z API:

1. Sprawdź logi aplikacji
2. Sprawdź dokumentację
3. Skontaktuj się z zespołem deweloperskim
4. Otwórz issue w repozytorium

## Changelog

### v1.0.0 (2024-01-01)
- Początkowa implementacja API profilu
- Endpointy GET i PUT dla profilu
- Podstawowa walidacja preferencji
- Autoryzacja Bearer token
