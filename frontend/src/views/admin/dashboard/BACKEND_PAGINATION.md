# Backend Pagination Implementation Guide

## Current Implementation Status

The frontend is now configured to send pagination parameters to the backend:

- `page`: Current page number (starts at 1)
- `limit`: Number of items per page

## Required Backend Response Format

The backend `/pickups` endpoint should accept query parameters and return metadata:

### Request

```
GET /pickups?page=1&limit=10
```

### Expected Response Format

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "status": "CONFIRMED",
      "pickupDate": "2025-10-13T23:33:17.483Z",
      "dropoffDate": "2025-10-14T07:47:33.607Z",
      ...
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

## Pagination Metadata Fields

| Field        | Type   | Description                                                    |
| ------------ | ------ | -------------------------------------------------------------- |
| `page`       | number | Current page number (starting from 1)                          |
| `limit`      | number | Number of items per page                                       |
| `total`      | number | Total number of items across all pages                         |
| `totalPages` | number | Total number of pages (calculated as Math.ceil(total / limit)) |

## Implementation Notes

1. The frontend currently falls back to client-side pagination if `meta` is not returned
2. The frontend will reset to page 1 when filters change
3. The `limit` parameter controls how many orders are returned per page
