# API Endpoint Implementation Plan: AI Usage Analytics

## 1. Przegląd punktu końcowego

The AI Usage Analytics endpoint provides functionality for users to view their AI generation usage statistics, including token usage, costs, and model-specific metrics over different time periods.

## 2. Szczegóły żądania

### GET /api/ai/usage

- Metoda HTTP: GET
- Struktura URL: /api/ai/usage
- Parametry:
  - period (query, optional)
  - start_date (query, optional)
  - end_date (query, optional)
- Request Body: None

## 3. Wykorzystywane typy

```typescript
// DTOs
interface ModelUsageDto {
  generations: number;
  cost: number | null;
}

interface DailyUsageDto {
  date: string;
  generations: number;
  cost: number | null;
}

interface AiUsageDto {
  period: "day" | "week" | "month" | "year" | "custom";
  start_date: string;
  end_date: string;
  total_generations: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost: number | null;
  models_used: Record<string, ModelUsageDto>;
  daily_breakdown: DailyUsageDto[];
}
```

## 4. Szczegóły odpowiedzi

### GET /api/ai/usage

- Status: 200 OK
- Body: AiUsageDto
- Error Codes:
  - 400 Bad Request
  - 401 Unauthorized

## 5. Przepływ danych

1. Parameter Processing:

   - Validate period or date range
   - Calculate start and end dates
   - Handle timezone conversions

2. Data Aggregation:

   - Query AI generation logs
   - Aggregate by model
   - Calculate daily breakdown
   - Compute totals

3. Response Formatting:
   - Format dates
   - Round costs
   - Structure response

## 6. Względy bezpieczeństwa

1. Authentication:

   - Require valid JWT token
   - Validate token expiration
   - Verify token signature

2. Authorization:

   - Enforce RLS policies
   - Verify user ownership
   - Prevent unauthorized access

3. Input Validation:

   - Validate date formats
   - Validate period values
   - Prevent SQL injection

4. Rate Limiting:
   - Implement request limits
   - Track request frequency
   - Return 429 when limit exceeded

## 7. Obsługa błędów

1. Authentication Errors (401):

   - Invalid token
   - Expired token
   - Missing token

2. Validation Errors (400):

   - Invalid date format
   - Invalid period value
   - Invalid date range
   - Missing required parameters

3. Server Errors (500):
   - Database connection issues
   - Aggregation errors
   - Unexpected errors

## 8. Rozważania dotyczące wydajności

1. Database Optimization:

   - Use appropriate indexes
   - Implement query caching
   - Optimize aggregation queries

2. Response Optimization:

   - Minimize response payload
   - Use appropriate content types
   - Implement response compression

3. Caching Strategy:

   - Cache aggregated data
   - Implement cache invalidation
   - Use appropriate cache headers

4. Query Optimization:
   - Use efficient date range queries
   - Optimize aggregation functions
   - Implement pagination if needed

## 9. Etapy wdrożenia

1. Setup:

   - Create analytics service
   - Implement Zod schemas
   - Setup error handling

2. Authentication:

   - Implement token validation
   - Setup middleware
   - Configure RLS policies

3. Data Processing:

   - Implement date handling
   - Implement aggregation logic
   - Implement cost calculations

4. Response Generation:

   - Implement model breakdown
   - Implement daily breakdown
   - Implement totals calculation

5. Validation:

   - Add input validation
   - Add business logic validation
   - Add error handling

6. Testing:

   - Unit tests
   - Integration tests
   - Performance tests

7. Documentation:
   - API documentation
   - Error documentation
   - Usage examples
