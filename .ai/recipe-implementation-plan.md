# API Endpoint Implementation Plan: Recipe Management

## 1. Przegląd punktu końcowego

Recipe Management endpoints provide functionality for generating, retrieving, updating, and managing AI-generated recipes. These endpoints handle recipe creation, visibility control, regeneration based on user feedback, and recipe saving functionality.

## 2. Szczegóły żądania

### POST /api/recipes/generate

- Metoda HTTP: POST
- Struktura URL: /api/recipes/generate
- Parametry: None
- Request Body: GenerateRecipeCommand

### GET /api/recipes/{id}

- Metoda HTTP: GET
- Struktura URL: /api/recipes/{id}
- Parametry:
  - id (path parameter)
- Request Body: None

### POST /api/recipes/{id}/regenerate

- Metoda HTTP: POST
- Struktura URL: /api/recipes/{id}/regenerate
- Parametry:
  - id (path parameter)
- Request Body: None

### PUT /api/recipes/{id}/visibility

- Metoda HTTP: PUT
- Struktura URL: /api/recipes/{id}/visibility
- Parametry:
  - id (path parameter)
- Request Body: UpdateRecipeVisibilityCommand

### GET /api/recipes

- Metoda HTTP: GET
- Struktura URL: /api/recipes
- Parametry:
  - page (query, optional, default: 1)
  - limit (query, optional, default: 10, max: 100)
  - visible_only (query, optional, default: false)
  - sort (query, optional, default: "created_at.desc")
- Request Body: None

### POST /api/recipes/{id}/save

- Metoda HTTP: POST
- Struktura URL: /api/recipes/{id}/save
- Parametry:
  - id (path parameter)
- Request Body: None

### DELETE /api/recipes/{id}/save

- Metoda HTTP: DELETE
- Struktura URL: /api/recipes/{id}/save
- Parametry:
  - id (path parameter)
- Request Body: None

## 3. Wykorzystywane typy

```typescript
// DTOs
interface GenerateRecipeCommand {
  query: Recipe["initial_user_query"];
  model?: string;
}

type GeneratedRecipeDto = Pick<
  Recipe,
  "id" | "title" | "ingredients" | "shopping_list" | "instructions" | "initial_user_query" | "is_visible" | "created_at"
> & {
  user_preferences_applied: Profile["preferences"];
  ai_generation: AiGenerationDto;
};

type RecipeDetailsDto = Recipe & {
  is_saved: boolean;
  user_rating: RatingType | null;
};

type RegeneratedRecipeDto = Pick<
  Recipe,
  | "id"
  | "title"
  | "ingredients"
  | "shopping_list"
  | "instructions"
  | "initial_user_query"
  | "regenerated_from_recipe_id"
  | "is_visible"
  | "created_at"
> & {
  ai_generation: AiGenerationDto;
};

type UpdateRecipeVisibilityCommand = Pick<Recipe, "is_visible">;

type UpdatedRecipeVisibilityDto = Pick<Recipe, "id" | "is_visible" | "updated_at">;

type RecipeListItemDto = Pick<Recipe, "id" | "title" | "created_at" | "is_visible"> & {
  user_rating: RatingType | null;
  is_saved: boolean;
};

interface PaginatedRecipesDto {
  recipes: RecipeListItemDto[];
  pagination: PaginationDto;
}

// Database types (current structure)
type Recipe = {
  id: string;
  user_id: string;
  title: string;
  ingredients: string; // Stored as string, not array
  shopping_list: string; // Stored as string, not array
  instructions: string; // Stored as string, not array
  initial_user_query: string;
  is_visible: boolean;
  regenerated_from_recipe_id: string | null;
  created_at: string;
  updated_at: string;
};

type RatingType = "up" | "down"; // Enum values, not numbers
```

## 4. Szczegóły odpowiedzi

### POST /api/recipes/generate

- Status: 201 Created
- Body: GeneratedRecipeDto
- Error Codes:
  - 400 Bad Request
  - 401 Unauthorized
  - 429 Too Many Requests
  - 500 Internal Server Error

### GET /api/recipes/{id}

- Status: 200 OK
- Body: RecipeDetailsDto
- Error Codes:
  - 401 Unauthorized
  - 403 Forbidden
  - 404 Not Found

### POST /api/recipes/{id}/regenerate

- Status: 201 Created
- Body: RegeneratedRecipeDto
- Error Codes:
  - 401 Unauthorized
  - 403 Forbidden
  - 404 Not Found
  - 429 Too Many Requests

### PUT /api/recipes/{id}/visibility

- Status: 200 OK
- Body: UpdatedRecipeVisibilityDto
- Error Codes:
  - 401 Unauthorized
  - 403 Forbidden
  - 404 Not Found

### GET /api/recipes

- Status: 200 OK
- Body: PaginatedRecipesDto
- Error Codes:
  - 400 Bad Request
  - 401 Unauthorized

### POST /api/recipes/{id}/save

- Status: 200 OK
- Body: { message: string; saved: boolean }
- Error Codes:
  - 401 Unauthorized
  - 404 Not Found

### DELETE /api/recipes/{id}/save

- Status: 200 OK
- Body: { message: string; saved: boolean }
- Error Codes:
  - 401 Unauthorized
  - 404 Not Found

## 5. Przepływ danych

1. Recipe Generation:

   - Validate user query
   - Get user preferences
   - Call AI service
   - Store recipe with string fields (ingredients, shopping_list, instructions)
   - Log AI generation metrics
   - Update AI log with recipe_id after successful creation
   - Return generated recipe

2. Recipe Retrieval:

   - Validate recipe ownership
   - Get recipe details
   - Get user rating
   - Check if recipe is saved
   - Return recipe data

3. Recipe Regeneration:

   - Validate original recipe
   - Get original query and preferences
   - Call AI service
   - Store new recipe with reference to original
   - Update AI generation log
   - Return regenerated recipe

4. Visibility Update:

   - Validate recipe ownership
   - Update visibility status
   - Return updated status

5. Recipe Listing:
   - Apply pagination (default: page 1, limit 10)
   - Apply filters (visible_only default: false)
   - Get user ratings
   - Check saved status
   - Return paginated results

6. Recipe Saving:
   - Validate recipe exists and user has access
   - Add to saved_recipes table
   - Return success message

7. Recipe Unsaving:
   - Validate recipe exists and user has access
   - Remove from saved_recipes table
   - Return success message

## 6. Względy bezpieczeństwa

1. Authentication:

   - Require valid JWT token
   - Validate token expiration
   - Verify token signature

2. Authorization:

   - Enforce RLS policies
   - Verify recipe ownership
   - Prevent unauthorized access

3. Input Validation:

   - Validate query length and content
   - Sanitize recipe content
   - Validate pagination parameters

4. Rate Limiting:
   - Implement AI generation limits
   - Track request frequency
   - Return 429 when limit exceeded

## 7. Obsługa błędów

1. Authentication Errors (401):

   - Invalid token
   - Expired token
   - Missing token

2. Authorization Errors (403):

   - Recipe belongs to another user
   - Insufficient permissions

3. Validation Errors (400):

   - Invalid query format
   - Invalid pagination parameters
   - Invalid visibility value

4. Not Found Errors (404):

   - Recipe doesn't exist
   - User not found

5. Rate Limit Errors (429):

   - Too many AI generations
   - Too many requests

6. Server Errors (500):
   - AI service unavailable
   - Database connection issues
   - Unexpected errors

## 8. Rozważania dotyczące wydajności

1. Database Optimization:

   - Use appropriate indexes
   - Implement query caching
   - Optimize pagination queries

2. AI Service Optimization:

   - Cache common queries
   - Implement request batching
   - Optimize token usage

3. Response Optimization:

   - Minimize response payload
   - Use appropriate content types
   - Implement response compression

4. Caching Strategy:
   - Cache recipe data
   - Implement cache invalidation
   - Use appropriate cache headers

## 9. Etapy wdrożenia

1. Setup:

   - Create recipe service
   - Implement Zod schemas
   - Setup error handling

2. AI Integration:

   - Setup AI service client
   - Implement prompt engineering
   - Add cost tracking

3. Recipe Generation:

   - Implement generation endpoint
   - Add validation
   - Add error handling
   - Handle string storage for recipe content

4. Recipe Management:

   - Implement retrieval endpoints
   - Add visibility control
   - Add regeneration logic
   - Integrate saved recipes functionality

5. Listing and Pagination:

   - Implement listing endpoint
   - Add filtering
   - Add sorting
   - Include saved status

6. Testing:

   - Unit tests
   - Integration tests
   - AI service tests

7. Documentation:
   - API documentation
   - Error documentation
   - Usage examples

## 10. Uwagi implementacyjne

### Struktura bazy danych

- **Ingredients, shopping_list, instructions**: Przechowywane jako stringi, nie jako tablice JSON
- **AI generation workflow**: Najpierw logujemy użycie AI, potem aktualizujemy recipe_id po utworzeniu przepisu
- **Saved recipes**: Nowa tabela `saved_recipes` do śledzenia ulubionych przepisów użytkownika

### Kompatybilność z frontendem

- Frontend może parsować stringi na tablice przy wyświetlaniu
- API zwraca dane w formacie zgodnym z typami TypeScript
- Zachowana jest kompatybilność wsteczna z istniejącymi komponentami
