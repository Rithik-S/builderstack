package middleware

import (
	"net/http"

	"builderstack-backend/internal/utils"
)

// AdminMiddleware checks if user has admin role
// MUST be used AFTER AuthMiddleware
func AdminMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get user from context (put there by AuthMiddleware)
		claims, ok := r.Context().Value(UserContextKey).(*utils.Claims)
		if !ok || claims == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Check if admin
		if claims.Role != "admin" {
			http.Error(w, "Admin access required", http.StatusForbidden)
			return
		}

		// User is admin, continue
		next.ServeHTTP(w, r)
	})
}
