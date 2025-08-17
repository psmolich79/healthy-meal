# Dokument wymagań produktu (PRD) - HealthyMeal (MVP)
## 1. Przegląd produktu
HealthyMeal to aplikacja mobilna w wersji MVP (Minimum Viable Product), której celem jest uproszczenie procesu gotowania poprzez dostarczanie spersonalizowanych przepisów kulinarnych. Aplikacja wykorzystuje sztuczną inteligencję (model OpenAI GPT-4o) do generowania przepisów dostosowanych do indywidualnych preferencji żywieniowych, diet i potrzeb użytkownika. Główną wartością dla użytkownika jest możliwość szybkiego otrzymania kompletnego przepisu (składniki, lista zakupów, instrukcje) na podstawie prostego zapytania w języku naturalnym, z automatycznym uwzględnieniem wcześniej zdefiniowanych preferencji.

## 2. Problem użytkownika
Użytkownicy często napotykają trudności w adaptacji ogólnodostępnych przepisów kulinarnych do swoich specyficznych wymagań dietetycznych (np. wegetarianizm, alergie pokarmowe, preferencje smakowe). Proces ten jest czasochłonny, wymaga wiedzy kulinarnej i często prowadzi do frustracji. W rezultacie, wiele osób rezygnuje z gotowania w domu, decydując się na mniej zdrowe alternatywy lub spożywając monotonne posiłki. HealthyMeal adresuje ten problem, oferując natychmiastowe, spersonalizowane rozwiązania, które inspirują i ułatwiają codzienne gotowanie.

## 3. Wymagania funkcjonalne
Poniżej przedstawiono kluczowe funkcjonalności, które muszą zostać zaimplementowane w ramach wersji MVP produktu.

* F-01: System uwierzytelniania użytkowników
    * Rejestracja i logowanie za pomocą adresu e-mail i hasła.
    * Integracja z systemem logowania Google (OAuth 2.0).
    * Mechanizm resetowania hasła poprzez link wysyłany na adres e-mail.

* F-02: Profil użytkownika i zarządzanie preferencjami
    * Dedykowany ekran profilu użytkownika.
    * Możliwość zdefiniowania preferencji żywieniowych za pomocą predefiniowanej listy pól wyboru (checkbox).
    * Automatyczne zapisywanie i uwzględnianie preferencji przy każdym generowaniu przepisu.

* F-03: Generowanie przepisów z wykorzystaniem AI
    * Prosty interfejs z polem tekstowym do wprowadzania zapytań w języku naturalnym.
    * Integracja z API modelu OpenAI GPT-4o w celu generowania odpowiedzi.
    * Wizualne wskazanie aktywnych filtrów (preferencji) podczas generowania.

* F-04: Wyświetlanie i interakcja z przepisem
    * Ustrukturyzowany widok przepisu podzielony na sekcje: "Składniki", "Lista Zakupowa", "Sposób Przyrządzenia".
    * Opcja zapisu przepisu na koncie użytkownika.
    * System oceny "kciuk w górę" / "kciuk w dół".
    * Widoczne ostrzeżenie (disclaimer) informujące, że przepis został wygenerowany przez AI i zalecana jest jego weryfikacja.

* F-05: Zarządzanie zapisanymi przepisami
    * Sekcja "Moje przepisy" zawierająca listę wszystkich zapisanych przez użytkownika przepisów.
    * Możliwość przeglądania i usuwania przepisów z listy.
    * Wymaganie potwierdzenia przed trwałym usunięciem przepisu.

## 4. Granice produktu
### Co wchodzi w zakres MVP
* Zapisywanie, odczytywanie, przeglądanie i usuwanie przepisów w formie tekstowej.
* Prosty system kont użytkowników (e-mail/hasło, Google OAuth) do powiązania użytkownika z własnymi przepisami.
* Strona profilu użytkownika służąca do zapisywania preferencji żywnościowych w oparciu o predefiniowane checkboxy.
* Integracja z AI (OpenAI GPT-4o) umożliwiająca modyfikowanie przepisów wg preferencji żywieniowych użytkownika.
* Podstawowy mechanizm oceny przepisów (kciuk w górę/dół) z opcją ponownego generowania.

### Co NIE wchodzi w zakres MVP
* Import przepisów z zewnętrznych adresów URL.
* Obsługa multimediów (np. dodawanie zdjęć do przepisów).
* Funkcje społecznościowe (np. udostępnianie przepisów innym użytkownikom, komentowanie).
* Zaawansowana kategoryzacja listy zakupów (np. według alejek sklepowych).
* Walidacja przepisów przez drugi, niezależny model AI.

### Nierozwiązane kwestie (do dalszej dyskusji)
* Szczegółowa logika funkcji "Wygeneruj ponownie" po negatywnej ocenie.
* Strategia monitorowania i optymalizacji kosztów związanych z wykorzystaniem API modelu AI.
* Szczegółowe makiety (wireframes/mockups) dla poszczególnych ekranów, które zostaną opracowane w fazie projektowania UI/UX.

## 5. Historyjki użytkowników
### Zarządzanie kontem i profilem

* ID: US-001
* Tytuł: Rejestracja nowego konta za pomocą adresu e-mail i hasła
* Opis: Jako nowy użytkownik, chcę móc założyć konto w aplikacji, podając swój adres e-mail i tworząc hasło, abym mógł uzyskać dostęp do spersonalizowanych funkcji.
* Kryteria akceptacji:
    1.  Użytkownik może przejść do formularza rejestracji z ekranu powitalnego.
    2.  Formularz zawiera pola na adres e-mail, hasło i potwierdzenie hasła.
    3.  Walidacja w czasie rzeczywistym sprawdza, czy e-mail ma poprawny format.
    4.  Pole hasła wymaga co najmniej 8 znaków.
    5.  Pole "potwierdź hasło" musi być zgodne z polem hasła.
    6.  W przypadku, gdy e-mail jest już zarejestrowany, wyświetlany jest czytelny komunikat o błędzie.
    7.  Po pomyślnej rejestracji, użytkownik jest automatycznie zalogowany i przekierowany do ekranu ustawiania preferencji.

* ID: US-002
* Tytuł: Logowanie do aplikacji za pomocą adresu e-mail i hasła
* Opis: Jako powracający użytkownik, chcę móc zalogować się na moje konto za pomocą adresu e-mail i hasła, aby uzyskać dostęp do moich zapisanych przepisów i preferencji.
* Kryteria akceptacji:
    1.  Ekran logowania zawiera pola na adres e-mail i hasło.
    2.  Po poprawnym wprowadzeniu danych i kliknięciu "Zaloguj", użytkownik jest przekierowywany na główny ekran aplikacji.
    3.  W przypadku podania błędnego e-maila lub hasła, wyświetlany jest stosowny komunikat o błędzie.
    4.  Na ekranie logowania znajduje się link do funkcji "Zapomniałem hasła".

* ID: US-003
* Tytuł: Rejestracja i logowanie za pomocą konta Google
* Opis: Jako użytkownik, chcę mieć możliwość szybkiego założenia konta lub zalogowania się za pomocą mojego istniejącego konta Google, aby uniknąć konieczności pamiętania kolejnego hasła.
* Kryteria akceptacji:
    1.  Na ekranie powitalnym/logowania znajduje się przycisk "Kontynuuj z Google".
    2.  Kliknięcie przycisku inicjuje standardowy proces uwierzytelniania Google (OAuth).
    3.  Po pomyślnym uwierzytelnieniu przez Google, użytkownik jest zalogowany w aplikacji.
    4.  Jeśli jest to pierwsze logowanie tego użytkownika, tworzone jest dla niego nowe konto, a on sam jest przekierowywany do ekranu ustawiania preferencji.

* ID: US-004
* Tytuł: Resetowanie zapomnianego hasła
* Opis: Jako użytkownik, który zapomniał hasła, chcę mieć możliwość jego zresetowania, aby odzyskać dostęp do swojego konta.
* Kryteria akceptacji:
    1.  Użytkownik klika link "Zapomniałem hasła" na ekranie logowania.
    2.  Użytkownik jest proszony o podanie swojego adresu e-mail powiązanego z kontem.
    3.  Po podaniu i zatwierdzeniu adresu, na skrzynkę e-mail użytkownika wysyłana jest wiadomość z unikalnym linkiem do resetowania hasła.
    4.  Po kliknięciu w link, użytkownik jest przekierowywany na stronę, gdzie może ustawić nowe hasło.

* ID: US-005
* Tytuł: Ustawianie i modyfikacja preferencji żywieniowych
* Opis: Jako użytkownik, chcę móc zdefiniować i w dowolnym momencie modyfikować swoje preferencje żywieniowe (np. "jestem wegetarianinem", "lubię kuchnię włoską"), aby otrzymywać przepisy idealnie dopasowane do moich potrzeb.
* Kryteria akceptacji:
    1.  Po pierwszej rejestracji użytkownik jest kierowany do ekranu wyboru preferencji.
    2.  Użytkownik może w dowolnym momencie wejść na ekran "Profil", aby zobaczyć i zmienić swoje preferencje.
    3.  Preferencje są prezentowane jako lista predefiniowanych opcji z polami wyboru (checkbox).
    4.  Wybory użytkownika są zapisywane automatycznie po ich zmianie.
    5.  Zapisane preferencje są wizualnie reprezentowane (np. ikonami) na głównym ekranie generowania przepisów.

### Główne funkcje

* ID: US-006
* Tytuł: Generowanie spersonalizowanego przepisu
* Opis: Jako użytkownik, chcę wpisać w pole tekstowe, na co mam ochotę (np. "pomysł na obiad z kurczakiem i brokułami"), i otrzymać kompletny przepis, który automatycznie uwzględnia moje zapisane preferencje.
* Kryteria akceptacji:
    1.  Na głównym ekranie aplikacji znajduje się pole tekstowe do wprowadzania zapytań.
    2.  Po wpisaniu zapytania i naciśnięciu przycisku "Generuj", aplikacja wysyła zapytanie do modelu AI.
    3.  Zapytanie wysyłane do AI zawiera zarówno treść od użytkownika, jak i jego zapisane preferencje.
    4.  Podczas generowania wyświetlany jest wskaźnik ładowania.
    5.  Po pomyślnym wygenerowaniu, użytkownik jest przenoszony do widoku przepisu.
    6.  Próba wysłania pustego zapytania skutkuje wyświetleniem komunikatu proszącego o wpisanie treści.

* ID: US-007
* Tytuł: Przeglądanie wygenerowanego przepisu
* Opis: Jako użytkownik, po wygenerowaniu przepisu chcę zobaczyć go w przejrzystej i ustrukturyzowanej formie, abym mógł łatwo go zrozumieć i wykorzystać.
* Kryteria akceptacji:
    1.  Widok przepisu jest podzielony na trzy wyraźne sekcje: "Składniki", "Lista Zakupowa", "Sposób Przyrządzenia".
    2.  Sekcja "Sposób Przyrządzenia" przedstawia kroki w formie listy numerowanej.
    3.  Na ekranie przepisu widoczne są przyciski: "Zapisz", "Kciuk w górę", "Kciuk w dół".
    4.  Na ekranie stale widoczny jest disclaimer: "Przepis został wygenerowany przez AI. Przed użyciem zweryfikuj składniki i sposób przygotowania."

* ID: US-008
* Tytuł: Zapisywanie przepisu do ulubionych
* Opis: Jako użytkownik, który otrzymał świetny przepis, chcę go zapisać w aplikacji, aby móc do niego łatwo wrócić w przyszłości.
* Kryteria akceptacji:
    1.  Na ekranie przepisu znajduje się przycisk "Zapisz".
    2.  Po kliknięciu przycisku "Zapisz", przepis jest dodawany do sekcji "Moje przepisy" na koncie użytkownika.
    3.  Po pomyślnym zapisaniu, użytkownik otrzymuje wizualne potwierdzenie (np. zmiana ikony, krótki komunikat).

* ID: US-009
* Tytuł: Przeglądanie listy zapisanych przepisów
* Opis: Jako użytkownik, chcę mieć dostęp do listy wszystkich moich zapisanych przepisów, aby móc szybko odnaleźć ten, którego szukam.
* Kryteria akceptacji:
    1.  W aplikacji znajduje się sekcja "Moje przepisy".
    2.  W tej sekcji wyświetlana jest chronologiczna lista wszystkich zapisanych przepisów (od najnowszego do najstarszego).
    3.  Każdy element na liście zawiera tytuł przepisu.
    4.  Kliknięcie na element listy przenosi użytkownika do pełnego widoku danego przepisu.

* ID: US-010
* Tytuł: Usuwanie zapisanego przepisu
* Opis: Jako użytkownik, chcę mieć możliwość usunięcia przepisu z mojej listy zapisanych, jeśli już go nie potrzebuję.
* Kryteria akceptacji:
    1.  Na liście "Moje przepisy" przy każdym przepisie znajduje się ikona usuwania (np. kosz).
    2.  Kliknięcie ikony usuwania wyświetla modal z prośbą o potwierdzenie ("Czy na pewno chcesz usunąć ten przepis?").
    3.  Po potwierdzeniu, przepis jest trwale usuwany z listy.
    4.  Użytkownik może anulować operację usuwania.

* ID: US-011
* Tytuł: Ocena i ponowne generowanie przepisu
* Opis: Jako użytkownik, któremu nie spodobał się wygenerowany przepis, chcę dać mu negatywną ocenę i natychmiast poprosić o nową propozycję na podstawie tego samego zapytania.
* Kryteria akceptacji:
    1.  Na ekranie przepisu znajdują się ikony "kciuk w górę" i "kciuk w dół".
    2.  Kliknięcie "kciuk w górę" zapisuje pozytywną ocenę (na potrzeby analityki).
    3.  Kliknięcie "kciuk w dół" zapisuje negatywną ocenę i daje użytkownikowi możliwość ponownego wygenerowania przepisu.
    4.  Po kliknięciu "kciuk w dół", pojawia się opcja "Wygeneruj ponownie".
    5.  Kliknięcie "Wygeneruj ponownie" powoduje ponowne wysłanie tego samego zapytania i preferencji do AI w celu uzyskania nowego wyniku.

## 6. Metryki sukcesu
Powodzenie wdrożenia wersji MVP aplikacji HealthyMeal będzie mierzone za pomocą następujących kluczowych wskaźników:

* Metryka 1: Aktywacja Użytkowników
    * Cel: 90% zarejestrowanych użytkowników ma zdefiniowaną co najmniej jedną preferencję w swoim profilu.
    * Pomiar: Analiza danych z bazy użytkowników. Wskaźnik będzie obliczany jako stosunek liczby użytkowników, którzy zdefiniowali co najmniej jedną preferencję, do całkowitej liczby zarejestrowanych użytkowników.

* Metryka 2: Zaangażowanie Użytkowników
    * Cel: 75% tygodniowo aktywnych użytkowników (WAU) zapisuje co najmniej jeden przepis w tygodniu.
    * Pomiar: Analiza zdarzeń systemowych. Wskaźnik będzie obliczany poprzez śledzenie zdarzenia "zapisz przepis" i porównanie liczby unikalnych użytkowników wykonujących tę akcję w danym tygodniu do całkowitej liczby tygodniowo aktywnych użytkowników.