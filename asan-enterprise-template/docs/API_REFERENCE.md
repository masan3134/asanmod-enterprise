---
type: reference
agent_role: backend_engineer
context_depth: 3
required_knowledge: ["trpc_patterns"]
last_audited: "2026-01-14"
---

# API Reference

> **Auto-generated API documentation**

## Authentication

### POST /api/auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user"
  }
}
```

### POST /api/auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

## Users

### GET /api/users
Get list of users (admin only).

**Query Params:**
- `page`: number (default: 1)
- `limit`: number (default: 20)

**Response:**
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "pages": 5
}
```

### GET /api/users/:id
Get user by ID.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### PUT /api/users/:id
Update user (own profile or admin).

**Request:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

### DELETE /api/users/:id
Delete user (admin only).

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

### Common Error Codes
- `UNAUTHORIZED` (401): Not authenticated
- `FORBIDDEN` (403): Not authorized
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid input
- `INTERNAL_ERROR` (500): Server error
