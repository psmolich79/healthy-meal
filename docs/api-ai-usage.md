# AI Usage Analytics API

## Overview

The AI Usage Analytics API provides comprehensive statistics about user's AI generation usage, including token usage, costs, and model-specific metrics over different time periods.

## Endpoints

### GET /api/ai/usage

Retrieves AI usage statistics for the current authenticated user.

#### Request

**Method:** `GET`  
**URL:** `/api/ai/usage`  
**Authentication:** Required (JWT token)

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `period` | string | No | `"month"` | Time period for statistics. Valid values: `"day"`, `"week"`, `"month"`, `"year"`, `"custom"` |
| `start_date` | string | No* | - | Custom start date for custom period (ISO 8601 format: `YYYY-MM-DDTHH:mm:ssZ`) |
| `end_date` | string | No* | - | Custom end date for custom period (ISO 8601 format: `YYYY-MM-DDTHH:mm:ssZ`) |

\* Required when `period` is `"custom"`

#### Period Options

- **`"day"`**: Last 24 hours
- **`"week"`**: Last 7 days
- **`"month"`**: Last 30 days
- **`"year"`**: Last 365 days
- **`"custom"`**: Custom date range (requires both `start_date` and `end_date`)

#### Example Requests

```bash
# Get monthly usage (default)
GET /api/ai/usage

# Get weekly usage
GET /api/ai/usage?period=week

# Get custom date range
GET /api/ai/usage?period=custom&start_date=2024-01-01T00:00:00Z&end_date=2024-01-31T23:59:59Z

# Get yearly usage
GET /api/ai/usage?period=year
```

#### Response

**Success Response (200 OK)**

```json
{
  "period": "month",
  "start_date": "2024-01-01T00:00:00.000Z",
  "end_date": "2024-02-01T00:00:00.000Z",
  "total_generations": 15,
  "total_input_tokens": 3000,
  "total_output_tokens": 6000,
  "total_cost": 0.45,
  "models_used": {
    "gpt-4": {
      "generations": 10,
      "cost": 0.30
    },
    "gpt-3.5-turbo": {
      "generations": 5,
      "cost": 0.15
    }
  },
  "daily_breakdown": [
    {
      "date": "2024-01-15",
      "generations": 3,
      "cost": 0.09
    },
    {
      "date": "2024-01-16",
      "generations": 2,
      "cost": 0.06
    }
  ]
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `period` | string | The time period used for the statistics |
| `start_date` | string | Start date of the period (ISO 8601) |
| `end_date` | string | End date of the period (ISO 8601) |
| `total_generations` | number | Total number of AI generations in the period |
| `total_input_tokens` | number | Total input tokens consumed |
| `total_output_tokens` | number | Total output tokens generated |
| `total_cost` | number \| null | Total cost in USD (null if no cost) |
| `models_used` | object | Breakdown by AI model |
| `models_used[model]` | object | Statistics for specific model |
| `models_used[model].generations` | number | Number of generations using this model |
| `models_used[model].cost` | number \| null | Cost for this model (null if no cost) |
| `daily_breakdown` | array | Daily statistics breakdown |
| `daily_breakdown[].date` | string | Date in YYYY-MM-DD format |
| `daily_breakdown[].generations` | number | Number of generations on this date |
| `daily_breakdown[].cost` | number \| null | Cost on this date (null if no cost) |

#### Error Responses

**400 Bad Request - Invalid Query Parameters**

```json
{
  "error": "Invalid query parameters",
  "details": [
    {
      "code": "invalid_type",
      "expected": "day | week | month | year | custom",
      "received": "invalid",
      "path": ["period"],
      "message": "Invalid period specified"
    }
  ]
}
```

**400 Bad Request - Custom Period Validation**

```json
{
  "error": "Custom period requires both start_date and end_date"
}
```

**400 Bad Request - Invalid Date Range**

```json
{
  "error": "Start date must be before end date"
}
```

**401 Unauthorized**

```json
{
  "error": "Unauthorized"
}
```

**500 Internal Server Error**

```json
{
  "error": "Internal server error"
}
```

## Usage Examples

### JavaScript/TypeScript

```typescript
// Get monthly usage
const response = await fetch('/api/ai/usage', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const usage = await response.json();
console.log(`Total generations: ${usage.total_generations}`);
console.log(`Total cost: $${usage.total_cost}`);

// Get custom date range
const customResponse = await fetch('/api/ai/usage?period=custom&start_date=2024-01-01T00:00:00Z&end_date=2024-01-31T23:59:59Z', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const customUsage = await customResponse.json();
```

### cURL

```bash
# Get monthly usage
curl -X GET "https://your-domain.com/api/ai/usage" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get weekly usage
curl -X GET "https://your-domain.com/api/ai/usage?period=week" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get custom date range
curl -X GET "https://your-domain.com/api/ai/usage?period=custom&start_date=2024-01-01T00:00:00Z&end_date=2024-01-31T23:59:59Z" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Rate Limiting

This endpoint is subject to rate limiting. If you exceed the rate limit, you'll receive a `429 Too Many Requests` response.

## Authentication

All requests to this endpoint require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Data Freshness

Usage statistics are calculated in real-time from the `ai_generations_log` table. The data reflects the current state of your AI generation history.

## Cost Calculation

Costs are calculated based on the actual token usage and the pricing for each AI model:

- **GPT-4**: $0.03 per 1K input tokens, $0.06 per 1K output tokens
- **GPT-3.5-turbo**: $0.0015 per 1K input tokens, $0.002 per 1K output tokens
- **Claude-3-sonnet**: $0.003 per 1K input tokens, $0.015 per 1K output tokens

## Notes

- All dates are returned in ISO 8601 format with UTC timezone
- Daily breakdown is sorted chronologically
- Models with no usage in the period are not included in `models_used`
- Costs are rounded to 2 decimal places
- Empty periods return zero counts and null costs
- The endpoint automatically handles timezone conversions
