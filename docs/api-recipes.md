# Recipe Management API

## Overview

The Recipe Management API provides comprehensive functionality for creating, retrieving, updating, and managing AI-generated recipes. It includes features for recipe generation, regeneration, visibility management, and rating system.

## Endpoints

### Recipe Generation

#### POST /api/recipes/generate

Generates a new recipe using AI based on user query and preferences.

**Request Body:**
```json
{
  "query": "Quick vegetarian dinner with pasta",
  "model": "gpt-4"
}
```

**Response:** `GeneratedRecipeDto` with status 201

### Recipe Retrieval

#### GET /api/recipes/{id}

Retrieves detailed information about a specific recipe.

**Response:** `RecipeDetailsDto` with status 200

### Recipe Visibility Management

#### PUT /api/recipes/{id}/visibility

Updates the visibility status of a recipe.

**Request Body:**
```json
{
  "is_visible": true
}
```

**Response:** `UpdatedRecipeVisibilityDto` with status 200

### Recipe Regeneration

#### POST /api/recipes/{id}/regenerate

Regenerates a recipe using AI to create a variation.

**Response:** `RegeneratedRecipeDto` with status 201

### Recipe Listing

#### GET /api/recipes

Retrieves a paginated list of user's recipes with filtering and sorting options.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10, max: 100)
- `visible_only` (boolean, default: false)
- `sort` (string, default: "created_at.desc")

**Response:** `PaginatedRecipesDto` with status 200

### Recipe Rating

#### POST /api/recipes/{id}/rating

Creates a new rating for a recipe.

**Request Body:**
```json
{
  "rating": "up"
}
```

**Response:** `UpsertRatingDto` with status 201

#### PUT /api/recipes/{id}/rating

Updates an existing rating for a recipe.

**Request Body:**
```json
{
  "rating": "down"
}
```

**Response:** `UpsertRatingDto` with status 200

#### DELETE /api/recipes/{id}/rating

Deletes a rating for a recipe.

**Response:** Success message with status 200

## Error Handling

All endpoints return appropriate HTTP status codes:

- **200 OK**: Successful operation
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

## Authentication

All endpoints require valid JWT authentication via the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

AI generation endpoints (`/generate` and `/regenerate`) are subject to rate limiting:
- Maximum 10 generations per hour per user
- Rate limit window: 1 hour

## Data Types

### Recipe Structure

Recipes include:
- **Basic Info**: title, ingredients, instructions, shopping list
- **Metadata**: creation date, visibility status, user ownership
- **AI Generation**: model used, token usage, cost tracking
- **User Preferences**: dietary restrictions and preferences applied

### Rating System

- **Rating Types**: "up" (positive) or "down" (negative)
- **One Rating Per User**: Users can only have one rating per recipe
- **Update/Delete**: Ratings can be modified or removed

## Related APIs

For AI usage analytics and cost tracking, see the [AI Usage Analytics API](./api-ai-usage.md).

For user profile management, see the [Profile Management API](./api-profiles.md).
