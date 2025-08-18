# Ulepszenia w obsłudze alergenów

## Problem
W komponencie `ActiveFilters` alergeny (np. "nuts" - orzechy) były wyświetlane tak samo jak preferencje dietetyczne i kulinarne, co mogło wprowadzać w błąd użytkowników. Alergeny powinny być wyraźnie wyróżnione jako preferencje wykluczające.

## Rozwiązanie

### 1. Poprawiona logika kategoryzacji
- Zastąpiono hardkodowane słowa kluczowe rzeczywistymi danymi z `src/data/preferences.ts`
- Preferencje są teraz kategoryzowane na podstawie ich rzeczywistych ID i kategorii
- Alergeny są automatycznie rozpoznawane jako `category: "allergy"`

### 2. Wizualne wyróżnienie alergenów
- **Kolor**: Jasne czerwone tło (`bg-red-50`) z ciemnym czerwonym tekstem (`text-red-800`) dla lepszej czytelności
- **Ikona**: Dodano ikonę `XCircle` w kolorze `text-red-600` przed nazwą alergenu
- **Ostrzeżenie**: Dla alergenów o wysokim stopniu zagrożenia (`severity: "severe"`) dodano emoji ostrzeżenia ⚠️
- **Ramka**: Ciemniejsza czerwona ramka (`border-red-400`) dla lepszego wyróżnienia
- **Cień**: Dodano delikatny cień (`shadow-sm`) dla lepszej widoczności

### 3. Informacja o znaczeniu alergenów
- Dodano specjalne ostrzeżenie na dole sekcji, gdy obecne są alergeny
- Tekst wyjaśnia: "Alergie są preferencjami wykluczającymi - przepisy będą generowane bez tych składników"
- Ostrzeżenie ma bardzo jasne czerwone tło (`bg-red-50`) z ciemniejszym tekstem (`text-red-800`)

### 4. Poprawiona etykietka
- Alergeny wyświetlają się z polskimi nazwami (np. "Orzechy" zamiast "nuts")
- Używa danych z `ALLERGY_PREFERENCES` dla poprawnego tłumaczenia

## Przykład wyglądu

**Przed:**
```
Dieta: [high-protein] [italian] [nuts]
```

**Po:**
```
Dieta: [Wysokobiałkowa] [Włoska]
Alergie: [❌ Orzechy ⚠️]

Uwaga: Alergie są preferencjami wykluczającymi - przepisy będą generowane bez tych składników
```

**Kolory alergenów:**
- Tło: `bg-red-50` (bardzo jasne czerwone)
- Tekst: `text-red-800` (ciemny czerwony)
- Ramka: `border-red-400` (średni czerwony)
- Ikona: `text-red-600` (czerwony)
- Cień: `shadow-sm` (delikatny)

## Pliki zmodyfikowane

- `src/components/recipes/ActiveFilters.tsx` - główna logika komponentu
- `src/components/recipes/ActiveFilters.test.tsx` - testy dla nowej funkcjonalności

## Testy

Dodano testy sprawdzające:
- Poprawną kategoryzację preferencji
- Wyświetlanie ostrzeżenia o alergiach
- Brak ostrzeżenia gdy nie ma alergenów
- Stan pusty bez preferencji

## Korzyści

1. **Jasność**: Użytkownicy od razu widzą, które preferencje to alergie
2. **Bezpieczeństwo**: Wyraźne oznaczenie alergenów zmniejsza ryzyko błędów
3. **UX**: Lepsze zrozumienie, że alergeny to preferencje wykluczające
4. **Spójność**: Używa rzeczywistych danych zamiast hardkodowanych słów kluczowych
