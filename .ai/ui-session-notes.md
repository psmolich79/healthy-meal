<conversation_summary>
<decisions>
1. Aplikacja responsywna (mobile-first) z obsługą tabletu i komputera
2. Nawigacja: bottom navigation na telefonie, topbar na tablecie/komputerze
3. Tylko usuwanie i ponowne generowania przepisów (brak edycji)
4. Potwierdzenie użytkownika wymagane dla ponownego generowania
5. Preferencje jako lista z możliwością edycji inline w osobnej sekcji
6. Prosty spinner dla stanów ładowania
7. Wyszukiwanie tylko w sekcji "Moje przepisy", karuzela 3 ostatnich przepisów na głównym ekranie
8. Komunikaty krytyczne jako inline/modal, niekrytyczne jako toast
9. Aplikacja tylko online (brak trybu offline)
10. Uwierzytelnianie przez Supabase (email/hasło + magiczne linki), bez zewnętrznego OAuth
11. Karuzela tradycyjna z nawigacją strzałkami i dots
12. Edycja inline preferencji z auto-save
13. Przełącznik jasny/ciemny/systemowy w topbar
14. Toggle buttons dla sortowania (najnowsze/najlepsze)
15. Placeholder z zachętą gdy brak przepisów w karuzeli
16. Standardowe sortowanie (brak przypinania)
17. Truncate tytułów z "..." w karuzeli
18. Akcje na przepisach dostępne po wejściu w szczegóły
19. Retry button dla błędów generowania
20. Standardowe wyszukiwanie tekstowe (brak filtrowania po preferencjach)
21. Breakpointy: 768px i 1024px dla przejścia między layoutami
22. Auto-save preferencji z 2000ms delay
23. Karuzela z autoplay co 3000ms
24. Domyślne ustawienia touch gesture sensitivity
25. Limit 5 prób ponowienia dla operacji AI
26. Search debounce z 200ms delay
27. Preferencje motywu w localStorage
28. Loading states per-component z React Context (bez Zustand)
</decisions>

<matched_recommendations>
1. Zaimplementuj responsive breakpoints w Tailwind CSS: mobile-first (< 768px), tablet (768px - 1024px), desktop (> 1024px) z odpowiednimi layoutami
2. Stwórz komponenty layoutu: `MobileLayout` z bottom navigation i `DesktopLayout` z topbar - użyj React Context do zarządzania aktualnym breakpointem
3. Zaimplementuj `RecipeCarousel` z horizontal scroll, pagination dots i autoplay co 3000ms - użyj CSS scroll-snap i `useEffect` z timer
4. Stwórz `PreferencesSection` z kategoryzacją: "Dieta", "Kuchnia", "Alergie" - użyj Accordion z Shadcn/ui dla zwijanych sekcji
5. Zaimplementuj `ThemeToggle` w topbar z opcjami jasny/ciemny/systemowy - użyj `next-themes` z Tailwind CSS i localStorage persistence
6. Stwórz `SortToggle` z toggle buttons "Najnowsze" / "Najlepsze" - użyj Button Group z Shadcn/ui
7. Zaimplementuj `EmptyState` z ilustracją, zachętą do generowania pierwszego przepisu i CTA button
8. Stwórz `RecipeCard` z truncate dla długich tytułów, hover effects i click handler
9. Zaimplementuj `InlineEdit` component z `Input` i `Button` - użyj `useState` dla edit/save states i `useEffect` z 2000ms timer dla auto-save
10. Stwórz `CarouselNavigation` z strzałkami i dots - użyj `Button` z variant="ghost" i `useCallback` dla navigation functions
11. Zaimplementuj `SearchInput` z 200ms debounce - użyj `useDebounce` hook i `useEffect` dla search logic
12. Stwórz `ErrorBoundary` z retry button i limitem 5 prób - użyj `useState` dla retry count i `useCallback` dla retry function
13. Zaimplementuj `LoadingSpinner` per-component - użyj React Context dla globalnego loading state management
</matched_recommendations>

<ui_architecture_planning_summary>
**Główne wymagania architektury UI:**
Aplikacja MVP HealthyMeal ma być w pełni responsywna z podejściem mobile-first, obsługująca telefon (< 768px), tablet (768px - 1024px) i komputer (> 1024px). Interfejs ma być intuicyjny i skupiony na głównych funkcjach: generowaniu przepisów przez AI, zarządzaniu preferencjami żywieniowymi i przechowywaniu ulubionych przepisów.

**Kluczowe widoki i ekrany:**
- **Ekran główny**: Pole generowania przepisu + karuzela 3 ostatnich przepisów z autoplay co 3000ms
- **Moje przepisy**: Lista zapisanych przepisów z wyszukiwaniem (200ms debounce) i sortowaniem toggle (najnowsze/najlepsze)
- **Profil**: Edycja preferencji żywieniowych w kategoriach (Dieta, Kuchnia, Alergie) z auto-save co 2000ms
- **Szczegóły przepisu**: Pełny widok z oceną, zapisaniem i opcją ponownego generowania

**Przepływy użytkownika:**
1. Rejestracja/logowanie → Ustawienie preferencji → Generowanie pierwszego przepisu
2. Generowanie przepisu → Ocena → Zapisywanie lub ponowne generowanie (max 5 prób)
3. Przeglądanie zapisanych przepisów → Wyszukiwanie → Szczegóły → Akcje

**Strategia integracji z API:**
- React Context dla zarządzania stanem użytkownika, preferencji i loading states (bez Zustand)
- Komponenty z Shadcn/ui dla spójności designu i dostępności
- Inline validation z React Hook Form + Zod
- Error boundaries z retry buttons (limit 5 prób) dla operacji AI
- Toast notifications dla akcji użytkownika

**Responsywność i dostępność:**
- Breakpoint-based layouts: mobile (< 768px) z bottom navigation, tablet/desktop (≥ 768px) z topbar
- Touch gestures dla karuzeli na urządzeniach mobilnych z domyślnymi ustawieniami
- Keyboard navigation support
- Semantic HTML i ARIA labels
- Spójne spacing i typografia z Tailwind CSS

**Bezpieczeństwo i autoryzacja:**
- Middleware Astro dla walidacji JWT tokens
- Row-Level Security (RLS) w Supabase
- Protected routes dla wszystkich operacji wymagających uwierzytelnienia
- Walidacja danych wejściowych po stronie klienta i serwera

**Szczegóły techniczne:**
- Karuzela z autoplay co 3000ms, możliwość pauzy na hover
- Auto-save preferencji z 2000ms delay
- Search debounce z 200ms delay
- Loading states per-component z React Context
- Preferencje motywu (jasny/ciemny/systemowy) w localStorage
- Limit 5 prób ponowienia dla operacji AI
</ui_architecture_planning_summary>

<unresolved_issues>
Wszystkie kwestie zostały rozwiązane w trakcie konwersacji. Architektura UI jest w pełni zdefiniowana i gotowa do implementacji.
</unresolved_issues>
</conversation_summary>