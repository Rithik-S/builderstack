package handlers

import (
	"database/sql"
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
func GetCurrentUserHandler(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserContextKey).(*utils.Claims)
	if !ok || claims == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	user, err := repository.GetUserByID(claims.UserID)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	if user == nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// GetUsersHandler returns all users from the database
// Route: GET /api/users
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
		var location, ageGroup, profession, gender sql.NullString

		err := rows.Scan(
			&u.ID,
			&u.Name,
			&u.Email,
			&location,
			&ageGroup,
			&profession,
			&gender,
			&u.Role,
			&u.CreatedAt,
		)
		if err != nil {
			http.Error(w, "Error reading data", http.StatusInternalServerError)
			return
		}

		// Convert NullString to *string (pointer)
		if location.Valid {
			u.Location = &location.String
		}
		if ageGroup.Valid {
			u.AgeGroup = &ageGroup.String
		}
		if profession.Valid {
			u.Profession = &profession.String
		}
		if gender.Valid {
			u.Gender = &gender.String
		}

		users = append(users, u)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}
