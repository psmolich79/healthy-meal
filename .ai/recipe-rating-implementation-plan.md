# API Endpoint Implementation Plan: Recipe Rating

## 1. Przegląd punktu końcowego

Recipe Rating endpoints provide functionality for users to rate recipes (thumbs up/down), update their ratings, and remove ratings. These endpoints handle user feedback and enable recipe regeneration based on negative ratings.

## 2. Szczegóły żądania

### POST /api/recipes/{id}/rating

- Metoda HTTP: POST
- Struktura URL: /api/recipes/{id}/rating
- Parametry:
  - id (path parameter)
- Request Body: UpsertRatingCommand

### PUT /api/recipes/{id}/rating

- Metoda HTTP: PUT
- Struktura URL: /api/recipes/{id}/rating
- Parametry:
  - id (path parameter)
- Request Body: UpsertRatingCommand

### DELETE /api/recipes/{id}/rating

- Metoda HTTP: DELETE
- Struktura URL: /api/recipes/{id}/rating
- Parametry:
  - id (path parameter)
- Request Body: None

## 3. Wykorzystywane typy

```typescript
// DTOs
type UpsertRatingCommand = Pick<Rating, "rating">;

type UpsertRatingDto = Rating & {
  can_regenerate: boolean;
};

interface DeletedRatingDto {
  message: string;
}

// Enums
type RatingType = "up" | "down";
```

## 4. Szczegóły odpowiedzi

### POST /api/recipes/{id}/rating

- Status: 201 Created
- Body: UpsertRatingDto
- Error Codes:
  - 400 Bad Request
  - 401 Unauthorized
  - 403 Forbidden
  - 404 Not Found

### PUT /api/recipes/{id}/rating

- Status: 200 OK
- Body: UpsertRatingDto
- Error Codes:
  - 400 Bad Request
  - 401 Unauthorized
  - 403 Forbidden
  - 404 Not Found

### DELETE /api/recipes/{id}/rating

- Status: 200 OK
- Body: DeletedRatingDto
- Error Codes:
  - 401 Unauthorized
  - 404 Not Found

## 5. Przepływ danych

1. Create Rating:

   - Validate recipe exists
   - Check recipe ownership
   - Create rating record
   - Return rating data

2. Update Rating:

   - Validate rating exists
   - Check recipe ownership
   - Update rating value
   - Return updated rating

3. Delete Rating:
   - Validate rating exists
   - Check recipe ownership
   - Remove rating record
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

   - Validate rating value
   - Ensure one rating per user
   - Prevent duplicate ratings

4. Rate Limiting:
   - Implement rating limits
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

   - Invalid rating value
   - Duplicate rating
   - Invalid request format

4. Not Found Errors (404):

   - Recipe doesn't exist
   - Rating doesn't exist
   - User not found

5. Server Errors (500):
   - Database connection issues
   - Unexpected errors

## 8. Rozważania dotyczące wydajności

1. Database Optimization:

   - Use appropriate indexes
   - Implement query caching
   - Optimize update operations

2. Response Optimization:

   - Minimize response payload
   - Use appropriate content types
   - Implement response compression

3. Caching Strategy:
   - Cache rating data
   - Implement cache invalidation
   - Use appropriate cache headers

## 9. Etapy wdrożenia

1. Setup:

   - Create rating service
   - Implement Zod schemas
   - Setup error handling

2. Authentication:

   - Implement token validation
   - Setup middleware
   - Configure RLS policies

3. Rating Operations:

   - Implement create rating
   - Implement update rating
   - Implement delete rating

4. Validation:

   - Add input validation
   - Add business logic validation
   - Add error handling

5. Testing:

   - Unit tests
   - Integration tests
   - Security tests

6. Documentation:
   - API documentation
   - Error documentation
   - Usage examples
