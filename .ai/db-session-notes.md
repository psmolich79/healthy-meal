<conversation_summary>
<decisions>

1.  **Zarządzanie Preferencjami**: Na potrzeby MVP, predefiniowana lista preferencji będzie zarządzana przez plik konfiguracyjny JSON w aplikacji. Wybrane przez użytkownika preferencje będą przechowywane w tabeli `profiles` w kolumnie typu `TEXT[]` (tablica tekstowa).
2.  **Przechowywanie Przepisów**: Treść przepisu będzie podzielona na osobne kolumny (`title`, `ingredients`, `shopping_list`, `instructions`) w tabeli `recipes`. Kolumna `instructions` będzie przechowywać sformatowany tekst, np. w formacie Markdown.
3.  **Regeneracja Przepisu**: Negatywna ocena i prośba o ponowne wygenerowanie przepisu skutkuje utworzeniem nowego rekordu w tabeli `recipes`. Oryginalny (odrzucony) przepis jest oznaczany jako niewidoczny (`is_visible = false`), a nowy rekord zawiera odniesienie do starego (`regenerated_from_recipe_id`), co pozwala na analizę historii.
4.  **Usuwanie Konta Użytkownika**: Zostanie zaimplementowany mechanizm "miękkiego usuwania". Konto użytkownika będzie oznaczane jako `pending_deletion`, a ostateczne, fizyczne usunięcie danych nastąpi po 30 dniach za pomocą cyklicznego zadania (cron job).
5.  **Monitorowanie Kosztów AI**: Zostanie utworzona dedykowana tabela `ai_generations_log` do śledzenia interakcji z API AI. Będzie ona przechowywać m.in. treść zapytania (prompt), liczbę tokenów wejściowych/wyjściowych, koszt oraz identyfikator użytkownika.
6.  **Oceny Przepisów**: System ocen ("kciuk w górę"/"kciuk w dół") będzie jawnie powiązany z użytkownikiem i przepisem. Zastosowany zostanie złożony klucz główny (`recipe_id`, `user_id`), aby uniemożliwić wielokrotne ocenianie tego samego przepisu przez jednego użytkownika.
7.  **Dodatkowe Pola i Typy Danych**: Potwierdzono dodanie pola `initial_user_query` w tabeli `recipes` oraz użycie typów `NUMERIC` dla kosztów i `INTEGER` dla liczby tokenów w tabeli logów AI.
8.  **Ograniczenia Znaków**: Nie ma potrzeby implementowania specyficznych ograniczeń długości dla pól tekstowych.

    </decisions>

    <matched_recommendations>

9.  **Struktura tabeli `profiles`**: Zgodnie z dyskusją, kluczową rekomendacją jest utworzenie tabeli `profiles` połączonej relacją 1-do-1 z tabelą `auth.users` z Supabase. Tabela ta będzie zawierać kolumnę `preferences TEXT[]` oraz pola `status` i `status_changed_at` do obsługi mechanizmu miękkiego usuwania.
10. **Struktura tabeli `recipes`**: Istotną rekomendacją, potwierdzoną w rozmowie, jest użycie osobnych kolumn tekstowych na treść przepisu oraz dodanie pól `is_visible` i `regenerated_from_recipe_id` w celu zaimplementowania logiki ukrywania i regeneracji.
11. **Rezygnacja z tabeli `preferences`**: Ważnym uproszczeniem schematu MVP, wynikającym z dyskusji, jest rezygnacja z osobnych tabel `preferences` i `user_preferences` na rzecz przechowywania preferencji w tablicy tekstowej w profilu użytkownika.
12. **Struktura tabeli `ratings`**: Zastosowanie złożonego klucza głównego na kolumnach (`recipe_id`, `user_id`) jest kluczową rekomendacją zapewniającą, że użytkownik może ocenić przepis tylko raz.
13. **Bezpieczeństwo przez RLS**: Najważniejszą rekomendacją w kontekście bezpieczeństwa jest natychmiastowe wdrożenie polityk bezpieczeństwa na poziomie wierszy (RLS). Polityki te muszą uwzględniać nie tylko `user_id`, ale również logikę biznesową, taką jak status użytkownika (`active`) i widoczność przepisu (`is_visible`).
14. **Użycie typów ENUM**: Rekomendacja użycia typów `ENUM` (`user_status_type`, `rating_type`) została przyjęta w celu zwiększenia integralności i czytelności danych w bazie.

    </matched_recommendations>

    <database_planning_summary>

### Główne wymagania dotyczące schematu bazy danych

Schemat bazy danych PostgreSQL dla aplikacji HealthyMeal MVP, działającej na platformie Supabase, musi wspierać uwierzytelnianie użytkowników, zarządzanie ich profilami i preferencjami żywieniowymi, generowanie i przechowywanie spersonalizowanych przepisów, system ocen oraz mechanizm monitorowania kosztów API AI. Kluczowe jest zapewnienie bezpieczeństwa danych poprzez rygorystyczne reguły dostępu oraz zaprojektowanie struktury umożliwiającej analizę odrzuconych przepisów i obsługę cyklu życia konta użytkownika.

### Kluczowe encje i ich relacje

1.  **`profiles`**: Encja przechowująca dane aplikacji użytkownika. Posiada relację **jeden-do-jednego** z encją `users` z modułu `auth` Supabase. Przechowuje status konta oraz tablicę preferencji.
2.  **`recipes`**: Encja zawierająca wygenerowane przepisy. Posiada relację **wiele-do-jednego** z `profiles` (użytkownik może mieć wiele przepisów). Może mieć również rekurencyjną relację **jeden-do-jednego** z samą sobą w celu łączenia przepisów regenerowanych.
3.  **`ratings`**: Encja łącząca, która realizuje relację **wiele-do-wielu** między `profiles` a `recipes`. Reprezentuje ocenę wystawioną przez użytkownika dla przepisu. Ograniczenie klucza głównego zapewnia, że relacja ta jest unikalna dla każdej pary (użytkownik, przepis).
4.  **`ai_generations_log`**: Encja przechowująca dane o zapytaniach do AI. Posiada relację **wiele-do-jednego** z `profiles` (użytkownik może wygenerować wiele zapytań).

### Ważne kwestie dotyczące bezpieczeństwa i skalowalności

- **Bezpieczeństwo**: Podstawą bezpieczeństwa jest mechanizm Row-Level Security (RLS) w PostgreSQL. Dostęp do danych w każdej tabeli jest kontrolowany przez polityki, które filtrują wiersze na podstawie identyfikatora zalogowanego użytkownika (`auth.uid()`). Polityki uwzględniają również logikę biznesową – na przykład użytkownik nie może uzyskać dostępu do danych, jeśli jego konto jest oznaczone jako `pending_deletion`, ani zobaczyć przepisów, które zostały przez niego odrzucone (`is_visible = false`).
- **Skalowalność**: Schemat na potrzeby MVP jest prosty i zoptymalizowany pod kątem podstawowych funkcji. Użycie indeksów na kluczach obcych i polach używanych w warunkach `WHERE` jest standardową praktyką zapewniającą wydajność. Tabela `ai_generations_log` ma potencjał do szybkiego wzrostu, jednak na etapie MVP nie przewiduje się potrzeby partycjonowania. Mechanizm miękkiego usuwania z późniejszym czyszczeniem danych przez cron job pomaga zarządzać rozmiarem bazy w długim terminie.

  </database_planning_summary>

  <unresolved_issues>

1.  **Logika "Wygeneruj ponownie"**: Zdefiniowano strukturę bazy danych do obsługi ponownego generowania przepisów, jednak szczegółowa logika aplikacji (np. jak modyfikować zapytanie do AI na podstawie negatywnej oceny, aby uzyskać lepszy wynik) pozostaje kwestią do opracowania w warstwie aplikacyjnej.
2.  **Strategia optymalizacji kosztów AI**: Utworzono tabelę do _monitorowania_ kosztów, ale strategia ich _aktywnej optymalizacji_ (np. wybór tańszych modeli AI dla określonych typów zapytań, cachowanie odpowiedzi) wymaga dalszej analizy i decyzji na poziomie produktu i aplikacji.
3.  **Implementacja Cron Joba**: Projekt bazy danych jest przygotowany na mechanizm usuwania nieaktywnych kont, jednak sama implementacja zadania cyklicznego w `pg_cron` (lub innym mechanizmie) jest osobnym zadaniem deweloperskim/administracyjnym do wykonania.
        </unresolved_issues>
    </conversation_summary>
