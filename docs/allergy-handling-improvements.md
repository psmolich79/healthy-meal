# Poprawki w Obsłudze Alergenów w Serwisie AI

## Problem

Użytkownicy zgłaszali, że mimo ustawienia alergii na orzechy w preferencjach, generowane przepisy nadal zawierały składniki orzechowe. Problem polegał na tym, że:

1. **Alergeny nie były specjalnie traktowane** - AI otrzymywało tylko listę preferencji bez jasnych instrukcji
2. **Brak kategoryzacji preferencji** - wszystkie preferencje były traktowane jednakowo
3. **Niewystarczające instrukcje** - AI nie rozumiało, że alergeny to kwestia zdrowia i bezpieczeństwa

## Rozwiązanie

### 1. Kategoryzacja Preferencji

Dodano metodę `categorizePreferences()` która rozdziela preferencje użytkownika na trzy kategorie:

- **Alergie** (`allergies`) - składniki, których należy bezwzględnie unikać
- **Preferencje dietetyczne** (`dietPreferences`) - wybory żywieniowe
- **Preferencje kuchni** (`cuisinePreferences`) - style kulinarne

### 2. Rozpoznawanie Alergenów

Metoda rozpoznaje alergeny na podstawie słów kluczowych w języku polskim i angielskim:

```typescript
const allergyKeywords = [
  // Polish allergy terms
  "gluten", "laktoza", "orzechy", "skorupiaki", "jaja", "soja", "ryby", "sezam",
  "orzeszki", "orzechowy", "glutenowe", "laktozowy",
  // English allergy terms
  "gluten", "lactose", "nuts", "shellfish", "eggs", "soy", "fish", "sesame",
  "peanut", "walnut", "hazelnut", "cashew", "pistachio", "almond", "pecan"
];
```

### 3. Ulepszone Prompty dla AI

#### System Message
Dodano jasne instrukcje w system message:
```
CRITICAL: If the user has allergies, NEVER include those ingredients - this is a matter of health and safety. Double-check all ingredients against the allergy list before finalizing the recipe. Remember: Food allergies can be life-threatening, so be extremely careful and thorough in your ingredient selection.
```

#### Prompt z Alergenami
Gdy użytkownik ma alergeny, prompt zawiera:

1. **Ostrzeżenie o alergiach**:
   ```
   ⚠️ CRITICAL - ALLERGIES TO AVOID (NEVER include these ingredients):
   - orzechy (ABSOLUTELY FORBIDDEN)
   - gluten (ABSOLUTELY FORBIDDEN)
   ```

2. **Krytyczne ostrzeżenie**:
   ```
   ⚠️ CRITICAL ALLERGY WARNING: The user has severe allergies to the ingredients listed above. 
   NEVER include any of these ingredients in the recipe, shopping list, or instructions. 
   This is a matter of health and safety - double-check every ingredient carefully.
   Remember: Including these ingredients could cause serious health problems or allergic reactions.
   ```

3. **Lista kontrolna bezpieczeństwa**:
   ```
   SAFETY CHECKLIST - Before finalizing, verify:
   1. No forbidden allergens in ingredients list
   2. No forbidden allergens in shopping list  
   3. No forbidden allergens in cooking instructions
   4. No derivatives or variations of forbidden allergens
   5. All ingredients are safe alternatives
   ```

4. **Przykłady tego, czego unikać**:
   ```
   Examples of what to avoid:
   - If allergy is "orzechy" (nuts): avoid all nuts, nut butters, nut oils, nut flours, nut extracts
   - If allergy is "gluten": avoid wheat, rye, barley, and any products containing these grains
   - If allergy is "laktoza" (lactose): avoid milk, cheese, yogurt, butter, and dairy products
   ```

5. **Krytyczne wymagania bezpieczeństwa**:
   ```
   - CRITICAL: NEVER include any ingredients from the allergies list above
   - This is a critical safety requirement - failure to exclude these ingredients could harm the user's health
   - Check every ingredient name, including any variations or derivatives of the forbidden allergens
   - If unsure about any ingredient, choose a safer alternative that definitely doesn't contain allergens
   - Use the safety checklist above to verify your recipe is completely allergen-free
   - When in doubt, err on the side of caution and choose a different ingredient
   ```

### 4. Struktura Promptu

Prompt jest teraz budowany dynamicznie:

- **Bez preferencji**: Podstawowy prompt bez dodatkowych instrukcji
- **Z preferencjami dietetycznymi**: Dodane sekcje "Dietary Preferences" i "Cuisine Preferences"
- **Z alergenami**: Dodane wszystkie powyższe ostrzeżenia i instrukcje bezpieczeństwa

## Przykład Promptu z Alergią na Orzechy

```
Generate a detailed recipe based on the following request:

User Request: zdrowa kolacja

⚠️ CRITICAL - ALLERGIES TO AVOID (NEVER include these ingredients):
- orzechy (ABSOLUTELY FORBIDDEN)

⚠️ CRITICAL ALLERGY WARNING: The user has severe allergies to the ingredients listed above. 
NEVER include any of these ingredients in the recipe, shopping list, or instructions. 
This is a matter of health and safety - double-check every ingredient carefully.
Remember: Including these ingredients could cause serious health problems or allergic reactions.

IMPORTANT: Before including any ingredient, check if it contains or is related to any of these allergens:
- orzechy: Check for any variations, derivatives, or related ingredients

Examples of what to avoid:
- If allergy is "orzechy" (nuts): avoid all nuts, nut butters, nut oils, nut flours, nut extracts
- If allergy is "gluten": avoid wheat, rye, barley, and any products containing these grains
- If allergy is "laktoza" (lactose): avoid milk, cheese, yogurt, butter, and dairy products

SAFETY CHECKLIST - Before finalizing, verify:
1. No forbidden allergens in ingredients list
2. No forbidden allergens in shopping list  
3. No forbidden allergens in cooking instructions
4. No derivatives or variations of forbidden allergens
5. All ingredients are safe alternatives

Please provide the recipe in the following JSON format:
{
  "title": "Nazwa Przepisu",
  "ingredients": ["składnik 1 z ilością", "składnik 2 z ilością", ...],
  "shopping_list": ["produkt 1 z ilością", "produkt 2 z ilością", ...],
  "instructions": ["krok 1", "krok 2", ...]
}

Requirements:
- Generate the recipe entirely in Polish language
- Make the recipe practical and easy to follow
- Consider user dietary preferences and cuisine choices
- CRITICAL: NEVER include any ingredients from the allergies list above - these are absolutely forbidden for health reasons
- Provide clear, step-by-step instructions
- Include a shopping list with quantities
- Ensure ingredients are commonly available
- Make the recipe healthy and balanced
- Double-check that NO forbidden ingredients are included in the recipe, shopping list, or instructions
- Before finalizing, verify that NONE of these ingredients appear anywhere: orzechy
- This is a critical safety requirement - failure to exclude these ingredients could harm the user's health
- Check every ingredient name, including any variations or derivatives of the forbidden allergens
- If unsure about any ingredient, choose a safer alternative that definitely doesn't contain allergens
- Use the safety checklist above to verify your recipe is completely allergen-free
- When in doubt, err on the side of caution and choose a different ingredient
```

## Testy

Dodano kompleksowe testy sprawdzające:

1. **Kategoryzację preferencji** - czy alergeny, dieta i kuchnia są poprawnie rozpoznawane
2. **Budowanie promptów** - czy ostrzeżenia o alergiach są poprawnie dodawane
3. **Instrukcje bezpieczeństwa** - czy wszystkie krytyczne informacje są zawarte
4. **Listę kontrolną** - czy checklista bezpieczeństwa jest obecna
5. **Przykłady unikania** - czy przykłady są poprawnie sformułowane

## Korzyści

1. **Bezpieczeństwo** - AI jest teraz jasno instruowane o tym, że alergeny to kwestia zdrowia
2. **Precyzja** - Alergeny są specjalnie traktowane i kategoryzowane
3. **Jasność** - Prompt zawiera jasne instrukcje i listę kontrolną
4. **Ostrożność** - AI jest instruowane, aby w razie wątpliwości wybierać bezpieczniejsze alternatywy
5. **Weryfikacja** - Dodano wielopoziomowe sprawdzanie składników

## Wnioski

Te zmiany powinny znacząco poprawić bezpieczeństwo generowanych przepisów dla użytkowników z alergiami. AI jest teraz:

- **Jasno ostrzegane** o wadze problemu
- **Instruowane** o tym, jak sprawdzać składniki
- **Zachęcane** do ostrożności
- **Weryfikowane** przez listę kontrolną

Alergeny są teraz traktowane jako kwestia zdrowia i bezpieczeństwa, a nie tylko preferencja żywieniowa.
