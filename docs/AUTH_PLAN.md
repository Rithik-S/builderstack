# Authentication & Authorization Plan

## Overview

This document outlines the authentication and authorization system for BuilderStack.

---

## 1. User Roles

| Role | Description |
|------|-------------|
| `user` | Default role. Can view tools, manage own favorites, use chat |
| `admin` | Can create, edit, delete tools. Manage all content |

---

## 2. Permissions Matrix

| Action | Guest | User | Admin |
|--------|-------|------|-------|
| View tools | ✅ | ✅ | ✅ |
| View tool details | ✅ | ✅ | ✅ |
| Register/Login | ✅ | - | - |
| Create tools | ❌ | ❌ | ✅ |
| Edit tools | ❌ | ❌ | ✅ |
| Delete tools | ❌ | ❌ | ✅ |
| View own profile | ❌ | ✅ | ✅ |
| Create chat sessions | ❌ | ✅ | ✅ |
| View own chats | ❌ | ✅ | ✅ |
| Add favorites | ❌ | ✅ | ✅ |
| View own favorites | ❌ | ✅ | ✅ |

---

## 3. Authentication Flow

### 3.1 Registration
```
┌─────────────────────────────────────────────────────────────────┐
│  POST /api/auth/register                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Request:                                                       │
│  {                                                              │
│    "name": "Rithik",                                            │
│    "email": "rithik@example.com",                               │
│    "password": "securepassword123"                              │
│  }                                                              │
│                                                                 │
│  Process:                                                       │
│  1. Validate input (email format, password length)              │
│  2. Check if email already exists                               │
│  3. Hash password with bcrypt                                   │
│  4. Create user with role = "user"                              │
│  5. Return success (no auto-login)                              │
│                                                                 │
│  Response (201 Created):                                        │
│  {                                                              │
│    "message": "Registration successful",                        │
│    "user": {                                                    │
│      "id": 1,                                                   │
│      "name": "Rithik",                                          │
│      "email": "rithik@example.com",                             │
│      "role": "user"                                             │
│    }                                                            │
│  }                                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Login
```
┌─────────────────────────────────────────────────────────────────┐
│  POST /api/auth/login                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Request:                                                       │
│  {                                                              │
│    "email": "rithik@example.com",                               │
│    "password": "securepassword123"                              │
│  }                                                              │
│                                                                 │
│  Process:                                                       │
│  1. Find user by email                                          │
│  2. Compare password with bcrypt                                │
│  3. Generate JWT token (contains user_id, role)                 │
│  4. Return token in HttpOnly cookie                             │
│                                                                 │
│  Response (200 OK):                                             │
│  {                                                              │
│    "message": "Login successful",                               │
│    "user": {                                                    │
│      "id": 1,                                                   │
│      "name": "Rithik",                                          │
│      "email": "rithik@example.com",                             │
│      "role": "user"                                             │
│    }                                                            │
│  }                                                              │
│                                                                 │
│  + HttpOnly Cookie: "token=eyJhbGciOiJ..."                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. JWT Token Structure
```json
{
  "user_id": 1,
  "email": "rithik@example.com",
  "role": "user",
  "exp": 1234567890
}
```

- **Expiry**: 24 hours
- **Storage**: HttpOnly cookie (secure, not accessible by JavaScript)
- **Secret**: Stored in .env file

---

## 5. Authorization Middleware

### 5.1 AuthMiddleware (Is user logged in?)
```
┌─────────────────────────────────────────────────────────────────┐
│  For routes that require login                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Extract JWT from cookie                                     │
│  2. Validate token signature                                    │
│  3. Check if token expired                                      │
│  4. Attach user info to request context                         │
│  5. Continue to handler                                         │
│                                                                 │
│  If invalid → 401 Unauthorized                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 AdminMiddleware (Is user admin?)
```
┌─────────────────────────────────────────────────────────────────┐
│  For routes that require admin role                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Get user from context (set by AuthMiddleware)               │
│  2. Check if role == "admin"                                    │
│  3. Continue to handler                                         │
│                                                                 │
│  If not admin → 403 Forbidden                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Updated API Routes
```
PUBLIC (No auth required):
├── GET  /api/tools              # List all tools
├── GET  /api/tools/:id          # Get single tool
├── POST /api/auth/register      # Register new user
└── POST /api/auth/login         # Login

PRIVATE (Auth required):
├── GET  /api/users/me           # Get logged-in user profile
├── POST /api/auth/logout        # Logout (clear cookie)
├── POST /api/chats              # Create chat session
├── GET  /api/chats              # List user's chats
├── GET  /api/chats/:id          # Get single chat
├── POST /api/chats/:id/messages # Send message
├── GET  /api/chats/:id/messages # Get messages
├── POST /api/favorites          # Add favorite
├── GET  /api/favorites          # List favorites
└── DELETE /api/favorites/:id    # Remove favorite

ADMIN ONLY (Auth + Admin role required):
├── POST   /api/tools            # Create tool
├── PUT    /api/tools/:id        # Update tool
└── DELETE /api/tools/:id        # Delete tool
```

---

## 7. Database Changes

### Users Table (Already exists)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 8. Files to Create/Modify
```
internal/
├── handlers/
│   └── auth_handler.go      # NEW: Register, Login, Logout
├── middleware/
│   ├── auth.go              # NEW: JWT validation
│   └── admin.go             # NEW: Admin role check
├── repository/
│   └── user_repo.go         # UPDATE: Add auth queries
├── models/
│   └── user.go              # UPDATE: Add password field
└── router/
    └── router.go            # UPDATE: Apply middleware
```

---

## 9. Implementation Order

1. [ ] Update User model (add password_hash field handling)
2. [ ] Create user repository functions (CreateUser, GetUserByEmail)
3. [ ] Create auth handlers (Register, Login, Logout)
4. [ ] Create JWT helper functions (Generate, Validate)
5. [ ] Create AuthMiddleware
6. [ ] Create AdminMiddleware
7. [ ] Update router with middleware
8. [ ] Update Swagger docs
9. [ ] Test all endpoints

---

## 10. Security Considerations

- Passwords hashed with bcrypt (cost factor 10)
- JWT stored in HttpOnly cookie (prevents XSS)
- Token expiry: 24 hours
- HTTPS required in production
- Rate limiting on login endpoint (future)

---

## Questions for Discussion

1. Should we implement refresh tokens?
2. Email verification required before login?
3. Password reset flow needed now or later?
4. Should admins be created via API or manually in DB?