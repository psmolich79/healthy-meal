# API Endpoint Implementation Plan: Zarządzanie profilem użytkownika (`/api/profiles/me`)

## 1. Przegląd punktu końcowego

Ten dokument opisuje plan wdrożenia punktu końcowego API REST `/api/profiles/me`, który umożliwia zalogowanym użytkownikom zarządzanie własnym profilem. Obejmuje on trzy operacje: pobieranie danych profilu (GET), aktualizację preferencji (PUT) oraz zgłoszenie profilu do usunięcia (DELETE).

## 2. Szczegóły żądania

### GET `/api/profiles/me`

- **Metoda HTTP**: `GET`
- **Opis**: Pobiera pełne dane profilu aktualnie zalogowanego użytkownika.
- **Nagłówki**:
  - `Authorization`: `Bearer <supabase_jwt>` (Wymagany)
- **Ciało żądania**: Brak

### PUT `/api/profiles/me`

- **Metoda HTTP**: `PUT`
- **Opis**: Aktualizuje preferencje użytkownika.
- **Nagłówki**:
  - `Authorization`: `Bearer <supabase_jwt>` (Wymagany)
  - `Content-Type`: `application/json`
- **Ciało żądania**:
  ```json
  {
    "preferences": ["string"]
  }
  ```

### DELETE `/api/profiles/me`

- **Metoda HTTP**: `DELETE`
- **Opis**: Inicjuje procedurę miękkiego usunięcia profilu użytkownika.
- **Nagłówki**:
  - `Authorization`: `Bearer <supabase_jwt>` (Wymagany)
- **Ciało żądania**: Brak

## 3. Wykorzystywane typy

Implementacja będzie korzystać z następujących, predefiniowanych typów z `src/types.ts`:

- **Command Models**:
  - `UpdateProfileCommand`: Do walidacji ciała żądania `PUT`.
- **DTOs (Data Transfer Objects)**:
  - `ProfileDto`: Struktura odpowiedzi dla `GET`.
  - `UpdatedProfileDto`: Struktura odpowiedzi dla `PUT`.
  - `DeletedProfileDto`: Struktura odpowiedzi dla `DELETE`.

## 4. Szczegóły odpowiedzi

### Sukces

- **GET `/api/profiles/me`**:
  - **Kod stanu**: `200 OK`
  - **Ciało odpowiedzi**: `ProfileDto`
- **PUT `/api/profiles/me`**:
  - **Kod stanu**: `200 OK`
  - **Ciało odpowiedzi**: `UpdatedProfileDto`
- **DELETE `/api/profiles/me`**:
  - **Kod stanu**: `200 OK`
  - **Ciało odpowiedzi**: `DeletedProfileDto`

### Błędy

- **Kod stanu**: `400 Bad Request` - Nieprawidłowe dane wejściowe (np. błąd walidacji Zod).
- **Kod stanu**: `401 Unauthorized` - Brak lub nieprawidłowy token uwierzytelniający.
- **Kod stanu**: `404 Not Found` - Profil użytkownika nie został znaleziony.
- **Kod stanu**: `500 Internal Server Error` - Wewnętrzny błąd serwera.

## 5. Przepływ danych

1.  Żądanie klienta trafia do serwera Astro.
2.  Middleware Astro (`src/middleware/index.ts`) przechwytuje żądanie, waliduje token JWT i umieszcza klienta Supabase oraz dane użytkownika w `Astro.locals`. Jeśli token jest nieprawidłowy, middleware zwraca `401 Unauthorized`.
3.  Żądanie jest kierowane do odpowiedniego handlera (`GET`, `PUT`, `DELETE`) w pliku `src/pages/api/profiles/me.ts`.
4.  Handler API (kontroler) wywołuje odpowiednią metodę z `ProfileService`, przekazując ID użytkownika z `Astro.locals.user.id` oraz dane z ciała żądania (dla `PUT`).
5.  `ProfileService` (`src/lib/services/profile.service.ts`) wykonuje logikę biznesową, komunikując się z bazą danych Supabase za pomocą dostarczonego klienta.
6.  Polityki RLS (Row-Level Security) w Supabase zapewniają, że operacja dotyczy wyłącznie profilu należącego do zalogowanego użytkownika.
7.  `ProfileService` zwraca wynik (dane lub błąd) do handlera API.
8.  Handler API formatuje odpowiedź (DTO) i wysyła ją do klienta z odpowiednim kodem statusu.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie**: Wszystkie operacje są chronione i wymagają prawidłowego tokenu JWT, który jest weryfikowany przez middleware.
- **Autoryzacja**: Dostęp do danych jest ograniczony na poziomie bazy danych dzięki politykom RLS Supabase. Użytkownik może modyfikować i odczytywać wyłącznie własny profil. Aplikacja w pełni polega na tym mechanizmie.
- **Walidacja danych**: Ciało żądania dla `PUT` jest walidowane za pomocą `Zod` w celu zapewnienia integralności danych i ochrony przed złośliwymi danymi wejściowymi.

## 7. Obsługa błędów

- Błędy walidacji Zod w handlerze `PUT` będą przechwytywane, a serwer zwróci odpowiedź `400 Bad Request` ze szczegółami błędu.
- Jeśli `ProfileService` zwróci błąd (np. `null` przy próbie pobrania nieistniejącego profilu), handler API zwróci `404 Not Found`.
- Wszelkie inne, nieoczekiwane błędy (np. problemy z połączeniem z bazą danych) będą przechwytywane w bloku `try...catch` i spowodują zwrot odpowiedzi `500 Internal Server Error` z generycznym komunikatem. Błąd zostanie zalogowany po stronie serwera.

## 8. Rozważania dotyczące wydajności

- Operacje na bazie danych są prostymi zapytaniami `SELECT` i `UPDATE` na pojedynczym wierszu, indeksowanym przez klucz główny (`user_id`), co zapewnia wysoką wydajność.
- Indeks `idx_profiles_status` na kolumnie `status` może w przyszłości przyspieszyć wyszukiwanie profili o określonym statusie, ale nie ma bezpośredniego wpływu na te operacje.
- Należy unikać pobierania zbędnych danych z bazy; zapytania powinny wybierać tylko te kolumny, które są potrzebne do zbudowania DTO.

## 9. Etapy wdrożenia

1.  **Utworzenie serwisu**: Stwórz plik `src/lib/services/profile.service.ts`.
2.  **Implementacja `ProfileService`**:
    - Dodaj klasę `ProfileService`, która przyjmuje `SupabaseClient` w konstruktorze.
    - Zaimplementuj metodę `getProfile(userId: string): Promise<Profile | null>`.
    - Zaimplementuj metodę `updatePreferences(userId: string, preferences: string[]): Promise<UpdatedProfileDto | null>`.
    - Zaimplementuj metodę `scheduleDeletion(userId: string): Promise<Profile | null>`.
3.  **Utworzenie pliku API Route**: Stwórz plik `src/pages/api/profiles/me.ts`.
4.  **Dodanie walidacji Zod**: W pliku `me.ts`, zdefiniuj schemat Zod dla `UpdateProfileCommand`.
5.  **Implementacja handlerów API**:
    - W `me.ts` dodaj `export const prerender = false;`.
    - Zaimplementuj handler `GET`, który pobiera `user` i `supabase` z `Astro.locals`, tworzy instancję `ProfileService` i wywołuje `getProfile`. Obsłuż przypadki sukcesu i błędu (404, 500).
    - Zaimplementuj handler `PUT`, który dodatkowo waliduje ciało żądania za pomocą Zod (zwracając 400 w razie błędu) i wywołuje `updatePreferences`.
    - Zaimplementuj handler `DELETE`, który wywołuje `scheduleDeletion` i zwraca `DeletedProfileDto`.
6.  **Testowanie**:
    - Napisz testy jednostkowe dla `ProfileService`, mockując klienta Supabase.
    - Napisz testy integracyjne dla endpointu API, symulując żądania HTTP i sprawdzając odpowiedzi oraz interakcje z bazą danych.
