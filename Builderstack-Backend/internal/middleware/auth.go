package middleware

import (
	"context"
	"net/http"

	"builderstack-backend/internal/utils"
)

// ContextKey is a custom type for context keys
type ContextKey string

const UserContextKey ContextKey = "user"

// AuthMiddleware checks if user has valid JWT token
// If valid: attaches user info to request context, continues
// If invalid: returns 401 Unauthorized
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// ===== STEP 1: Get token from cookie =====
		cookie, err := r.Cookie("token")
		if err != nil {
			http.Error(w, "No token provided", http.StatusUnauthorized)
			return
		}

		// ===== STEP 2: Validate token =====
		claims, err := utils.ValidateToken(cookie.Value)
		if err != nil {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		// ===== STEP 3: Attach user info to context =====
		ctx := context.WithValue(r.Context(), UserContextKey, claims)

		// ===== STEP 4: Continue to next handler =====
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
