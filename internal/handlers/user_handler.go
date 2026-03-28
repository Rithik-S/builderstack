// Package handlers contains HTTP handlers for all API endpoints
// This file handles /api/users endpoint

package handlers

import (
	"encoding/json"
	"net/http"

	"builderstack-backend/internal/database"
	"builderstack-backend/internal/models"
)

// GetUsersHandler returns all users from the database
// Route: GET /api/users
// NOTE: This should be protected and not expose password_hash
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
