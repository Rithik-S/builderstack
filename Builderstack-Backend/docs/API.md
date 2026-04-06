# BuilderStack API Documentation

## Base URL
```
http://localhost:8080/api
```

## Endpoints

### Tools

#### List all tools
```
GET /api/tools
```

Query parameters:
- `category` - Filter by category
- `pricing` - Filter by pricing model (free, freemium, paid)
- `min_rating` - Minimum rating filter

#### Get tool by ID
```
GET /api/tools/:id
```

#### Get AI recommendations
```
POST /api/tools/recommend
```

Request body:
```json
{
  "requirements": "I need a tool for project management with Kanban boards"
}
```

### Users

#### Register
```
POST /api/users/register
```

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Login
```
POST /api/users/login
```

Request body:
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

## Response Format

All responses follow this structure:

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```
