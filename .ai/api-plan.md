# REST API Plan

## 1. Resources

| Resource           | Database Table       | Description                                                        |
| ------------------ | -------------------- | ------------------------------------------------------------------ |
| **Profiles**       | `profiles`           | User profile data including dietary preferences and account status |
| **Recipes**        | `recipes`            | AI-generated recipes with ingredients, instructions, and metadata  |
| **Ratings**        | `ratings`            | User ratings for recipes (thumbs up/down)                          |
| **AI Generations** | `ai_generations_log` | Tracking of AI model usage and associated costs                    |
| **Saved Recipes**  | `saved_recipes`      | User's favorite/saved recipes                                     |

## 2. Endpoints

### 2.1 Profile Management

#### GET /api/profiles/me

- **Description**: Get current user's profile information
- **Authentication**: Required (Bearer token)
- **Query Parameters**: None
- **Request Body**: None
- **Response Body**:

```json
{
  "user_id": "uuid",
  "preferences": ["vegetarian", "gluten_free", "italian_cuisine"],
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

- **Success Codes**: 200 OK
- **Error Codes**:
  - 401 Unauthorized - Invalid or missing authentication token
  - 404 Not Found - Profile not found

#### PUT /api/profiles/me

- **Description**: Update current user's profile preferences
- **Authentication**: Required (Bearer token)
- **Query Parameters**: None
- **Request Body**:

```json
{
  "preferences": ["vegetarian", "low_carb", "mediterranean"]
}
```

- **Response Body**:

```json
{
  "user_id": "uuid",
  "preferences": ["vegetarian", "low_carb", "mediterranean"],
  "status": "active",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

- **Success Codes**: 200 OK
- **Error Codes**:
  - 400 Bad Request - Invalid preferences format
  - 401 Unauthorized - Invalid or missing authentication token

#### DELETE /api/profiles/me

- **Description**: Mark user profile for deletion (soft delete)
- **Authentication**: Required (Bearer token)
- **Query Parameters**: None
- **Request Body**: None
- **Response Body**:

```json
{
  "message": "Profile marked for deletion",
  "status": "pending_deletion",
  "deletion_scheduled_at": "2024-01-31T00:00:00Z"
}
```

- **Success Codes**: 200 OK
- **Error Codes**:
  - 401 Unauthorized - Invalid or missing authentication token

### 2.2 Recipe Management

#### POST /api/recipes/generate

- **Description**: Generate a new recipe using AI based on user query and preferences
- **Authentication**: Required (Bearer token)
- **Query Parameters**: None
- **Request Body**:

```json
{
  "query": "healthy dinner with chicken and vegetables",
  "model": "gpt-4o"
}
```

- **Response Body**:

```json
{
  "id": "uuid",
  "title": "Grilled Chicken with Roasted Vegetables",
  "ingredients": ["2 chicken breasts", "1 broccoli head", "2 carrots"],
  "shopping_list": ["Chicken breasts", "Broccoli", "Carrots", "Olive oil"],
  "instructions": ["1. Preheat oven to 400°F", "2. Season chicken..."],
  "initial_user_query": "healthy dinner with chicken and vegetables",
  "user_preferences_applied": ["vegetarian", "low_carb"],
  "is_visible": true,
  "created_at": "2024-01-01T00:00:00Z",
  "ai_generation": {
    "model": "gpt-4o",
    "input_tokens": 150,
    "output_tokens": 500,
    "cost": 0.0025
  }
}
```

- **Success Codes**: 201 Created
- **Error Codes**:
  - 400 Bad Request - Empty or invalid query
  - 401 Unauthorized - Invalid or missing authentication token
  - 429 Too Many Requests - Rate limit exceeded
  - 500 Internal Server Error - AI service unavailable

#### GET /api/recipes/{id}

- **Description**: Get a specific recipe by ID
- **Authentication**: Required (Bearer token)
- **Query Parameters**: None
- **Request Body**: None
- **Response Body**:

```json
{
  "id": "uuid",
  "title": "Grilled Chicken with Roasted Vegetables",
  "ingredients": "2 chicken breasts, 1 broccoli head, 2 carrots...",
  "shopping_list": "Chicken breasts, Broccoli, Carrots, Olive oil...",
  "instructions": "1. Preheat oven to 400°F\n2. Season chicken...",
  "initial_user_query": "healthy dinner with chicken and vegetables",
  "is_visible": true,
  "is_saved": true,
  "user_rating": 1,
  "regenerated_from_recipe_id": null,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

- **Success Codes**: 200 OK
- **Error Codes**:
  - 401 Unauthorized - Invalid or missing authentication token
  - 403 Forbidden - Recipe belongs to another user
  - 404 Not Found - Recipe not found

#### POST /api/recipes/{id}/regenerate

- **Description**: Regenerate a recipe based on the original query (typically after negative rating)
- **Authentication**: Required (Bearer token)
- **Query Parameters**: None
- **Request Body**: None
- **Response Body**:

```json
{
  "id": "new-uuid",
  "title": "Pan-Seared Chicken with Steamed Vegetables",
  "ingredients": ["2 chicken thighs", "1 broccoli head", "2 carrots"],
  "shopping_list": ["Chicken thighs", "Broccoli", "Carrots", "Butter"],
  "instructions": ["1. Heat pan over medium-high heat", "2. Season chicken..."],
  "initial_user_query": "healthy dinner with chicken and vegetables",
  "regenerated_from_recipe_id": "original-recipe-uuid",
  "is_visible": true,
  "created_at": "2024-01-01T00:00:00Z",
  "ai_generation": {
    "model": "gpt-4o",
    "input_tokens": 160,
    "output_tokens": 480,
    "cost": 0.0024
  }
}
```

- **Success Codes**: 201 Created
- **Error Codes**:
  - 401 Unauthorized - Invalid or missing authentication token
  - 403 Forbidden - Recipe belongs to another user
  - 404 Not Found - Original recipe not found
  - 429 Too Many Requests - Rate limit exceeded

#### PUT /api/recipes/{id}/visibility

- **Description**: Update recipe visibility (hide/show)
- **Authentication**: Required (Bearer token)
- **Query Parameters**: None
- **Request Body**:

```json
{
  "is_visible": false
}
```

- **Response Body**:

```json
{
  "id": "uuid",
  "is_visible": false,
  "updated_at": "2024-01-01T00:00:00Z"
}
```

- **Success Codes**: 200 OK
- **Error Codes**:
  - 401 Unauthorized - Invalid or missing authentication token
  - 403 Forbidden - Recipe belongs to another user
  - 404 Not Found - Recipe not found

#### GET /api/recipes

- **Description**: Get user's recipes with pagination and filtering
- **Authentication**: Required (Bearer token)
- **Query Parameters**:
  - `page` (integer, default: 1) - Page number
  - `limit` (integer, default: 10, max: 100) - Items per page
  - `visible_only` (boolean, default: false) - Show only visible recipes
  - `sort` (string, default: "created_at.desc") - Sort order: "created_at.desc", "created_at.asc", "title.asc"
- **Request Body**: None
- **Response Body**:

```json
{
  "recipes": [
    {
      "id": "uuid",
      "title": "Grilled Chicken with Roasted Vegetables",
      "created_at": "2024-01-01T00:00:00Z",
      "is_visible": true,
      "user_rating": 1,
      "is_saved": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "total_pages": 5,
    "has_next": true,
    "has_previous": false
  }
}
```

- **Success Codes**: 200 OK
- **Error Codes**:
  - 400 Bad Request - Invalid query parameters
  - 401 Unauthorized - Invalid or missing authentication token

### 2.3 Recipe Rating

#### POST /api/recipes/{id}/rating

- **Description**: Rate a recipe (thumbs up/down)
- **Authentication**: Required (Bearer token)
- **Query Parameters**: None
- **Request Body**:

```json
{
  "rating": "up"
}
```

- **Response Body**:

```json
{
  "recipe_id": "uuid",
  "user_id": "uuid",
  "rating": "up",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

- **Success Codes**: 200 OK
- **Error Codes**:
  - 400 Bad Request - Invalid rating value
  - 401 Unauthorized - Invalid or missing authentication token
  - 403 Forbidden - Recipe belongs to another user
  - 404 Not Found - Recipe not found

#### PUT /api/recipes/{id}/rating

- **Description**: Update existing recipe rating
- **Authentication**: Required (Bearer token)
- **Query Parameters**: None
- **Request Body**:

```json
{
  "rating": "down"
}
```

- **Response Body**:

```json
{
  "recipe_id": "uuid",
  "user_id": "uuid",
  "rating": "down",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

- **Success Codes**: 200 OK
- **Error Codes**:
  - 400 Bad Request - Invalid rating value
  - 401 Unauthorized - Invalid or missing authentication token
  - 403 Forbidden - Recipe belongs to another user
  - 404 Not Found - Recipe or rating not found

#### DELETE /api/recipes/{id}/rating

- **Description**: Remove recipe rating
- **Authentication**: Required (Bearer token)
- **Query Parameters**: None
- **Request Body**: None
- **Response Body**:

```json
{
  "message": "Rating removed successfully"
}
```

- **Success Codes**: 200 OK
- **Error Codes**:
  - 401 Unauthorized - Invalid or missing authentication token
  - 404 Not Found - Recipe or rating not found

### 2.4 Recipe Saving

#### POST /api/recipes/{id}/save

- **Description**: Save a recipe to user's favorites
- **Authentication**: Required (Bearer token)
- **Query Parameters**: None
- **Request Body**: None
- **Response Body**:

```json
{
  "message": "Recipe saved successfully",
  "saved": true
}
```

- **Success Codes**: 200 OK
- **Error Codes**:
  - 401 Unauthorized - Invalid or missing authentication token
  - 404 Not Found - Recipe not found

#### DELETE /api/recipes/{id}/save

- **Description**: Remove a recipe from user's favorites
- **Authentication**: Required (Bearer token)
- **Query Parameters**: None
- **Request Body**: None
- **Response Body**:

```json
{
  "message": "Recipe removed from favorites",
  "saved": false
}
```

- **Success Codes**: 200 OK
- **Error Codes**:
  - 401 Unauthorized - Invalid or missing authentication token
  - 404 Not Found - Recipe not found

### 2.5 AI Usage Analytics

#### GET /api/ai/usage

- **Description**: Get user's AI usage statistics
- **Authentication**: Required (Bearer token)
- **Query Parameters**:
  - `period` (string, default: "month") - Time period: "day", "week", "month", "year"
  - `start_date` (string, ISO date) - Start date for custom period
  - `end_date` (string, ISO date) - End date for custom period
- **Request Body**: None
- **Response Body**:

```json
{
  "period": "month",
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-01-31T23:59:59Z",
  "total_generations": 45,
  "total_input_tokens": 6750,
  "total_output_tokens": 22500,
  "total_cost": 0.1125,
  "models_used": {
    "gpt-4o": {
      "generations": 45,
      "cost": 0.1125
    }
  },
  "daily_breakdown": [
    {
      "date": "2024-01-01",
      "generations": 3,
      "cost": 0.0075
    }
  ]
}
```

- **Success Codes**: 200 OK
- **Error Codes**:
  - 400 Bad Request - Invalid date parameters
  - 401 Unauthorized - Invalid or missing authentication token

## 3. Authentication and Authorization

### Authentication Mechanism

- **Primary**: Supabase Auth with JWT tokens
- **Supported Methods**:
  - Email/Password authentication
  - Google OAuth 2.0
  - Password reset via email

### Authorization Implementation

- **Bearer Token**: All API endpoints require `Authorization: Bearer <jwt_token>` header
- **Row Level Security**: Database-level security ensures users can only access their own data
- **Token Validation**: Supabase JWT tokens are validated on each request
- **Scope-based Access**: Users can only access resources they own (enforced by RLS policies)

### Rate Limiting

- **AI Generation**: 10 requests per minute per user
- **General API**: 100 requests per minute per user
- **Burst Allowance**: 20 requests in 10-second window

## 4. Validation and Business Logic

### Validation Rules

#### Profiles

- **preferences**: Array of strings, maximum 20 items
- **status**: Must be one of: 'active', 'pending_deletion', 'deleted'
- **Soft Delete**: Status change to 'pending_deletion' triggers 30-day grace period

#### Recipes

- **title**: Required, maximum 200 characters
- **ingredients**: Required, maximum 5000 characters (stored as string)
- **shopping_list**: Required, maximum 3000 characters (stored as string)
- **instructions**: Required, maximum 8000 characters (stored as string)
- **initial_user_query**: Required, maximum 500 characters
- **is_visible**: Boolean, defaults to true
- **regenerated_from_recipe_id**: Optional UUID reference to original recipe

#### Ratings

- **rating**: Must be one of: 'up', 'down' (stored as enum)
- **Uniqueness**: One rating per user per recipe (composite primary key)
- **Ownership**: Users can only rate recipes they can access

#### AI Generations

- **prompt**: Required, maximum 1000 characters
- **input_tokens**: Required, positive integer
- **output_tokens**: Positive integer
- **cost**: Positive decimal with 6 decimal places
- **recipe_id**: Optional, updated after recipe creation

#### Saved Recipes

- **user_id**: Required, references auth.users(id)
- **recipe_id**: Required, references recipes(id)
- **Uniqueness**: One save per user per recipe

### Business Logic Implementation

#### Recipe Generation Flow

1. **Input Validation**: Validate user query and authentication
2. **Preference Integration**: Automatically append user preferences to AI prompt
3. **AI Service Call**: Send enhanced prompt to configured AI model
4. **Response Processing**: Parse and structure AI response into recipe format
5. **Database Storage**: Store recipe with string fields (ingredients, shopping_list, instructions)
6. **AI Usage Logging**: Log AI generation metrics and update with recipe_id
7. **Cost Tracking**: Record token usage and calculate costs

#### Rating and Regeneration Logic

1. **Rating Storage**: Store user rating with timestamp
2. **Regeneration Trigger**: "thumbs down" rating enables regeneration option
3. **Regeneration Process**: Use original query + preferences to generate new recipe
4. **Relationship Tracking**: Link regenerated recipe to original via `regenerated_from_recipe_id`

#### Recipe Saving Logic

1. **Save Recipe**: Add recipe to user's saved_recipes table
2. **Unsave Recipe**: Remove recipe from saved_recipes table
3. **Duplicate Prevention**: Enforce unique constraint per user per recipe

#### Soft Delete Implementation

1. **Profile Deletion**: Mark profile as 'pending_deletion'
2. **Grace Period**: 30-day window before permanent deletion
3. **Cascade Effects**: All user recipes become invisible but remain in database
4. **Cleanup Process**: Scheduled job removes data after grace period

#### Error Handling

- **AI Service Failures**: Graceful degradation with retry logic
- **Rate Limiting**: Informative error messages with retry-after headers
- **Validation Errors**: Detailed field-level error descriptions
- **Authentication Errors**: Clear distinction between invalid and expired tokens
