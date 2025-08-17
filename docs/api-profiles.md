# Profile Management API

This document describes the Profile Management API endpoint that allows authenticated users to manage their profile information.

## Base URL

```
/api/profiles/me
```

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### GET /api/profiles/me

Retrieves the current user's profile information.

**Request:**
- Method: `GET`
- Headers: `Authorization: Bearer <jwt_token>`
- Body: None

**Response:**
- Status: `200 OK`
- Body: `ProfileDto`

**Example Response:**
```json
{
  "user_id": "user-123",
  "preferences": ["vegetarian", "gluten-free"],
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid JWT token
- `404 Not Found` - User profile not found
- `500 Internal Server Error` - Server error

### PUT /api/profiles/me

Updates the current user's profile preferences.

**Request:**
- Method: `PUT`
- Headers: 
  - `Authorization: Bearer <jwt_token>`
  - `Content-Type: application/json`
- Body: `UpdateProfileCommand`

**Request Body:**
```json
{
  "preferences": ["vegan", "organic", "low-sodium"]
}
```

**Response:**
- Status: `200 OK`
- Body: `UpdatedProfileDto`

**Example Response:**
```json
{
  "user_id": "user-123",
  "preferences": ["vegan", "organic", "low-sodium"],
  "status": "active",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid JSON or validation errors
- `401 Unauthorized` - Missing or invalid JWT token
- `404 Not Found` - User profile not found
- `500 Internal Server Error` - Server error

**Validation Rules:**
- `preferences` must be an array of strings
- `preferences` must contain at least one item

### DELETE /api/profiles/me

Schedules the current user's profile for deletion.

**Request:**
- Method: `DELETE`
- Headers: `Authorization: Bearer <jwt_token>`
- Body: None

**Response:**
- Status: `200 OK`
- Body: `DeletedProfileDto`

**Example Response:**
```json
{
  "message": "Profile scheduled for deletion",
  "status": "pending_deletion",
  "deletion_scheduled_at": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid JWT token
- `404 Not Found` - User profile not found
- `500 Internal Server Error` - Server error

## Data Types

### ProfileDto
```typescript
{
  user_id: string;
  preferences: string[];
  status: "active" | "pending_deletion" | "deleted";
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}
```

### UpdateProfileCommand
```typescript
{
  preferences: string[];
}
```

### UpdatedProfileDto
```typescript
{
  user_id: string;
  preferences: string[];
  status: "active" | "pending_deletion" | "deleted";
  updated_at: string; // ISO date string
}
```

### DeletedProfileDto
```typescript
{
  message: string;
  status: "active" | "pending_deletion" | "deleted";
  deletion_scheduled_at: string; // ISO date string
}
```

## Security

- **Authentication**: All endpoints require valid JWT tokens
- **Authorization**: Users can only access and modify their own profile
- **Row-Level Security**: Database-level protection via Supabase RLS policies
- **Input Validation**: Request bodies are validated using Zod schemas

## Error Handling

The API follows standard HTTP status codes and provides consistent error responses:

```json
{
  "error": "Error message description",
  "details": "Additional error details (when applicable)"
}
```

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## Examples

### cURL Examples

**Get Profile:**
```bash
curl -X GET "http://localhost:4321/api/profiles/me" \
  -H "Authorization: Bearer your_jwt_token_here"
```

**Update Preferences:**
```bash
curl -X PUT "http://localhost:4321/api/profiles/me" \
  -H "Authorization: Bearer your_jwt_token_here" \
  -H "Content-Type: application/json" \
  -d '{"preferences": ["vegan", "organic"]}'
```

**Schedule Deletion:**
```bash
curl -X DELETE "http://localhost:4321/api/profiles/me" \
  -H "Authorization: Bearer your_jwt_token_here"
```

### JavaScript/TypeScript Examples

**Get Profile:**
```typescript
const response = await fetch('/api/profiles/me', {
  headers: {
    'Authorization': `Bearer ${jwtToken}`
  }
});

const profile = await response.json();
```

**Update Preferences:**
```typescript
const response = await fetch('/api/profiles/me', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    preferences: ['vegan', 'organic']
  })
});

const updatedProfile = await response.json();
```

## Implementation Details

- **Framework**: Astro 5 with API routes
- **Database**: Supabase with PostgreSQL
- **Authentication**: JWT tokens via Supabase Auth
- **Validation**: Zod schemas for request validation
- **Error Handling**: Comprehensive error handling with appropriate HTTP status codes
- **Logging**: Server-side logging for debugging and monitoring

## Related Files

- **API Route**: `src/pages/api/profiles/me.ts`
- **Service**: `src/lib/services/profile.service.ts`
- **Types**: `src/types.ts`
- **Middleware**: `src/middleware/index.ts`
- **Database Types**: `src/db/database.types.ts`
