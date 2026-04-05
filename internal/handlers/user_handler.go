package handlers

import (
	"encoding/json"
	"net/http"

	"builderstack-backend/internal/database"
	"builderstack-backend/internal/middleware"
	"builderstack-backend/internal/models"
	"builderstack-backend/internal/repository"
	"builderstack-backend/internal/utils"
)

// GetCurrentUserHandler returns the logged-in user's profile
// Route: GET /api/users/me
// @Summary      Get current user
// @Description  Get the logged-in user's profile
// @Tags         users
// @Produce      json
// @Success      200  {object}  models.User
// @Failure      401  {string}  string  "Unauthorized"
// @Router       /users/me [get]
func GetCurrentUserHandler(w http.ResponseWriter, r *http.Request) {
	// Get user from context (put there by AuthMiddleware)
	claims, ok := r.Context().Value(middleware.UserContextKey).(*utils.Claims)
	if !ok || claims == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get full user from database
	user, err := repository.GetUserByID(claims.UserID)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	if user == nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Return user
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// GetUsersHandler returns all users from the database
// Route: GET /api/users
// NOTE: This should be admin only
func GetUsersHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(`
		SELECT id, name, email, location, age_group, profession, gender, role, created_at
		FROM users
	`)
	if err != nil {
		http.Error(w, "Failed to fetch users", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var users []models.User

	for rows.Next() {
		var u models.User
		err := rows.Scan(
			&u.ID,
			&u.Name,
			&u.Email,
			&u.Location,
			&u.AgeGroup,
			&u.Profession,
			&u.Gender,
			&u.Role,
			&u.CreatedAt,
		)
		if err != nil {
			http.Error(w, "Error reading data", http.StatusInternalServerError)
			return
		}
		users = append(users, u)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}
